/**
 * ANI STRATEGY LAB — Gestión de Estado, Retrocompatibilidad PEI y Utilidades
 * Preserva 100% la clave `ani_pei_2027_2030_v1` y corrige la normalización de Foco.
 */
import {
  STORAGE_KEY,
  STATUS_LABELS,
  BASE_DOC_SHEETS,
  SCORING_CRITERIA,
  COMPETENCE_MODES,
  FOCOS
} from '../../data/knowledge-base.js';

export function esc(val) {
  return String(val ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Corrige el Defecto #1 del index.html original: normaliza valores antiguos
 * como "F1 · Infraestructura dinamizadora" o "F2 · Ruta social" a "F1" / "F2" / "F1+F2".
 */
export function normalizeFoco(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  if (/^f1\s*\+\s*f2/i.test(s)) return 'F1+F2';
  if (/^f1\b/i.test(s)) return 'F1';
  if (/^f2\b/i.test(s)) return 'F2';
  return '';
}

export function blankDoc() {
  return {
    titulo: '',
    fecha: '',
    emisor: '',
    resumen: '',
    puntos: [],
    relacionTipo: '',
    relacion: '',
    contribuciones: [],
    foco: '',
    evidencia: '',
    pendiente: ''
  };
}

export function blankPndAxis(numero) {
  return {
    numero,
    nombre: '',
    capitulo: '',
    resumen: '',
    competenciaTipo: '',
    foco: '',
    relacionAni: '',
    oportunidades: '',
    cita: '',
    estatus: 'pendiente'
  };
}

export function safeId(raw, prefix = 'id') {
  const clean = String(raw || '').replace(/[^A-Za-z0-9_-]/g, '');
  return clean || uid(prefix);
}

export function createProject(overrides = {}) {
  const defaultScores = {
    impInst: 3, impNac: 3, alineacion: 3,
    factTec: 3, factFin: 3, factJur: 3, factPol: 3,
    riesgo: 3, tiempo: 3
  };
  const mergedScores = { ...defaultScores };
  if (overrides.scores && typeof overrides.scores === 'object') {
    for (const [k] of SCORING_CRITERIA) {
      const n = Number(overrides.scores[k]);
      if (Number.isFinite(n) && n >= 1 && n <= 5) mergedScores[k] = Math.round(n);
    }
  }
  return {
    id: safeId(overrides.id, 'p'),
    foco: normalizeFoco(overrides.foco) === 'F2' ? 'F2' : (normalizeFoco(overrides.foco) === 'F1' ? 'F1' : ''),
    objetivo: String(overrides.objetivo ?? ''),
    proyecto: String(overrides.proyecto ?? ''),
    unidad: String(overrides.unidad ?? ''),
    meta: String(overrides.meta ?? ''),
    detalle: String(overrides.detalle ?? ''),
    doble: String(overrides.doble ?? ''),
    lineaBase: String(overrides.lineaBase ?? ''),
    ejePnd: String(overrides.ejePnd ?? ''),
    modo: String(overrides.modo ?? ''),
    criterios: Array.isArray(overrides.criterios) ? overrides.criterios.map(String) : [],
    estatus: STATUS_LABELS[overrides.estatus] ? overrides.estatus : 'en_construccion',
    fuente: String(overrides.fuente ?? ''),
    scores: mergedScores
  };
}

export function createOpportunity(overrides = {}) {
  return {
    id: overrides.id || uid('opp'),
    foco: normalizeFoco(overrides.foco) || 'F1',
    titulo: String(overrides.titulo ?? ''),
    ejePnd: String(overrides.ejePnd ?? ''),
    modo: String(overrides.modo ?? ''),
    competencia: String(overrides.competencia ?? 'Competencia directa'),
    prioridad: String(overrides.prioridad ?? 'Alta'),
    horizonte: String(overrides.horizonte ?? 'Corto (2027)'),
    descripcion: String(overrides.descripcion ?? ''),
    evidencia: String(overrides.evidencia ?? ''),
    estatus: STATUS_LABELS[overrides.estatus] ? overrides.estatus : 'en_construccion'
  };
}

export function createActionItem(overrides = {}) {
  return {
    id: overrides.id || uid('pa'),
    codigo: String(overrides.codigo ?? ''),
    proyectoId: String(overrides.proyectoId ?? ''),
    proyectoNombre: String(overrides.proyectoNombre ?? ''),
    foco: normalizeFoco(overrides.foco) === 'F2' ? 'F2' : (normalizeFoco(overrides.foco) === 'F1' ? 'F1' : ''),
    actividad: String(overrides.actividad ?? ''),
    entregable: String(overrides.entregable ?? ''),
    indicador: String(overrides.indicador ?? ''),
    unidad: String(overrides.unidad ?? ''),
    lineaBase: String(overrides.lineaBase ?? 'Información insuficiente para concluir'),
    m2027: String(overrides.m2027 ?? ''),
    m2028: String(overrides.m2028 ?? ''),
    m2029: String(overrides.m2029 ?? ''),
    m2030: String(overrides.m2030 ?? ''),
    responsable: String(overrides.responsable ?? ''),
    presupuesto: String(overrides.presupuesto ?? 'Por definir — restricción presupuestal pendiente'),
    riesgo: String(overrides.riesgo ?? ''),
    estado: String(overrides.estado ?? 'Formulada'),
    avance: Math.min(100, Math.max(0, Number(overrides.avance) || 0)),
    estatus: STATUS_LABELS[overrides.estatus] ? overrides.estatus : 'en_construccion'
  };
}

export function createMediaItem(overrides = {}) {
  return {
    id: overrides.id || uid('med'),
    tipo: overrides.tipo === 'imagen' ? 'imagen' : 'video',
    titulo: String(overrides.titulo ?? ''),
    url: String(overrides.url ?? ''),
    foco: normalizeFoco(overrides.foco) || 'F1+F2',
    fuente: String(overrides.fuente ?? ''),
    fecha: String(overrides.fecha ?? ''),
    descripcion: String(overrides.descripcion ?? '')
  };
}

export function defaultState() {
  const competences = {};
  COMPETENCE_MODES.forEach((m) => {
    competences[m.id] = { criterioJuridico: '', normaSoporte: '', estado: 'pendiente' };
  });
  return {
    schemaVersion: 2,
    // Estructura original preservada (v1)
    docs: {
      pnd: blankDoc(),
      choco: blankDoc(),
      ministra: blankDoc(),
      destrabe: blankDoc()
    },
    projects: [],
    updatedAt: null,
    // Extensiones ANI Strategy Lab (v2) — cero contenidos institucionales inventados
    identity: {
      mision: '',
      misionStatus: 'pendiente',
      vision: '',
      visionStatus: 'pendiente',
      naturaleza: '',
      fuenteNormativa: '',
      objetivos: [],
      competences
    },
    indicatorBaselines: {},
    pndAxes: Array.from({ length: 7 }, (_, i) => blankPndAxis(i + 1)),
    customDocs: [],
    opportunities: [],
    actionPlan: [],
    mediaAssets: []
  };
}

/**
 * Migra de forma no destructiva cualquier estado previo v1 o v2
 */
export function migrateState(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== 'object') return base;

  // Preservar las 4 hojas documentales originales
  if (raw.docs && typeof raw.docs === 'object') {
    for (const sheet of BASE_DOC_SHEETS) {
      const src = raw.docs[sheet.id];
      if (src && typeof src === 'object') {
        base.docs[sheet.id] = {
          titulo: String(src.titulo ?? ''),
          fecha: String(src.fecha ?? ''),
          emisor: String(src.emisor ?? ''),
          resumen: String(src.resumen ?? ''),
          puntos: Array.isArray(src.puntos) ? src.puntos.map(String) : [],
          relacionTipo: String(src.relacionTipo ?? ''),
          relacion: String(src.relacion ?? ''),
          contribuciones: Array.isArray(src.contribuciones) ? src.contribuciones.map(String) : [],
          foco: normalizeFoco(src.foco),
          evidencia: String(src.evidencia ?? ''),
          pendiente: String(src.pendiente ?? '')
        };
      }
    }
  }

  // Preservar todos los proyectos PEI originales + normalizar foco
  if (Array.isArray(raw.projects)) {
    base.projects = raw.projects.map((p) => createProject(p));
  }

  base.updatedAt = raw.updatedAt || null;

  // Preservar extensiones v2 si existen
  if (raw.identity && typeof raw.identity === 'object') {
    base.identity = {
      ...base.identity,
      mision: String(raw.identity.mision ?? ''),
      misionStatus: STATUS_LABELS[raw.identity.misionStatus] ? raw.identity.misionStatus : 'pendiente',
      vision: String(raw.identity.vision ?? ''),
      visionStatus: STATUS_LABELS[raw.identity.visionStatus] ? raw.identity.visionStatus : 'pendiente',
      naturaleza: String(raw.identity.naturaleza ?? ''),
      fuenteNormativa: String(raw.identity.fuenteNormativa ?? ''),
      objetivos: Array.isArray(raw.identity.objetivos) ? raw.identity.objetivos : [],
      competences: { ...base.identity.competences, ...(raw.identity.competences || {}) }
    };
  }

  if (raw.indicatorBaselines && typeof raw.indicatorBaselines === 'object') {
    base.indicatorBaselines = { ...raw.indicatorBaselines };
  }

  if (Array.isArray(raw.pndAxes) && raw.pndAxes.length) {
    base.pndAxes = Array.from({ length: 7 }, (_, i) => {
      const found = raw.pndAxes[i] || {};
      const hasContent = found.nombre?.trim() || found.relacionAni?.trim() || found.resumen?.trim();
      return {
        ...blankPndAxis(i + 1),
        ...found,
        numero: i + 1,
        foco: normalizeFoco(found.foco),
        estatus: found.estatus && STATUS_LABELS[found.estatus]
          ? found.estatus
          : (hasContent ? 'en_construccion' : 'pendiente')
      };
    });
  }

  if (Array.isArray(raw.customDocs)) base.customDocs = raw.customDocs;
  if (Array.isArray(raw.opportunities)) base.opportunities = raw.opportunities.map((o) => createOpportunity(o));
  if (Array.isArray(raw.actionPlan)) base.actionPlan = raw.actionPlan.map((a) => createActionItem(a));
  if (Array.isArray(raw.mediaAssets)) base.mediaAssets = raw.mediaAssets.map((m) => createMediaItem(m));

  return base;
}

export function loadStateFromStorage(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return migrateState(JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

export function persistStateToStorage(state, storage = globalThis.localStorage) {
  state.updatedAt = new Date().toISOString();
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota/unavailable */ }
  return state.updatedAt;
}

/* ---------- REGLAS DE VALIDACIÓN Y SCORING ---------- */
export function statusBadge(statusKey) {
  const meta = STATUS_LABELS[statusKey] || STATUS_LABELS.en_construccion;
  return `<span class="badge ${meta.cls}">${esc(meta.label)}</span>`;
}

export function citeBadge(id) {
  return `<button type="button" class="cite-tag" data-cite="${esc(id)}" title="Ver fuente documental verificable [${esc(id)}]">[${esc(id)}]</button>`;
}

export function docComplete(d) {
  if (!d) return false;
  return d.resumen.trim().length >= 20 &&
    d.relacion.trim().length >= 20 &&
    Array.isArray(d.contribuciones) &&
    d.contribuciones.some((c) => c.trim().length > 0);
}

export function pndAxisComplete(ax) {
  return Boolean(ax && ax.nombre.trim().length >= 3 && ax.relacionAni.trim().length >= 10);
}

export function projValid(p) {
  return Boolean(
    p &&
    (p.foco === 'F1' || p.foco === 'F2') &&
    p.objetivo.trim() &&
    p.proyecto.trim() &&
    p.unidad.trim() &&
    p.meta.trim() &&
    p.detalle.trim()
  );
}

export function projScored(p) {
  return Boolean(p?.scores && SCORING_CRITERIA.every(([k]) => p.scores[k] >= 1 && p.scores[k] <= 5));
}

export function projHasBaselineIssue(p) {
  const hasNumMeta = /\d/.test(p?.meta || '') && !/por definir|pendiente|insuficiente/i.test(p?.meta || '');
  const lacksBase = !p?.lineaBase?.trim() || /pendiente|insuficiente|por definir/i.test(p?.lineaBase || '');
  return hasNumMeta && lacksBase;
}

export function projChecklist(p) {
  const f1or2 = p.foco === 'F1' || p.foco === 'F2';
  const hasTags = (p.criterios && p.criterios.length > 0) ||
    (f1or2 && FOCOS[p.foco].tags.some((t) => p.detalle.toLowerCase().includes(t.toLowerCase().slice(0, 6))));
  return [
    ['Foco único (F1/F2)', f1or2],
    ['Objetivo registrado', Boolean(p.objetivo.trim())],
    ['Unidad única', Boolean(p.unidad.trim())],
    ['Meta coherente con línea base', Boolean(p.meta.trim()) && !projHasBaselineIssue(p)],
    ['Criterios F1 / Capacidades F2', Boolean(hasTags && p.detalle.trim())],
    ['Scoring 9 criterios (1–5)', projScored(p)],
    ['Doble llave F1↔F2', Boolean(p.doble.trim())]
  ];
}

export function projScore(p) {
  const s = p.scores;
  const imp = (s.impInst + s.impNac + s.alineacion) / 3;
  const fact = (s.factTec + s.factFin + s.factJur + s.factPol) / 4;
  const eff = 6 - fact;
  return { imp, fact, eff, total: imp + fact };
}

export function projCategory(p) {
  const { imp, eff } = projScore(p);
  if (imp >= 3.5 && eff <= 2.5) return { key: 'q1', label: 'Quick Win', cls: 'badge-ok' };
  if (imp >= 3.5) return { key: 'q2', label: 'Iniciativa Estratégica', cls: 'badge-navy' };
  if (eff <= 2.5) return { key: 'q3', label: 'Descartar / rediseñar', cls: 'badge-warn' };
  return { key: 'q4', label: 'Transformación estructural', cls: 'badge-amber' };
}

export function computeMetrics(state) {
  const docsDone = BASE_DOC_SHEETS.filter((d) => docComplete(state.docs[d.id])).length;
  const axesDone = state.pndAxes.filter(pndAxisComplete).length;
  const projTotal = state.projects.length;
  const projF1 = state.projects.filter((p) => p.foco === 'F1').length;
  const projF2 = state.projects.filter((p) => p.foco === 'F2').length;
  const projOk = state.projects.filter(projValid).length;
  const projDoble = state.projects.filter((p) => p.doble.trim()).length;
  const paTotal = state.actionPlan.length;
  const oppTotal = state.opportunities.length;
  const identityDone = (state.identity.mision.trim() ? 1 : 0) + (state.identity.vision.trim() ? 1 : 0) + (state.identity.objetivos.length > 0 ? 1 : 0);

  // Ponderación integral de avance estratégico
  const docRatio = docsDone / 4;
  const axesRatio = axesDone / 7;
  const idRatio = identityDone / 3;
  const peiRatio = projTotal ? projOk / projTotal : 0;
  const dobleRatio = projTotal ? projDoble / projTotal : 0;
  const paRatio = paTotal > 0 ? 1 : 0;
  const pct = Math.round((docRatio * 0.22 + axesRatio * 0.18 + idRatio * 0.12 + peiRatio * 0.24 + dobleRatio * 0.12 + paRatio * 0.12) * 100);

  return {
    docsDone,
    axesDone,
    projTotal,
    projF1,
    projF2,
    projOk,
    projDoble,
    paTotal,
    oppTotal,
    identityDone,
    totalLibraryDocs: 4 + BASE_DOC_SHEETS.length + state.customDocs.length,
    pct
  };
}

/* ---------- SERIALIZACIÓN E IMPORTACIÓN CSV ---------- */
export function buildCsv(headers, rows) {
  const all = [headers, ...rows];
  return '\ufeff' + all
    .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function buildPeiCsv(projects) {
  // Compatible con las 18 columnas de 02_Plantilla_Ejercicio_PEI_2027-2030.csv + metadatos de trazabilidad
  const head = [
    'FOCO (INICIATIVA)',
    'OBJETIVOS ESTRATÉGICOS',
    'PROYECTO',
    'UNIDAD MEDIDA',
    'META 2030',
    'DETALLE',
    ...SCORING_CRITERIA.map(([, label]) => `SCORING ${label} (1-5)`),
    'DOBLE LLAVE F1-F2 (proyecto asociado)',
    'LÍNEA BASE',
    'VALIDACIÓN (OK / Por definir)',
    'CATEGORÍA MATRIZ',
    'EJE PND',
    'MODO / FRENTE',
    'ESTATUS EDITORIAL'
  ];
  const rows = projects.map((p) => {
    const focoFull = p.foco === 'F1'
      ? `F1 — ${FOCOS.F1.fullName}`
      : p.foco === 'F2'
        ? `F2 — ${FOCOS.F2.fullName}`
        : '';
    const valid = projValid(p) && !projHasBaselineIssue(p) ? 'OK' : 'Por definir';
    return [
      focoFull,
      p.objetivo,
      p.proyecto,
      p.unidad,
      p.meta,
      p.detalle,
      ...SCORING_CRITERIA.map(([k]) => p.scores[k]),
      p.doble,
      p.lineaBase || 'Pendiente',
      valid,
      projCategory(p).label,
      p.ejePnd,
      p.modo,
      STATUS_LABELS[p.estatus]?.label || p.estatus
    ];
  });
  return buildCsv(head, rows);
}

export function buildActionPlanCsv(actionPlan) {
  const head = [
    'CÓDIGO', 'FOCO', 'PROYECTO PEI ASOCIADO', 'ACTIVIDAD', 'ENTREGABLE',
    'INDICADOR DE GESTIÓN', 'UNIDAD', 'LÍNEA BASE',
    'META 2027', 'META 2028', 'META 2029', 'META 2030',
    'RESPONSABLE', 'PRESUPUESTO / RECURSOS', 'RIESGO', 'ESTADO', 'AVANCE %', 'ESTATUS'
  ];
  const rows = actionPlan.map((a, idx) => [
    a.codigo || `PA-${String(idx + 1).padStart(2, '0')}`,
    a.foco,
    a.proyectoNombre,
    a.actividad,
    a.entregable,
    a.indicador,
    a.unidad,
    a.lineaBase,
    a.m2027, a.m2028, a.m2029, a.m2030,
    a.responsable,
    a.presupuesto,
    a.riesgo,
    a.estado,
    a.avance,
    STATUS_LABELS[a.estatus]?.label || a.estatus
  ]);
  return buildCsv(head, rows);
}

export function parseCsvRows(text) {
  const clean = String(text || '').replace(/^\ufeff/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    const next = clean[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
      if (ch === '\r') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

export function importPeiFromCsv(csvText) {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) return [];
  const dataRows = rows.slice(1);
  return dataRows
    .filter((r) => (r[0] || r[2] || '').trim().length > 0)
    .map((r) => {
      const scores = {};
      SCORING_CRITERIA.forEach(([k], idx) => {
        const val = parseInt(r[6 + idx], 10);
        scores[k] = Number.isFinite(val) && val >= 1 && val <= 5 ? val : 3;
      });
      const isIllustrative = /ejemplo ilustrativo/i.test(r[2] || '');
      return createProject({
        foco: normalizeFoco(r[0]),
        objetivo: r[1] || '',
        proyecto: r[2] || '',
        unidad: r[3] || '',
        meta: r[4] || '',
        detalle: r[5] || '',
        scores,
        doble: r[15] || '',
        lineaBase: r[16] || '',
        ejePnd: r[19] || '',
        modo: r[20] || '',
        estatus: isIllustrative ? 'ejemplo_ilustrativo' : 'en_construccion'
      });
    });
}
