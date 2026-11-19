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
  const rawFoco = overrides.foco ?? overrides.Foco ?? '';
  const normFoco = normalizeFoco(rawFoco);
  return {
    id: safeId(overrides.id, 'p'),
    foco: normFoco === 'F2' ? 'F2' : (normFoco === 'F1' ? 'F1' : ''),
    objetivo: String(overrides.objetivo ?? overrides.objetivo_estrategico ?? overrides['Objetivo Estratégico'] ?? ''),
    proyecto: String(overrides.proyecto ?? overrides.Proyecto ?? overrides.nombre ?? ''),
    unidad: String(overrides.unidad ?? overrides.unidad_medida ?? overrides['Unidad de medida'] ?? ''),
    meta: String(overrides.meta ?? overrides.meta_2030 ?? overrides['Meta 2030'] ?? ''),
    detalle: String(overrides.detalle ?? overrides.Detalle ?? overrides.descripcion ?? ''),
    doble: String(overrides.doble ?? overrides.doble_llave ?? ''),
    dobleProyectoId: String(overrides.dobleProyectoId ?? overrides.doble_proyecto_id ?? ''),
    lineaBase: String(overrides.lineaBase ?? overrides.linea_base ?? ''),
    ejePnd: String(overrides.ejePnd ?? overrides.eje_pnd ?? ''),
    modo: String(overrides.modo ?? ''),
    criterios: Array.isArray(overrides.criterios) ? overrides.criterios.map(String) : [],
    estatus: STATUS_LABELS[overrides.estatus] ? overrides.estatus : 'en_construccion',
    fuente: String(overrides.fuente ?? ''),
    scores: mergedScores
  };
}

export function createOpportunity(overrides = {}) {
  return {
    id: safeId(overrides.id, 'opp'),
    foco: normalizeFoco(overrides.foco ?? overrides.Foco) || 'F1',
    titulo: String(overrides.titulo ?? overrides.oportunidad ?? ''),
    ejePnd: String(overrides.ejePnd ?? overrides.eje_pnd ?? ''),
    modo: String(overrides.modo ?? ''),
    competencia: String(overrides.competencia ?? 'Competencia directa'),
    prioridad: String(overrides.prioridad ?? 'Alta'),
    horizonte: String(overrides.horizonte ?? 'Corto (2027)'),
    descripcion: String(overrides.descripcion ?? overrides.detalle ?? ''),
    evidencia: String(overrides.evidencia ?? overrides.fuente ?? ''),
    estatus: STATUS_LABELS[overrides.estatus] ? overrides.estatus : 'en_construccion'
  };
}

/**
 * Crea una fila del Plan de Acción preservando la estructura contractual obligatoria:
 * Foco | Objetivo Estratégico | Proyecto | Actividad | Meta 2027 | Unidad de medida | Detalle
 * más el despliegue plurianual 2028–2030 y seguimiento operativo.
 */
export function createActionItem(overrides = {}) {
  const rawFoco = overrides.foco ?? overrides.Foco ?? '';
  const normFoco = normalizeFoco(rawFoco);
  return {
    id: safeId(overrides.id, 'pa'),
    codigo: String(overrides.codigo ?? ''),
    // 7 columnas contractuales obligatorias del Plan de Acción:
    foco: normFoco === 'F2' ? 'F2' : (normFoco === 'F1' ? 'F1' : ''),
    objetivo: String(overrides.objetivo ?? overrides.objetivo_estrategico ?? overrides['Objetivo Estratégico'] ?? ''),
    proyectoId: String(overrides.proyectoId ?? overrides.proyecto_id ?? ''),
    proyectoNombre: String(overrides.proyectoNombre ?? overrides.proyecto ?? overrides.Proyecto ?? ''),
    actividad: String(overrides.actividad ?? overrides.Actividad ?? ''),
    m2027: String(overrides.m2027 ?? overrides.meta2027 ?? overrides.meta_2027 ?? overrides['Meta 2027'] ?? ''),
    unidad: String(overrides.unidad ?? overrides.unidad_medida ?? overrides['Unidad de medida'] ?? ''),
    detalle: String(overrides.detalle ?? overrides.Detalle ?? overrides.observaciones ?? ''),
    // Campos complementarios de programación plurianual y seguimiento:
    entregable: String(overrides.entregable ?? ''),
    indicador: String(overrides.indicador ?? ''),
    lineaBase: String(overrides.lineaBase ?? overrides.linea_base ?? 'Información insuficiente para concluir'),
    m2028: String(overrides.m2028 ?? overrides.meta_2028 ?? ''),
    m2029: String(overrides.m2029 ?? overrides.meta_2029 ?? ''),
    m2030: String(overrides.m2030 ?? overrides.meta_2030 ?? ''),
    responsable: String(overrides.responsable ?? ''),
    presupuesto: String(overrides.presupuesto ?? 'Por definir — restricción presupuestal pendiente'),
    riesgo: String(overrides.riesgo ?? overrides.riesgos ?? ''),
    estado: String(overrides.estado ?? 'Formulada'),
    avance: Math.min(100, Math.max(0, Number(overrides.avance ?? overrides.avance_pct) || 0)),
    estatus: STATUS_LABELS[overrides.estatus] ? overrides.estatus : 'en_construccion'
  };
}

export function createMediaItem(overrides = {}) {
  return {
    id: safeId(overrides.id, 'med'),
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
    mediaAssets: [],
    mediaSlots: {}
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

  // Preservar todos los proyectos PEI originales + normalizar foco (acepta formato web y Streamlit)
  const rawProjects = Array.isArray(raw.projects)
    ? raw.projects
    : (Array.isArray(raw.pei) ? raw.pei : (Array.isArray(raw.proyectos_pei) ? raw.proyectos_pei : null));
  if (rawProjects) {
    base.projects = rawProjects.map((p) => createProject(p));
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

  const rawCustomDocs = Array.isArray(raw.customDocs) ? raw.customDocs : (Array.isArray(raw.documentos_adicionales) ? raw.documentos_adicionales : null);
  if (rawCustomDocs) base.customDocs = rawCustomDocs;
  const rawOpps = Array.isArray(raw.opportunities) ? raw.opportunities : (Array.isArray(raw.oportunidades) ? raw.oportunidades : null);
  if (rawOpps) base.opportunities = rawOpps.map((o) => createOpportunity(o));
  const rawPa = Array.isArray(raw.actionPlan)
    ? raw.actionPlan
    : (Array.isArray(raw.plan_accion) ? raw.plan_accion : (Array.isArray(raw.plan_de_accion) ? raw.plan_de_accion : null));
  if (rawPa) {
    base.actionPlan = rawPa.map((a) => {
      const item = createActionItem(a);
      // Reconciliar correspondencia con proyecto PEI (por id o nombre) sin sobrescribir datos explícitos
      const parent = (item.proyectoId && base.projects.find((p) => p.id === item.proyectoId))
        || (item.proyectoNombre && base.projects.find((p) => p.proyecto && p.proyecto.trim().toLowerCase() === item.proyectoNombre.trim().toLowerCase()));
      if (parent) {
        if (!item.proyectoId) item.proyectoId = parent.id;
        if (!item.proyectoNombre.trim()) item.proyectoNombre = parent.proyecto;
        if (!item.foco && parent.foco) item.foco = parent.foco;
        if (!item.objetivo.trim() && parent.objetivo.trim()) item.objetivo = parent.objetivo;
      }
      return item;
    });
  }
  const rawMedia = Array.isArray(raw.mediaAssets) ? raw.mediaAssets : (Array.isArray(raw.recursos_media) ? raw.recursos_media : null);
  if (rawMedia) base.mediaAssets = rawMedia.map((m) => createMediaItem(m));
  if (raw.mediaSlots && typeof raw.mediaSlots === 'object') {
    const cleanSlots = {};
    for (const [k, v] of Object.entries(raw.mediaSlots)) {
      if (v && typeof v === 'object') {
        const rawUrl = String(v.url ?? '').trim();
        cleanSlots[k] = {
          titulo: String(v.titulo ?? ''),
          foco: normalizeFoco(v.foco),
          url: rawUrl.startsWith('blob:') ? '' : rawUrl,
          descripcion: String(v.descripcion ?? '')
        };
      }
    }
    base.mediaSlots = cleanSlots;
  }

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

/**
 * Valida las 7 columnas obligatorias del Plan de Acción:
 * Foco | Objetivo Estratégico | Proyecto | Actividad | Meta 2027 | Unidad de medida | Detalle
 */
export function paValid(a) {
  return Boolean(
    a &&
    (a.foco === 'F1' || a.foco === 'F2') &&
    String(a.objetivo || '').trim() &&
    String(a.proyectoNombre || '').trim() &&
    String(a.actividad || '').trim() &&
    String(a.m2027 || '').trim() &&
    String(a.unidad || '').trim() &&
    String(a.detalle || '').trim()
  );
}

export function paHasBaselineIssue(a) {
  const hasNumMeta = /\d/.test(a?.m2027 || '') && !/por definir|pendiente|insuficiente|por validar/i.test(a?.m2027 || '');
  const lacksBase = !a?.lineaBase?.trim() || /pendiente|insuficiente|por definir/i.test(a?.lineaBase || '');
  return hasNumMeta && lacksBase;
}

export function paChecklist(a, projects = []) {
  const parent = a?.proyectoId ? projects.find((p) => p.id === a.proyectoId) : null;
  const coherentFoco = parent ? (!parent.foco || parent.foco === a.foco) : (a.foco === 'F1' || a.foco === 'F2');
  return [
    ['1. Foco (F1/F2)', (a.foco === 'F1' || a.foco === 'F2') && coherentFoco],
    ['2. Objetivo Estratégico', Boolean(String(a.objetivo || '').trim())],
    ['3. Proyecto PEI vinculado', Boolean(String(a.proyectoNombre || '').trim() && (parent || !projects.length))],
    ['4. Actividad definida', Boolean(String(a.actividad || '').trim())],
    ['5. Meta 2027 coherente', Boolean(String(a.m2027 || '').trim()) && !paHasBaselineIssue(a)],
    ['6. Unidad de medida', Boolean(String(a.unidad || '').trim())],
    ['7. Detalle técnico', Boolean(String(a.detalle || '').trim())]
  ];
}

/**
 * Mantiene la correspondencia viva entre un proyecto PEI y sus actividades del Plan de Acción
 */
export function syncActionPlanWithProject(state, project) {
  if (!state?.actionPlan || !project?.id) return 0;
  let updated = 0;
  for (const a of state.actionPlan) {
    if (a.proyectoId === project.id) {
      if (project.foco) a.foco = project.foco;
      if (project.proyecto?.trim()) a.proyectoNombre = project.proyecto;
      if (project.objetivo?.trim()) a.objetivo = project.objetivo;
      updated += 1;
    }
  }
  // Sincronizar etiqueta de Doble Llave en proyectos emparejados
  for (const p of state.projects || []) {
    if (p.dobleProyectoId === project.id && project.proyecto?.trim()) {
      p.doble = `[${project.foco || 'F1/F2'}] ${project.proyecto}`;
    }
  }
  return updated;
}

/**
 * Calcula correspondencia integral PEI 2027–2030 ↔ Plan de Acción y articulación Doble Llave F1↔F2
 */
export function computeCorrespondence(state) {
  const projects = state.projects || [];
  const actions = state.actionPlan || [];
  const byProject = new Map();
  projects.forEach((p) => byProject.set(p.id, []));

  const orphanActions = [];
  const focoMismatches = [];

  for (const a of actions) {
    const parent = (a.proyectoId && projects.find((p) => p.id === a.proyectoId))
      || (a.proyectoNombre && projects.find((p) => p.proyecto && p.proyecto.trim().toLowerCase() === a.proyectoNombre.trim().toLowerCase()));
    if (parent) {
      byProject.get(parent.id)?.push(a);
      if (parent.foco && a.foco && parent.foco !== a.foco) {
        focoMismatches.push({ action: a, project: parent });
      }
    } else {
      orphanActions.push(a);
    }
  }

  const projectRows = projects.map((p) => {
    const linkedActions = byProject.get(p.id) || [];
    const partner = p.dobleProyectoId ? projects.find((x) => x.id === p.dobleProyectoId) : null;
    const hasDoubleKey = Boolean(partner || (p.doble && p.doble.trim().length >= 5));
    const avgAvance = linkedActions.length
      ? Math.round(linkedActions.reduce((s, x) => s + (Number(x.avance) || 0), 0) / linkedActions.length)
      : 0;
    return {
      project: p,
      linkedActions,
      partner,
      hasDoubleKey,
      hasPa: linkedActions.length > 0,
      validPaCount: linkedActions.filter(paValid).length,
      avgAvance
    };
  });

  const coveredProjects = projectRows.filter((r) => r.hasPa).length;
  const uncoveredProjects = projectRows.filter((r) => !r.hasPa).map((r) => r.project);
  const doubleKeyProjects = projectRows.filter((r) => r.hasDoubleKey).length;
  const hasF1 = projects.some((p) => p.foco === 'F1');
  const hasF2 = projects.some((p) => p.foco === 'F2');

  return {
    projectRows,
    coveredProjects,
    uncoveredProjects,
    orphanActions,
    focoMismatches,
    doubleKeyProjects,
    balancedFocos: hasF1 && hasF2,
    coveragePct: projects.length ? Math.round((coveredProjects / projects.length) * 100) : 0,
    doubleKeyPct: projects.length ? Math.round((doubleKeyProjects / projects.length) * 100) : 0
  };
}

export function computeMetrics(state) {
  const docsDone = BASE_DOC_SHEETS.filter((d) => docComplete(state.docs[d.id])).length;
  const axesDone = state.pndAxes.filter(pndAxisComplete).length;
  const projTotal = state.projects.length;
  const projF1 = state.projects.filter((p) => p.foco === 'F1').length;
  const projF2 = state.projects.filter((p) => p.foco === 'F2').length;
  const projOk = state.projects.filter((p) => projValid(p) && !projHasBaselineIssue(p)).length;
  const projDoble = state.projects.filter((p) => p.doble.trim() || p.dobleProyectoId).length;
  const paTotal = state.actionPlan.length;
  const paF1 = state.actionPlan.filter((a) => a.foco === 'F1').length;
  const paF2 = state.actionPlan.filter((a) => a.foco === 'F2').length;
  const paOk = state.actionPlan.filter((a) => paValid(a) && !paHasBaselineIssue(a)).length;
  const corr = computeCorrespondence(state);
  const oppTotal = state.opportunities.length;
  const identityDone = (state.identity.mision.trim() ? 1 : 0) + (state.identity.vision.trim() ? 1 : 0) + (state.identity.objetivos.length > 0 ? 1 : 0);

  // Ponderación integral de avance estratégico (incluye validez 7 col. PA y correspondencia PEI↔PA)
  const docRatio = docsDone / 4;
  const axesRatio = axesDone / 7;
  const idRatio = identityDone / 3;
  const peiRatio = projTotal ? projOk / projTotal : 0;
  const dobleRatio = projTotal ? projDoble / projTotal : 0;
  const paRatio = paTotal ? (0.5 * (paOk / paTotal) + 0.5 * (projTotal ? corr.coveredProjects / projTotal : 1)) : 0;
  const pct = Math.round((docRatio * 0.20 + axesRatio * 0.16 + idRatio * 0.12 + peiRatio * 0.24 + dobleRatio * 0.12 + paRatio * 0.16) * 100);

  return {
    docsDone,
    axesDone,
    projTotal,
    projF1,
    projF2,
    projOk,
    projDoble,
    paTotal,
    paF1,
    paF2,
    paOk,
    peiCovered: corr.coveredProjects,
    paOrphans: corr.orphanActions.length,
    balancedFocos: corr.balancedFocos,
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

/**
 * Exporta el Plan de Acción iniciando con las 7 columnas obligatorias exactas:
 * Foco | Objetivo Estratégico | Proyecto | Actividad | Meta 2027 | Unidad de medida | Detalle
 * seguidas por las columnas de programación plurianual 2028–2030 y trazabilidad operativa.
 */
export function buildActionPlanCsv(actionPlan) {
  const head = [
    'FOCO',
    'OBJETIVO ESTRATÉGICO',
    'PROYECTO',
    'ACTIVIDAD',
    'META 2027',
    'UNIDAD DE MEDIDA',
    'DETALLE',
    'CÓDIGO',
    'ENTREGABLE',
    'INDICADOR DE GESTIÓN',
    'LÍNEA BASE',
    'META 2028',
    'META 2029',
    'META 2030',
    'RESPONSABLE',
    'PRESUPUESTO / RECURSOS',
    'RIESGO',
    'ESTADO',
    'AVANCE %',
    'VALIDACIÓN (OK / Por definir)',
    'ESTATUS'
  ];
  const rows = actionPlan.map((a, idx) => {
    const valid = paValid(a) && !paHasBaselineIssue(a) ? 'OK' : 'Por definir';
    return [
      a.foco,
      a.objetivo,
      a.proyectoNombre,
      a.actividad,
      a.m2027,
      a.unidad,
      a.detalle,
      a.codigo || `PA-${String(idx + 1).padStart(2, '0')}`,
      a.entregable,
      a.indicador,
      a.lineaBase,
      a.m2028,
      a.m2029,
      a.m2030,
      a.responsable,
      a.presupuesto,
      a.riesgo,
      a.estado,
      a.avance,
      valid,
      STATUS_LABELS[a.estatus]?.label || a.estatus
    ];
  });
  return buildCsv(head, rows);
}

export function buildActionPlanTemplateCsv() {
  const head = [
    'FOCO',
    'OBJETIVO ESTRATÉGICO',
    'PROYECTO',
    'ACTIVIDAD',
    'META 2027',
    'UNIDAD DE MEDIDA',
    'DETALLE'
  ];
  return buildCsv(head, []);
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
      const statusCol = String(r[21] || '').trim();
      const matchedStatus = statusCol
        ? Object.entries(STATUS_LABELS).find(([k, v]) => k === statusCol || v.label.toLowerCase() === statusCol.toLowerCase())
        : null;
      return createProject({
        foco: normalizeFoco(r[0]),
        objetivo: r[1] || '',
        proyecto: r[2] || '',
        unidad: r[3] || '',
        meta: r[4] || '',
        detalle: r[5] || '',
        scores,
        doble: r[15] || '',
        lineaBase: r[16] && r[16].trim() !== 'Pendiente' ? r[16] : '',
        ejePnd: r[19] || '',
        modo: r[20] || '',
        estatus: matchedStatus ? matchedStatus[0] : (isIllustrative ? 'ejemplo_ilustrativo' : 'en_construccion')
      });
    });
}

export function importActionPlanFromCsv(csvText, projects = []) {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) return [];
  const normH = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const header = rows[0].map(normH);
  const dataRows = rows.slice(1);

  // Detectar formato legado (CÓDIGO en columna 0) vs formato contractual obligatorio (FOCO | OBJETIVO ESTRATÉGICO | PROYECTO | ACTIVIDAD | META 2027 | UNIDAD DE MEDIDA | DETALLE)
  const isLegacy = header[0] === 'codigo';
  const findCol = (...patterns) => header.findIndex((h) => patterns.some((rx) => rx.test(h)));

  const idxFoco = isLegacy ? 1 : Math.max(0, findCol(/^foco/));
  const idxObj = isLegacy ? -1 : findCol(/objetivo/);
  const idxProj = isLegacy ? 2 : findCol(/^proyecto/);
  const idxAct = isLegacy ? 3 : findCol(/^actividad/);
  const idxM2027 = isLegacy ? 8 : findCol(/meta\s*2027/);
  const idxUnidad = isLegacy ? 6 : findCol(/^unidad/);
  const idxDetalle = isLegacy ? -1 : findCol(/^detalle|observacion/);
  const idxCodigo = isLegacy ? 0 : findCol(/^codigo/);
  const idxEnt = isLegacy ? 4 : findCol(/^entregable/);
  const idxInd = isLegacy ? 5 : findCol(/^indicador/);
  const idxLb = isLegacy ? 7 : findCol(/linea\s*base/);
  const idxM2028 = isLegacy ? 9 : findCol(/meta\s*2028/);
  const idxM2029 = isLegacy ? 10 : findCol(/meta\s*2029/);
  const idxM2030 = isLegacy ? 11 : findCol(/meta\s*2030/);
  const idxResp = isLegacy ? 12 : findCol(/^responsable/);
  const idxPres = isLegacy ? 13 : findCol(/^presupuesto/);
  const idxRiesgo = isLegacy ? 14 : findCol(/^riesgo/);
  const idxEstado = isLegacy ? 15 : findCol(/^estado$/);
  const idxAvance = isLegacy ? 16 : findCol(/^avance/);
  const idxEstatus = isLegacy ? 17 : findCol(/^estatus/);

  const cellAt = (r, i) => (i >= 0 && i < r.length ? String(r[i] || '').trim() : '');

  return dataRows
    .filter((r) => (cellAt(r, idxFoco) || cellAt(r, idxProj) || cellAt(r, idxAct)).length > 0)
    .map((r) => {
      const projLabel = cellAt(r, idxProj);
      const linked = projects.find((p) => p.proyecto && p.proyecto.trim().toLowerCase() === projLabel.toLowerCase());
      const pct = Math.max(0, Math.min(100, parseInt(cellAt(r, idxAvance), 10) || 0));
      const statusCol = cellAt(r, idxEstatus);
      const matchedStatus = statusCol
        ? Object.entries(STATUS_LABELS).find(([k, v]) => k === statusCol || v.label.toLowerCase() === statusCol.toLowerCase())
        : null;
      const objVal = cellAt(r, idxObj) || linked?.objetivo || '';
      const lbVal = cellAt(r, idxLb);
      const presVal = cellAt(r, idxPres);
      return createActionItem({
        codigo: cellAt(r, idxCodigo),
        foco: normalizeFoco(cellAt(r, idxFoco) || linked?.foco || ''),
        objetivo: objVal,
        proyectoId: linked ? linked.id : '',
        proyectoNombre: linked ? linked.proyecto : projLabel,
        actividad: cellAt(r, idxAct),
        m2027: cellAt(r, idxM2027),
        unidad: cellAt(r, idxUnidad),
        detalle: cellAt(r, idxDetalle),
        entregable: cellAt(r, idxEnt),
        indicador: cellAt(r, idxInd),
        lineaBase: lbVal || 'Información insuficiente para concluir',
        m2028: cellAt(r, idxM2028),
        m2029: cellAt(r, idxM2029),
        m2030: cellAt(r, idxM2030),
        responsable: cellAt(r, idxResp),
        presupuesto: presVal || 'Por definir — restricción presupuestal pendiente',
        riesgo: cellAt(r, idxRiesgo),
        estado: cellAt(r, idxEstado) || 'Formulada',
        avance: pct,
        estatus: matchedStatus ? matchedStatus[0] : 'en_construccion'
      });
    });
}

export function buildOpportunitiesCsv(opportunities = []) {
  const head = ['N°', 'FOCO', 'EJE PND', 'OPORTUNIDAD ESTRATÉGICA', 'MODO / CAPACIDAD', 'ENCAJE COMPETENCIA ANI', 'ANÁLISIS ESTRATÉGICO', 'EVIDENCIA / FUENTE', 'ESTATUS'];
  const rows = opportunities.map((o, i) => [
    i + 1,
    o.foco,
    o.ejePnd,
    o.titulo,
    o.modo,
    o.competencia,
    o.descripcion,
    o.evidencia,
    STATUS_LABELS[o.estatus]?.label || o.estatus
  ]);
  return buildCsv(head, rows);
}
