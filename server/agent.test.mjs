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
  importPeiFromCsv,
  projValid,
  projCategory,
  projHasBaselineIssue
} from '../assets/js/state.js';

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
