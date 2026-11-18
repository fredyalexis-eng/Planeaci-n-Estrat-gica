/**
 * ANI STRATEGY LAB — Renderizadores Ejecutivos de Módulos 06 a 09
 * (06 Cartera PEI y Priorización · 07 Plan de Acción · 08 Centro Audiovisual · 09 Agente IA y Auditoría)
 */
import {
  FOCOS,
  SCORING_CRITERIA,
  PEI_FILL_RULES,
  REPO_DOCUMENTS,
  AGENT_QUICK_PROMPTS
} from '../../data/knowledge-base.js';
import {
  esc,
  statusBadge,
  citeBadge,
  projValid,
  projChecklist,
  projScore,
  projCategory,
  projHasBaselineIssue
} from './state.js';
import { getBackendBase } from './agent-client.js';

/* ==================== MÓDULO 06: CARTERA PEI Y PRIORIZACIÓN ==================== */
function renderScatterSvg(projects) {
  const w = 520;
  const h = 300;
  const pad = 42;
  const plotW = w - pad * 2;
  const plotH = h - pad * 2;
  const toX = (eff) => pad + ((eff - 1) / 4) * plotW;
  const toY = (imp) => pad + ((5 - imp) / 4) * plotH;
  const midX = toX(2.5);
  const midY = toY(3.5);

  const dots = projects.map((p, idx) => {
    const { imp, eff } = projScore(p);
    const cx = toX(eff).toFixed(1);
    const cy = toY(imp).toFixed(1);
    const fill = p.foco === 'F2' ? '#F2A900' : '#0E9B9B';
    return `<g>
      <circle cx="${cx}" cy="${cy}" r="9" fill="${fill}" stroke="#0B2C4A" stroke-width="1.5"/>
      <text x="${cx}" y="${(Number(cy) + 3.5).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="800" fill="#fff">${idx + 1}</text>
      <title>#${idx + 1} ${esc(p.proyecto || 'Sin nombre')} (${p.foco || '—'}) · Impacto ${imp.toFixed(1)} · Esfuerzo ${eff.toFixed(1)}</title>
    </g>`;
  }).join('');

  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:560px;height:auto;border:1px solid var(--line);border-radius:10px;background:#fff" role="img" aria-label="Mapa cartesiano Impacto vs Esfuerzo">
    <rect x="${pad}" y="${pad}" width="${midX - pad}" height="${midY - pad}" fill="#EBF9F2"/>
    <rect x="${midX}" y="${pad}" width="${w - pad - midX}" height="${midY - pad}" fill="#EEF4FB"/>
    <rect x="${pad}" y="${midY}" width="${midX - pad}" height="${h - pad - midY}" fill="#F8FAFC"/>
    <rect x="${midX}" y="${midY}" width="${w - pad - midX}" height="${h - pad - midY}" fill="#FFF9EB"/>
    <line x1="${midX}" y1="${pad}" x2="${midX}" y2="${h - pad}" stroke="#94A3B8" stroke-dasharray="4 4"/>
    <line x1="${pad}" y1="${midY}" x2="${w - pad}" y2="${midY}" stroke="#94A3B8" stroke-dasharray="4 4"/>
    <rect x="${pad}" y="${pad}" width="${plotW}" height="${plotH}" fill="none" stroke="#CBD5E1"/>
    <text x="${pad + 8}" y="${pad + 16}" font-size="10" font-weight="700" fill="#0A6847">Quick Wins</text>
    <text x="${midX + 8}" y="${pad + 16}" font-size="10" font-weight="700" fill="#0B2C4A">Iniciativas Estratégicas</text>
    <text x="${pad + 8}" y="${h - pad - 8}" font-size="10" font-weight="700" fill="#64748B">Descartar / rediseñar</text>
    <text x="${midX + 8}" y="${h - pad - 8}" font-size="10" font-weight="700" fill="#8A5A00">Transformaciones</text>
    <text x="${w / 2}" y="${h - 10}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#334558">Esfuerzo (1 Bajo → 5 Alto)</text>
    <text x="14" y="${h / 2}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#334558" transform="rotate(-90 14 ${h / 2})">Impacto (1 → 5)</text>
    ${dots}
  </svg>`;
}

export function renderPei(state, ui) {
  const { peiTab = 'fichas', filterFoco = '', searchProj = '', timerLabel = '20:00' } = ui;
  const q = searchProj.trim().toLowerCase();
  const filtered = state.projects.filter((p) =>
    (!filterFoco || p.foco === filterFoco) &&
    (!q || `${p.proyecto} ${p.objetivo} ${p.detalle} ${p.modo} ${p.ejePnd}`.toLowerCase().includes(q))
  );

  const tabs = [
    ['fichas', `Fichas Editables (${state.projects.length})`],
    ['tabla', 'Tabla Contractual PEI (6 columnas)'],
    ['priorizacion', 'Priorización, Matriz y Taller 20 min']
  ];

  const objDatalist = state.identity.objetivos.length
    ? `<datalist id="ani-objetivos-list">${state.identity.objetivos.map((o) => `<option value="${esc(`${o.codigo ? o.codigo + ' · ' : ''}${o.nombre}`)}"></option>`).join('')}</datalist>`
    : '';

  let body = '';
  if (peiTab === 'fichas') {
    body = `
    ${objDatalist}
    <div class="card">
      <div class="toolbar no-print" style="margin-bottom:8px">
        <button class="btn btn-teal" onclick="ANI.addProject()">+ Nuevo proyecto PEI</button>
        <select aria-label="Filtrar por foco" onchange="ANI.setPeiFilter(this.value)">
          <option value="" ${!filterFoco ? 'selected' : ''}>Todos los focos</option>
          <option value="F1" ${filterFoco === 'F1' ? 'selected' : ''}>Solo F1 · Infraestructura</option>
          <option value="F2" ${filterFoco === 'F2' ? 'selected' : ''}>Solo F2 · Ruta social</option>
        </select>
        <input type="search" value="${esc(searchProj)}" placeholder="Buscar proyecto, objetivo, modo…" style="flex:1;min-width:180px" oninput="ANI.setPeiSearch(this.value)">
        <label class="btn btn-outline btn-sm" style="cursor:pointer">Importar CSV <input type="file" accept=".csv,text/csv" hidden onchange="ANI.importPeiCsvFile(event)"></label>
        <button class="btn btn-outline btn-sm" onclick="ANI.exportPeiCsv()">Exportar CSV</button>
      </div>
      <details class="guide-box">
        <summary>Reglas contractuales de llenado (6 columnas obligatorias) ${citeBadge('MARCO-S5.1')}</summary>
        <div class="table-wrap" style="margin-top:8px">
          <table class="exec-table">
            <thead><tr><th>Columna</th><th>Regla obligatoria</th><th>Error típico a evitar</th></tr></thead>
            <tbody>${PEI_FILL_RULES.map((r) => `<tr><td><b>${esc(r.col)}</b></td><td>${esc(r.rule)}</td><td>${esc(r.avoid)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </details>
    </div>

    ${filtered.length
      ? filtered.map((p) => {
          const valid = projValid(p);
          const cat = projCategory(p);
          const sc = projScore(p);
          const baseErr = projHasBaselineIssue(p);
          const checks = projChecklist(p);
          const tagPool = p.foco === 'F2' ? FOCOS.F2.tags : FOCOS.F1.tags;
          const modePool = p.foco === 'F2' ? FOCOS.F2.modos : FOCOS.F1.modos;

          return `<article class="entity-card" data-proj-card="${p.id}">
            <div class="entity-head">
              <span class="badge ${p.foco === 'F1' ? 'badge-teal' : p.foco === 'F2' ? 'badge-amber' : 'badge-warn'}" data-proj-foco="${p.id}">${p.foco || 'Sin foco'}</span>
              <span class="entity-title" data-proj-title="${p.id}">${esc(p.proyecto || 'Proyecto sin nombre')}</span>
              <span class="badge ${valid && !baseErr ? 'badge-ok' : 'badge-warn'}" data-proj-valid="${p.id}">${valid && !baseErr ? 'Fila válida' : 'Incompleta / revisar'}</span>
              <span class="badge ${cat.cls}" data-proj-cat="${p.id}">${esc(cat.label)} (${sc.total.toFixed(1)})</span>
              ${statusBadge(p.estatus)}
              <span style="flex:1"></span>
              <button class="btn btn-soft btn-xs no-print" onclick="ANI.addActionForProject('${p.id}')">+ Actividad PA</button>
              <button class="btn btn-outline btn-xs no-print" onclick="ANI.dupProject('${p.id}')">Duplicar</button>
              <button class="btn btn-danger btn-xs no-print" onclick="ANI.delProject('${p.id}')">Eliminar</button>
            </div>

            ${baseErr ? `<div class="callout callout-bad" style="padding:8px 12px;font-size:12px"><b>Alerta R6:</b> Registró una meta numérica sin línea base oficial. Escriba <i>"Por definir — línea base pendiente"</i> hasta contar con línea base verificada.</div>` : ''}

            <div class="grid-3">
              <div>
                <label class="field-label">1. Foco (Iniciativa PND) *</label>
                <select onchange="ANI.setProj('${p.id}','foco',this.value,true)">
                  <option value="" ${!p.foco ? 'selected' : ''}>Seleccionar foco único…</option>
                  <option value="F1" ${p.foco === 'F1' ? 'selected' : ''}>F1 · Infraestructura dinamizadora</option>
                  <option value="F2" ${p.foco === 'F2' ? 'selected' : ''}>F2 · Ruta social y prevención</option>
                </select>
              </div>
              <div>
                <label class="field-label">2. Objetivo Estratégico ANI *</label>
                <input type="text" list="ani-objetivos-list" value="${esc(p.objetivo)}" placeholder="Objetivo vigente ANI o: Información insuficiente para concluir" oninput="ANI.setProj('${p.id}','objetivo',this.value)">
              </div>
              <div>
                <label class="field-label">3. Proyecto Estratégico *</label>
                <input type="text" value="${esc(p.proyecto)}" placeholder="Nombre único, verificable, con modo o frente" oninput="ANI.setProj('${p.id}','proyecto',this.value)">
              </div>
              <div>
                <label class="field-label">4. Unidad de Medida *</label>
                <input type="text" value="${esc(p.unidad)}" placeholder="Una sola unidad: km, %, casos, proyectos…" oninput="ANI.setProj('${p.id}','unidad',this.value)">
              </div>
              <div>
                <label class="field-label">Línea Base (requisito R6)</label>
                <input type="text" value="${esc(p.lineaBase)}" placeholder="Dato oficial o: Información insuficiente para concluir" oninput="ANI.setProj('${p.id}','lineaBase',this.value)">
              </div>
              <div>
                <label class="field-label">5. Meta 2030 *</label>
                <input type="text" value="${esc(p.meta)}" placeholder="Por definir — línea base pendiente" oninput="ANI.setProj('${p.id}','meta',this.value)">
              </div>
              <div>
                <label class="field-label">Modo / Frente ANI</label>
                <select onchange="ANI.setProj('${p.id}','modo',this.value)">
                  <option value="">Seleccionar…</option>
                  ${modePool.map((m) => `<option value="${esc(m)}" ${p.modo === m ? 'selected' : ''}>${esc(m)}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="field-label">Eje PND vinculado</label>
                <select onchange="ANI.setProj('${p.id}','ejePnd',this.value)">
                  <option value="">Por vincular…</option>
                  ${state.pndAxes.map((ax) => `<option value="Eje ${ax.numero}" ${p.ejePnd === `Eje ${ax.numero}` ? 'selected' : ''}>Eje ${ax.numero}${ax.nombre ? ' · ' + esc(ax.nombre.slice(0, 28)) : ''}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="field-label">Estatus de gobernanza</label>
                <select onchange="ANI.setProj('${p.id}','estatus',this.value,true)">
                  <option value="en_construccion" ${p.estatus === 'en_construccion' ? 'selected' : ''}>En construcción (Equipo)</option>
                  <option value="validado_taller" ${p.estatus === 'validado_taller' ? 'selected' : ''}>Validado en taller</option>
                  <option value="propuesta_ia" ${p.estatus === 'propuesta_ia' ? 'selected' : ''}>Propuesta IA — No aprobada</option>
                  <option value="ejemplo_ilustrativo" ${p.estatus === 'ejemplo_ilustrativo' ? 'selected' : ''}>Ejemplo ilustrativo (no dato ANI)</option>
                  <option value="oficial_ani" ${p.estatus === 'oficial_ani' ? 'selected' : ''}>Oficial ANI (Aprobado)</option>
                </select>
              </div>
            </div>

            ${p.foco ? `
              <label class="field-label">${p.foco === 'F1' ? 'Criterios transversales F1 cubiertos' : 'Capacidades F2 fortalecidas'}</label>
              <div class="check-pills">
                ${tagPool.map((t) => {
                  const checked = (p.criterios || []).includes(t);
                  return `<label class="check-pill ${checked ? 'checked' : ''}">
                    <input type="checkbox" ${checked ? 'checked' : ''} onchange="ANI.toggleProjCriterio('${p.id}','${esc(t)}')"> ${esc(t)}
                  </label>`;
                }).join('')}
              </div>` : ''}

            <label class="field-label">6. Detalle Técnico (contribución al Foco + criterios F1 / capacidades F2 + supuestos/riesgos) *</label>
            <textarea placeholder="Explique contribución verificable, criterios transversales o capacidades, supuestos y riesgos." oninput="ANI.setProj('${p.id}','detalle',this.value)">${esc(p.detalle)}</textarea>

            <label class="field-label">Doble Llave F1 ↔ F2 (proyecto o componente complementario obligatorio — R3)</label>
            <input type="text" value="${esc(p.doble)}" placeholder="Ej.: F1 Corredor X ↔ F2 Sistema preventivo y diálogo territorial Y" oninput="ANI.setProj('${p.id}','doble',this.value)">

            <label class="field-label">Scoring Multicriterio 1–5 (1 = Muy bajo · 5 = Muy alto) — Recomendación R5</label>
            <div class="score-grid">
              ${SCORING_CRITERIA.map(([k, label]) => `
                <div class="score-box">
                  <div class="score-box-top"><span>${esc(label)}</span><output id="out-${p.id}-${k}">${p.scores[k]}</output></div>
                  <input type="range" min="1" max="5" step="1" value="${p.scores[k]}" oninput="ANI.setScore('${p.id}','${k}',this.value)">
                </div>`).join('')}
            </div>

            <div class="tag-cloud" style="margin-top:10px" data-proj-checks="${p.id}">
              ${checks.map(([lbl, ok]) => `<span class="badge ${ok ? 'badge-ok' : 'badge-warn'}">${ok ? '✓' : '○'} ${esc(lbl)}</span>`).join('')}
            </div>
          </article>`;
        }).join('')
      : `<div class="empty-state">
          <h3>${state.projects.length ? 'Ningún proyecto coincide con el filtro actual' : 'Cartera PEI 2027–2030 lista para diligenciar'}</h3>
          <p class="muted">Cree un nuevo proyecto cumpliendo las 6 columnas contractuales o cargue los 2 ejemplos ilustrativos de formato de la plantilla CSV original (marcados explícitamente como no oficiales).</p>
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px">
            <button class="btn btn-teal" onclick="ANI.addProject()">+ Crear primer proyecto PEI</button>
            ${!state.projects.length ? `<button class="btn btn-outline" onclick="ANI.loadIllustrativeExamples()">Cargar 2 ejemplos de formato (CSV)</button>` : ''}
          </div>
        </div>`}`;
  } else if (peiTab === 'tabla') {
    body = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Contrato de Trazabilidad — Tabla PEI 2027–2030</h2>
          <p class="muted">Vista ejecutiva consolidada de las 6 columnas obligatorias, doble llave F1↔F2, scoring y estatus.</p>
        </div>
        <div class="toolbar no-print" style="margin:0">
          <button class="btn btn-teal btn-sm" onclick="ANI.exportPeiCsv()">Exportar CSV (Excel/Sheets)</button>
          <a class="btn btn-outline btn-sm" href="./02_Plantilla_Ejercicio_PEI_2027-2030.csv" download>Plantilla CSV original</a>
        </div>
      </div>
      <div class="table-wrap">
        <table class="exec-table">
          <thead><tr><th>Foco</th><th>Objetivos Estratégicos</th><th>Proyecto</th><th>Unidad</th><th>Línea Base / Meta 2030</th><th>Detalle y Doble Llave</th><th>Priorización</th></tr></thead>
          <tbody>
            ${state.projects.length
              ? state.projects.map((p) => {
                  const cat = projCategory(p);
                  const sc = projScore(p);
                  return `<tr>
                    <td><span class="badge ${p.foco === 'F1' ? 'badge-teal' : p.foco === 'F2' ? 'badge-amber' : 'badge-warn'}">${p.foco || '—'}</span></td>
                    <td>${esc(p.objetivo || 'Pendiente')}</td>
                    <td><b>${esc(p.proyecto || 'Sin nombre')}</b><br>${statusBadge(p.estatus)}</td>
                    <td>${esc(p.unidad || '—')}</td>
                    <td><small class="muted">LB:</small> ${esc(p.lineaBase || 'Pendiente')}<br><small class="muted">2030:</small> <b>${esc(p.meta || 'Por definir')}</b></td>
                    <td>${esc(p.detalle || '—')}<br><small class="muted"><b>Doble llave:</b> ${esc(p.doble || 'Sin declarar')}</small></td>
                    <td><span class="badge ${cat.cls}">${esc(cat.label)}</span><br><small class="muted">Imp ${sc.imp.toFixed(1)} · Esf ${sc.eff.toFixed(1)}</small></td>
                  </tr>`;
                }).join('')
              : `<tr><td colspan="7" class="muted">Aún no hay proyectos en la tabla PEI.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
  } else {
    const ranked = [...state.projects].sort((a, b) => projScore(b).total - projScore(a).total);
    const buckets = { q1: [], q2: [], q3: [], q4: [] };
    state.projects.forEach((p) => buckets[projCategory(p).key].push(p));

    body = `
    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <div>
            <h2>Mapa Cartesiano Impacto vs. Esfuerzo</h2>
            <p class="muted">Impacto = media(institucional, nacional, alineación). Esfuerzo = 6 − media(4 factibilidades).</p>
          </div>
          ${citeBadge('MARCO-S3.5')}
        </div>
        ${renderScatterSvg(state.projects)}
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h2>Taller 20 Minutos — “Doble llave: F1 viable con F2”</h2>
            <p class="muted">Metodología preservada: scoring silencioso → debate → consenso → ubicación en matriz.</p>
          </div>
          ${citeBadge('MARCO-S5.3')}
        </div>
        <div class="timer-display" id="workshopTimer">${esc(timerLabel)}</div>
        <div class="toolbar no-print">
          <button class="btn btn-teal btn-sm" onclick="ANI.timerStart()">Iniciar</button>
          <button class="btn btn-outline btn-sm" onclick="ANI.timerPause()">Pausar</button>
          <button class="btn btn-outline btn-sm" onclick="ANI.timerReset()">Reiniciar 20:00</button>
        </div>
        <h3 style="margin-top:12px">Ranking Automático de Cartera</h3>
        ${ranked.length
          ? ranked.map((p, i) => {
              const sc = projScore(p);
              const cat = projCategory(p);
              return `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--line);font-size:12.8px">
                <b style="color:var(--navy-900);width:26px">#${i + 1}</b>
                <span class="badge ${p.foco === 'F2' ? 'badge-amber' : 'badge-teal'}">${p.foco || '—'}</span>
                <span style="flex:1"><b>${esc(p.proyecto || 'Sin nombre')}</b></span>
                <span class="badge ${cat.cls}">${esc(cat.label)}</span>
                <span class="badge badge-navy">${sc.total.toFixed(2)}</span>
              </div>`;
            }).join('')
          : `<p class="muted">Agregue proyectos en la pestaña Fichas Editables para calcular el ranking automático.</p>`}
      </div>
    </div>

    <div class="card">
      <h2>Cuadrantes de Decisión — Matriz Impacto vs. Esfuerzo</h2>
      <div class="matrix-quadrants">
        <div class="quad-box q-win"><h4>Quick Wins · Alto impacto (≥3.5) · Bajo esfuerzo (≤2.5)</h4>${buckets.q1.length ? buckets.q1.map((p) => `<span class="badge badge-ok" style="margin:3px">${esc(p.foco)} · ${esc(p.proyecto || 'Sin nombre')}</span>`).join('') : '<span class="muted">Sin proyectos en este cuadrante</span>'}</div>
        <div class="quad-box q-strat"><h4>Iniciativas Estratégicas · Alto impacto (≥3.5) · Alto esfuerzo (&gt;2.5)</h4>${buckets.q2.length ? buckets.q2.map((p) => `<span class="badge badge-navy" style="margin:3px">${esc(p.foco)} · ${esc(p.proyecto || 'Sin nombre')}</span>`).join('') : '<span class="muted">Sin proyectos en este cuadrante</span>'}</div>
        <div class="quad-box q-drop"><h4>Descartar o Rediseñar · Bajo impacto (&lt;3.5) · Bajo esfuerzo (≤2.5)</h4>${buckets.q3.length ? buckets.q3.map((p) => `<span class="badge badge-warn" style="margin:3px">${esc(p.foco)} · ${esc(p.proyecto || 'Sin nombre')}</span>`).join('') : '<span class="muted">Sin proyectos en este cuadrante</span>'}</div>
        <div class="quad-box q-trans"><h4>Transformaciones Estructurales · Bajo impacto hoy · Alto esfuerzo</h4>${buckets.q4.length ? buckets.q4.map((p) => `<span class="badge badge-amber" style="margin:3px">${esc(p.foco)} · ${esc(p.proyecto || 'Sin nombre')}</span>`).join('') : '<span class="muted">Sin proyectos en este cuadrante</span>'}</div>
      </div>
    </div>`;
  }

  return `
  <div class="subtabs no-print">
    ${tabs.map(([id, lbl]) => `<button class="subtab ${peiTab === id ? 'active' : ''}" onclick="ANI.setPeiTab('${id}')">${esc(lbl)}</button>`).join('')}
  </div>
  ${body}`;
}

/* ==================== MÓDULO 07: PLAN DE ACCIÓN 2027–2030 ==================== */
export function renderActionPlan(state, paTab = 'fichas', filterFoco = '') {
  const items = state.actionPlan.filter((a) => !filterFoco || a.foco === filterFoco);
  const tabs = [
    ['fichas', `Actividades y Seguimiento (${state.actionPlan.length})`],
    ['cronograma', 'Cronograma Plurianual 2027–2030']
  ];

  let body = '';
  if (paTab === 'fichas') {
    body = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Despliegue Operativo: Cartera PEI → Plan de Acción 2027–2030</h2>
          <p class="muted">Programe actividades concretas, entregables, indicadores de gestión, metas anuales, responsables y recursos (sin inventar cifras sin soporte).</p>
        </div>
        <div class="toolbar no-print" style="margin:0">
          <select onchange="ANI.setPaFilter(this.value)">
            <option value="" ${!filterFoco ? 'selected' : ''}>Todos los focos</option>
            <option value="F1" ${filterFoco === 'F1' ? 'selected' : ''}>F1 · Infraestructura</option>
            <option value="F2" ${filterFoco === 'F2' ? 'selected' : ''}>F2 · Ruta social</option>
          </select>
          <button class="btn btn-teal btn-sm" onclick="ANI.addActionItem()">+ Nueva actividad</button>
          <button class="btn btn-outline btn-sm" onclick="ANI.exportActionCsv()">Exportar CSV PA</button>
        </div>
      </div>

      ${items.length
        ? items.map((a, idx) => `
          <div class="entity-card">
            <div class="entity-head">
              <span class="badge badge-navy">${esc(a.codigo || `PA-${String(idx + 1).padStart(2, '0')}`)}</span>
              <span class="badge ${a.foco === 'F2' ? 'badge-amber' : a.foco === 'F1' ? 'badge-teal' : 'badge-warn'}">${a.foco || 'Sin foco'}</span>
              <span class="entity-title" data-pa-title="${a.id}">${esc(a.actividad || 'Actividad en formulación')}</span>
              ${statusBadge(a.estatus)}
              <span style="flex:1"></span>
              <button class="btn btn-outline btn-xs no-print" onclick="ANI.dupActionItem('${a.id}')">Duplicar</button>
              <button class="btn btn-danger btn-xs no-print" onclick="ANI.delActionItem('${a.id}')">Eliminar</button>
            </div>
            <div class="grid-3">
              <div>
                <label class="field-label">Proyecto PEI asociado *</label>
                <select onchange="ANI.linkActionProject('${a.id}',this.value)">
                  <option value="">Seleccionar proyecto PEI…</option>
                  ${state.projects.map((p) => `<option value="${p.id}" ${a.proyectoId === p.id ? 'selected' : ''}>[${p.foco || '—'}] ${esc(p.proyecto || 'Sin nombre')}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="field-label">Foco Estratégico *</label>
                <select onchange="ANI.setAction('${a.id}','foco',this.value,true)">
                  <option value="" ${!a.foco ? 'selected' : ''}>Seleccionar…</option>
                  <option value="F1" ${a.foco === 'F1' ? 'selected' : ''}>F1 · Infraestructura dinamizadora</option>
                  <option value="F2" ${a.foco === 'F2' ? 'selected' : ''}>F2 · Ruta social preventiva</option>
                </select>
              </div>
              <div>
                <label class="field-label">Dependencia / Rol Responsable *</label>
                <input type="text" value="${esc(a.responsable)}" placeholder="Ej.: Planeación, Gestión Social, Jurídica, Predial…" oninput="ANI.setAction('${a.id}','responsable',this.value)">
              </div>
            </div>
            <div class="grid-2">
              <div><label class="field-label">Actividad del Plan de Acción *</label><input type="text" value="${esc(a.actividad)}" placeholder="Acción concreta y verificable" oninput="ANI.setAction('${a.id}','actividad',this.value)"></div>
              <div><label class="field-label">Producto / Entregable verificable *</label><input type="text" value="${esc(a.entregable)}" placeholder="Protocolo, estudio, km intervenidos, sistema…" oninput="ANI.setAction('${a.id}','entregable',this.value)"></div>
            </div>
            <div class="grid-3">
              <div><label class="field-label">Indicador de gestión</label><input type="text" value="${esc(a.indicador)}" placeholder="Fórmula o nombre del indicador" oninput="ANI.setAction('${a.id}','indicador',this.value)"></div>
              <div><label class="field-label">Unidad de medida</label><input type="text" value="${esc(a.unidad)}" placeholder="%, documentos, mesas, km…" oninput="ANI.setAction('${a.id}','unidad',this.value)"></div>
              <div><label class="field-label">Presupuesto / fuente de recursos</label><input type="text" value="${esc(a.presupuesto)}" placeholder="Por definir — restricción presupuestal pendiente" oninput="ANI.setAction('${a.id}','presupuesto',this.value)"></div>
            </div>
            <div class="grid-4">
              <div><label class="field-label">Programación 2027</label><input type="text" value="${esc(a.m2027)}" placeholder="Hito / meta 2027" oninput="ANI.setAction('${a.id}','m2027',this.value)"></div>
              <div><label class="field-label">Programación 2028</label><input type="text" value="${esc(a.m2028)}" placeholder="Hito / meta 2028" oninput="ANI.setAction('${a.id}','m2028',this.value)"></div>
              <div><label class="field-label">Programación 2029</label><input type="text" value="${esc(a.m2029)}" placeholder="Hito / meta 2029" oninput="ANI.setAction('${a.id}','m2029',this.value)"></div>
              <div><label class="field-label">Programación 2030</label><input type="text" value="${esc(a.m2030)}" placeholder="Hito / meta 2030" oninput="ANI.setAction('${a.id}','m2030',this.value)"></div>
            </div>
            <div class="grid-3">
              <div>
                <label class="field-label">Estado operativo</label>
                <select onchange="ANI.setAction('${a.id}','estado',this.value)">
                  ${['Formulada', 'Propuesta IA — No aprobada', 'Programada', 'En ejecución', 'En alerta', 'Cumplida']
                    .map((st) => `<option value="${st}" ${a.estado === st ? 'selected' : ''}>${st}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="field-label">Avance físico (<span id="pa-av-${a.id}">${a.avance}</span>%)</label>
                <input type="range" min="0" max="100" step="5" value="${a.avance}" oninput="ANI.setAction('${a.id}','avance',this.value)">
              </div>
              <div><label class="field-label">Riesgo operativo y mitigación</label><input type="text" value="${esc(a.riesgo)}" placeholder="Riesgo asociado y acción preventiva" oninput="ANI.setAction('${a.id}','riesgo',this.value)"></div>
            </div>
          </div>`).join('')
        : `<div class="empty-state">
            <h3>Plan de Acción 2027–2030 listo para programación</h3>
            <p class="muted">Cree actividades directamente o derívelas desde cada proyecto de la Cartera PEI (botón “+ Actividad PA”).</p>
            <button class="btn btn-teal btn-sm" onclick="ANI.addActionItem()">+ Crear primera actividad</button>
          </div>`}
    </div>`;
  } else {
    body = `
    <div class="card">
      <div class="card-header">
        <h2>Cronograma Plurianual del Plan de Acción (2027–2030)</h2>
        <button class="btn btn-teal btn-sm no-print" onclick="ANI.exportActionCsv()">Exportar CSV</button>
      </div>
      <div class="table-wrap">
        <table class="exec-table">
          <thead><tr><th>Foco</th><th>Proyecto PEI → Actividad</th><th>Responsable</th><th>2027 (Corto)</th><th>2028 (Mediano)</th><th>2029 (Mediano)</th><th>2030 (Largo)</th><th>Estado</th></tr></thead>
          <tbody>
            ${state.actionPlan.length
              ? state.actionPlan.map((a) => `<tr>
                  <td><span class="badge ${a.foco === 'F2' ? 'badge-amber' : 'badge-teal'}">${a.foco || '—'}</span></td>
                  <td><small class="muted">${esc(a.proyectoNombre || 'Sin proyecto PEI')}</small><br><b>${esc(a.actividad || 'Sin nombre')}</b><br><small class="muted">Entregable: ${esc(a.entregable || '—')}</small></td>
                  <td>${esc(a.responsable || 'Por asignar')}</td>
                  <td>${esc(a.m2027 || '—')}</td>
                  <td>${esc(a.m2028 || '—')}</td>
                  <td>${esc(a.m2029 || '—')}</td>
                  <td>${esc(a.m2030 || '—')}</td>
                  <td><span class="badge badge-slate">${esc(a.estado)} · ${a.avance}%</span></td>
                </tr>`).join('')
              : `<tr><td colspan="8" class="muted">Sin actividades registradas aún.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  return `
  <div class="subtabs no-print">
    ${tabs.map(([id, lbl]) => `<button class="subtab ${paTab === id ? 'active' : ''}" onclick="ANI.setPaTab('${id}')">${esc(lbl)}</button>`).join('')}
  </div>
  ${body}`;
}

/* ==================== MÓDULO 08: CENTRO AUDIOVISUAL Y RECURSOS ==================== */
export function renderMedia(state) {
  const renderAssetPreview = (m) => {
    const u = (m.url || '').trim();
    if (!u) return `<p class="muted">Ruta pendiente de configurar.</p>`;
    if (m.tipo === 'imagen') {
      return `<img src="${esc(u)}" alt="${esc(m.titulo)}" style="width:100%;max-height:260px;object-fit:contain;border-radius:8px;border:1px solid var(--line);background:#f8fafc">`;
    }
    const yt = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (yt) {
      return `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="${esc(m.titulo)}" style="width:100%;height:240px;border:0;border-radius:8px" allowfullscreen loading="lazy"></iframe>`;
    }
    return `<video controls preload="metadata" src="${esc(u)}" style="width:100%;max-height:260px;border-radius:8px;background:#000"></video>`;
  };

  return `
  <div class="card">
    <div class="card-header">
      <div>
        <h2>Canvas Ejecutivo Original Preservado — 2 Focos ANI 2027–2030</h2>
        <p class="muted">Recurso gráfico interactivo existente en el repositorio (<code>03_Canvas_2_Focos_ANI.html</code>), integrado sin alteraciones.</p>
      </div>
      <a class="btn btn-navy btn-sm no-print" href="./03_Canvas_2_Focos_ANI.html" target="_blank" rel="noopener">Abrir pantalla completa ↗</a>
    </div>
    <iframe class="media-frame" src="./03_Canvas_2_Focos_ANI.html" title="Canvas Ejecutivo 2 Focos ANI 2027-2030"></iframe>
  </div>

  <div class="card">
    <div class="card-header">
      <div>
        <h2>Videos, Imágenes y Láminas Institucionales ANI</h2>
        <p class="muted">No se incluyen imágenes ni videos genéricos de relleno. Coloque archivos oficiales en <code>assets/media/</code> o vincule URLs institucionales verificadas.</p>
      </div>
      <button class="btn btn-teal btn-sm no-print" onclick="ANI.addMediaItem()">+ Vincular video o imagen oficial</button>
    </div>

    ${state.mediaAssets.length
      ? `<div class="grid-2">${state.mediaAssets.map((m) => `
          <div class="entity-card" style="margin:0">
            <div class="entity-head">
              <span class="badge ${m.tipo === 'video' ? 'badge-navy' : 'badge-teal'}">${m.tipo === 'video' ? 'Video institucional' : 'Imagen / Mapa'}</span>
              <span class="badge">${esc(m.foco)}</span>
              <span style="flex:1"></span>
              <button class="btn btn-danger btn-xs no-print" onclick="ANI.delMediaItem('${m.id}')">Quitar</button>
            </div>
            ${m.url ? `<div style="margin-bottom:10px">${renderAssetPreview(m)}</div>` : ''}
            <div class="grid-2">
              <div><label class="field-label">Tipo</label>
                <select onchange="ANI.setMedia('${m.id}','tipo',this.value,true)">
                  <option value="video" ${m.tipo === 'video' ? 'selected' : ''}>Video (.mp4, .webm, YouTube)</option>
                  <option value="imagen" ${m.tipo === 'imagen' ? 'selected' : ''}>Imagen / Lámina (.png, .jpg, .svg, .webp)</option>
                </select>
              </div>
              <div><label class="field-label">Foco</label>
                <select onchange="ANI.setMedia('${m.id}','foco',this.value)">
                  <option value="F1+F2" ${m.foco === 'F1+F2' ? 'selected' : ''}>Institucional (F1 + F2)</option>
                  <option value="F1" ${m.foco === 'F1' ? 'selected' : ''}>F1 · Infraestructura</option>
                  <option value="F2" ${m.foco === 'F2' ? 'selected' : ''}>F2 · Ruta social</option>
                </select>
              </div>
            </div>
            <label class="field-label">Título del recurso institucional</label>
            <input type="text" value="${esc(m.titulo)}" placeholder="Ej.: Video Estratégico ANI 2027–2030 / Lámina Iniciativas PND" oninput="ANI.setMedia('${m.id}','titulo',this.value)">
            <label class="field-label">Ruta en repositorio o URL oficial</label>
            <input type="text" value="${esc(m.url)}" placeholder="Ej.: ./assets/media/estrategia-ani.mp4 o https://…" onchange="ANI.setMedia('${m.id}','url',this.value,true)">
            <label class="field-label">Fuente / dependencia y descripción</label>
            <input type="text" value="${esc(m.fuente)}" placeholder="Oficina de Comunicaciones / Planeación ANI · Fecha" oninput="ANI.setMedia('${m.id}','fuente',this.value)">
          </div>`).join('')}</div>`
      : `<div class="callout callout-warn" style="margin:0">
          <b>Estado verificado de activos multimedia:</b> El repositorio actual contiene <b>0 archivos de video</b> y <b>0 archivos de imagen</b>
          (las 2 láminas fuente citadas en <code>01_Marco_Estrategico_ANI_2027-2030.md</code> fueron transcritas pero no almacenadas como imagen).
          Al incorporar archivos en <code>assets/media/</code> o registrarlos con el botón superior, se reproducirán aquí de forma nativa.
        </div>`}
  </div>

  <div class="card">
    <h2>Descarga Directa de Archivos Originales del Repositorio</h2>
    <div class="grid-4">
      ${REPO_DOCUMENTS.map((d) => `<div class="kpi-card">
        <span class="kpi-label">${esc(d.type)}</span>
        <b style="font-size:13px;color:var(--navy-900)">${esc(d.title)}</b>
        <a class="btn btn-outline btn-xs no-print" style="margin-top:6px" href="./${esc(d.file)}" download>Descargar</a>
      </div>`).join('')}
    </div>
  </div>`;
}

/* ==================== MÓDULO 09: HERRAMIENTAS DE CONSULTA Y AGENTE IA ==================== */
export function renderChatFeedHtml(messages) {
  if (!messages.length) {
    return `<div class="callout callout-navy" style="margin:0">
      <b>Agente de Inteligencia Estratégica — ANI STRATEGY LAB</b><br>
      Formule consultas sobre el Marco Estratégico 2027–2030, los 2 Focos, las recomendaciones R1–R6, el cruce PND ↔ competencias ANI, su Cartera PEI o el Plan de Acción.
      Todas las respuestas incluyen referencias documentales clicables <code>[ID]</code> y toda propuesta queda marcada como <b>no aprobada</b> hasta validación institucional.
    </div>`;
  }

  return messages.map((msg, mIdx) => {
    if (msg.role === 'user') {
      return `<div class="chat-msg user"><div style="font-size:10.5px;opacity:.75;margin-bottom:3px">Consulta · ${esc(msg.modeLabel || msg.mode || '')}</div>${esc(msg.content)}</div>`;
    }
    const r = msg.payload || {};
    const formattedAnswer = r.answer
      ? esc(r.answer)
          .replace(/\[([A-Z0-9][A-Z0-9._-]{2,40})\]/g, '<button type="button" class="cite-tag" data-cite="$1">[$1]</button>')
          .replace(/\n/g, '<br>')
      : '';

    const citations = Array.isArray(r.verifiedCitations) ? r.verifiedCitations : [];
    const props = r.proposals || { peiProjects: [], actionItems: [], opportunities: [] };

    const peiCards = (props.peiProjects || []).map((p, pIdx) => `
      <div class="proposal-card">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap">
          <span class="badge badge-ai">Propuesta Proyecto PEI — No aprobada</span>
          <span class="badge ${p.foco === 'F2' ? 'badge-amber' : 'badge-teal'}">${esc(p.foco)}</span>
        </div>
        <b style="display:block;margin:6px 0 3px;color:var(--navy-900)">${esc(p.proyecto)}</b>
        <div class="muted">Unidad: ${esc(p.unidad)} · Meta 2030: ${esc(p.meta)} · Doble llave: ${esc(p.doble || 'Por definir')}</div>
        <p class="muted" style="margin:5px 0">${esc(p.detalle)}</p>
        <button class="btn btn-navy btn-xs no-print" onclick="ANI.acceptProposal(${mIdx},'pei',${pIdx})">+ Incorporar como borrador a Cartera PEI</button>
      </div>`).join('');

    const paCards = (props.actionItems || []).map((a, aIdx) => `
      <div class="proposal-card">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap">
          <span class="badge badge-ai">Propuesta Plan de Acción — No aprobada</span>
          <span class="badge ${a.foco === 'F2' ? 'badge-amber' : 'badge-teal'}">${esc(a.foco)}</span>
        </div>
        <b style="display:block;margin:6px 0 3px;color:var(--navy-900)">${esc(a.actividad)}</b>
        <div class="muted">Entregable: ${esc(a.entregable)} · Indicador: ${esc(a.indicador)} · Responsable: ${esc(a.responsable)}</div>
        <button class="btn btn-navy btn-xs no-print" style="margin-top:6px" onclick="ANI.acceptProposal(${mIdx},'pa',${aIdx})">+ Incorporar como borrador al Plan de Acción</button>
      </div>`).join('');

    const oppCards = (props.opportunities || []).map((o, oIdx) => `
      <div class="proposal-card">
        <span class="badge badge-ai">Propuesta Oportunidad — No aprobada</span>
        <b style="display:block;margin:6px 0 3px;color:var(--navy-900)">[${esc(o.foco)}] ${esc(o.titulo)}</b>
        <p class="muted" style="margin:4px 0">${esc(o.descripcion)}</p>
        <button class="btn btn-navy btn-xs no-print" onclick="ANI.acceptProposal(${mIdx},'opp',${oIdx})">+ Incorporar a Matriz de Oportunidades</button>
      </div>`).join('');

    const auditHtml = r.auditReport?.findings?.length
      ? `<div style="margin-top:10px">
          <b style="font-size:12px;color:var(--navy-900)">Verificación reglada R1–R6 (${r.auditReport.summary.critical} críticos · ${r.auditReport.summary.warnings} alertas):</b>
          ${r.auditReport.findings.slice(0, 6).map((f) => `
            <div class="citation-block" style="border-left:3px solid ${f.severity === 'bad' ? 'var(--bad-600)' : f.severity === 'warn' ? 'var(--amber-500)' : 'var(--teal-600)'}">
              <b>${esc(f.rule)} — ${esc(f.title)}</b> ${citeBadge(f.citation)}<br>
              <span class="muted">${esc(f.detail)}</span>
            </div>`).join('')}
        </div>`
      : '';

    return `<div class="chat-msg assistant">
      <div style="display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap;margin-bottom:8px">
        <span class="badge ${r.generationMode === 'arena_api_live' ? 'badge-ok' : 'badge-warn'}">
          ${r.generationMode === 'arena_api_live'
            ? `Arena API en vivo · ${esc(r.arenaMeta?.reportedModel || 'modelo')}`
            : 'Recuperación documental verificada (Arena API pendiente de clave)'}
        </span>
        ${r.arenaMeta?.traceId ? `<span class="badge">Trace: ${esc(r.arenaMeta.traceId)}</span>` : ''}
      </div>

      ${r.statusNotice ? `<div class="callout callout-warn" style="padding:9px 12px;font-size:12.2px">${esc(r.statusNotice)}</div>` : ''}
      ${r.error ? `<div class="callout callout-bad" style="padding:9px 12px;font-size:12.2px"><b>Error Arena API (${esc(r.error.code)}):</b> ${esc(r.error.message)}<br>${esc(r.error.userGuidance || '')}</div>` : ''}
      ${r.governanceBadge ? `<div style="margin-bottom:8px"><span class="badge badge-ai">${esc(r.governanceBadge)}</span></div>` : ''}
      ${formattedAnswer ? `<div style="margin-bottom:10px">${formattedAnswer}</div>` : ''}
      ${peiCards}${paCards}${oppCards}
      ${auditHtml}
      ${citations.length ? `
        <div style="margin-top:10px">
          <b style="font-size:12px;color:var(--navy-900)">Fuentes documentales verificables (${citations.length}):</b>
          ${citations.map((c) => `
            <div class="citation-block">
              <div style="display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap">
                <span>${citeBadge(c.id)} <b>${esc(c.section)}</b></span>
                <small class="muted">${esc(c.sourceFile)} (${esc(c.lineRange)})</small>
              </div>
              <pre>${esc(String(c.excerpt || '').slice(0, 520))}${String(c.excerpt || '').length > 520 ? '…' : ''}</pre>
            </div>`).join('')}
        </div>` : ''}
    </div>`;
  }).join('');
}

export function renderAgentModule(state, agentUi) {
  const {
    toolTab = 'chat',
    statusData = null,
    verifyResult = null,
    activeMode = 'consulta',
    messages = [],
    busy = false,
    searchQuery = '',
    searchResults = null,
    auditReport = null
  } = agentUi;

  const arena = statusData?.arena || {};
  const kb = statusData?.knowledge || {};
  const isLiveReady = arena.status === 'configured_ready';

  const modeOptions = [
    ['consulta', '1. Consulta documental trazable'],
    ['analisis', '2. Análisis de documentos y proyectos'],
    ['pnd_ani', '3. Cruce PND (7 Ejes) ↔ Competencias ANI'],
    ['oportunidades', '4. Identificación de oportunidades estratégicas'],
    ['recomendaciones', '5. Formulación de recomendaciones'],
    ['propuesta_pei', '6. Proponer proyectos PEI (borrador)'],
    ['propuesta_pa', '7. Proponer actividades Plan de Acción (borrador)'],
    ['auditoria', '8. Auditoría R1–R6 y Doble Llave']
  ];

  const tabs = [
    ['chat', 'Agente Estratégico ANI (Arena API)'],
    ['buscador', 'Buscador Documental BM25'],
    ['auditor', 'Auditor de Trazabilidad R1–R6']
  ];

  let body = '';
  if (toolTab === 'chat') {
    body = `
    <div class="agent-layout">
      <aside class="card" style="margin:0">
        <h3>Conexión Arena API</h3>
        <div style="margin:8px 0">
          <span class="badge ${isLiveReady ? 'badge-ok' : 'badge-warn'}">
            ${isLiveReady ? 'Clave Arena configurada' : arena.status === 'static_host_mode' ? 'Modo estático (sin backend)' : 'Pendiente ARENA_API_KEY'}
          </span>
        </div>
        <p class="muted" style="font-size:12px">
          <b>Proveedor único:</b> ${esc(arena.providerLabel || 'Arena API')}<br>
          <b>Endpoint:</b> <code>${esc(arena.completionsEndpoint || 'https://api.arena.ai/v1/chat/completions')}</code><br>
          <b>Modelo:</b> ${esc(arena.configuredModel || 'Por definir en .env')}<br>
          <b>Acervo indexado:</b> ${kb.totalRepoChunks || 0} secciones en ${kb.totalRepoFiles || 4} archivos base + sesión activa
        </p>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0">
          <button class="btn btn-outline btn-xs" onclick="ANI.verifyArena()">Verificar conexión</button>
          <button class="btn btn-soft btn-xs" onclick="ANI.refreshAgentStatus()">Actualizar estado</button>
        </div>
        ${verifyResult ? `<div class="callout ${verifyResult.ok ? 'callout-teal' : 'callout-warn'}" style="padding:8px 10px;font-size:11.8px;margin-top:8px">
          <b>Verificación:</b> ${esc(verifyResult.status)}<br>
          ${esc(verifyResult.recommendedAction || verifyResult.message || '')}
          ${verifyResult.userGuidance ? `<br><span class="muted">${esc(verifyResult.userGuidance)}</span>` : ''}
        </div>` : ''}

        <details class="guide-box">
          <summary>Cómo activar Arena API</summary>
          <ol class="tree-list" style="font-size:11.6px">
            ${(arena.activationSteps || []).map((s) => `<li>${esc(s.replace(/^\d+\.\s*/, ''))}</li>`).join('')}
          </ol>
          <label class="field-label">URL HTTPS Backend (solo para GitHub Pages)</label>
          <input type="url" value="${esc(getBackendBase())}" placeholder="Vacío = mismo servidor" onchange="ANI.saveBackendUrl(this.value)">
        </details>

        <h3 style="margin-top:14px">Consultas Estratégicas Guiadas</h3>
        <div style="display:flex;flex-direction:column;gap:6px;margin-top:6px">
          ${AGENT_QUICK_PROMPTS.map((qp, i) => `
            <button class="btn btn-outline btn-xs" style="justify-content:flex-start;white-space:normal;text-align:left;padding:7px 9px" onclick="ANI.runQuickPrompt(${i})">
              ${esc(qp.label)}
            </button>`).join('')}
        </div>
      </aside>

      <div class="chat-panel">
        <div class="chat-feed" id="agentChatFeed">${renderChatFeedHtml(messages)}</div>
        <form class="chat-composer" onsubmit="ANI.submitAgentForm(event)">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <label for="agentModeSelect" style="font-size:11.5px;font-weight:750;color:var(--navy-900)">Modo de análisis:</label>
            <select id="agentModeSelect" style="flex:1;min-width:210px;padding:6px 10px" onchange="ANI.setAgentMode(this.value)">
              ${modeOptions.map(([id, lbl]) => `<option value="${id}" ${activeMode === id ? 'selected' : ''}>${esc(lbl)}</option>`).join('')}
            </select>
            ${messages.length ? `<button type="button" class="btn btn-outline btn-xs" onclick="ANI.clearChat()">Limpiar</button>` : ''}
          </div>
          <div class="chat-composer-row">
            <textarea id="agentInput" placeholder="Escriba su pregunta estratégica, análisis PND–ANI o solicitud de propuesta PEI / Plan de Acción…" ${busy ? 'disabled' : ''}></textarea>
            <button type="submit" class="btn btn-teal" ${busy ? 'disabled' : ''}>${busy ? 'Consultando…' : 'Consultar'}</button>
          </div>
        </form>
      </div>
    </div>`;
  } else if (toolTab === 'buscador') {
    body = `
    <div class="card">
      <h2>Buscador Documental Trazable (Repositorio + Sesión Activa)</h2>
      <p class="muted">Consulta léxica ponderada (Okapi BM25 en español) sobre el Marco Estratégico, plantillas, 7 Ejes PND, fichas documentales, cartera PEI y Plan de Acción.</p>
      <form class="toolbar" style="margin-top:12px" onsubmit="ANI.submitSearch(event)">
        <input type="search" id="kbSearchInput" value="${esc(searchQuery)}" placeholder="Ej.: doble llave, infraestructura social competencia R2, alertas tempranas, indicadores…" style="flex:1;min-width:240px">
        <button type="submit" class="btn btn-navy">Buscar con referencias</button>
      </form>
      ${Array.isArray(searchResults)
        ? searchResults.length
          ? searchResults.map((r) => `
            <div class="entity-card">
              <div class="entity-head" style="margin-bottom:6px;padding-bottom:6px">
                ${citeBadge(r.id)}
                <b>${esc(r.docTitle)} — ${esc(r.section)}</b>
                <span style="flex:1"></span>
                <span class="badge">Relevancia ${r.score}</span>
                <small class="muted">${esc(r.sourceFile)} (${esc(r.lineRange)})</small>
              </div>
              <pre class="doc-pre">${esc(r.content)}</pre>
            </div>`).join('')
          : `<p class="muted">No se encontraron fragmentos para “${esc(searchQuery)}”.</p>`
        : `<p class="muted">Ingrese un término estratégico para recuperar los pasajes literales y su ubicación exacta.</p>`}
    </div>`;
  } else {
    body = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Auditor Institucional de Trazabilidad (Reglas R1–R6 y Checklist PEI)</h2>
          <p class="muted">Verifica automáticamente completitud de 6 columnas, coherencia línea base–meta 2030, doble llave F1↔F2, riesgo de competencia R2, 7 Ejes PND y vínculo con Plan de Acción.</p>
        </div>
        <button class="btn btn-teal btn-sm" onclick="ANI.executeAudit()">Ejecutar auditoría ahora</button>
      </div>
      ${auditReport
        ? `<div class="grid-4" style="margin-bottom:14px">
            <div class="kpi-card"><span class="kpi-label">Hallazgos Críticos</span><span class="kpi-value" style="color:var(--bad-700)">${auditReport.summary.critical}</span></div>
            <div class="kpi-card"><span class="kpi-label">Alertas Preventivas</span><span class="kpi-value" style="color:var(--amber-700)">${auditReport.summary.warnings}</span></div>
            <div class="kpi-card"><span class="kpi-label">Recomendaciones</span><span class="kpi-value">${auditReport.summary.info}</span></div>
            <div class="kpi-card"><span class="kpi-label">Reglas Cumplidas</span><span class="kpi-value" style="color:var(--ok-700)">${auditReport.summary.passed}</span></div>
          </div>
          ${auditReport.findings.map((f) => `
            <div class="callout ${f.severity === 'bad' ? 'callout-bad' : f.severity === 'warn' ? 'callout-warn' : f.severity === 'ok' ? 'callout-teal' : 'callout-navy'}">
              <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap">
                <b>[${esc(f.rule)}] ${esc(f.title)}</b>
                ${citeBadge(f.citation)}
              </div>
              <div style="margin-top:4px">${esc(f.detail)}</div>
            </div>`).join('')}`
        : `<p class="muted">Pulse “Ejecutar auditoría ahora” para evaluar su estado actual de planeación.</p>`}
    </div>`;
  }

  return `
  <div class="subtabs no-print">
    ${tabs.map(([id, lbl]) => `<button class="subtab ${toolTab === id ? 'active' : ''}" onclick="ANI.setAgentTab('${id}')">${esc(lbl)}</button>`).join('')}
  </div>
  ${body}`;
}
