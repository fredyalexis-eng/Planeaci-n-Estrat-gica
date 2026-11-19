/**
 * ANI STRATEGY LAB — Suite Integral de Pruebas Automatizadas (`npm test`)
 * Verifica: motor documental y citas MARCO-S1, adaptador Arena API,
 * seguridad de archivos, retrocompatibilidad PEI v1, Plan de Acción,
 * exportación/importación CSV/JSON y renderizado de los 9 módulos.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppServer } from './index.mjs';
import { MODULES, createAniApp, formatTimer } from '../assets/js/app.js';
import {
  migrateState,
  buildPeiCsv,
  buildActionPlanCsv,
  buildOpportunitiesCsv,
  importPeiFromCsv,
  importActionPlanFromCsv,
  projValid,
  projCategory,
  projHasBaselineIssue
} from '../assets/js/state.js';
import { renderMedia, renderChatFeedHtml } from '../assets/js/render-execution.js';
import { sanitizeMediaUrl } from '../data/media-manifest.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function startTestServer(env = {}, fetchImpl = globalThis.fetch) {
  const ctx = await createAppServer({ repoRoot: REPO_ROOT, env, fetchImpl });
  await new Promise((resolve) => ctx.server.listen(0, '127.0.0.1', resolve));
  const { port } = ctx.server.address();
  return {
    ...ctx,
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => ctx.server.close(resolve))
  };
}

test('1. Archivos originales del repositorio intactos y MARCO-S1 exactamente numerado', async () => {
  for (const rel of [
    '01_Marco_Estrategico_ANI_2027-2030.md',
    '02_Plantilla_Ejercicio_PEI_2027-2030.csv',
    '03_Canvas_2_Focos_ANI.html',
    '04_App_Interactiva_ANI.md',
    '.nojekyll',
    '.github/workflows/pages.yml',
    'index.html'
  ]) {
    assert.ok(fs.existsSync(path.join(REPO_ROOT, rel)), `Falta archivo requerido: ${rel}`);
  }

  const srv = await startTestServer({});
  try {
    const res = await fetch(`${srv.baseUrl}/api/agent/knowledge?id=MARCO-S1`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.chunk.id, 'MARCO-S1');
    assert.match(data.chunk.section, /^1\.\s*RESUMEN EJECUTIVO/i);
    assert.equal(data.chunk.sourceFile, '01_Marco_Estrategico_ANI_2027-2030.md');

    const full = await (await fetch(`${srv.baseUrl}/api/agent/knowledge`)).json();
    const ids = new Set(full.chunkIndex.map((c) => c.id));
    for (const expected of [
      'MARCO-INTRO', 'MARCO-S1', 'MARCO-S2.1', 'MARCO-S2.2', 'MARCO-S2.3',
      'MARCO-S3.1', 'MARCO-S3.2', 'MARCO-S3.3', 'MARCO-S3.4', 'MARCO-S3.5',
      'MARCO-S3.6', 'MARCO-S3.7', 'MARCO-S4', 'MARCO-S4-RIESGOS',
      'MARCO-S5.1', 'MARCO-S5.3', 'MARCO-S5.4', 'PLANTILLA-PEI-CSV', 'CANVAS-2FOCOS-HTML'
    ]) {
      assert.ok(ids.has(expected), `Falta referencia indexada [${expected}]`);
    }
    assert.ok(!ids.has('MARCO-S1-2'), 'No debe existir colisión MARCO-S1-2');
  } finally {
    await srv.close();
  }
});

test('2. Seguridad HTTP: lista blanca de frontend y bloqueo estricto de servidor y .env', async () => {
  const srv = await startTestServer({});
  try {
    for (const pub of [
      '/',
      '/index.html',
      '/assets/css/styles.css',
      '/assets/js/app.js',
      '/assets/js/state.js',
      '/assets/js/render-strategy.js',
      '/assets/js/render-execution.js',
      '/assets/js/agent-client.js',
      '/data/knowledge-base.js',
      '/01_Marco_Estrategico_ANI_2027-2030.md',
      '/02_Plantilla_Ejercicio_PEI_2027-2030.csv',
      '/03_Canvas_2_Focos_ANI.html',
      '/04_App_Interactiva_ANI.md'
    ]) {
      const r = await fetch(`${srv.baseUrl}${pub}`);
      assert.equal(r.status, 200, `Recurso público debe responder 200: ${pub}`);
    }

    for (const blocked of [
      '/.env',
      '/.env.example',
      '/.gitignore',
      '/package.json',
      '/server/index.mjs',
      '/server/arena-adapter.mjs',
      '/.github/workflows/pages.yml',
      '/assets/..%2Fserver/index.mjs'
    ]) {
      const r = await fetch(`${srv.baseUrl}${blocked}`);
      assert.equal(r.status, 404, `Ruta sensible debe estar bloqueada (404): ${blocked}`);
    }
  } finally {
    await srv.close();
  }
});

test('3. Búsqueda documental BM25 y Auditoría R1–R6 con citas 100% válidas', async () => {
  const srv = await startTestServer({});
  try {
    const sRes = await fetch(`${srv.baseUrl}/api/agent/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'infraestructura social productiva desbordamiento competencia',
        workspace: {
          pndAxes: [{ numero: 1, nombre: 'Ordenamiento territorial', relacionAni: 'Articulación multimodal y predial', foco: 'F1+F2', cita: 'Cap. 1' }]
        }
      })
    });
    const sData = await sRes.json();
    assert.equal(sData.ok, true);
    assert.ok(sData.results.length >= 3);
    assert.ok(sData.results.some((r) => r.id === 'MARCO-S2.2' || r.id === 'MARCO-S4-RIESGOS'));

    const aRes = await fetch(`${srv.baseUrl}/api/agent/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspace: {
          projects: [{
            id: 'p1', foco: 'F1', objetivo: 'OE-01', proyecto: 'Corredor portuario',
            unidad: 'km', meta: '85 km a 2030', lineaBase: 'Pendiente',
            detalle: 'Incluye infraestructura social complementaria', doble: ''
          }],
          actionPlan: [{ id: 'a1', foco: 'F1', actividad: 'Actividad suelta', proyectoId: '' }],
          pndAxes: []
        }
      })
    });
    const audit = await aRes.json();
    assert.equal(audit.ok, true);
    assert.ok(audit.summary.critical >= 2);
    const rules = audit.findings.map((f) => f.rule).join(' | ');
    assert.match(rules, /R6/);
    assert.match(rules, /R2/);
    assert.match(rules, /R3/);

    const validIds = new Set(srv.knowledge.repoChunks.map((c) => c.id));
    for (const f of audit.findings) {
      assert.ok(validIds.has(f.citation), `Cita de auditoría inexistente: ${f.citation}`);
    }
  } finally {
    await srv.close();
  }
});

test('4. Agente sin ARENA_API_KEY: nunca simula IA, no expone secretos y entrega evidencia real', async () => {
  const srv = await startTestServer({});
  try {
    const st = await (await fetch(`${srv.baseUrl}/api/agent/status`)).json();
    assert.equal(st.arena.provider, 'arena');
    assert.equal(st.arena.status, 'awaiting_api_key');
    assert.equal(st.arena.keyConfigured, false);
    assert.equal(st.arena.apiKey, undefined);

    const chat = await (await fetch(`${srv.baseUrl}/api/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '¿Qué exige el Foco 2 y cuáles son sus 5 capacidades?', mode: 'consulta' })
    })).json();
    assert.equal(chat.ok, true);
    assert.equal(chat.generationMode, 'retrieval_only_awaiting_key');
    assert.equal(chat.answer, null);
    assert.ok(chat.verifiedCitations.length > 0);
  } finally {
    await srv.close();
  }
});

test('5. Adaptador Arena API: formatos OpenAI y Anthropic, verificación /v1/models, errores 402/403 y propuestas no aprobadas', async () => {
  // 5A: OpenAI format + verify + proposals + fake citation filtering
  const mockOpenAi = async (url, opts) => {
    assert.equal(opts.headers.Authorization, 'Bearer secret_arena_test_key');
    if (url === 'https://api.arena.ai/v1/models') {
      return new Response(JSON.stringify({ data: [{ id: 'coding-router-preview' }, { id: 'model-direct-1' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json', 'x-arena-trace-id': 'req_m1' }
      });
    }
    assert.equal(url, 'https://api.arena.ai/v1/chat/completions');
    const body = JSON.parse(opts.body);
    assert.ok(body.max_tokens >= 256, 'Debe enviar max_tokens acotado');
    return new Response(JSON.stringify({
      model: 'model-direct-1',
      choices: [{
        message: {
          content: 'Propuesta técnica sujeta a validación ANI basada en [MARCO-S2.1] y [MARCO-S4] (ignorar [CITA-FALSA]).\n<ani_proposals>{"peiProjects":[{"foco":"F2","proyecto":"Alertas tempranas ANI","unidad":"% casos","detalle":"Cierra capacidades social y tecnológica","doble":"Corredores F1","citations":["MARCO-S2.1","CITA-FALSA"]}],"actionItems":[{"foco":"F2","actividad":"Diseñar protocolo preventivo","entregable":"Protocolo","indicador":"Protocolo adoptado","unidad":"documento","responsable":"Gestión Social","citations":["MARCO-S3.7"]}],"opportunities":[]}</ani_proposals>'
        }
      }]
    }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'x-arena-trace-id': 'req_c1', 'x-arena-routing-mode': 'direct' }
    });
  };

  const srv1 = await startTestServer({
    AI_PROVIDER: 'arena',
    ARENA_API_KEY: 'secret_arena_test_key',
    ARENA_API_FORMAT: 'openai',
    ARENA_MODEL: 'model-direct-1'
  }, mockOpenAi);

  try {
    const statusRaw = await (await fetch(`${srv1.baseUrl}/api/agent/status`)).text();
    assert.ok(!statusRaw.includes('secret_arena_test_key'), 'Jamás debe filtrarse ARENA_API_KEY');

    const ver = await (await fetch(`${srv1.baseUrl}/api/agent/verify`, { method: 'POST' })).json();
    assert.equal(ver.ok, true);
    assert.deepEqual(ver.verification.directModels, ['model-direct-1']);

    const chat = await (await fetch(`${srv1.baseUrl}/api/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Propón proyecto F2 y actividad PA', mode: 'propuesta_pei' })
    })).json();
    assert.equal(chat.generationMode, 'arena_api_live');
    assert.equal(chat.arenaMeta.traceId, 'req_c1');
    assert.deepEqual(chat.verifiedCitations.map((c) => c.id), ['MARCO-S2.1', 'MARCO-S4']);
    assert.deepEqual(chat.unverifiedCitationTags, ['CITA-FALSA']);
    assert.equal(chat.proposals.peiProjects[0].estatus, 'propuesta_ia');
    assert.deepEqual(chat.proposals.peiProjects[0].citations, ['MARCO-S2.1']);
    assert.equal(chat.proposals.actionItems[0].estado, 'Propuesta IA — No aprobada');
  } finally {
    await srv1.close();
  }

  // 5B: Anthropic format + 403 organization_client_restricted handling
  const mock403 = async (url, opts) => {
    if (url === 'https://api.arena.ai/v1/models') {
      return new Response(JSON.stringify({ data: [{ id: 'claude-sonnet-4-5' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
    assert.equal(url, 'https://api.arena.ai/v1/messages');
    assert.equal(opts.headers['anthropic-version'], '2023-06-01');
    return new Response(JSON.stringify({
      error: { code: 'organization_client_restricted', message: 'client restricted', trace_id: 'req_403' }
    }), { status: 403, headers: { 'content-type': 'application/json' } });
  };

  const srv2 = await startTestServer({
    AI_PROVIDER: 'arena',
    ARENA_API_KEY: 'k2',
    ARENA_API_FORMAT: 'anthropic',
    ARENA_BASE_URL: 'https://api.arena.ai'
  }, mock403);

  try {
    const errRes = await (await fetch(`${srv2.baseUrl}/api/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Resumen ejecutivo', mode: 'consulta' })
    })).json();
    assert.equal(errRes.ok, false);
    assert.equal(errRes.generationMode, 'arena_api_error_with_evidence');
    assert.equal(errRes.error.code, 'organization_client_restricted');
    assert.ok(errRes.verifiedCitations.length > 0, 'Aun con error API entrega evidencia documental');
  } finally {
    await srv2.close();
  }

  // 5C: Rechazo de proveedores no autorizados
  const srv3 = await startTestServer({ AI_PROVIDER: 'openai', ARENA_API_KEY: 'x' });
  try {
    const st3 = await (await fetch(`${srv3.baseUrl}/api/agent/status`)).json();
    assert.equal(st3.arena.status, 'provider_not_authorized');
  } finally {
    await srv3.close();
  }
});

test('6. Frontend: 9 módulos, retrocompatibilidad ani_pei_2027_2030_v1, 3 defectos corregidos y CSV/JSON', () => {
  const legacy = migrateState({
    docs: {
      pnd: { resumen: 'Resumen largo de prueba del PND oficial', relacion: 'Relación directa con competencias ANI', contribuciones: ['Corredores'], foco: 'F1 + F2' },
      choco: { foco: 'F2 · Ruta social' }
    },
    projects: [{
      id: 'p_old',
      foco: 'F1 · Infraestructura dinamizadora',
      objetivo: 'Información insuficiente para concluir',
      proyecto: 'Corredor multimodal prueba',
      unidad: 'km',
      meta: 'Por definir — línea base pendiente',
      detalle: 'Criterios de seguridad vial y resiliencia climática',
      doble: 'Ruta social asociada',
      scores: { impInst: 5, impNac: 4, alineacion: 5, factTec: 4, factFin: 4, factJur: 4, factPol: 4, riesgo: 2, tiempo: 3 }
    }]
  });
  assert.equal(legacy.docs.pnd.foco, 'F1+F2');
  assert.equal(legacy.docs.choco.foco, 'F2');
  assert.equal(legacy.projects[0].foco, 'F1');
  assert.equal(projValid(legacy.projects[0]), true);
  assert.equal(projCategory(legacy.projects[0]).key, 'q1');
  assert.equal(projHasBaselineIssue(legacy.projects[0]), false);

  const csvRaw = fs.readFileSync(path.join(REPO_ROOT, '02_Plantilla_Ejercicio_PEI_2027-2030.csv'), 'utf8');
  const imported = importPeiFromCsv(csvRaw);
  assert.equal(imported.length, 2);
  assert.equal(importPeiFromCsv(buildPeiCsv(imported)).length, 2);

  const mem = new Map();
  globalThis.localStorage = {
    getItem: (k) => mem.get(k) ?? null,
    setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k)
  };
  const app = createAniApp();
  app.setPndAxis(0, 'nombre', 'Eje 1');
  app.setPndAxis(0, 'relacionAni', 'Relación con Foco 1 y Foco 2');
  app.deriveOppFromAxis(0);
  app.promoteOppToPei(app.getState().opportunities[0].id);
  app.addActionForProject(app.getState().projects[0].id);
  assert.ok(mem.has('ani_pei_2027_2030_v1'));
  assert.ok(buildActionPlanCsv(app.getState().actionPlan).includes('PA-01'));
  assert.equal(formatTimer(1200), '20:00');

  assert.equal(MODULES.length, 9);
  for (const m of MODULES) {
    const html = app.renderModuleHtml(m.id);
    assert.ok(html.length > 400);
    assert.equal([...html.matchAll(/<option(?![^>]*\bvalue=)[^>]*>/g)].length, 0, `Option sin value en ${m.id}`);
    assert.equal([...html.matchAll(/<table(?![^>]*class="exec-table")[^>]*>/g)].length, 0, `Table sin estilo en ${m.id}`);
  }
});

test('7. Centro Audiovisual: /api/media, autodetección de 2 videos e imágenes, HTTP 206 Range y bloqueo XSS', async () => {
  // Bloqueo estricto de URLs maliciosas y path traversal
  assert.equal(sanitizeMediaUrl('javascript:alert(1)'), '');
  assert.equal(sanitizeMediaUrl('data:text/html,<script>alert(1)</script>'), '');
  assert.equal(sanitizeMediaUrl('./assets/media/../../server/index.mjs'), '');
  assert.equal(sanitizeMediaUrl('http://insecure.example.com/v.mp4'), '');
  assert.equal(sanitizeMediaUrl('assets/media/video_institucional_01.mp4'), './assets/media/video_institucional_01.mp4');
  assert.equal(sanitizeMediaUrl('https://www.ani.gov.co/video.mp4'), 'https://www.ani.gov.co/video.mp4');
  assert.equal(sanitizeMediaUrl('blob:https://example.org/1234'), 'blob:https://example.org/1234');

  // Prueba real con archivos temporales en assets/media/ (limpiados en finally)
  const mediaDir = path.join(REPO_ROOT, 'assets', 'media');
  const tmpVid1 = path.join(mediaDir, '__test_video_01.mp4');
  const tmpVid2 = path.join(mediaDir, '__test_video_02.webm');
  const tmpImg1 = path.join(mediaDir, '__test_lamina_01.png');
  fs.writeFileSync(tmpVid1, Buffer.alloc(512, 0x41));
  fs.writeFileSync(tmpVid2, Buffer.alloc(256, 0x42));
  fs.writeFileSync(tmpImg1, Buffer.from('89504e470d0a1a0a', 'hex'));

  const srv = await startTestServer({});
  try {
    const inv = await (await fetch(`${srv.baseUrl}/api/media`)).json();
    assert.equal(inv.ok, true);
    assert.equal(inv.videos.length, 2);
    assert.equal(inv.images.length, 1);

    // Verificar streaming HTTP 206 Partial Content para reproducción/adelanto HTML5
    const rangeRes = await fetch(`${srv.baseUrl}/assets/media/__test_video_01.mp4`, {
      headers: { Range: 'bytes=0-63' }
    });
    assert.equal(rangeRes.status, 206);
    assert.equal(rangeRes.headers.get('accept-ranges'), 'bytes');
    assert.equal(rangeRes.headers.get('content-range'), 'bytes 0-63/512');
    assert.equal(rangeRes.headers.get('content-type'), 'video/mp4');
    const buf = await rangeRes.arrayBuffer();
    assert.equal(buf.byteLength, 64);

    // Rango inválido debe responder 416
    const badRange = await fetch(`${srv.baseUrl}/assets/media/__test_video_01.mp4`, {
      headers: { Range: 'bytes=9999-10000' }
    });
    assert.equal(badRange.status, 416);

    // Renderizar Centro Audiovisual con los 2 videos e imagen autodetectados
    const st = migrateState({});
    const html = renderMedia(st, { mediaTab: 'todo', repoMedia: inv, sessionBlobs: {} });
    assert.equal([...html.matchAll(/<video\b/g)].length, 2, 'Deben renderizarse los 2 reproductores HTML5 <video>');
    assert.equal([...html.matchAll(/class="media-img-preview"/g)].length, 1, 'Debe renderizarse la imagen estratégica con visor lightbox');
    assert.ok(html.includes('03_Canvas_2_Focos_ANI.html'), 'Debe preservar el Canvas Ejecutivo 2 Focos');
    assert.ok(html.includes('2/2 videos activos'));
  } finally {
    await srv.close();
    for (const f of [tmpVid1, tmpVid2, tmpImg1]) {
      try { fs.unlinkSync(f); } catch { /* ignore */ }
    }
  }
});

test('8. Agente IA Arena API: autodetección /v1/models, retry max_completion_tokens, candado de dominio, BM25 plural y citas de sesión', async () => {
  let chatAttempts = 0;
  const mockReasoningArena = async (url, opts) => {
    // Candado de dominio: jamás debe salir de api.arena.ai aunque ARENA_BASE_URL sea malicioso
    assert.ok(url.startsWith('https://api.arena.ai/'), `Dominio no autorizado: ${url}`);
    if (url === 'https://api.arena.ai/v1/models') {
      return new Response(JSON.stringify({
        data: [{ id: 'coding-router-preview' }, { id: 'o3-strategic-direct' }]
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    chatAttempts += 1;
    const body = JSON.parse(opts.body);
    assert.equal(body.model, 'o3-strategic-direct', 'Debe autodescubrir el primer modelo directo habilitado');
    if (chatAttempts === 1) {
      return new Response(JSON.stringify({
        error: { code: 'unsupported_parameter', message: 'Unsupported parameter: max_tokens. Use max_completion_tokens instead.' }
      }), { status: 400, headers: { 'content-type': 'application/json' } });
    }
    assert.ok(body.max_completion_tokens >= 256);
    assert.equal(body.temperature, undefined);
    return new Response(JSON.stringify({
      model: 'o3-strategic-direct',
      choices: [{
        message: {
          content: '### Análisis Estratégico\n- **Doble llave** verificada en [MARCO-S2.3] y [PND-EJE-1].\n- Indicadores propuestos en [MARCO-S3.7].'
        }
      }]
    }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'x-arena-trace-id': 'trace_live_99', 'x-arena-routing-mode': 'direct' }
    });
  };

  const srv = await startTestServer({
    AI_PROVIDER: 'arena',
    ARENA_API_KEY: 'arena_test_key_2',
    ARENA_BASE_URL: 'http://attacker.evil.example/v1', // debe ser ignorado y forzado a https://api.arena.ai/v1
    ARENA_MODEL: '' // debe autodetectar desde GET /v1/models
  }, mockReasoningArena);

  const sampleWorkspace = {
    pndAxes: [{ numero: 1, nombre: 'Ordenamiento del territorio alrededor del agua', resumen: 'Corredores sostenibles', relacionAni: 'Conectividad multimodal F1 y diálogo F2', foco: 'F1+F2', cita: 'PND Cap. 1' }],
    projects: [{ id: 'p1', foco: 'F1', objetivo: 'OE-01', proyecto: 'Corredor Férreo Central', unidad: 'km', lineaBase: '120 km', meta: '250 km', detalle: 'Reactivación férrea', doble: 'Ruta social corredor férreo' }]
  };

  try {
    // Stemming español singular/plural y compuestos ANI
    for (const q of ['indicador estratégico', 'foco 1 multimodal', 'doble llave', 'recomendación R6 línea base', 'alertas tempranas conflicto']) {
      const s = await (await fetch(`${srv.baseUrl}/api/agent/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, workspace: sampleWorkspace })
      })).json();
      assert.ok(s.results.length >= 2, `Consulta BM25 debe hallar fuentes reales para: "${q}"`);
    }

    // Resolución de citas tanto de repositorio como de sesión activa
    const citeSession = await (await fetch(`${srv.baseUrl}/api/agent/citation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'PND-EJE-1', workspace: sampleWorkspace })
    })).json();
    assert.equal(citeSession.ok, true);
    assert.match(citeSession.chunk.content, /Ordenamiento del territorio/);

    // Consulta completa en vivo con autodetección + retry + citas verificadas + render Markdown seguro
    const chat = await (await fetch(`${srv.baseUrl}/api/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Analiza la doble llave y el Eje 1 del PND', mode: 'pnd_ani', workspace: sampleWorkspace })
    })).json();
    assert.equal(chat.ok, true);
    assert.equal(chat.generationMode, 'arena_api_live');
    assert.equal(chatAttempts, 2);
    assert.equal(chat.arenaMeta.traceId, 'trace_live_99');
    assert.deepEqual(chat.verifiedCitations.map((c) => c.id), ['MARCO-S2.3', 'PND-EJE-1', 'MARCO-S3.7']);

    const feedHtml = renderChatFeedHtml([{ role: 'assistant', payload: chat, accepted: {} }]);
    assert.ok(feedHtml.includes('class="chat-heading"'));
    assert.ok(feedHtml.includes('data-cite="PND-EJE-1"'));
    assert.ok(feedHtml.includes('trace_live_99'));
  } finally {
    await srv.close();
  }
});

test('9. Tablas ejecutivas (PEI, Plan de Acción, Oportunidades) y round-trip CSV completo', () => {
  const mem = new Map();
  globalThis.localStorage = {
    getItem: (k) => mem.get(k) ?? null,
    setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k)
  };
  globalThis.confirm = () => true;

  const app = createAniApp();
  // Crear 2 proyectos PEI (F1 y F2), ordenar, filtrar, auditar tabla y exportar/reimportar CSV
  app.addProject('F1');
  const p1 = app.getState().projects[0];
  app.setProj(p1.id, 'objetivo', 'OE-01 Conectividad multimodal');
  app.setProj(p1.id, 'proyecto', 'Corredor Férreo La Dorada - Chiriguaná');
  app.setProj(p1.id, 'unidad', 'km');
  app.setProj(p1.id, 'lineaBase', 'Información insuficiente para concluir');
  app.setProj(p1.id, 'meta', 'Por definir — línea base pendiente');
  app.setProj(p1.id, 'detalle', 'Intermodalidad, eficiencia logística y resiliencia climática');
  app.setProj(p1.id, 'doble', 'Articulado con Sistema de Alertas Tempranas F2');
  app.setScore(p1.id, 'impInst', 5);
  app.setScore(p1.id, 'impNac', 5);

  app.addProject('F2');
  const p2 = app.getState().projects[0];
  app.setProj(p2.id, 'objetivo', 'OE-02 Gestión social preventiva');
  app.setProj(p2.id, 'proyecto', 'Sistema de Alertas Tempranas Socio-Territoriales');
  app.setProj(p2.id, 'unidad', '% de casos gestionados preventivamente');
  app.setProj(p2.id, 'meta', '80%'); // Sin línea base -> dispara alerta R6
  app.setProj(p2.id, 'detalle', 'Capacidades social, tecnológica y gobernanza territorial');
  assert.equal(projHasBaselineIssue(p2), true);

  app.setPeiTab('tabla');
  app.setPeiSort('score_desc');
  const peiTableHtml = app.renderModuleHtml('pei');
  assert.ok(peiTableHtml.includes('Corredor Férreo La Dorada - Chiriguaná'));
  assert.ok(peiTableHtml.includes('Alerta R6'));
  assert.ok(peiTableHtml.includes('Filas válidas (6 col + R6): <b>1/2</b>'));

  app.setPeiTab('priorizacion');
  assert.ok(app.renderModuleHtml('pei').includes('Mapa Cartesiano Impacto vs. Esfuerzo'));

  // Round-trip Plan de Acción CSV con revinculación automática al proyecto PEI
  app.addActionForProject(p1.id);
  const pa1 = app.getState().actionPlan[0];
  app.setAction(pa1.id, 'actividad', 'Estructurar anexos socio-ambientales y operativos');
  app.setAction(pa1.id, 'entregable', 'Anexo técnico aprobado');
  app.setAction(pa1.id, 'indicador', 'Anexos estructurados');
  app.setAction(pa1.id, 'unidad', 'documento');
  app.setAction(pa1.id, 'm2027', '1');
  app.setAction(pa1.id, 'responsable', 'Vicepresidencia de Estructuración');
  app.setAction(pa1.id, 'estado', 'Programada');
  app.setAction(pa1.id, 'avance', 35);

  app.setPaTab('cronograma');
  const paCronoHtml = app.renderModuleHtml('action-plan');
  assert.ok(paCronoHtml.includes('Estructurar anexos socio-ambientales y operativos'));
  assert.ok(paCronoHtml.includes('Avance promedio: <b>35%</b>'));
  assert.ok(paCronoHtml.includes('Cobertura Cartera PEI: <b>1/2</b>'));

  const paCsv = buildActionPlanCsv(app.getState().actionPlan);
  const reimportedPa = importActionPlanFromCsv(paCsv, app.getState().projects);
  assert.equal(reimportedPa.length, 1);
  assert.equal(reimportedPa[0].proyectoId, p1.id);
  assert.equal(reimportedPa[0].avance, 35);
  assert.equal(reimportedPa[0].estado, 'Programada');

  // Tabla Ejecutiva de Oportunidades y CSV
  app.addOpportunity();
  const opp = app.getState().opportunities[0];
  app.setOpp(opp.id, 'titulo', 'Integración nodo férreo-fluvial Magdalena');
  app.setOpp(opp.id, 'ejePnd', 'Eje 3');
  app.setOppTab('tabla');
  const oppTableHtml = app.renderModuleHtml('opportunities');
  assert.ok(oppTableHtml.includes('Integración nodo férreo-fluvial Magdalena'));
  assert.ok(buildOpportunitiesCsv(app.getState().opportunities).includes('Integración nodo férreo-fluvial Magdalena'));

  // Subpestañas restantes sin errores
  for (const ft of ['comparativa', 'arboles', 'toc', 'indicadores']) {
    app.setFocosTab(ft);
    assert.ok(app.renderModuleHtml('focos').length > 300);
  }
  for (const pt of ['ejes', 'fichas', 'acervo']) {
    app.setPndTab(pt);
    assert.ok(app.renderModuleHtml('pnd-docs').length > 300);
  }
  for (const mt of ['todo', 'videos', 'imagenes', 'canvas']) {
    app.setMediaTab(mt);
    assert.ok(app.renderModuleHtml('media').length > 300);
  }
  for (const at of ['chat', 'buscador', 'auditor']) {
    app.setAgentTab(at);
    assert.ok(app.renderModuleHtml('agent').length > 300);
  }
});

