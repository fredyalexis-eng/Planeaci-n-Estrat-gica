/**
 * ANI STRATEGY LAB — Renderizadores Ejecutivos de Módulos 01 a 05
 * (01 Centro de Mando · 02 Identidad · 03 Dos Focos · 04 PND y Biblioteca · 05 Oportunidades)
 */
import {
  FOCOS,
  COMPETENCE_MODES,
  DOCUMENTAL_FINDINGS,
  STRATEGIC_MAP,
  PROBLEM_OBJECTIVE_TREES,
  THEORY_OF_CHANGE,
  PROPOSED_INDICATORS,
  ROADMAP_2027_2030,
  RECOMMENDATIONS,
  STRATEGIC_RISKS,
  BASE_DOC_SHEETS,
  REPO_DOCUMENTS,
  ANI_INSTITUTIONAL_IDENTITY,
  PND_7_AXES_OFFICIAL,
  DOFA_ANI_MATRIX
} from '../../data/knowledge-base.js';
import {
  esc,
  statusBadge,
  citeBadge,
  docComplete,
  pndAxisComplete,
  projValid,
  projScored,
  projCategory,
  paValid,
  computeMetrics
} from './state.js';

function renderConsolidationRingSvg(pct) {
  const safe = Math.max(0, Math.min(100, Number(pct) || 0));
  const r = 46;
  const circ = 2 * Math.PI * r;
  const offset = (circ * (1 - safe / 100)).toFixed(2);
  return `<svg viewBox="0 0 120 120" class="ring-svg" role="img" aria-label="Consolidación metodológica ${safe}%">
    <defs>
      <linearGradient id="aniRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0E9B9B"/>
        <stop offset="65%" stop-color="#0B4F7C"/>
        <stop offset="100%" stop-color="#F2A900"/>
      </linearGradient>
    </defs>
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="#E5ECF4" stroke-width="10"/>
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="url(#aniRingGrad)" stroke-width="10"
      stroke-linecap="round" stroke-dasharray="${circ.toFixed(2)}" stroke-dashoffset="${offset}"
      transform="rotate(-90 60 60)"/>
    <text x="60" y="57" text-anchor="middle" font-size="22" font-weight="850" fill="#0B2C4A">${safe}%</text>
    <text x="60" y="73" text-anchor="middle" font-size="8.8" font-weight="700" fill="#5B6B7C" letter-spacing="0.4">CONSOLIDACIÓN</text>
  </svg>`;
}

/* ==================== MÓDULO 01: CENTRO DE MANDO EJECUTIVO ==================== */
export function renderDashboard(state) {
  const m = computeMetrics(state);
  const f1Actions = m.paF1;
  const f2Actions = m.paF2;

  const checklist = [
    ['Identidad y objetivos cargados', m.identityDone === 3, `${m.identityDone}/3`],
    ['7 Ejes del PND con relación ANI', m.axesDone === 7, `${m.axesDone}/7`],
    ['4 fichas documentales completas', m.docsDone === 4, `${m.docsDone}/4`],
    ['Cartera PEI iniciada', m.projTotal > 0, `${m.projTotal}`],
    ['PEI válido (6 columnas + R6)', m.projTotal > 0 && m.projOk === m.projTotal, `${m.projOk}/${m.projTotal}`],
    ['Scoring 1–5 completo', m.projTotal > 0 && state.projects.every(projScored), m.projTotal ? 'OK' : '0'],
    ['Doble llave F1↔F2 declarada', m.projTotal > 0 && m.projDoble === m.projTotal, `${m.projDoble}/${m.projTotal}`],
    ['Plan de Acción válido (7 columnas)', m.paTotal > 0 && m.paOk === m.paTotal, `${m.paOk}/${m.paTotal}`],
    ['Correspondencia PEI → Plan de Acción', m.projTotal > 0 && m.peiCovered === m.projTotal && m.paOrphans === 0, `${m.peiCovered}/${m.projTotal}`]
  ];

  const pillars = [
    { label: 'Identidad y Objetivos ANI', ratio: Math.round((m.identityDone / 3) * 100), meta: `${m.identityDone}/3`, mod: 'identity' },
    { label: '7 Ejes del PND → ANI', ratio: Math.round((m.axesDone / 7) * 100), meta: `${m.axesDone}/7`, mod: 'pnd-docs' },
    { label: 'Biblioteca Documental Base', ratio: Math.round((m.docsDone / 4) * 100), meta: `${m.docsDone}/4`, mod: 'pnd-docs' },
    { label: 'Cartera PEI (6 columnas)', ratio: m.projTotal ? Math.round((m.projOk / m.projTotal) * 100) : 0, meta: `${m.projOk}/${m.projTotal}`, mod: 'pei' },
    { label: 'Doble Llave F1 ↔ F2', ratio: m.projTotal ? Math.round((m.projDoble / m.projTotal) * 100) : 0, meta: `${m.projDoble}/${m.projTotal}`, mod: 'pei' },
    { label: 'Plan de Acción (7 col. + PEI)', ratio: m.paTotal ? Math.round((m.paOk / m.paTotal) * 100) : 0, meta: `${m.paOk}/${m.paTotal}`, mod: 'action-plan' }
  ];

  const peiF1Pct = m.projTotal ? Math.round((m.projF1 / m.projTotal) * 100) : 50;
  const paF1Pct = m.paTotal ? Math.round((f1Actions / m.paTotal) * 100) : 50;

  const docSummaryRows = BASE_DOC_SHEETS.map((d) => {
    const x = state.docs[d.id];
    return `<tr>
      <td><b>${esc(d.name)}</b></td>
      <td>${x.resumen.trim() ? esc(x.resumen.slice(0, 190)) : '<span class="badge badge-warn">Información insuficiente — pendiente</span>'}</td>
      <td>${x.relacion.trim() ? esc(x.relacion.slice(0, 190)) : '—'}</td>
      <td>${x.foco ? `<span class="badge ${x.foco === 'F1' ? 'badge-teal' : x.foco === 'F2' ? 'badge-amber' : 'badge-navy'}">${esc(x.foco)}</span>` : '—'}</td>
    </tr>`;
  }).join('');

  const projSummaryRows = state.projects.length
    ? state.projects.map((p) => {
        const cat = projCategory(p);
        return `<tr>
          <td>${p.foco ? `<span class="badge ${p.foco === 'F1' ? 'badge-teal' : 'badge-amber'}">${esc(p.foco)}</span>` : '—'}</td>
          <td>${esc(p.objetivo || 'Pendiente')}</td>
          <td><b>${esc(p.proyecto || 'Sin nombre')}</b><br>${statusBadge(p.estatus)}</td>
          <td>${esc(p.unidad || '—')}</td>
          <td><b>${esc(p.meta || 'Por definir')}</b><br><small class="muted">LB: ${esc(p.lineaBase || 'Pendiente')}</small></td>
          <td style="max-width:250px">${esc(p.detalle || '—')}<br><small class="muted"><b>Doble llave:</b> ${esc(p.doble || 'Sin declarar')}</small></td>
          <td><span class="badge ${cat.cls}">${esc(cat.label)}</span></td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="7" class="muted">Sin proyectos registrados aún en la Cartera PEI 2027–2030. Inicie en el Módulo 06.</td></tr>`;

  const paSummaryRows = state.actionPlan.length
    ? state.actionPlan.map((a) => `<tr>
        <td>${a.foco ? `<span class="badge ${a.foco === 'F1' ? 'badge-teal' : 'badge-amber'}">${esc(a.foco)}</span>` : '—'}</td>
        <td>${esc(a.objetivo || 'Pendiente')}</td>
        <td><b>${esc(a.proyectoNombre || 'Sin proyecto PEI')}</b></td>
        <td><b>${esc(a.actividad || 'Sin nombre')}</b><br>${statusBadge(a.estatus)}</td>
        <td><b>${esc(a.m2027 || 'Por definir')}</b></td>
        <td>${esc(a.unidad || '—')}</td>
        <td style="max-width:250px">${esc(a.detalle || a.entregable || '—')}</td>
      </tr>`).join('')
    : `<tr><td colspan="7" class="muted">Sin actividades registradas aún en el Plan de Acción. Desagregue sus proyectos PEI en el Módulo 07.</td></tr>`;

  return `
  <div class="hero-banner">
    <div class="hero-kicker">Agencia Nacional de Infraestructura · Horizonte 2027–2030</div>
    <h2>ANI STRATEGY LAB — Planeación e Inteligencia Estratégica</h2>
    <p class="hero-thesis">
      Arquitectura institucional trazable sobre los <b>2 Focos Estratégicos</b> derivados de las Iniciativas del PND:
      <b>F1 sin F2 = obra bloqueada; F2 sin F1 = gestión sin resultado físico.</b>
      Toda meta numérica exige línea base verificada y ninguna propuesta de IA sustituye decisiones oficiales de la ANI.
    </p>
    <div class="hero-actions no-print">
      <button class="btn btn-teal" onclick="ANI.go('focos')">Explorar 2 Focos y Mapa Causal</button>
      <button class="btn btn-amber" onclick="ANI.go('pei')">Gestionar Cartera PEI</button>
      <button class="btn btn-hero-light" onclick="ANI.go('action-plan')">Plan de Acción 2027–2030</button>
      <button class="btn btn-hero-light" onclick="ANI.go('pnd-docs')">7 Ejes PND y Biblioteca</button>
      <button class="btn btn-hero-light" onclick="ANI.go('agent')">Agente Estratégico IA</button>
    </div>
  </div>

  <div class="grid-6" style="margin-bottom:16px">
    <div class="kpi-card kpi-accent-navy">
      <span class="kpi-label">Avance Integral</span>
      <span class="kpi-value" data-kpi="pct">${m.pct}%</span>
      <span class="kpi-sub">Consolidación metodológica</span>
    </div>
    <div class="kpi-card kpi-accent-teal">
      <span class="kpi-label">Cartera PEI (6 col.)</span>
      <span class="kpi-value" data-kpi="projTotal">${m.projTotal}</span>
      <span class="kpi-sub" data-kpi="projSplit">F1: ${m.projF1} · F2: ${m.projF2} · Válidas: ${m.projOk}</span>
    </div>
    <div class="kpi-card kpi-accent-amber">
      <span class="kpi-label">Plan de Acción (7 col.)</span>
      <span class="kpi-value" data-kpi="paTotal">${m.paTotal}</span>
      <span class="kpi-sub">Válidas: ${m.paOk} · PEI cubiertos: ${m.peiCovered}/${m.projTotal}</span>
    </div>
    <div class="kpi-card kpi-accent-navy">
      <span class="kpi-label">Ejes del PND</span>
      <span class="kpi-value" data-kpi="axesDone">${m.axesDone}/7</span>
      <span class="kpi-sub">Con análisis ANI</span>
    </div>
    <div class="kpi-card kpi-accent-teal">
      <span class="kpi-label">Biblioteca</span>
      <span class="kpi-value" data-kpi="docsDone">${m.docsDone}/4</span>
      <span class="kpi-sub">+ 4 base repo · ${state.customDocs.length} ampliados</span>
    </div>
    <div class="kpi-card kpi-accent-amber">
      <span class="kpi-label">Oportunidades</span>
      <span class="kpi-value" data-kpi="oppTotal">${m.oppTotal}</span>
      <span class="kpi-sub">+ 6 recomendaciones R1–R6</span>
    </div>
  </div>

  <!-- PANEL ANALÍTICO EJECUTIVO: CONSOLIDACIÓN, EQUILIBRIO F1↔F2 Y CADENA PEI→PA -->
  <div class="grid-2" style="margin-bottom:16px">
    <div class="card" style="margin:0">
      <div class="card-header">
        <div>
          <h2>Tablero de Madurez Metodológica</h2>
          <p class="muted">Progreso real verificable sobre los 6 pilares del ejercicio estratégico (sin cifras simuladas).</p>
        </div>
        <span class="badge badge-navy">${checklist.filter((c) => c[1]).length}/${checklist.length} hitos OK</span>
      </div>
      <div class="analytics-split">
        <div class="ring-wrap">${renderConsolidationRingSvg(m.pct)}</div>
        <div class="pillar-bars">
          ${pillars.map((pl) => `<button type="button" class="pillar-row" onclick="ANI.go('${pl.mod}')">
            <div class="pillar-row-top"><span>${esc(pl.label)}</span><b>${esc(pl.meta)} (${pl.ratio}%)</b></div>
            <div class="mini-bar"><i style="width:${pl.ratio}%"></i></div>
          </button>`).join('')}
        </div>
      </div>
    </div>

    <div class="card" style="margin:0">
      <div class="card-header">
        <div>
          <h2>Equilibrio Doble Llave (F1 ↔ F2) y Trazabilidad PEI → PA</h2>
          <p class="muted">Articulación en vivo entre Foco 1, Foco 2, Cartera PEI (Meta 2030) y Plan de Acción (Meta 2027).</p>
        </div>
        <button class="btn btn-soft btn-xs no-print" onclick="ANI.openCorrespondenceView()">Ver matriz PEI↔PA →</button>
      </div>

      <div class="balance-block">
        <div class="pillar-row-top">
          <span><b>Cartera PEI 2027–2030</b> (F1: ${m.projF1} · F2: ${m.projF2})</span>
          <span class="badge ${m.projTotal === 0 ? 'badge-slate' : m.balancedFocos ? 'badge-ok' : 'badge-warn'}">
            ${m.projTotal === 0 ? 'Sin filas aún' : m.balancedFocos ? 'F1 + F2 articulados' : 'Requiere contraparte F1/F2'}
          </span>
        </div>
        <div class="dual-bar" title="Distribución Foco 1 vs Foco 2 en Cartera PEI">
          <span class="dual-f1" style="width:${m.projTotal ? peiF1Pct : 0}%"></span>
          <span class="dual-f2" style="width:${m.projTotal ? (100 - peiF1Pct) : 0}%"></span>
        </div>
      </div>

      <div class="balance-block">
        <div class="pillar-row-top">
          <span><b>Plan de Acción</b> (F1: ${f1Actions} · F2: ${f2Actions})</span>
          <span class="badge ${m.paTotal === 0 ? 'badge-slate' : m.paOrphans === 0 ? 'badge-ok' : 'badge-warn'}">
            ${m.paTotal === 0 ? 'Sin actividades aún' : m.paOrphans === 0 ? '100% vinculado al PEI' : `${m.paOrphans} sin vincular`}
          </span>
        </div>
        <div class="dual-bar" title="Distribución Foco 1 vs Foco 2 en Plan de Acción">
          <span class="dual-f1" style="width:${m.paTotal ? paF1Pct : 0}%"></span>
          <span class="dual-f2" style="width:${m.paTotal ? (100 - paF1Pct) : 0}%"></span>
        </div>
      </div>

      <div class="trace-pipeline no-print">
        <button type="button" class="pipe-step" onclick="ANI.go('pnd-docs')"><small>1. Mandatos</small><b>PND · ${m.axesDone}/7</b></button>
        <span class="pipe-arrow" aria-hidden="true">→</span>
        <button type="button" class="pipe-step" onclick="ANI.go('opportunities')"><small>2. Análisis</small><b>Oport. · ${m.oppTotal}</b></button>
        <span class="pipe-arrow" aria-hidden="true">→</span>
        <button type="button" class="pipe-step" onclick="ANI.go('pei')"><small>3. Meta 2030</small><b>PEI · ${m.projTotal}</b></button>
        <span class="pipe-arrow" aria-hidden="true">→</span>
        <button type="button" class="pipe-step" onclick="ANI.go('action-plan')"><small>4. Meta 2027</small><b>PA · ${m.paTotal}</b></button>
      </div>
    </div>
  </div>

  <div class="grid-2" style="margin-bottom:16px">
    ${['F1', 'F2'].map((code) => {
      const f = FOCOS[code];
      const pCount = code === 'F1' ? m.projF1 : m.projF2;
      const aCount = code === 'F1' ? f1Actions : f2Actions;
      return `<article class="foco-card">
        <div class="foco-stripe ${f.color}"></div>
        <div class="foco-body">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap">
            <span class="badge ${code === 'F1' ? 'badge-teal' : 'badge-amber'}">${f.code} · ${esc(f.role)}</span>
            ${citeBadge(f.citation)}
          </div>
          <h3 style="font-size:15.5px;margin:2px 0">${esc(f.code)}. ${esc(f.fullName)}</h3>
          <p class="muted" style="margin:0">${esc(f.description)}</p>
          <div>
            <small style="font-weight:700;color:var(--navy-900);display:block;margin-bottom:5px">${esc(f.tagLabel)}:</small>
            <div class="tag-cloud">${f.tags.map((t) => `<span class="badge">${esc(t)}</span>`).join('')}</div>
          </div>
          <div style="margin-top:auto;padding-top:8px;border-top:1px solid var(--line);display:flex;justify-content:space-between;font-size:12px;color:var(--muted)">
            <span><b>${pCount}</b> proyecto(s) PEI · <b>${aCount}</b> actividad(es) PA</span>
            <button class="btn btn-outline btn-xs no-print" onclick="ANI.quickAddProject('${code}')">+ Proyecto ${code}</button>
          </div>
        </div>
      </article>`;
    }).join('')}
  </div>

  <div class="card">
    <div class="card-header">
      <div>
        <h2>Hoja de Ruta Estratégica 2027–2030</h2>
        <p class="muted">Secuencia institucional por horizontes extraída del Marco Estratégico ANI.</p>
      </div>
      ${citeBadge('MARCO-S3.7')}
    </div>
    <div class="table-wrap">
      <table class="exec-table">
        <thead><tr><th>Horizonte</th><th>Foco 1 (Portafolio Multimodal)</th><th>Foco 2 (Ruta Social Preventiva)</th><th>Gestión Transversal</th></tr></thead>
        <tbody>
          ${ROADMAP_2027_2030.map((r) => `<tr>
            <td><b>${esc(r.horizonte)}</b><br><small class="muted">${esc(r.fase)}</small></td>
            <td>${esc(r.f1)}</td>
            <td>${esc(r.f2)}</td>
            <td>${esc(r.transversal)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div>
        <h2>Checklist Automático de Gobernanza y Trazabilidad</h2>
        <p class="muted">Se actualiza en tiempo real conforme diligencia documentos, ejes PND, cartera PEI y Plan de Acción.</p>
      </div>
      <button class="btn btn-soft btn-sm no-print" onclick="ANI.openAuditTab()">Ejecutar auditoría R1–R6</button>
    </div>
    <div class="tag-cloud">
      ${checklist.map(([txt, ok, count]) => `<span class="badge ${ok ? 'badge-ok' : 'badge-warn'}">${ok ? '✓' : '○'} ${esc(txt)} (${esc(count)})</span>`).join('')}
    </div>
  </div>

  <div class="card" id="executive-summary-block">
    <div class="card-header">
      <div>
        <h2>Síntesis Ejecutiva Consolidada (Exportable / Imprimible)</h2>
        <p class="muted">Consolidado en vivo de documentos y cartera PEI 2027–2030 sin inventar datos pendientes.</p>
      </div>
      <div class="toolbar no-print" style="margin:0">
        <button class="btn btn-teal btn-sm" onclick="ANI.exportPeiCsv()">Exportar CSV PEI</button>
        <button class="btn btn-outline btn-sm" onclick="ANI.exportActionCsv()">Exportar CSV Plan Acción</button>
        <button class="btn btn-navy btn-sm" onclick="ANI.exportJson()">Respaldo JSON</button>
        <button class="btn btn-outline btn-sm" onclick="window.print()">Imprimir / PDF</button>
      </div>
    </div>
    <h3 style="margin-top:8px">1. Fichas Documentales Base → Relación ANI</h3>
    <div class="table-wrap" style="margin-bottom:14px">
      <table class="exec-table">
        <thead><tr><th>Documento</th><th>Lo principal</th><th>Relación ANI</th><th>Foco</th></tr></thead>
        <tbody>${docSummaryRows}</tbody>
      </table>
    </div>
    <h3>2. Cartera PEI 2027–2030 (Estructura Obligatoria — 6 Columnas)</h3>
    <div class="table-wrap" style="margin-bottom:14px">
      <table class="exec-table">
        <thead><tr><th>Foco</th><th>Objetivo Estratégico</th><th>Proyecto</th><th>Unidad de medida</th><th>Meta 2030</th><th>Detalle</th><th>Priorización</th></tr></thead>
        <tbody>${projSummaryRows}</tbody>
      </table>
    </div>
    <h3>3. Plan de Acción (Estructura Obligatoria — 7 Columnas)</h3>
    <div class="table-wrap">
      <table class="exec-table">
        <thead><tr><th>Foco</th><th>Objetivo Estratégico</th><th>Proyecto</th><th>Actividad</th><th>Meta 2027</th><th>Unidad de medida</th><th>Detalle</th></tr></thead>
        <tbody>${paSummaryRows}</tbody>
      </table>
    </div>
  </div>`;
}

/* ==================== MÓDULO 02: IDENTIDAD Y MARCO DE COMPETENCIAS ==================== */
export function renderIdentity(state) {
  const idn = state.identity;
  const statusOpts = (cur) => [
    ['pendiente', 'Pendiente de carga oficial'],
    ['en_construccion', 'En revisión técnica'],
    ['oficial_ani', 'Texto oficial ANI verificado']
  ].map(([v, l]) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${l}</option>`).join('');

  const objRows = idn.objetivos.length
    ? idn.objetivos.map((o, i) => `
      <div class="entity-card" style="padding:13px 15px">
        <div class="grid-3">
          <div>
            <label class="field-label" style="margin-top:0">Código</label>
            <input type="text" value="${esc(o.codigo)}" placeholder="Ej.: OE-01" oninput="ANI.setObjective(${i},'codigo',this.value)">
          </div>
          <div>
            <label class="field-label" style="margin-top:0">Foco asociado</label>
            <select onchange="ANI.setObjective(${i},'foco',this.value)">
              <option value="F1+F2" ${o.foco === 'F1+F2' ? 'selected' : ''}>Transversal (F1 + F2)</option>
              <option value="F1" ${o.foco === 'F1' ? 'selected' : ''}>F1 · Infraestructura dinamizadora</option>
              <option value="F2" ${o.foco === 'F2' ? 'selected' : ''}>F2 · Ruta social preventiva</option>
            </select>
          </div>
          <div>
            <label class="field-label" style="margin-top:0">Estatus documental</label>
            <select onchange="ANI.setObjective(${i},'estatus',this.value)">${statusOpts(o.estatus)}</select>
          </div>
        </div>
        <label class="field-label">Objetivo Estratégico vigente ANI</label>
        <input type="text" value="${esc(o.nombre)}" placeholder="Transcriba literalmente el objetivo oficial vigente (sin inventar)" oninput="ANI.setObjective(${i},'nombre',this.value)">
        <div style="display:flex;gap:8px;align-items:flex-end;margin-top:8px;flex-wrap:wrap">
          <div style="flex:1;min-width:220px">
            <label class="field-label" style="margin-top:0">Fuente oficial / acto administrativo</label>
            <input type="text" value="${esc(o.fuente)}" placeholder="Ej.: Resolución / PEI vigente / página" oninput="ANI.setObjective(${i},'fuente',this.value)">
          </div>
          <button class="btn btn-danger btn-sm" onclick="ANI.removeObjective(${i})">Eliminar</button>
        </div>
      </div>`).join('')
    : `<div class="empty-state">
        <span class="badge badge-warn">Información insuficiente para concluir — Pendiente de carga oficial</span>
        <p class="muted" style="margin:8px 0 12px">Los objetivos estratégicos vigentes de la ANI no figuran en los archivos iniciales del repositorio. Regístrelos aquí a partir del documento oficial para habilitar su selección directa en la Cartera PEI.</p>
        <button class="btn btn-teal btn-sm" onclick="ANI.addObjective()">+ Registrar objetivo estratégico oficial</button>
      </div>`;

  const compRows = COMPETENCE_MODES.map((cm) => {
    const rec = idn.competences?.[cm.id] || { criterioJuridico: '', normaSoporte: '', estado: 'pendiente' };
    const isHigh = cm.id === 'social_productiva';
    return `<tr>
      <td><b>${esc(cm.modo)}</b><br><span class="badge ${cm.foco === 'F1' ? 'badge-teal' : 'badge-amber'}">${cm.foco}</span> ${citeBadge(cm.citation)}</td>
      <td>${esc(cm.alcanceMarco)}</td>
      <td><span class="badge ${isHigh ? 'badge-bad' : 'badge-slate'}">${esc(cm.riesgoR2)}</span></td>
      <td style="min-width:230px">
        <textarea style="min-height:62px" placeholder="${isHigh ? 'R2 obligatorio: defina criterio jurídico escrito cuando corresponde a la ANI…' : 'Criterio de competencia / norma aplicable (pendiente)…'}" oninput="ANI.setCompetence('${cm.id}','criterioJuridico',this.value)">${esc(rec.criterioJuridico)}</textarea>
      </td>
    </tr>`;
  }).join('');

  return `
  <div class="callout callout-teal">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
      <div style="flex:1;min-width:260px">
        <b>Misión y Visión ANI disponibles en el repositorio</b> ${citeBadge('IDENTIDAD-ANI')}<br>
        <span style="font-size:12.4px"><b>Misión:</b> ${esc(ANI_INSTITUTIONAL_IDENTITY.mision)}</span><br>
        <span style="font-size:12.4px"><b>Visión 2030:</b> ${esc(ANI_INSTITUTIONAL_IDENTITY.vision)}</span>
      </div>
      <button class="btn btn-teal btn-sm no-print" onclick="ANI.loadRepoIdentity()">Cargar en fichas editables</button>
    </div>
  </div>
  <div class="callout callout-warn">
    <b>Salvaguarda de rigor institucional</b> ${citeBadge('MARCO-S2.3')}: El repositorio base registra expresamente la
    <b>Misión, Visión y Objetivos Estratégicos vigentes de la ANI</b> como <i>“Información insuficiente para concluir”</i>.
    No se incluye texto inventado: registre únicamente formulaciones oficiales con su fuente normativa verificable.
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-header">
        <h2>Misión Institucional</h2>
        ${statusBadge(idn.mision.trim() ? idn.misionStatus : 'pendiente')}
      </div>
      <textarea placeholder="Información insuficiente para concluir — Transcriba aquí la Misión oficial vigente de la ANI." oninput="ANI.setIdentity('mision',this.value)">${esc(idn.mision)}</textarea>
      <label class="field-label">Estado de verificación</label>
      <select onchange="ANI.setIdentity('misionStatus',this.value)">${statusOpts(idn.misionStatus)}</select>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>Visión Institucional (2030 / Vigente)</h2>
        ${statusBadge(idn.vision.trim() ? idn.visionStatus : 'pendiente')}
      </div>
      <textarea placeholder="Información insuficiente para concluir — Transcriba aquí la Visión oficial vigente o aprobada para el ciclo 2027–2030." oninput="ANI.setIdentity('vision',this.value)">${esc(idn.vision)}</textarea>
      <label class="field-label">Estado de verificación</label>
      <select onchange="ANI.setIdentity('visionStatus',this.value)">${statusOpts(idn.visionStatus)}</select>
    </div>
  </div>

  <div class="card">
    <h2>Naturaleza Jurídica y Fuente Normativa de Soporte</h2>
    <div class="grid-2">
      <div>
        <label class="field-label">Alcance misional y objeto institucional</label>
        <input type="text" value="${esc(idn.naturaleza)}" placeholder="Pendiente de carga oficial (ej.: Decreto de creación/estructura vigente)" oninput="ANI.setIdentity('naturaleza',this.value)">
      </div>
      <div>
        <label class="field-label">Acto administrativo / documento oficial fuente</label>
        <input type="text" value="${esc(idn.fuenteNormativa)}" placeholder="Decreto, Resolución, Acuerdo o documento PEI oficial" oninput="ANI.setIdentity('fuenteNormativa',this.value)">
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div>
        <h2>Catálogo de Objetivos Estratégicos Vigentes ANI</h2>
        <p class="muted">Cumple la regla §5.1: los proyectos PEI deben vincularse a objetivos oficiales vigentes, sin inventar objetivos por fila.</p>
      </div>
      <button class="btn btn-teal btn-sm no-print" onclick="ANI.addObjective()">+ Agregar objetivo</button>
    </div>
    ${objRows}
  </div>

  <div class="card">
    <div class="card-header">
      <div>
        <h2>Matriz de Competencias Modales y Delimitación R2</h2>
        <p class="muted">Modos de infraestructura identificados en Foco 1, capacidades de Foco 2 y control de desbordamiento misional.</p>
      </div>
      ${citeBadge('MARCO-S4')}
    </div>
    <div class="table-wrap">
      <table class="exec-table">
        <thead><tr><th>Modo / Frente</th><th>Alcance en el Marco 2027–2030</th><th>Control Competencia</th><th>Delimitación Jurídica y Norma (Equipo ANI)</th></tr></thead>
        <tbody>${compRows}</tbody>
      </table>
    </div>
  </div>`;
}

/* ==================== MÓDULO 03: LOS DOS FOCOS Y ARQUITECTURA CAUSAL ==================== */
export function renderFocos(state, subtab = 'comparativa') {
  const tabs = [
    ['comparativa', '2 Focos y Doble Llave'],
    ['mapa', 'Mapa Estratégico (6 niveles)'],
    ['arboles', 'Árboles Problema / Objetivo'],
    ['toc', 'Teoría del Cambio'],
    ['indicadores', 'Indicadores (6) y Riesgos (6)']
  ];

  let body = '';
  if (subtab === 'comparativa') {
    body = `
    <div class="grid-2" style="margin-bottom:16px">
      ${['F1', 'F2'].map((c) => {
        const f = FOCOS[c];
        return `<div class="foco-card">
          <div class="foco-stripe ${f.color}"></div>
          <div class="foco-body">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span class="badge ${c === 'F1' ? 'badge-teal' : 'badge-amber'}">${f.code} · ${esc(f.role)}</span>
              ${citeBadge(f.citation)}
            </div>
            <h3>${esc(f.fullName)}</h3>
            <p class="muted" style="margin:0">${esc(f.description)}</p>
            <div class="callout ${c === 'F1' ? 'callout-teal' : 'callout-warn'}" style="margin:4px 0">
              <b>Implicación estratégica:</b> ${esc(f.implication)}
            </div>
            <div>
              <small style="font-weight:750;color:var(--navy-900)">${esc(f.tagLabel)}:</small>
              <div class="tag-cloud" style="margin-top:6px">${f.tags.map((t) => `<span class="badge ${c === 'F1' ? 'badge-teal' : 'badge-amber'}">${esc(t)}</span>`).join('')}</div>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Diagrama Ejecutivo de Articulación: Regla de Doble Llave F1 ↔ F2</h2>
          <p class="muted">Acoplamiento obligatorio entre el portafolio físico multimodal (F1) y la viabilidad socio-territorial preventiva (F2) hacia PEI 2030 y Plan de Acción 2027.</p>
        </div>
        ${citeBadge('MARCO-S2.3')}
      </div>
      <div style="overflow-x:auto">
        <svg viewBox="0 0 860 225" style="width:100%;min-width:620px;height:auto;display:block" role="img" aria-label="Diagrama de articulación Doble Llave Foco 1 y Foco 2 hacia PEI 2030 y Plan de Acción 2027">
          <rect x="8" y="14" width="255" height="196" rx="12" fill="#F0FAFA" stroke="#0E9B9B" stroke-width="2"/>
          <rect x="8" y="14" width="255" height="32" rx="12" fill="#0E9B9B"/>
          <text x="135" y="35" text-anchor="middle" font-size="11.5" font-weight="800" fill="#fff">FOCO 1 · QUÉ SE CONSTRUYE</text>
          <text x="22" y="68" font-size="11" font-weight="700" fill="#0B2C4A">5 Modos + Social/Productiva (R2)</text>
          <text x="22" y="86" font-size="10.2" fill="#334558">Carretero · Férreo · Fluvial · Portuario · Aeroport.</text>
          <line x1="22" y1="100" x2="248" y2="100" stroke="#CBE9E9"/>
          <text x="22" y="119" font-size="10.5" font-weight="700" fill="#0B2C4A">6 Criterios Transversales:</text>
          <text x="22" y="137" font-size="10" fill="#334558">• Seguridad vial  • Accesibilidad</text>
          <text x="22" y="154" font-size="10" fill="#334558">• Resiliencia climática  • Sostenibilidad</text>
          <text x="22" y="171" font-size="10" fill="#334558">• Innovación  • Gestión social</text>
          <text x="22" y="196" font-size="9.6" font-weight="700" fill="#991B1B">Sin F2 → Obra bloqueada</text>

          <rect x="304" y="52" width="192" height="122" rx="14" fill="#0B2C4A"/>
          <text x="400" y="79" text-anchor="middle" font-size="11" font-weight="800" fill="#F2A900">DOBLE LLAVE ANI (R3)</text>
          <text x="400" y="99" text-anchor="middle" font-size="10.2" fill="#E2E8F0">Correspondencia obligatoria</text>
          <line x1="324" y1="111" x2="476" y2="111" stroke="#244C70"/>
          <text x="400" y="131" text-anchor="middle" font-size="10.5" font-weight="700" fill="#fff">PEI 2027–2030 (Meta 2030)</text>
          <text x="400" y="148" text-anchor="middle" font-size="10" fill="#7CE0E0">↓ desagregación directa ↓</text>
          <text x="400" y="164" text-anchor="middle" font-size="10.5" font-weight="700" fill="#fff">Plan de Acción (Meta 2027)</text>

          <line x1="263" y1="112" x2="304" y2="112" stroke="#0E9B9B" stroke-width="3"/>
          <line x1="496" y1="112" x2="537" y2="112" stroke="#F2A900" stroke-width="3"/>

          <rect x="537" y="14" width="315" height="196" rx="12" fill="#FFFBF0" stroke="#E59A00" stroke-width="2"/>
          <rect x="537" y="14" width="315" height="32" rx="12" fill="#E59A00"/>
          <text x="694" y="35" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0B2C4A">FOCO 2 · CÓMO SE HACE VIABLE</text>
          <text x="552" y="68" font-size="11" font-weight="700" fill="#0B2C4A">Ruta Social y Prevención de Conflictos</text>
          <text x="552" y="86" font-size="10.2" fill="#334558">Alertas tempranas · Conocimiento territorial · Diálogo</text>
          <line x1="552" y1="100" x2="836" y2="100" stroke="#F3DF9E"/>
          <text x="552" y="119" font-size="10.5" font-weight="700" fill="#0B2C4A">5 Capacidades Institucionales (R4):</text>
          <text x="552" y="137" font-size="10" fill="#334558">• Social  • Jurídica  • Ambiental</text>
          <text x="552" y="154" font-size="10" fill="#334558">• Predial  • Tecnológica (alertas y datos)</text>
          <text x="552" y="171" font-size="10" fill="#334558">Protege recursos públicos y reduce demandas</text>
          <text x="552" y="196" font-size="9.6" font-weight="700" fill="#991B1B">Sin F1 → Gestión sin resultado físico</text>
        </svg>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <h2>Hallazgos del Análisis Documental (Interdependencia, Solapes y Tensiones)</h2>
        ${citeBadge('MARCO-S2.2')}
      </div>
      <div class="grid-2">
        ${DOCUMENTAL_FINDINGS.map((h) => `
          <div class="entity-card" style="margin:0">
            <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:6px">
              <span class="badge ${h.cls}">${esc(h.badge)}</span>
              ${citeBadge(h.citation)}
            </div>
            <h3>${esc(h.tipo)}</h3>
            <p class="muted">${esc(h.hallazgo)}</p>
          </div>`).join('')}
      </div>
    </div>`;
  } else if (subtab === 'mapa') {
    body = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Mapa Estratégico Causa → Efecto (PEI 2027–2030)</h2>
          <p class="muted">Lectura institucional: sin capacidades (F2) no hay procesos preventivos; sin procesos no hay F1 viable; sin F1 no hay desarrollo ni confianza ciudadana.</p>
        </div>
        ${citeBadge('MARCO-S3.1')}
      </div>
      <div class="map-ladder">
        ${STRATEGIC_MAP.map((lvl, idx) => `
          <div class="map-step ${lvl.accent}">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
              <div><span class="badge badge-navy">Nivel ${lvl.level}</span> <b style="color:var(--navy-900);margin-left:6px">${esc(lvl.name)}</b></div>
              <span class="badge">${esc(lvl.role)}</span>
            </div>
            <div class="tag-cloud" style="margin:8px 0">${lvl.items.map((it) => `<span class="badge badge-slate">${esc(it)}</span>`).join('')}</div>
            <p class="muted" style="margin:0">${esc(lvl.logic)}</p>
          </div>
          ${idx < STRATEGIC_MAP.length - 1 ? '<div class="map-connector">↓ habilita / produce</div>' : ''}
        `).join('')}
      </div>
    </div>`;
  } else if (subtab === 'arboles') {
    const p = PROBLEM_OBJECTIVE_TREES.problem;
    const o = PROBLEM_OBJECTIVE_TREES.objective;
    body = `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h2>Árbol de Problemas</h2>${citeBadge(PROBLEM_OBJECTIVE_TREES.citationProblem)}</div>
        <div class="tree-box">
          <span class="badge badge-bad">Consecuencias (Efectos)</span>
          <ul class="tree-list">${p.consequences.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          <div class="tree-node-core">PROBLEMA CENTRAL: ${esc(p.central)}</div>
          <span class="badge badge-warn">Causas directas</span>
          <ul class="tree-list" style="margin-bottom:10px">${p.directCauses.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          <span class="badge badge-slate">Causas indirectas / estructurales</span>
          <ul class="tree-list">${p.indirectCauses.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h2>Árbol de Objetivos</h2>${citeBadge(PROBLEM_OBJECTIVE_TREES.citationObjective)}</div>
        <div class="tree-box">
          <span class="badge badge-ok">Impacto superior esperado</span>
          <p class="muted" style="margin:6px 0 8px"><b>${esc(o.impact)}</b></p>
          <div class="tree-node-core teal">OBJETIVO CENTRAL: ${esc(o.central)}</div>
          <span class="badge badge-teal">Medios Foco 1 · Portafolio integrado multimodal</span>
          <ul class="tree-list" style="margin-bottom:10px">${o.branchF1.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          <span class="badge badge-amber">Medios Foco 2 · Ruta social preventiva</span>
          <ul class="tree-list">${o.branchF2.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
      </div>
    </div>`;
  } else if (subtab === 'toc') {
    body = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Teoría del Cambio Comparada (Foco 1 ↔ Foco 2)</h2>
          <p class="muted">Cadena lógica de intervención desde la problemática hasta el impacto y sus supuestos críticos.</p>
        </div>
        ${citeBadge('MARCO-S3.4')}
      </div>
      <div class="table-wrap">
        <table class="exec-table">
          <thead><tr><th>Eslabón</th><th>Foco 1 · Infraestructura dinamizadora</th><th>Foco 2 · Ruta social preventiva</th></tr></thead>
          <tbody>
            ${THEORY_OF_CHANGE.map((r) => `<tr><td><b>${esc(r.eslabon)}</b></td><td>${esc(r.f1)}</td><td>${esc(r.f2)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  } else {
    body = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Indicadores Estratégicos Propuestos (Sin Línea Base Inventada)</h2>
          <p class="muted">Prioriza resultado e impacto. Puede registrar la línea base oficial cuando el área responsable la certifique.</p>
        </div>
        ${citeBadge('MARCO-S3.6')}
      </div>
      <div class="table-wrap">
        <table class="exec-table">
          <thead><tr><th>Foco</th><th>Indicador propuesto</th><th>Fórmula</th><th>Frecuencia</th><th>Responsable / Fuente</th><th>Línea Base Oficial (editable)</th></tr></thead>
          <tbody>
            ${PROPOSED_INDICATORS.map((ind) => {
              const val = state.indicatorBaselines?.[ind.id] ?? '';
              return `<tr>
                <td><span class="badge ${ind.foco === 'F1' ? 'badge-teal' : 'badge-amber'}">${ind.foco}</span></td>
                <td><b>${esc(ind.nombre)}</b></td>
                <td>${esc(ind.formula)}</td>
                <td>${esc(ind.frecuencia)}</td>
                <td>${esc(ind.responsable)}<br><small class="muted">${esc(ind.fuente)}</small></td>
                <td style="min-width:210px">
                  <input type="text" value="${esc(val)}" placeholder="${esc(ind.lineaBaseDefault)}" oninput="ANI.setIndicatorBaseline('${ind.id}',this.value)">
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Riesgos Estratégicos Identificados</h2>
          <p class="muted">*Las valoraciones de Probabilidad/Impacto son hipótesis metodológicas de taller, no datos oficiales ANI; calibrar con evidencia.</p>
        </div>
        ${citeBadge('MARCO-S4-RIESGOS')}
      </div>
      <div class="table-wrap">
        <table class="exec-table">
          <thead><tr><th>Categoría</th><th>Riesgo estratégico</th><th>Prob. / Impacto*</th><th>Acción recomendada</th></tr></thead>
          <tbody>
            ${STRATEGIC_RISKS.map((rk) => `<tr>
              <td><b>${esc(rk.categoria)}</b></td>
              <td>${esc(rk.riesgo)}</td>
              <td><span class="badge badge-warn">${esc(rk.probImpacto)}</span></td>
              <td>${esc(rk.accion)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  return `
  <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px" class="no-print">
    <div class="subtabs" style="margin:0">
      ${tabs.map(([id, label]) => `<button class="subtab ${subtab === id ? 'active' : ''}" onclick="ANI.setFocosTab('${id}')">${esc(label)}</button>`).join('')}
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-outline btn-sm" onclick="ANI.viewRepoFile('01_Marco_Estrategico_ANI_2027-2030.md')">Ver Marco .md original</button>
      <a class="btn btn-outline btn-sm" href="./03_Canvas_2_Focos_ANI.html" target="_blank" rel="noopener">Abrir Canvas original ↗</a>
    </div>
  </div>
  ${body}`;
}

/* ==================== MÓDULO 04: 7 EJES DEL PND Y BIBLIOTECA DOCUMENTAL ==================== */
export function renderPndDocs(state, subtab = 'ejes', activeDoc = 'pnd') {
  const tabs = [
    ['ejes', `7 Ejes del PND (${state.pndAxes.filter(pndAxisComplete).length}/7)`],
    ['fichas', `4 Hojas Documentales (${BASE_DOC_SHEETS.filter((d) => docComplete(state.docs[d.id])).length}/4)`],
    ['acervo', `Acervo y Carga Documental (${4 + state.customDocs.length})`]
  ];

  let body = '';
  if (subtab === 'ejes') {
    body = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Bases Plan Nacional de Desarrollo 2026–2030 — Colombia, la patria milagro (7 Ejes Estratégicos)</h2>
          <p class="muted">${esc(ANI_INSTITUTIONAL_IDENTITY.notaPnd)} ${citeBadge('PND-7-EJES')} ${citeBadge('MARCO-S1')}</p>
        </div>
        <div class="toolbar no-print" style="margin:0">
          <button class="btn btn-teal btn-sm" onclick="ANI.loadOfficialPndAxes()">Precargar 7 Ejes en fichas</button>
          <button class="btn btn-outline btn-sm" onclick="ANI.openImageLightbox('./assets/bases_pnd_siete_ejes.png','Bases PND 2026–2030 · 7 Ejes Estratégicos')">⤢ Ampliar lámina</button>
        </div>
      </div>
      <div class="grid-2" style="align-items:center">
        <div>
          <img src="./assets/bases_pnd_siete_ejes.png" alt="Bases Plan Nacional de Desarrollo 2026-2030 — 7 Ejes Estratégicos" style="width:100%;border-radius:10px;border:1px solid var(--line);cursor:zoom-in" onclick="ANI.openImageLightbox('./assets/bases_pnd_siete_ejes.png','Bases PND 2026–2030 · 7 Ejes Estratégicos')" loading="lazy">
        </div>
        <div>
          ${PND_7_AXES_OFFICIAL.map((ax) => `<div style="display:flex;align-items:center;gap:10px;padding:7px 11px;margin-bottom:6px;background:#F6F9FC;border-radius:8px;border-left:4px solid ${ax.color}">
            <span class="badge badge-navy">${ax.numero}</span>
            <b style="flex:1;font-size:12.8px;color:var(--navy-900)">${esc(ax.nombre)}</b>
            <span class="badge ${ax.focoSugerido === 'F1' ? 'badge-f1' : ax.focoSugerido === 'F2' ? 'badge-f2' : 'badge-navy'}">${esc(ax.focoSugerido)}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>
    <div class="grid-2">
      ${state.pndAxes.map((ax, idx) => {
        const ok = pndAxisComplete(ax);
        return `<div class="entity-card" style="margin:0">
          <div class="entity-head">
            <span class="badge badge-navy">Eje PND ${ax.numero}</span>
            <span class="badge ${ok ? 'badge-ok' : 'badge-warn'}" id="pnd-pill-${idx}">${ok ? 'Documentado' : 'Pendiente de carga oficial'}</span>
            <span style="flex:1"></span>
            <button class="btn btn-soft btn-xs no-print" onclick="ANI.deriveOppFromAxis(${idx})">+ Derivar oportunidad</button>
          </div>
          <label class="field-label" style="margin-top:0">Nombre oficial del Eje ${ax.numero} (PND)</label>
          <input type="text" value="${esc(ax.nombre)}" placeholder="Pendiente — ingrese el título oficial exacto del Eje ${ax.numero}" oninput="ANI.setPndAxis(${idx},'nombre',this.value)">
          <div class="grid-2">
            <div>
              <label class="field-label">Competencia ANI</label>
              <select onchange="ANI.setPndAxis(${idx},'competenciaTipo',this.value)">
                <option value="">Seleccionar…</option>
                <option value="Competencia directa" ${ax.competenciaTipo === 'Competencia directa' ? 'selected' : ''}>Competencia directa ANI</option>
                <option value="Articulación interinstitucional" ${ax.competenciaTipo === 'Articulación interinstitucional' ? 'selected' : ''}>Articulación interinstitucional</option>
                <option value="Condicionada — aplicar R2" ${ax.competenciaTipo === 'Condicionada — aplicar R2' ? 'selected' : ''}>Condicionada — validar R2</option>
                <option value="Sin competencia directa" ${ax.competenciaTipo === 'Sin competencia directa' ? 'selected' : ''}>Sin competencia directa</option>
              </select>
            </div>
            <div>
              <label class="field-label">Foco ANI vinculado</label>
              <select onchange="ANI.setPndAxis(${idx},'foco',this.value)">
                <option value="">Seleccionar…</option>
                <option value="F1" ${ax.foco === 'F1' ? 'selected' : ''}>F1 · Infraestructura dinamizadora</option>
                <option value="F2" ${ax.foco === 'F2' ? 'selected' : ''}>F2 · Ruta social preventiva</option>
                <option value="F1+F2" ${ax.foco === 'F1+F2' ? 'selected' : ''}>F1 + F2 (Articulación integral)</option>
              </select>
            </div>
          </div>
          <label class="field-label">Iniciativas y mandatos clave del eje</label>
          <textarea style="min-height:66px" placeholder="Resuma solo lo que establece el texto oficial del PND…" oninput="ANI.setPndAxis(${idx},'resumen',this.value)">${esc(ax.resumen)}</textarea>
          <label class="field-label">Relación con competencias ANI y contribución estratégica</label>
          <textarea style="min-height:66px" placeholder="¿Qué demanda a la ANI, con qué modo/capacidad responde y qué límite de competencia aplica?" oninput="ANI.setPndAxis(${idx},'relacionAni',this.value)">${esc(ax.relacionAni)}</textarea>
          <label class="field-label">Cita verificable (capítulo, artículo, página)</label>
          <input type="text" value="${esc(ax.cita)}" placeholder="Ej.: Bases PND, Eje ${ax.numero}, pág. … / Art. …" oninput="ANI.setPndAxis(${idx},'cita',this.value)">
        </div>`;
      }).join('')}
    </div>`;
  } else if (subtab === 'fichas') {
    const meta = BASE_DOC_SHEETS.find((x) => x.id === activeDoc) || BASE_DOC_SHEETS[0];
    const d = state.docs[meta.id];
    const ok = docComplete(d);
    const puntos = d.puntos.length ? d.puntos : [''];
    const contribs = d.contribuciones.length ? d.contribuciones : [''];

    body = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Fichas Comparables de Análisis Documental (Preservadas y Compatibles)</h2>
          <p class="muted">${esc(meta.hint)}</p>
        </div>
        <span class="badge ${ok ? 'badge-ok' : 'badge-warn'}" id="doc-complete-pill">${ok ? 'Ficha completa' : 'Pendiente de diligenciar'}</span>
      </div>
      <div class="toolbar no-print">
        ${BASE_DOC_SHEETS.map((s) => {
          const done = docComplete(state.docs[s.id]);
          return `<button class="btn ${s.id === meta.id ? 'btn-navy' : 'btn-outline'} btn-sm" onclick="ANI.setActiveDoc('${s.id}')">${done ? '✓ ' : ''}${esc(s.name)}</button>`;
        }).join('')}
      </div>
      <div class="grid-3">
        <div><label class="field-label">Título del documento</label><input type="text" value="${esc(d.titulo)}" placeholder="Ej.: ${esc(meta.full)}, capítulo…" oninput="ANI.setDoc('${meta.id}','titulo',this.value)"></div>
        <div><label class="field-label">Fecha / vigencia</label><input type="text" value="${esc(d.fecha)}" placeholder="Ej.: 2026 / 2027–2030" oninput="ANI.setDoc('${meta.id}','fecha',this.value)"></div>
        <div><label class="field-label">Emisor / fuente oficial</label><input type="text" value="${esc(d.emisor)}" placeholder="Entidad emisora (sin inventar)" oninput="ANI.setDoc('${meta.id}','emisor',this.value)"></div>
      </div>
      <label class="field-label">Resumen ejecutivo — lo principal (solo lo que dice el documento)</label>
      <textarea placeholder="Pegue o resuma lo esencial. Si un dato no figura en el documento, escriba: Información insuficiente para concluir." oninput="ANI.setDoc('${meta.id}','resumen',this.value)">${esc(d.resumen)}</textarea>

      <label class="field-label">Puntos principales</label>
      ${puntos.map((v, i) => `<div class="list-input-row">
        <input type="text" value="${esc(v)}" placeholder="Punto principal #${i + 1}…" oninput="ANI.setDocList('${meta.id}','puntos',${i},this.value)">
        <button class="btn btn-danger btn-sm" onclick="ANI.delDocList('${meta.id}','puntos',${i})" aria-label="Eliminar punto">✕</button>
      </div>`).join('')}
      <button class="btn btn-outline btn-xs" onclick="ANI.addDocList('${meta.id}','puntos')">+ Agregar punto</button>

      <div class="grid-2" style="margin-top:6px">
        <div>
          <label class="field-label">Tipo de relación con la ANI</label>
          <select onchange="ANI.setDoc('${meta.id}','relacionTipo',this.value)">
            <option value="">Seleccionar…</option>
            <option value="Directa" ${d.relacionTipo === 'Directa' ? 'selected' : ''}>Directa</option>
            <option value="Indirecta" ${d.relacionTipo === 'Indirecta' ? 'selected' : ''}>Indirecta</option>
            <option value="Por definir" ${d.relacionTipo === 'Por definir' ? 'selected' : ''}>Por definir</option>
          </select>
        </div>
        <div>
          <label class="field-label">Foco estratégico asociado</label>
          <select onchange="ANI.setDoc('${meta.id}','foco',this.value)">
            <option value="">Seleccionar…</option>
            <option value="F1" ${d.foco === 'F1' ? 'selected' : ''}>F1 · Infraestructura dinamizadora</option>
            <option value="F2" ${d.foco === 'F2' ? 'selected' : ''}>F2 · Ruta social</option>
            <option value="F1+F2" ${d.foco === 'F1+F2' ? 'selected' : ''}>F1 + F2</option>
          </select>
        </div>
      </div>

      <label class="field-label">Relación ANI — qué le pide / qué le ofrece / qué debe hacer la ANI</label>
      <textarea placeholder="Ej.: El documento establece X; la ANI responde con Y; queda pendiente Z. Incluya referencia." oninput="ANI.setDoc('${meta.id}','relacion',this.value)">${esc(d.relacion)}</textarea>

      <label class="field-label">Contribución concreta de la ANI</label>
      ${contribs.map((v, i) => `<div class="list-input-row">
        <input type="text" value="${esc(v)}" placeholder="Contribución concreta #${i + 1}…" oninput="ANI.setDocList('${meta.id}','contribuciones',${i},this.value)">
        <button class="btn btn-danger btn-sm" onclick="ANI.delDocList('${meta.id}','contribuciones',${i})" aria-label="Eliminar contribución">✕</button>
      </div>`).join('')}
      <button class="btn btn-outline btn-xs" onclick="ANI.addDocList('${meta.id}','contribuciones')">+ Agregar contribución</button>

      <div class="grid-2" style="margin-top:6px">
        <div><label class="field-label">Evidencia / cita (página, artículo, párrafo)</label><input type="text" value="${esc(d.evidencia)}" placeholder="Ubicación exacta en el documento" oninput="ANI.setDoc('${meta.id}','evidencia',this.value)"></div>
        <div><label class="field-label">¿Qué falta? (Información insuficiente para concluir)</label><input type="text" value="${esc(d.pendiente)}" placeholder="Ej.: Falta línea base, falta presupuesto…" oninput="ANI.setDoc('${meta.id}','pendiente',this.value)"></div>
      </div>

      <details class="guide-box">
        <summary>Preguntas guía para diligenciar sin inventar</summary>
        <ul class="tree-list">
          <li>¿Qué ordena o solicita explícitamente este documento a la ANI?</li>
          <li>¿Qué proyecto, modo o capacidad ANI responde? ¿Corresponde a F1, F2 o ambos?</li>
          <li>¿Cuál es la evidencia verificable (capítulo, página o artículo)?</li>
          <li>¿Qué NO dice el documento y por tanto debe marcarse como información insuficiente?</li>
        </ul>
      </details>
    </div>`;
  } else {
    body = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Acervo Documental Original del Repositorio (Indexado en el Agente IA)</h2>
          <p class="muted">Los 4 archivos fuente originales se conservan intactos y alimentan las referencias verificables de la plataforma.</p>
        </div>
      </div>
      <div class="grid-2">
        ${REPO_DOCUMENTS.map((rd) => `
          <div class="entity-card" style="margin:0">
            <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px">
              ${statusBadge(rd.status)}
              <span class="badge">${esc(rd.type)}</span>
            </div>
            <h3>${esc(rd.title)}</h3>
            <p class="muted">${esc(rd.description)}</p>
            <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
              ${rd.file.endsWith('.html')
                ? `<a class="btn btn-outline btn-xs" href="./${esc(rd.file)}" target="_blank" rel="noopener">Abrir en pestaña ↗</a>`
                : `<button class="btn btn-navy btn-xs" onclick="ANI.viewRepoFile('${esc(rd.file)}')">Leer documento</button>`}
              <a class="btn btn-soft btn-xs" href="./${esc(rd.file)}" download>Descargar original</a>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <h2>Ampliar Conocimiento Documental de la Sesión</h2>
          <p class="muted">Incorpore textos oficiales (<code>.md</code>, <code>.txt</code>, <code>.csv</code>, <code>.json</code>) para que el buscador y el Agente Estratégico los consulten con cita <code>[BIBLIO-N]</code>. Para indexación permanente en servidor, colóquelos en la carpeta <code>knowledge/</code>.</p>
        </div>
        <label class="btn btn-teal btn-sm no-print" style="cursor:pointer">
          + Cargar archivo de texto
          <input type="file" accept=".md,.txt,.csv,.json" hidden onchange="ANI.uploadCustomDoc(event)">
        </label>
      </div>
      ${state.customDocs.length
        ? state.customDocs.map((cd, i) => `
          <div class="entity-card" style="padding:12px 15px">
            <div class="entity-head" style="margin-bottom:6px;padding-bottom:6px">
              <span class="badge badge-navy">[BIBLIO-${i + 1}]</span>
              <b>${esc(cd.titulo)}</b>
              <span class="badge">${esc(cd.nombreArchivo || 'manual')}</span>
              <span style="flex:1"></span>
              <button class="btn btn-danger btn-xs" onclick="ANI.removeCustomDoc(${i})">Quitar</button>
            </div>
            <div class="grid-2">
              <div><label class="field-label" style="margin-top:0">Fuente / cita oficial</label><input type="text" value="${esc(cd.cita || '')}" placeholder="Entidad, año, sección/página" oninput="ANI.setCustomDoc(${i},'cita',this.value)"></div>
              <div><label class="field-label" style="margin-top:0">Foco relacionado</label>
                <select onchange="ANI.setCustomDoc(${i},'foco',this.value)">
                  <option value="F1+F2" ${cd.foco === 'F1+F2' ? 'selected' : ''}>F1 + F2</option>
                  <option value="F1" ${cd.foco === 'F1' ? 'selected' : ''}>F1</option>
                  <option value="F2" ${cd.foco === 'F2' ? 'selected' : ''}>F2</option>
                </select>
              </div>
            </div>
            <p class="muted" style="margin-top:6px">${esc(String(cd.contenido || '').slice(0, 280))}${String(cd.contenido || '').length > 280 ? '…' : ''}</p>
          </div>`).join('')
        : `<p class="muted">No se han cargado documentos adicionales en esta sesión todavía.</p>`}
    </div>`;
  }

  return `
  <div class="subtabs no-print">
    ${tabs.map(([id, label]) => `<button class="subtab ${subtab === id ? 'active' : ''}" onclick="ANI.setPndTab('${id}')">${esc(label)}</button>`).join('')}
  </div>
  ${body}`;
}

/* ==================== MÓDULO 05: OPORTUNIDADES Y RECOMENDACIONES ==================== */
export function renderOpportunities(state, filterFoco = '', oppTab = 'todo') {
  const list = state.opportunities.filter((o) => !filterFoco || o.foco === filterFoco || o.foco === 'F1+F2');
  const standardAxisVals = new Set(['', ...state.pndAxes.map((a) => `Eje ${a.numero}`)]);
  const buildAxisSelectOptions = (selectedVal = '') => {
    const clean = String(selectedVal || '');
    const opts = [`<option value="" ${clean === '' ? 'selected' : ''}>Por vincular…</option>`];
    for (const a of state.pndAxes) {
      const val = `Eje ${a.numero}`;
      const label = `Eje ${a.numero}${a.nombre.trim() ? ': ' + a.nombre.trim().slice(0, 40) : ''}`;
      opts.push(`<option value="${esc(val)}" ${clean === val ? 'selected' : ''}>${esc(label)}</option>`);
    }
    if (clean && !standardAxisVals.has(clean)) {
      opts.push(`<option value="${esc(clean)}" selected>${esc(clean)}</option>`);
    }
    return opts.join('');
  };

  const tabs = [
    ['todo', `Vista Integral`],
    ['tabla', `Tabla Ejecutiva PND × ANI (${list.length})`],
    ['recomendaciones', `Recomendaciones R1–R6 (${RECOMMENDATIONS.length})`]
  ];

  const recsHtml = `
  <div class="card">
    <div class="card-header">
      <div>
        <h2>Recomendaciones Estratégicas Estructurales (R1 – R6)</h2>
        <p class="muted">Lineamientos rectores del Marco Estratégico ANI 2027–2030 con justificación, beneficio, riesgo, prioridad y horizonte.</p>
      </div>
      ${citeBadge('MARCO-S4')}
    </div>
    <div class="grid-2">
      ${RECOMMENDATIONS.map((r) => `
        <div class="entity-card" style="margin:0">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px">
            <span class="badge badge-navy">${esc(r.code)}</span>
            <span class="badge ${r.prioridad === 'Alta' ? 'badge-bad' : 'badge-amber'}">Prioridad ${esc(r.prioridad)}</span>
            <span class="badge">${esc(r.horizonte)}</span>
          </div>
          <h3>${esc(r.titulo)}</h3>
          <p class="muted" style="color:var(--ink-soft)">${esc(r.detalle)}</p>
          <p class="muted"><b>Justificación:</b> ${esc(r.justificacion)}<br><b>Beneficio:</b> ${esc(r.beneficio)}<br><b>Riesgo:</b> ${esc(r.riesgo)}</p>
        </div>`).join('')}
    </div>
  </div>`;

  const toolbarHtml = `
    <div class="toolbar no-print" style="margin:0">
      <select onchange="ANI.setOppFilter(this.value)" aria-label="Filtrar oportunidades por foco">
        <option value="" ${!filterFoco ? 'selected' : ''}>Todos los focos (${state.opportunities.length})</option>
        <option value="F1" ${filterFoco === 'F1' ? 'selected' : ''}>F1 · Infraestructura</option>
        <option value="F2" ${filterFoco === 'F2' ? 'selected' : ''}>F2 · Ruta social</option>
      </select>
      <button class="btn btn-teal btn-sm" onclick="ANI.addOpportunity()">+ Nueva oportunidad</button>
      ${state.opportunities.length ? `<button class="btn btn-outline btn-sm" onclick="ANI.exportOpportunitiesCsv()">Exportar CSV</button>` : ''}
    </div>`;

  const tableHtml = `
  <div class="card">
    <div class="card-header">
      <div>
        <h2>Tabla Ejecutiva de Oportunidades (PND × Competencias ANI)</h2>
        <p class="muted">Consolidado tabular verificable con promoción directa a la Cartera PEI 2027–2030.</p>
      </div>
      ${toolbarHtml}
    </div>
    ${list.length
      ? `<div class="table-wrap">
          <table class="exec-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Foco</th>
                <th>Eje PND</th>
                <th>Oportunidad estratégica</th>
                <th>Modo / Capacidad</th>
                <th>Encaje ANI</th>
                <th>Análisis y evidencia</th>
                <th>Estatus</th>
                <th class="no-print">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${list.map((o, idx) => `<tr>
                <td><b>${idx + 1}</b></td>
                <td><span class="badge ${o.foco === 'F2' ? 'badge-amber' : 'badge-teal'}">${esc(o.foco)}</span></td>
                <td>${esc(o.ejePnd || 'Por vincular')}</td>
                <td><b>${esc(o.titulo || 'En formulación')}</b></td>
                <td>${esc(o.modo || '—')}</td>
                <td><span class="badge ${/R2/i.test(o.competencia) ? 'badge-warn' : 'badge-navy'}">${esc(o.competencia || '—')}</span></td>
                <td style="max-width:280px">${esc(o.descripcion || '—')}${o.evidencia ? `<br><span class="muted">Fuente: ${esc(o.evidencia)}</span>` : ''}</td>
                <td>${statusBadge(o.estatus)}</td>
                <td class="no-print" style="white-space:nowrap">
                  <button class="btn btn-navy btn-xs" onclick="ANI.promoteOppToPei('${o.id}')" title="Crear borrador en Cartera PEI">→ PEI</button>
                  <button class="btn btn-outline btn-xs" onclick="ANI.setOppTab('todo')" title="Editar ficha">Editar</button>
                  <button class="btn btn-danger btn-xs" onclick="ANI.deleteOpportunity('${o.id}')" title="Eliminar">✕</button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`
      : `<div class="empty-state">
          <h3>Sin oportunidades en este filtro</h3>
          <p class="muted">Registre oportunidades o derívelas desde los 7 Ejes del PND (Módulo 04).</p>
          <button class="btn btn-teal btn-sm" onclick="ANI.addOpportunity()">+ Registrar oportunidad</button>
        </div>`}
  </div>`;

  const fichasHtml = `
  <div class="card">
    <div class="card-header">
      <div>
        <h2>Matriz de Oportunidades Estratégicas (PND × Competencias ANI)</h2>
        <p class="muted">Identifique oportunidades concretas y conviértalas en 1 clic en borradores trazables de la Cartera PEI.</p>
      </div>
      ${toolbarHtml}
    </div>
    ${list.length
      ? list.map((o) => `
        <div class="entity-card">
          <div class="entity-head">
            <span class="badge ${o.foco === 'F2' ? 'badge-amber' : 'badge-teal'}">${esc(o.foco)}</span>
            <span class="entity-title">${esc(o.titulo || 'Oportunidad en formulación')}</span>
            ${statusBadge(o.estatus)}
            <span style="flex:1"></span>
            <button class="btn btn-navy btn-xs no-print" onclick="ANI.promoteOppToPei('${o.id}')">Convertir en Proyecto PEI →</button>
            <button class="btn btn-danger btn-xs no-print" onclick="ANI.deleteOpportunity('${o.id}')">Eliminar</button>
          </div>
          <div class="grid-4">
            <div>
              <label class="field-label">Foco</label>
              <select onchange="ANI.setOpp('${o.id}','foco',this.value)">
                <option value="F1" ${o.foco === 'F1' ? 'selected' : ''}>F1 · Infraestructura</option>
                <option value="F2" ${o.foco === 'F2' ? 'selected' : ''}>F2 · Ruta social</option>
                <option value="F1+F2" ${o.foco === 'F1+F2' ? 'selected' : ''}>F1 + F2</option>
              </select>
            </div>
            <div>
              <label class="field-label">Eje PND origen</label>
              <select onchange="ANI.setOpp('${o.id}','ejePnd',this.value)">
                ${buildAxisSelectOptions(o.ejePnd)}
              </select>
            </div>
            <div>
              <label class="field-label">Modo / Capacidad</label>
              <input type="text" value="${esc(o.modo)}" placeholder="Carretero, Férreo, Social, Predial…" oninput="ANI.setOpp('${o.id}','modo',this.value)">
            </div>
            <div>
              <label class="field-label">Encaje de competencia ANI</label>
              <select onchange="ANI.setOpp('${o.id}','competencia',this.value)">
                <option value="Competencia directa" ${o.competencia === 'Competencia directa' ? 'selected' : ''}>Competencia directa</option>
                <option value="Articulación interinstitucional" ${o.competencia === 'Articulación interinstitucional' ? 'selected' : ''}>Articulación interinstitucional</option>
                <option value="Validar R2 (social/productiva)" ${o.competencia === 'Validar R2 (social/productiva)' ? 'selected' : ''}>Validar R2 (riesgo desbordamiento)</option>
              </select>
            </div>
          </div>
          <label class="field-label">Título de la oportunidad estratégica</label>
          <input type="text" value="${esc(o.titulo)}" placeholder="Oportunidad concreta y verificable para la ANI 2027–2030" oninput="ANI.setOpp('${o.id}','titulo',this.value)">
          <label class="field-label">Análisis estratégico (justificación, beneficio esperado y condición F1↔F2)</label>
          <textarea style="min-height:66px" placeholder="Describa el valor estratégico, brecha que cierra y riesgos…" oninput="ANI.setOpp('${o.id}','descripcion',this.value)">${esc(o.descripcion)}</textarea>
          <label class="field-label">Fuente / referencia documental</label>
          <input type="text" value="${esc(o.evidencia)}" placeholder="Documento, capítulo o sección de sustento" oninput="ANI.setOpp('${o.id}','evidencia',this.value)">
        </div>`).join('')
      : `<div class="empty-state">
          <h3>Sin oportunidades adicionales registradas</h3>
          <p class="muted">Puede crear oportunidades aquí, derivarlas desde los 7 Ejes del PND (Módulo 04) o analizarlas en el Agente Estratégico (Módulo 09).</p>
          <button class="btn btn-teal btn-sm" onclick="ANI.addOpportunity()">+ Registrar primera oportunidad</button>
        </div>`}
  </div>`;

  const dofaHtml = `
  <div class="card">
    <div class="card-header">
      <div>
        <h2>Matriz DOFA Estratégica Institucional — ANI</h2>
        <p class="muted">Diagnóstico estratégico integrado desde <code>assets/dofa_ani_estrategico.png</code>. ${citeBadge('DOFA-ANI')}</p>
      </div>
      <div class="toolbar no-print" style="margin:0">
        <button class="btn btn-outline btn-sm" onclick="ANI.openImageLightbox('./assets/dofa_ani_estrategico.png','Matriz DOFA Estratégica ANI')">⤢ Ver lámina original</button>
        <a class="btn btn-soft btn-sm" href="./assets/dofa_ani_estrategico.png" download="dofa_ani_estrategico.png">⬇ Descargar PNG</a>
      </div>
    </div>
    <div class="grid-2" style="margin-bottom:14px">
      <div class="entity-card" style="margin:0;border-top:4px solid #0B5FA5">
        <h3 style="margin:0 0 8px;color:#0B5FA5">Fortalezas (${DOFA_ANI_MATRIX.fortalezas.length})</h3>
        <ol class="clean-list" style="padding-left:18px;margin:0">${DOFA_ANI_MATRIX.fortalezas.map(([t, d]) => `<li style="margin-bottom:5px;font-size:12.4px"><b>${esc(t)}:</b> ${esc(d)}</li>`).join('')}</ol>
      </div>
      <div class="entity-card" style="margin:0;border-top:4px solid #D97706">
        <h3 style="margin:0 0 8px;color:#B45309">Debilidades (${DOFA_ANI_MATRIX.debilidades.length})</h3>
        <ol class="clean-list" style="padding-left:18px;margin:0">${DOFA_ANI_MATRIX.debilidades.map(([t, d]) => `<li style="margin-bottom:5px;font-size:12.4px"><b>${esc(t)}:</b> ${esc(d)}</li>`).join('')}</ol>
      </div>
      <div class="entity-card" style="margin:0;border-top:4px solid #15803D">
        <h3 style="margin:0 0 8px;color:#15803D">Oportunidades (${DOFA_ANI_MATRIX.oportunidades.length})</h3>
        <ol class="clean-list" style="padding-left:18px;margin:0">${DOFA_ANI_MATRIX.oportunidades.map(([t, d]) => `<li style="margin-bottom:5px;font-size:12.4px"><b>${esc(t)}:</b> ${esc(d)}</li>`).join('')}</ol>
      </div>
      <div class="entity-card" style="margin:0;border-top:4px solid #B91C1C">
        <h3 style="margin:0 0 8px;color:#B91C1C">Amenazas (${DOFA_ANI_MATRIX.amenazas.length})</h3>
        <ol class="clean-list" style="padding-left:18px;margin:0">${DOFA_ANI_MATRIX.amenazas.map(([t, d]) => `<li style="margin-bottom:5px;font-size:12.4px"><b>${esc(t)}:</b> ${esc(d)}</li>`).join('')}</ol>
      </div>
    </div>
    <img src="./assets/dofa_ani_estrategico.png" alt="Matriz DOFA Estratégica Institucional ANI" style="width:100%;border-radius:10px;border:1px solid var(--line);cursor:zoom-in" onclick="ANI.openImageLightbox('./assets/dofa_ani_estrategico.png','Matriz DOFA Estratégica ANI')" loading="lazy">
  </div>`;

  let content = '';
  if (oppTab === 'tabla') content = tableHtml;
  else if (oppTab === 'dofa') content = dofaHtml;
  else if (oppTab === 'recomendaciones') content = recsHtml;
  else content = fichasHtml + dofaHtml + recsHtml;

  return `
  <div class="subtabs no-print">
    ${[...tabs, ['dofa', 'Matriz DOFA ANI']].map(([id, label]) => `<button class="subtab ${oppTab === id ? 'active' : ''}" onclick="ANI.setOppTab('${id}')">${esc(label)}</button>`).join('')}
  </div>
  ${content}`;
}
