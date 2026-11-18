/**
 * ANI STRATEGY LAB — Cliente Seguro del Agente Estratégico y Buscador Documental
 *
 * - Usa rutas relativas (`./api/agent/*`) por defecto (sin hardcodear localhost).
 * - Nunca solicita ni almacena claves API en el navegador.
 * - Si se ejecuta en GitHub Pages estático sin backend conectado, mantiene
 *   operativa la búsqueda documental trazable y la auditoría reglada R1–R6,
 *   informando con total transparencia el estado del backend Arena API.
 */
import { STATIC_FALLBACK_CHUNKS } from '../../data/knowledge-base.js';

const BACKEND_URL_KEY = 'ani_strategy_lab_backend_url';

export function getBackendBase() {
  try {
    const saved = (localStorage.getItem(BACKEND_URL_KEY) || '').trim().replace(/\/+$/, '');
    if (saved && /^https?:\/\//i.test(saved)) return saved;
  } catch { /* ignore */ }
  return '';
}

export function setBackendBase(url) {
  const clean = String(url || '').trim().replace(/\/+$/, '');
  if (!clean) {
    localStorage.removeItem(BACKEND_URL_KEY);
    return '';
  }
  if (!/^https:\/\//i.test(clean)) {
    throw new Error('La URL del backend externo debe comenzar con https:// por seguridad.');
  }
  localStorage.setItem(BACKEND_URL_KEY, clean);
  return clean;
}

function apiUrl(endpoint) {
  const base = getBackendBase();
  return base ? `${base}${endpoint}` : `.${endpoint}`;
}

function normalizeClient(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function localFallbackSearch(query, workspace = null, topK = 6) {
  const extra = [];
  if (workspace?.pndAxes) {
    workspace.pndAxes.forEach((ax, i) => {
      if (ax?.nombre?.trim() || ax?.relacionAni?.trim()) {
        extra.push({
          id: `PND-EJE-${ax.numero || i + 1}`,
          docTitle: `PND — Eje ${ax.numero || i + 1}`,
          section: ax.nombre || `Eje ${i + 1}`,
          sourceFile: 'Sesión · PND 7 Ejes',
          lineRange: ax.cita || 'Cita pendiente',
          authorityStatus: ax.estatus || 'en_construccion',
          tags: ['PND', ax.foco || ''].filter(Boolean),
          content: `${ax.nombre || ''}. ${ax.resumen || ''}. Relación ANI: ${ax.relacionAni || ''}. Oportunidades: ${ax.oportunidades || ''}`
        });
      }
    });
  }
  if (workspace?.docs) {
    for (const [k, d] of Object.entries(workspace.docs)) {
      if (d?.resumen?.trim() || d?.relacion?.trim()) {
        extra.push({
          id: `FICHA-${k.toUpperCase()}`,
          docTitle: d.titulo || k.toUpperCase(),
          section: `Ficha documental (${d.foco || 'Sin foco'})`,
          sourceFile: `Sesión · Biblioteca (${k})`,
          lineRange: d.evidencia || 'Cita pendiente',
          authorityStatus: 'en_construccion',
          tags: ['Documentos', d.foco || ''].filter(Boolean),
          content: `${d.resumen || ''}\nRelación ANI: ${d.relacion || ''}\nContribuciones: ${(d.contribuciones || []).join('; ')}`
        });
      }
    }
  }
  if (Array.isArray(workspace?.customDocs)) {
    workspace.customDocs.forEach((cd, idx) => {
      if (cd?.contenido?.trim()) {
        extra.push({
          id: `BIBLIO-${idx + 1}`,
          docTitle: cd.titulo || `Documento ${idx + 1}`,
          section: cd.fuente || 'Biblioteca ampliada',
          sourceFile: `Sesión · ${cd.nombreArchivo || 'Documento'}`,
          lineRange: cd.cita || 'Registro usuario',
          authorityStatus: cd.estatus || 'en_construccion',
          tags: ['Biblioteca', cd.foco || ''].filter(Boolean),
          content: cd.contenido.slice(0, 1800)
        });
      }
    });
  }
  if (Array.isArray(workspace?.projects) && workspace.projects.length) {
    extra.push({
      id: 'SESION-CARTERA-PEI',
      docTitle: 'Cartera PEI 2027–2030 (Sesión)',
      section: `${workspace.projects.length} proyectos en trabajo`,
      sourceFile: 'Sesión · Cartera PEI',
      lineRange: 'Tabla PEI',
      authorityStatus: 'en_construccion',
      tags: ['PEI', 'Proyectos'],
      content: workspace.projects.map((p) => `[${p.foco || '—'}] ${p.proyecto || 'Sin nombre'} | Meta: ${p.meta || 'Por definir'} | Doble llave: ${p.doble || '—'} | ${p.detalle || ''}`).join('\n')
    });
  }
  if (Array.isArray(workspace?.actionPlan) && workspace.actionPlan.length) {
    extra.push({
      id: 'SESION-PLAN-ACCION',
      docTitle: 'Plan de Acción 2027–2030 (Sesión)',
      section: `${workspace.actionPlan.length} actividades`,
      sourceFile: 'Sesión · Plan de Acción',
      lineRange: 'Plan de Acción',
      authorityStatus: 'en_construccion',
      tags: ['Plan de Acción'],
      content: workspace.actionPlan.map((a) => `[${a.foco || '—'}] ${a.actividad || 'Sin nombre'} → ${a.entregable || '—'} (${a.responsable || '—'})`).join('\n')
    });
  }

  const corpus = [...STATIC_FALLBACK_CHUNKS, ...extra];
  const tokens = normalizeClient(query).split(' ').filter((t) => t.length >= 3);
  if (!tokens.length) return corpus.slice(0, topK).map((c) => ({ ...c, score: 1 }));

  return corpus
    .map((c) => {
      const hay = normalizeClient(`${c.id} ${c.docTitle} ${c.section} ${(c.tags || []).join(' ')} ${c.content}`);
      let score = 0;
      for (const tok of tokens) {
        if (hay.includes(tok)) score += 1.5;
        if (normalizeClient(`${c.section} ${c.docTitle}`).includes(tok)) score += 1.2;
      }
      return { ...c, score: Number(score.toFixed(2)) };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function localFallbackAudit(workspace = {}) {
  const findings = [];
  const projects = workspace.projects || [];
  const actionPlan = workspace.actionPlan || [];
  const pndAxes = workspace.pndAxes || [];
  const identity = workspace.identity || {};

  if (!identity.mision?.trim() || !identity.vision?.trim()) {
    findings.push({
      severity: 'warn',
      rule: 'Brecha §2.3',
      citation: 'MARCO-S2.3',
      title: 'Misión y/o Visión oficial ANI pendientes de carga',
      detail: 'Cargue el texto oficial vigente y su fuente normativa en el Módulo 02.'
    });
  }
  const filledAxes = pndAxes.filter((a) => a?.nombre?.trim() && a?.relacionAni?.trim()).length;
  if (filledAxes < 7) {
    findings.push({
      severity: 'warn',
      rule: 'Trazabilidad PND',
      citation: 'MARCO-S1',
      title: `Ejes del PND documentados: ${filledAxes} de 7`,
      detail: `Restan ${7 - filledAxes} ejes por diligenciar con nombre oficial, relación ANI y cita.`
    });
  } else {
    findings.push({
      severity: 'ok',
      rule: 'Trazabilidad PND',
      citation: 'MARCO-S1',
      title: '7 de 7 Ejes del PND con relación ANI documentada',
      detail: 'Cobertura completa del cruce PND ↔ ANI.'
    });
  }
  if (!projects.length) {
    findings.push({
      severity: 'warn',
      rule: 'R1 · Cartera PEI',
      citation: 'MARCO-S4',
      title: 'Aún no hay proyectos registrados en la Cartera PEI 2027–2030',
      detail: 'Cree proyectos cumpliendo las 6 columnas obligatorias y la doble llave F1↔F2.'
    });
  } else {
    const f1 = projects.filter((p) => p.foco === 'F1').length;
    const f2 = projects.filter((p) => p.foco === 'F2').length;
    if (f1 > 0 && f2 === 0) {
      findings.push({
        severity: 'bad',
        rule: 'R3 · Doble Llave',
        citation: 'MARCO-S1',
        title: 'Cartera desbalanceada: existen proyectos F1 sin proyectos F2',
        detail: 'Foco 1 sin Foco 2 = obra bloqueada. Registre iniciativas de ruta social preventiva.'
      });
    } else if (f2 > 0 && f1 === 0) {
      findings.push({
        severity: 'bad',
        rule: 'R3 · Doble Llave',
        citation: 'MARCO-S1',
        title: 'Cartera desbalanceada: existen proyectos F2 sin proyectos F1',
        detail: 'Foco 2 sin Foco 1 = gestión sin resultado físico.'
      });
    }
    projects.forEach((p, idx) => {
      const name = p.proyecto?.trim() || `Proyecto #${idx + 1}`;
      if (!(['F1', 'F2'].includes(p.foco) && p.objetivo?.trim() && p.proyecto?.trim() && p.unidad?.trim() && p.meta?.trim() && p.detalle?.trim())) {
        findings.push({
          severity: 'bad',
          rule: 'R1 · 6 Columnas',
          citation: 'MARCO-S5.1',
          title: `"${name}" no completa las 6 columnas obligatorias`,
          detail: 'Complete Foco, Objetivo, Proyecto, Unidad, Meta 2030 y Detalle.'
        });
      }
      if (!p.doble?.trim()) {
        findings.push({
          severity: 'warn',
          rule: 'R3 · Doble Llave',
          citation: 'MARCO-S4',
          title: `"${name}" sin Doble Llave F1↔F2 declarada`,
          detail: 'Declare explícitamente el proyecto o componente complementario.'
        });
      }
      const numMeta = /\d/.test(p.meta || '') && !/por definir|pendiente|insuficiente/i.test(p.meta || '');
      const noBase = !p.lineaBase?.trim() || /pendiente|insuficiente|por definir/i.test(p.lineaBase || '');
      if (numMeta && noBase) {
        findings.push({
          severity: 'bad',
          rule: 'R6 · Línea Base',
          citation: 'MARCO-S3.6',
          title: `"${name}" fija meta numérica sin línea base oficial`,
          detail: 'Use "Por definir — línea base pendiente" hasta levantar la línea base.'
        });
      }
      if (!actionPlan.some((a) => a.proyectoId === p.id)) {
        findings.push({
          severity: 'info',
          rule: 'PEI → Plan de Acción',
          citation: 'MARCO-S3.7',
          title: `"${name}" aún sin actividades en el Plan de Acción`,
          detail: 'Desagregue actividades 2027–2030 vinculadas a este proyecto.'
        });
      }
    });
  }
  return {
    ok: true,
    summary: {
      critical: findings.filter((f) => f.severity === 'bad').length,
      warnings: findings.filter((f) => f.severity === 'warn').length,
      info: findings.filter((f) => f.severity === 'info').length,
      passed: findings.filter((f) => f.severity === 'ok').length,
      projectsCount: projects.length,
      actionPlanCount: actionPlan.length,
      pndAxesFilled: filledAxes
    },
    findings
  };
}

export async function fetchAgentStatus() {
  try {
    const res = await fetch(apiUrl('/api/agent/status'), { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data?.backendOnline) throw new Error('Respuesta no válida');
    return data;
  } catch {
    return {
      ok: false,
      backendOnline: false,
      arena: {
        provider: 'arena',
        providerLabel: 'Arena API (Requiere servidor backend)',
        status: 'static_host_mode',
        keyConfigured: false,
        docsUrl: 'https://platform.arena.ai/docs/api',
        keysDashboardUrl: 'https://platform.arena.ai/dashboard/keys',
        warnings: [
          'La aplicación está ejecutándose en modo estático (p. ej. GitHub Pages) sin servidor backend conectado. Por seguridad, las claves ARENA_API_KEY nunca se exponen en el navegador. El buscador documental y el auditor R1–R6 operan localmente; conecte el backend (`npm start` o URL HTTPS del servidor) para consultas en vivo con Arena API.'
        ],
        activationSteps: [
          '1. Despliegue el servidor incluido (`server/index.mjs`) con `npm start` en su entorno seguro (contenedor institucional, Render, Railway, Fly.io o servidor ANI).',
          '2. Configure `ARENA_API_KEY` y `ARENA_MODEL` en las variables de entorno del servidor (consulte `.env.example`).',
          '3. Acceda directamente a la URL del servidor o indique su URL HTTPS en el campo "Endpoint del backend" de este panel.'
        ]
      },
      knowledge: {
        totalRepoFiles: 4,
        totalRepoChunks: STATIC_FALLBACK_CHUNKS.length,
        files: []
      }
    };
  }
}

export async function verifyArenaConnection() {
  const res = await fetch(apiUrl('/api/agent/verify'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: '{}'
  });
  return res.json();
}

export async function searchKnowledge(query, workspace, filterTag = '') {
  try {
    const res = await fetch(apiUrl('/api/agent/search'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, workspace, filterTag, topK: 10 })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    const results = localFallbackSearch(query, workspace, 8);
    return { ok: true, fallbackLocal: true, query, count: results.length, results };
  }
}

export async function runAudit(workspace) {
  try {
    const res = await fetch(apiUrl('/api/agent/audit'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ workspace })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return localFallbackAudit(workspace);
  }
}

export async function fetchCitationChunk(chunkId) {
  try {
    const res = await fetch(apiUrl(`/api/agent/knowledge?id=${encodeURIComponent(chunkId)}`), {
      headers: { Accept: 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.chunk) return data.chunk;
    }
  } catch { /* fallback estático */ }

  // Respaldo dinámico para GitHub Pages: extrae la sección exacta del Markdown original
  if (chunkId.startsWith('MARCO-')) {
    try {
      const mdRes = await fetch('./01_Marco_Estrategico_ANI_2027-2030.md');
      if (mdRes.ok) {
        const raw = await mdRes.text();
        const lines = raw.split(/\r?\n/);
        const target = chunkId.replace('MARCO-', '');
        let start = -1;
        let heading = '';
        for (let i = 0; i < lines.length; i++) {
          const m = lines[i].match(/^(#{2,3})\s+(.+)$/);
          if (!m) continue;
          const h = m[2].trim();
          const num = h.match(/^(\d+(?:\.\d+)?)\b/);
          const code = num ? `S${num[1]}` : (/riesgos/i.test(h) ? 'S4-RIESGOS' : (/marco de decisi/i.test(h) ? 'INTRO' : ''));
          if (start >= 0) {
            return {
              id: chunkId,
              docTitle: 'Marco Estratégico ANI — PEI 2027–2030',
              section: heading,
              sourceFile: '01_Marco_Estrategico_ANI_2027-2030.md',
              lineRange: `L${start + 1}–L${i}`,
              authorityStatus: 'marco_repositorio',
              content: lines.slice(start, i).join('\n').trim()
            };
          }
          if (code === target) {
            start = i;
            heading = h;
          }
        }
        if (start >= 0) {
          return {
            id: chunkId,
            docTitle: 'Marco Estratégico ANI — PEI 2027–2030',
            section: heading,
            sourceFile: '01_Marco_Estrategico_ANI_2027-2030.md',
            lineRange: `L${start + 1}–L${lines.length}`,
            authorityStatus: 'marco_repositorio',
            content: lines.slice(start).join('\n').trim()
          };
        }
      }
    } catch { /* fallback a catálogo local */ }
  }
  return STATIC_FALLBACK_CHUNKS.find((c) => c.id === chunkId) || null;
}

export async function sendAgentMessage({ message, mode, workspace, history }) {
  try {
    const res = await fetch(apiUrl('/api/agent/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ message, mode, workspace, history })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    const hits = localFallbackSearch(message, workspace, 5);
    const auditReport = ['auditoria', 'analisis', 'propuesta_pei', 'propuesta_pa'].includes(mode)
      ? localFallbackAudit(workspace)
      : null;
    return {
      ok: true,
      generationMode: 'static_fallback_retrieval',
      mode,
      statusNotice: 'Modo estático activo (sin backend conectado): se muestran los fragmentos verificados del acervo documental local y la auditoría reglada. Para respuestas generativas con Arena API, inicie o conecte el servidor backend con ARENA_API_KEY.',
      answer: null,
      verifiedCitations: hits.map((h) => ({
        id: h.id,
        score: h.score,
        docTitle: h.docTitle,
        section: h.section,
        sourceFile: h.sourceFile,
        lineRange: h.lineRange,
        authorityStatus: h.authorityStatus,
        excerpt: h.content
      })),
      auditReport,
      proposals: { peiProjects: [], actionItems: [], opportunities: [] }
    };
  }
}
