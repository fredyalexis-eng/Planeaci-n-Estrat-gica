/**
 * ANI STRATEGY LAB — Renderizadores Ejecutivos de Módulos 06 a 09
 * (06 Cartera PEI y Priorización · 07 Plan de Acción · 08 Centro Audiovisual · 09 Agente IA y Auditoría)
 */
import {
  FOCOS,
  SCORING_CRITERIA,
  PEI_FILL_RULES,
  PA_FILL_RULES,
  REPO_DOCUMENTS,
  AGENT_QUICK_PROMPTS,
  OFFICIAL_PEI_PORTFOLIO,
  OFFICIAL_PEI_PRIORITY_GROUPS,
  DB_SEED_RECORDS
} from '../../data/knowledge-base.js';
import {
  esc,
  statusBadge,
  citeBadge,
  projValid,
  projChecklist,
  projScore,
  projCategory,
  projHasBaselineIssue,
  paValid,
  paChecklist,
  paHasBaselineIssue,
  computeCorrespondence
} from './state.js';
import {
  INSTITUTIONAL_VIDEO_SLOTS,
  STRATEGIC_IMAGE_SLOTS,
  sanitizeMediaUrl,
  formatBytes
} from '../../data/media-manifest.js';
import { getBackendBase } from './agent-client.js';

function renderSafeMediaPlayer(rawUrl, tipo, titulo, meta = {}) {
  const safeUrl = sanitizeMediaUrl(rawUrl);
  if (!safeUrl) {
    return `<div class="callout callout-bad" style="margin:0;padding:8px 10px;font-size:12px">
      <b>URL bloqueada por seguridad:</b> Use una ruta en <code>./assets/media/archivo</code> o una URL oficial <code>https://…</code>.
    </div>`;
  }
  if (tipo === 'imagen') {
    const caption = meta.caption || '';
    const foco = meta.foco || 'F1+F2';
    return `<figure class="media-figure">
      <img
        src="${esc(safeUrl)}"
        alt="${esc(titulo)}"
        class="media-img-preview"
        loading="lazy"
        data-media-src="${esc(safeUrl)}"
        data-media-title="${esc(titulo)}"
        data-media-caption="${esc(caption)}"
        data-media-foco="${esc(foco)}"
        onclick="ANI.openMediaLightboxFromEl(this)"
        onerror="ANI.handleMediaError(this,'imagen')"
      >
      <div class="media-error-box" hidden>
        <b>No fue posible cargar la imagen</b> (<code>${esc(safeUrl)}</code>). Verifique que el archivo exista en <code>assets/media/</code> o previsualice el archivo local.
      </div>
      <figcaption class="media-caption">
        <span>Clic en la imagen para ampliar en pantalla completa</span>
        <button type="button" class="btn btn-outline btn-xs no-print" data-media-src="${esc(safeUrl)}" data-media-title="${esc(titulo)}" data-media-caption="${esc(caption)}" data-media-foco="${esc(foco)}" onclick="ANI.openMediaLightboxFromEl(this)">Ampliar ⤢</button>
      </figcaption>
    </figure>`;
  }

  const yt = safeUrl.match(/^https:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
  if (yt) {
    return `<div class="video-theater">
      <iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0" title="${esc(titulo)}" class="video-embed" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>
    </div>`;
  }
  const vimeo = safeUrl.match(/^https:\/\/(?:www\.|player\.)?vimeo\.com\/(?:video\/)?(\d{6,12})/i);
  if (vimeo) {
    return `<div class="video-theater">
      <iframe src="https://player.vimeo.com/video/${vimeo[1]}?dnt=1" title="${esc(titulo)}" class="video-embed" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>
    </div>`;
  }

  return `<div class="video-theater">
    <video
      controls
      playsinline
      preload="metadata"
      src="${esc(safeUrl)}"
      class="video-player"
      aria-label="${esc(titulo)}"
      onerror="ANI.handleMediaError(this,'video')"
    >
      Su navegador no soporta reproducción HTML5 de video. <a href="${esc(safeUrl)}" download>Descargar video</a>.
    </video>
    <div class="media-error-box" hidden>
      <b>Archivo de video no disponible en la ruta indicada</b> (<code>${esc(safeUrl)}</code>). Confirme que el archivo esté en <code>assets/media/</code> con formato <code>.mp4</code> o <code>.webm</code>, o use “Previsualizar archivo local”.
    </div>
  </div>
  <div class="video-controls-bar no-print">
    <small class="muted">Streaming HTTP 206 activo</small>
    <div style="display:flex;gap:4px;align-items:center">
      <small class="muted">Velocidad:</small>
      ${[0.75, 1, 1.25, 1.5].map((sp) => `<button type="button" class="btn btn-outline btn-xs" style="padding:2px 6px;font-size:11px" onclick="ANI.setVideoRate(this,${sp})">${sp}×</button>`).join('')}
    </div>
  </div>`;
}

function formatAgentMarkdown(rawText) {
  if (!rawText) return '';
  const injectInline = (escapedLine) => escapedLine
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:!?]|$)/g, '$1<i>$2</i>')
    .replace(/\[([A-Z0-9][A-Z0-9._-]{2,40})\]/g, '<button type="button" class="cite-tag" data-cite="$1">[$1]</button>');

  const lines = String(rawText).split(/\r?\n/);
  const out = [];
  let listType = null;
  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      closeList();
      continue;
    }
    const hMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (hMatch) {
      closeList();
      out.push(`<h4 class="chat-heading">${injectInline(esc(hMatch[2]))}</h4>`);
      continue;
    }
    const ulMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (ulMatch) {
      if (listType !== 'ul') { closeList(); out.push('<ul class="chat-list">'); listType = 'ul'; }
      out.push(`<li>${injectInline(esc(ulMatch[1]))}</li>`);
      continue;
    }
    const olMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (olMatch) {
      if (listType !== 'ol') { closeList(); out.push('<ol class="chat-list">'); listType = 'ol'; }
      out.push(`<li>${injectInline(esc(olMatch[1]))}</li>`);
      continue;
    }
    closeList();
    out.push(`<p class="chat-para">${injectInline(esc(trimmed))}</p>`);
  }
  closeList();
  return out.join('');
}

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
  const { peiTab = 'fichas', filterFoco = '', searchProj = '', sortProj = 'orden', timerLabel = '20:00' } = ui;
  const q = searchProj.trim().toLowerCase();
  const filtered = state.projects.filter((p) =>
    (!filterFoco || p.foco === filterFoco) &&
    (!q || `${p.proyecto} ${p.objetivo} ${p.detalle} ${p.modo} ${p.ejePnd} ${p.doble}`.toLowerCase().includes(q))
  );
  const sortedForTable = [...filtered];
  if (sortProj === 'score_desc') sortedForTable.sort((a, b) => projScore(b).total - projScore(a).total);
  else if (sortProj === 'imp_desc') sortedForTable.sort((a, b) => projScore(b).imp - projScore(a).imp);
  else if (sortProj === 'eff_asc') sortedForTable.sort((a, b) => projScore(a).eff - projScore(b).eff);
  else if (sortProj === 'foco') sortedForTable.sort((a, b) => (a.foco || 'Z').localeCompare(b.foco || 'Z'));

  const tabs = [
    ['fichas', `Fichas Editables (${state.projects.length})`],
    ['tabla', 'Tabla Contractual PEI (6 columnas)'],
    ['matriz', `Matriz Institucional (${OFFICIAL_PEI_PORTFOLIO.length})`],
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
        <button class="btn btn-navy btn-sm" onclick="ANI.importOfficialPortfolio()">+ Cargar Cartera Base (14)</button>
        <button class="btn btn-soft btn-sm" onclick="ANI.importDbRecords()">+ Cargar Base Área GC (DB)</button>
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

            <div class="callout callout-bad" data-proj-r6="${p.id}" style="padding:8px 12px;font-size:12px;${baseErr ? '' : 'display:none'}"><b>Alerta R6:</b> Registró una meta numérica sin línea base oficial. Escriba <i>"Por definir — línea base pendiente"</i> hasta contar con línea base verificada.</div>

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

            <label class="field-label">6. Detalle (contribución al Foco + criterios F1 / capacidades F2 + supuestos/riesgos) *</label>
            <textarea placeholder="Explique contribución verificable, criterios transversales o capacidades, supuestos y riesgos." oninput="ANI.setProj('${p.id}','detalle',this.value)">${esc(p.detalle)}</textarea>

            <div class="grid-2">
              <div>
                <label class="field-label">Emparejar con Proyecto Complementario F1 ↔ F2 (Doble Llave R3)</label>
                <select onchange="ANI.pairDoubleKeyProject('${p.id}',this.value)">
                  <option value="">Seleccionar contraparte en cartera (opcional)…</option>
                  ${state.projects
                    .filter((other) => other.id !== p.id && (!p.foco || !other.foco || other.foco !== p.foco))
                    .map((other) => `<option value="${other.id}" ${p.dobleProyectoId === other.id ? 'selected' : ''}>[${other.foco || '—'}] ${esc(other.proyecto || 'Proyecto sin nombre')}</option>`)
                    .join('')}
                </select>
              </div>
              <div>
                <label class="field-label">Descripción de Doble Llave F1 ↔ F2 (obligatoria — R3)</label>
                <input type="text" value="${esc(p.doble)}" placeholder="Ej.: F1 Corredor X ↔ F2 Sistema preventivo y diálogo territorial Y" oninput="ANI.setProj('${p.id}','doble',this.value)">
              </div>
            </div>

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
    const validCount = sortedForTable.filter((p) => projValid(p) && !projHasBaselineIssue(p)).length;
    const f1Count = sortedForTable.filter((p) => p.foco === 'F1').length;
    const f2Count = sortedForTable.filter((p) => p.foco === 'F2').length;
    const dkCount = sortedForTable.filter((p) => p.doble?.trim().length >= 5).length;

    body = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Contrato de Trazabilidad — Tabla PEI 2027–2030</h2>
          <p class="muted">Vista ejecutiva consolidada de las 6 columnas obligatorias, doble llave F1↔F2, scoring y estatus.</p>
        </div>
        <div class="toolbar no-print" style="margin:0">
          <button class="btn btn-teal btn-sm" onclick="ANI.addProject()">+ Proyecto</button>
          <label class="btn btn-outline btn-sm" style="cursor:pointer">Importar CSV <input type="file" accept=".csv,text/csv" hidden onchange="ANI.importPeiCsvFile(event)"></label>
          <button class="btn btn-navy btn-sm" onclick="ANI.exportPeiCsv()">Exportar CSV (18+ col)</button>
          <a class="btn btn-outline btn-sm" href="./02_Plantilla_Ejercicio_PEI_2027-2030.csv" download>Plantilla CSV original</a>
        </div>
      </div>

      <div class="toolbar no-print" style="margin-bottom:10px">
        <select aria-label="Filtrar tabla PEI por foco" onchange="ANI.setPeiFilter(this.value)">
          <option value="" ${!filterFoco ? 'selected' : ''}>Todos los focos (${state.projects.length})</option>
          <option value="F1" ${filterFoco === 'F1' ? 'selected' : ''}>Solo F1 · Infraestructura</option>
          <option value="F2" ${filterFoco === 'F2' ? 'selected' : ''}>Solo F2 · Ruta social</option>
        </select>
        <select aria-label="Ordenar tabla PEI" onchange="ANI.setPeiSort(this.value)">
          <option value="orden" ${sortProj === 'orden' ? 'selected' : ''}>Orden de registro</option>
          <option value="score_desc" ${sortProj === 'score_desc' ? 'selected' : ''}>Mayor puntaje total</option>
          <option value="imp_desc" ${sortProj === 'imp_desc' ? 'selected' : ''}>Mayor impacto estratégico</option>
          <option value="eff_asc" ${sortProj === 'eff_asc' ? 'selected' : ''}>Menor esfuerzo relativo</option>
          <option value="foco" ${sortProj === 'foco' ? 'selected' : ''}>Agrupar por foco (F1 → F2)</option>
        </select>
        <input type="search" value="${esc(searchProj)}" placeholder="Filtrar tabla por proyecto, objetivo, modo o doble llave…" style="flex:1;min-width:190px" oninput="ANI.setPeiSearch(this.value)">
      </div>

      <div class="table-summary-bar">
        <span>Mostrando <b>${sortedForTable.length}</b> de ${state.projects.length} proyectos</span>
        <span>· F1: <b>${f1Count}</b> · F2: <b>${f2Count}</b></span>
        <span>· Filas válidas (6 col + R6): <b>${validCount}/${sortedForTable.length}</b></span>
        <span>· Doble llave F1↔F2: <b>${dkCount}/${sortedForTable.length}</b></span>
      </div>

      <div class="table-wrap">
        <table class="exec-table">
          <thead>
            <tr>
              <th>Foco</th>
              <th>Objetivo Estratégico</th>
              <th>Proyecto</th>
              <th>Unidad de medida</th>
              <th>Meta 2030</th>
              <th>Detalle</th>
              <th>Priorización y Validez</th>
              <th class="no-print">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${sortedForTable.length
              ? sortedForTable.map((p) => {
                  const cat = projCategory(p);
                  const sc = projScore(p);
                  const ok = projValid(p) && !projHasBaselineIssue(p);
                  const r6 = projHasBaselineIssue(p);
                  return `<tr>
                    <td><span class="badge ${p.foco === 'F1' ? 'badge-teal' : p.foco === 'F2' ? 'badge-amber' : 'badge-warn'}">${p.foco || '—'}</span>${p.modo ? `<br><small class="muted">${esc(p.modo)}</small>` : ''}</td>
                    <td>${esc(p.objetivo || 'Pendiente')}${p.ejePnd ? `<br><small class="muted">${esc(p.ejePnd)}</small>` : ''}</td>
                    <td><b>${esc(p.proyecto || 'Sin nombre')}</b><br>${statusBadge(p.estatus)}</td>
                    <td>${esc(p.unidad || '—')}</td>
                    <td><small class="muted">LB:</small> ${esc(p.lineaBase || 'Pendiente')}<br><small class="muted">2030:</small> <b>${esc(p.meta || 'Por definir')}</b>${r6 ? `<br><span class="badge badge-bad">Alerta R6</span>` : ''}</td>
                    <td style="max-width:280px">${esc(p.detalle || '—')}<br><small class="muted"><b>Doble llave:</b> ${esc(p.doble || 'Sin declarar')}</small></td>
                    <td>
                      <span class="badge ${cat.cls}">${esc(cat.label)} (${sc.total.toFixed(1)})</span><br>
                      <small class="muted">Imp ${sc.imp.toFixed(1)} · Esf ${sc.eff.toFixed(1)}</small><br>
                      <span class="badge ${ok ? 'badge-ok' : 'badge-warn'}">${ok ? '✓ Fila válida' : '○ Revisar'}</span>
                    </td>
                    <td class="no-print" style="white-space:nowrap">
                      <button class="btn btn-outline btn-xs" onclick="ANI.focusProject('${p.id}')" title="Editar ficha">Editar</button>
                      <button class="btn btn-soft btn-xs" onclick="ANI.addActionForProject('${p.id}')" title="Crear actividad en Plan de Acción">+ PA</button>
                      <button class="btn btn-danger btn-xs" onclick="ANI.delProject('${p.id}')" title="Eliminar proyecto">✕</button>
                    </td>
                  </tr>`;
                }).join('')
              : `<tr><td colspan="8" class="muted">${state.projects.length ? 'Ningún proyecto coincide con el filtro actual.' : 'Aún no hay proyectos en la tabla PEI. Use “+ Proyecto” o importe un CSV.'}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
  } else if (peiTab === 'matriz') {
    const visibleOfficial = OFFICIAL_PEI_PORTFOLIO.filter((p) =>
      (!filterFoco || p.foco === filterFoco) &&
      (!q || `${p.proyecto} ${p.objetivo} ${p.detalle} ${p.unidad} ${p.meta}`.toLowerCase().includes(q))
    );
    body = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Matriz de Proyectos Estratégicos PEI 2027–2030 (14 Proyectos Institucionales)</h2>
          <p class="muted">Integrada íntegramente desde <code>modules/cartera_pei.py</code> en los 2 Focos institucionales (11 F1 · 3 F2) con las 6 columnas obligatorias. ${citeBadge('CARTERA-PEI-14')}</p>
        </div>
        <div class="toolbar no-print" style="margin:0">
          <button class="btn btn-teal btn-sm" onclick="ANI.importOfficialPortfolio()">Incorporar los 14 a Cartera editable</button>
          <button class="btn btn-soft btn-sm" onclick="ANI.importDbRecords()">Cargar registros Área GC (${DB_SEED_RECORDS.pei.length} PEI + ${DB_SEED_RECORDS.actionPlan.length} PA)</button>
          <button class="btn btn-navy btn-sm" onclick="ANI.exportOfficialPeiCsv()">Descargar Matriz (CSV)</button>
        </div>
      </div>
      <div class="toolbar no-print">
        <select aria-label="Filtrar foco matriz institucional" onchange="ANI.setPeiFilter(this.value)">
          <option value="" ${!filterFoco ? 'selected' : ''}>Todos los focos (14)</option>
          <option value="F1" ${filterFoco === 'F1' ? 'selected' : ''}>F1 · Infraestructura dinamizadora (11)</option>
          <option value="F2" ${filterFoco === 'F2' ? 'selected' : ''}>F2 · Ruta social y gestión preventiva (3)</option>
        </select>
        <input type="search" style="max-width:260px" placeholder="Buscar en matriz institucional…" value="${esc(searchProj)}" oninput="ANI.setPeiSearch(this.value)">
        <span class="muted">Mostrando <b>${visibleOfficial.length}</b> de ${OFFICIAL_PEI_PORTFOLIO.length} proyectos</span>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Foco</th>
              <th>Objetivo Estratégico</th>
              <th>Proyecto</th>
              <th>Unidad de medida</th>
              <th>Meta 2030</th>
              <th>Detalle</th>
              <th class="no-print">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${visibleOfficial.map((p) => `<tr>
              <td><b>${p.num}</b></td>
              <td><span class="badge ${p.foco === 'F1' ? 'badge-teal' : 'badge-amber'}">${p.foco}</span><br><small class="muted">Grupo ${p.grupo}</small></td>
              <td style="min-width:210px">${esc(p.objetivo)}</td>
              <td style="min-width:190px"><b>${esc(p.proyecto)}</b></td>
              <td style="min-width:130px">${esc(p.unidad)}</td>
              <td style="min-width:110px"><b>${esc(p.meta)}</b></td>
              <td style="min-width:280px">${esc(p.detalle)}</td>
              <td class="no-print"><button class="btn btn-outline btn-xs" onclick="ANI.importOfficialPortfolio(${p.num})">+ Editar</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Clasificación Priorizada para la Cartera PEI 2027–2030 (3 Horizontes)</h2>
          <p class="muted">Despliegue institucional en tres niveles de priorización integrados desde <code>modules/cartera_pei.py</code>. ${citeBadge('PRIORIZACION-3-GRUPOS')}</p>
        </div>
      </div>
      <div class="grid-3">
        ${OFFICIAL_PEI_PRIORITY_GROUPS.map((g) => `<div style="background:linear-gradient(145deg,#0B2C4A,#173F60);border-top:4px solid #F2A900;border-radius:10px;padding:16px;color:#fff;display:flex;flex-direction:column;gap:8px">
          <div style="font-size:12px;font-weight:800;color:#FFD166;letter-spacing:0.03em">${esc(g.titulo)}</div>
          <div style="font-size:11.5px;color:#DCE8F1">${esc(g.proyectos)} · <b>${esc(g.periodo)}</b></div>
          <div style="font-size:13.5px;font-weight:700">${esc(g.descripcion)}</div>
          <p style="margin:4px 0 0;font-size:12px;color:#E6EEF6;line-height:1.5">${esc(g.justificacion)}</p>
        </div>`).join('')}
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
export function renderActionPlan(state, paUi = {}) {
  const paTab = typeof paUi === 'string' ? paUi : (paUi.paTab || 'fichas');
  const filterFoco = typeof paUi === 'string' ? '' : (paUi.filterFoco || '');
  const filterEstado = typeof paUi === 'string' ? '' : (paUi.filterEstado || '');
  const searchPa = typeof paUi === 'string' ? '' : (paUi.searchPa || '');
  const q = searchPa.trim().toLowerCase();

  const items = state.actionPlan.filter((a) =>
    (!filterFoco || a.foco === filterFoco) &&
    (!filterEstado || a.estado === filterEstado) &&
    (!q || `${a.codigo} ${a.objetivo} ${a.proyectoNombre} ${a.actividad} ${a.m2027} ${a.unidad} ${a.detalle} ${a.entregable} ${a.responsable} ${a.indicador}`.toLowerCase().includes(q))
  );

  const avgProgress = items.length
    ? Math.round(items.reduce((s, a) => s + (Number(a.avance) || 0), 0) / items.length)
    : 0;
  const validPaCount = items.filter((a) => paValid(a) && !paHasBaselineIssue(a)).length;
  const corr = computeCorrespondence(state);
  const estadosList = ['Formulada', 'Propuesta IA — No aprobada', 'Programada', 'En ejecución', 'En alerta', 'Cumplida'];

  const objDatalist = state.identity.objetivos.length
    ? `<datalist id="pa-objetivos-list">${state.identity.objetivos.map((o) => `<option value="${esc(`${o.codigo ? o.codigo + ' · ' : ''}${o.nombre}`)}"></option>`).join('')}</datalist>`
    : '';

  const tabs = [
    ['fichas', `Fichas Editables (${state.actionPlan.length})`],
    ['tabla', 'Tabla Plan de Acción (7 columnas)'],
    ['cronograma', 'Cronograma Plurianual 2027–2030'],
    ['correspondencia', `Correspondencia PEI ↔ PA (${corr.coveredProjects}/${state.projects.length})`]
  ];

  const actionButtons = `
    <div class="toolbar no-print" style="margin:0">
      <button class="btn btn-teal btn-sm" onclick="ANI.addActionItem()">+ Nueva actividad</button>
      <label class="btn btn-outline btn-sm" style="cursor:pointer">Importar CSV PA <input type="file" accept=".csv,text/csv" hidden onchange="ANI.importActionCsvFile(event)"></label>
      <button class="btn btn-navy btn-sm" onclick="ANI.exportActionCsv()">Exportar CSV PA</button>
      <button class="btn btn-outline btn-sm" onclick="ANI.exportActionTemplateCsv()">Plantilla 7 col.</button>
    </div>`;

  const filterBar = `
    <div class="toolbar no-print" style="margin-bottom:10px">
      <select aria-label="Filtrar PA por foco" onchange="ANI.setPaFilter(this.value)">
        <option value="" ${!filterFoco ? 'selected' : ''}>Todos los focos (${state.actionPlan.length})</option>
        <option value="F1" ${filterFoco === 'F1' ? 'selected' : ''}>F1 · Infraestructura</option>
        <option value="F2" ${filterFoco === 'F2' ? 'selected' : ''}>F2 · Ruta social</option>
      </select>
      <select aria-label="Filtrar PA por estado" onchange="ANI.setPaEstadoFilter(this.value)">
        <option value="" ${!filterEstado ? 'selected' : ''}>Todos los estados</option>
        ${estadosList.map((st) => `<option value="${esc(st)}" ${filterEstado === st ? 'selected' : ''}>${esc(st)}</option>`).join('')}
      </select>
      <input type="search" value="${esc(searchPa)}" placeholder="Buscar por objetivo, proyecto, actividad, meta 2027, detalle o responsable…" style="flex:1;min-width:190px" oninput="ANI.setPaSearch(this.value)">
    </div>
    <div class="table-summary-bar">
      <span>Actividades: <b>${items.length}</b> de ${state.actionPlan.length}</span>
      <span>· Filas válidas (7 col. + R6): <b>${validPaCount}/${items.length}</b></span>
      <span>· Avance promedio: <b>${avgProgress}%</b></span>
      <span>· Cobertura Cartera PEI: <b>${corr.coveredProjects}/${state.projects.length}</b> proyectos con PA</span>
    </div>`;

  let body = '';
  if (paTab === 'fichas') {
    body = `
    ${objDatalist}
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Despliegue Operativo: Cartera PEI → Plan de Acción</h2>
          <p class="muted">Estructura contractual obligatoria: <b>Foco | Objetivo Estratégico | Proyecto | Actividad | Meta 2027 | Unidad de medida | Detalle</b>, articulada con el cronograma 2027–2030.</p>
        </div>
        ${actionButtons}
      </div>

      ${filterBar}

      <details class="guide-box" style="margin-bottom:12px">
        <summary>Reglas contractuales de llenado — Plan de Acción (7 columnas obligatorias) ${citeBadge('MARCO-S3.7')}</summary>
        <div class="table-wrap" style="margin-top:8px">
          <table class="exec-table">
            <thead><tr><th>Columna obligatoria</th><th>Regla de trazabilidad</th><th>Error típico a evitar</th></tr></thead>
            <tbody>${PA_FILL_RULES.map((r) => `<tr><td><b>${esc(r.col)}</b></td><td>${esc(r.rule)}</td><td>${esc(r.avoid)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </details>

      ${items.length
        ? items.map((a, idx) => {
            const ok = paValid(a) && !paHasBaselineIssue(a);
            const r6 = paHasBaselineIssue(a);
            const checks = paChecklist(a, state.projects);
            return `
          <article class="entity-card" data-pa-card="${a.id}">
            <div class="entity-head">
              <span class="badge badge-navy">${esc(a.codigo || `PA-${String(idx + 1).padStart(2, '0')}`)}</span>
              <span class="badge ${a.foco === 'F2' ? 'badge-amber' : a.foco === 'F1' ? 'badge-teal' : 'badge-warn'}">${a.foco || 'Sin foco'}</span>
              <span class="entity-title" data-pa-title="${a.id}">${esc(a.actividad || 'Actividad en formulación')}</span>
              <span class="badge ${ok ? 'badge-ok' : 'badge-warn'}" data-pa-valid="${a.id}">${ok ? 'Fila válida (7 col.)' : 'Incompleta / revisar'}</span>
              ${statusBadge(a.estatus)}
              <span style="flex:1"></span>
              <button class="btn btn-outline btn-xs no-print" onclick="ANI.dupActionItem('${a.id}')">Duplicar</button>
              <button class="btn btn-danger btn-xs no-print" onclick="ANI.delActionItem('${a.id}')">Eliminar</button>
            </div>

            <div class="callout callout-bad" data-pa-r6="${a.id}" style="padding:8px 12px;font-size:12px;${r6 ? '' : 'display:none'}">
              <b>Alerta R6:</b> Registró una Meta 2027 numérica sin línea base verificada. Registre la línea base oficial o escriba <i>"Por definir — línea base pendiente"</i>.
            </div>

            <div class="grid-3">
              <div>
                <label class="field-label">1. Foco *</label>
                <select onchange="ANI.setAction('${a.id}','foco',this.value,true)">
                  <option value="" ${!a.foco ? 'selected' : ''}>Seleccionar foco único…</option>
                  <option value="F1" ${a.foco === 'F1' ? 'selected' : ''}>F1 · Infraestructura dinamizadora</option>
                  <option value="F2" ${a.foco === 'F2' ? 'selected' : ''}>F2 · Ruta social y prevención</option>
                </select>
              </div>
              <div>
                <label class="field-label">3. Proyecto (vincular desde Cartera PEI) *</label>
                <select onchange="ANI.linkActionProject('${a.id}',this.value)">
                  <option value="">Seleccionar proyecto PEI (hereda Foco y Objetivo)…</option>
                  ${state.projects.map((p) => `<option value="${p.id}" ${a.proyectoId === p.id ? 'selected' : ''}>[${p.foco || '—'}] ${esc(p.proyecto || 'Sin nombre')}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="field-label">3b. Nombre del Proyecto *</label>
                <input type="text" value="${esc(a.proyectoNombre)}" placeholder="Proyecto estratégico PEI al que corresponde" oninput="ANI.setAction('${a.id}','proyectoNombre',this.value)">
              </div>
            </div>

            <div class="grid-2">
              <div>
                <label class="field-label">2. Objetivo Estratégico *</label>
                <input type="text" list="pa-objetivos-list" value="${esc(a.objetivo)}" placeholder="Heredado del Proyecto PEI o: Información insuficiente para concluir" oninput="ANI.setAction('${a.id}','objetivo',this.value)">
              </div>
              <div>
                <label class="field-label">4. Actividad *</label>
                <input type="text" value="${esc(a.actividad)}" placeholder="Acción operativa concreta y verificable" oninput="ANI.setAction('${a.id}','actividad',this.value)">
              </div>
            </div>

            <div class="grid-3">
              <div>
                <label class="field-label">Línea Base (control R6)</label>
                <input type="text" value="${esc(a.lineaBase)}" placeholder="Dato oficial o: Información insuficiente para concluir" oninput="ANI.setAction('${a.id}','lineaBase',this.value)">
              </div>
              <div>
                <label class="field-label">5. Meta 2027 *</label>
                <input type="text" value="${esc(a.m2027)}" placeholder="Por definir — línea base pendiente" oninput="ANI.setAction('${a.id}','m2027',this.value)">
              </div>
              <div>
                <label class="field-label">6. Unidad de medida *</label>
                <input type="text" value="${esc(a.unidad)}" placeholder="Una sola unidad: documentos, km, %, casos, mesas…" oninput="ANI.setAction('${a.id}','unidad',this.value)">
              </div>
            </div>

            <label class="field-label">7. Detalle (alcance operativo, entregable, articulación F1↔F2, supuestos y verificación) *</label>
            <textarea style="min-height:68px" placeholder="Describa alcance verificable, contribución al Proyecto PEI, articulación F1↔F2, supuestos y riesgos." oninput="ANI.setAction('${a.id}','detalle',this.value)">${esc(a.detalle)}</textarea>

            <details class="guide-box" style="margin-top:10px" ${a.m2028 || a.m2029 || a.m2030 || a.responsable || a.entregable ? 'open' : ''}>
              <summary>Programación plurianual 2028–2030, responsable, indicador, recursos y seguimiento</summary>
              <div class="grid-3" style="margin-top:8px">
                <div><label class="field-label" style="margin-top:0">Producto / Entregable verificable</label><input type="text" value="${esc(a.entregable)}" placeholder="Protocolo, estudio, km intervenidos, sistema…" oninput="ANI.setAction('${a.id}','entregable',this.value)"></div>
                <div><label class="field-label" style="margin-top:0">Indicador de gestión</label><input type="text" value="${esc(a.indicador)}" placeholder="Fórmula o nombre del indicador" oninput="ANI.setAction('${a.id}','indicador',this.value)"></div>
                <div><label class="field-label" style="margin-top:0">Dependencia / Rol Responsable</label><input type="text" value="${esc(a.responsable)}" placeholder="Planeación, Gestión Social, Jurídica, Predial…" oninput="ANI.setAction('${a.id}','responsable',this.value)"></div>
              </div>
              <div class="grid-4">
                <div><label class="field-label">Proyección 2028</label><input type="text" value="${esc(a.m2028)}" placeholder="Hito / meta 2028" oninput="ANI.setAction('${a.id}','m2028',this.value)"></div>
                <div><label class="field-label">Proyección 2029</label><input type="text" value="${esc(a.m2029)}" placeholder="Hito / meta 2029" oninput="ANI.setAction('${a.id}','m2029',this.value)"></div>
                <div><label class="field-label">Proyección 2030</label><input type="text" value="${esc(a.m2030)}" placeholder="Hito / meta 2030" oninput="ANI.setAction('${a.id}','m2030',this.value)"></div>
                <div><label class="field-label">Presupuesto / fuente</label><input type="text" value="${esc(a.presupuesto)}" placeholder="Por definir — restricción presupuestal pendiente" oninput="ANI.setAction('${a.id}','presupuesto',this.value)"></div>
              </div>
              <div class="grid-4">
                <div>
                  <label class="field-label">Estado operativo</label>
                  <select onchange="ANI.setAction('${a.id}','estado',this.value)">
                    ${estadosList.map((st) => `<option value="${st}" ${a.estado === st ? 'selected' : ''}>${st}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label class="field-label">Estatus de gobernanza</label>
                  <select onchange="ANI.setAction('${a.id}','estatus',this.value,true)">
                    <option value="en_construccion" ${a.estatus === 'en_construccion' ? 'selected' : ''}>En construcción (Equipo)</option>
                    <option value="validado_taller" ${a.estatus === 'validado_taller' ? 'selected' : ''}>Validado en taller</option>
                    <option value="propuesta_ia" ${a.estatus === 'propuesta_ia' ? 'selected' : ''}>Propuesta IA — No aprobada</option>
                    <option value="oficial_ani" ${a.estatus === 'oficial_ani' ? 'selected' : ''}>Oficial ANI (Aprobado)</option>
                  </select>
                </div>
                <div>
                  <label class="field-label">Avance físico (<span id="pa-av-${a.id}">${a.avance}</span>%)</label>
                  <input type="range" min="0" max="100" step="5" value="${a.avance}" oninput="ANI.setAction('${a.id}','avance',this.value)">
                </div>
                <div><label class="field-label">Riesgo operativo y mitigación</label><input type="text" value="${esc(a.riesgo)}" placeholder="Riesgo asociado y acción preventiva" oninput="ANI.setAction('${a.id}','riesgo',this.value)"></div>
              </div>
            </details>

            <div class="tag-cloud" style="margin-top:10px" data-pa-checks="${a.id}">
              ${checks.map(([lbl, cOk]) => `<span class="badge ${cOk ? 'badge-ok' : 'badge-warn'}">${cOk ? '✓' : '○'} ${esc(lbl)}</span>`).join('')}
            </div>
          </article>`;
          }).join('')
        : `<div class="empty-state">
            <h3>${state.actionPlan.length ? 'Ninguna actividad coincide con el filtro actual' : 'Plan de Acción listo para programación'}</h3>
            <p class="muted">Cree actividades cumpliendo las 7 columnas obligatorias, impórtelas desde CSV o derívelas en 1 clic desde cada proyecto de la Cartera PEI (“+ Actividad PA”).</p>
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:8px">
              <button class="btn btn-teal btn-sm" onclick="ANI.addActionItem()">+ Crear primera actividad</button>
              ${state.projects.length ? `<button class="btn btn-outline btn-sm" onclick="ANI.setPaTab('correspondencia')">Derivar desde Cartera PEI (${state.projects.length}) →</button>` : ''}
            </div>
          </div>`}
    </div>`;
  } else if (paTab === 'tabla') {
    body = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Contrato de Trazabilidad — Tabla Plan de Acción (7 Columnas Obligatorias)</h2>
          <p class="muted">Estructura oficial: <b>Foco | Objetivo Estratégico | Proyecto | Actividad | Meta 2027 | Unidad de medida | Detalle</b>.</p>
        </div>
        ${actionButtons}
      </div>
      ${filterBar}
      <div class="table-wrap">
        <table class="exec-table">
          <thead>
            <tr>
              <th>Foco</th>
              <th>Objetivo Estratégico</th>
              <th>Proyecto</th>
              <th>Actividad</th>
              <th>Meta 2027</th>
              <th>Unidad de medida</th>
              <th>Detalle</th>
              <th>Validez y Estado</th>
              <th class="no-print">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${items.length
              ? items.map((a) => {
                  const ok = paValid(a) && !paHasBaselineIssue(a);
                  const r6 = paHasBaselineIssue(a);
                  return `<tr>
                    <td><span class="badge ${a.foco === 'F2' ? 'badge-amber' : a.foco === 'F1' ? 'badge-teal' : 'badge-warn'}">${a.foco || '—'}</span></td>
                    <td>${esc(a.objetivo || 'Pendiente')}</td>
                    <td><b>${esc(a.proyectoNombre || 'Sin proyecto PEI')}</b>${a.proyectoId ? `<br><span class="badge badge-ok">Vinculado PEI</span>` : `<br><span class="badge badge-warn">Por vincular</span>`}</td>
                    <td><b>${esc(a.actividad || 'Sin nombre')}</b><br>${statusBadge(a.estatus)}</td>
                    <td><b>${esc(a.m2027 || 'Por definir')}</b><br><small class="muted">LB: ${esc(a.lineaBase || 'Pendiente')}</small>${r6 ? `<br><span class="badge badge-bad">Alerta R6</span>` : ''}</td>
                    <td>${esc(a.unidad || '—')}</td>
                    <td style="max-width:260px">${esc(a.detalle || '—')}${a.responsable ? `<br><small class="muted"><b>Resp.:</b> ${esc(a.responsable)}</small>` : ''}</td>
                    <td>
                      <span class="badge ${ok ? 'badge-ok' : 'badge-warn'}">${ok ? '✓ Válida' : '○ Revisar'}</span><br>
                      <small class="muted">${esc(a.estado)} · ${a.avance}%</small>
                    </td>
                    <td class="no-print" style="white-space:nowrap">
                      <button class="btn btn-outline btn-xs" onclick="ANI.focusAction('${a.id}')">Editar</button>
                      <button class="btn btn-danger btn-xs" onclick="ANI.delActionItem('${a.id}')">✕</button>
                    </td>
                  </tr>`;
                }).join('')
              : `<tr><td colspan="9" class="muted">${state.actionPlan.length ? 'Ninguna actividad coincide con el filtro actual.' : 'Sin actividades en la Tabla del Plan de Acción. Use “+ Nueva actividad” o importe un CSV.'}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
  } else if (paTab === 'cronograma') {
    body = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Cronograma Plurianual del Plan de Acción (2027–2030)</h2>
          <p class="muted">Seguimiento consolidado por horizonte anual (Meta 2027 a 2030), responsable, indicador y avance físico.</p>
        </div>
        ${actionButtons}
      </div>
      ${filterBar}
      <div class="table-wrap">
        <table class="exec-table">
          <thead>
            <tr>
              <th>Código / Foco</th>
              <th>Proyecto PEI → Actividad</th>
              <th>Objetivo, Indicador y Responsable</th>
              <th>Meta 2027 (Corto)</th>
              <th>2028 (Mediano)</th>
              <th>2029 (Mediano)</th>
              <th>2030 (Largo)</th>
              <th>Estado y Avance</th>
              <th class="no-print">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${items.length
              ? items.map((a, idx) => `<tr>
                  <td><b>${esc(a.codigo || `PA-${String(idx + 1).padStart(2, '0')}`)}</b><br><span class="badge ${a.foco === 'F2' ? 'badge-amber' : a.foco === 'F1' ? 'badge-teal' : 'badge-warn'}">${a.foco || '—'}</span></td>
                  <td><small class="muted">${esc(a.proyectoNombre || 'Sin proyecto PEI')}</small><br><b>${esc(a.actividad || 'Sin nombre')}</b><br><small class="muted">${esc(a.unidad || 'Sin unidad')}${a.entregable ? ` · ${esc(a.entregable)}` : ''}</small><br>${statusBadge(a.estatus)}</td>
                  <td><small class="muted"><b>OE:</b> ${esc(a.objetivo || 'Pendiente')}</small><br>${esc(a.indicador || '—')}<br><small class="muted"><b>Resp.:</b> ${esc(a.responsable || 'Por asignar')}</small></td>
                  <td><b>${esc(a.m2027 || '—')}</b></td>
                  <td>${esc(a.m2028 || '—')}</td>
                  <td>${esc(a.m2029 || '—')}</td>
                  <td>${esc(a.m2030 || '—')}</td>
                  <td>
                    <span class="badge ${a.estado === 'Cumplida' ? 'badge-ok' : a.estado === 'En alerta' ? 'badge-bad' : 'badge-slate'}">${esc(a.estado)}</span>
                    <div class="mini-bar" style="margin:5px 0 3px"><i style="width:${a.avance}%"></i></div>
                    <small class="muted"><b>${a.avance}%</b></small>
                  </td>
                  <td class="no-print" style="white-space:nowrap">
                    <button class="btn btn-outline btn-xs" onclick="ANI.focusAction('${a.id}')">Editar</button>
                    <button class="btn btn-danger btn-xs" onclick="ANI.delActionItem('${a.id}')">✕</button>
                  </td>
                </tr>`).join('')
              : `<tr><td colspan="9" class="muted">${state.actionPlan.length ? 'Ninguna actividad coincide con el filtro actual.' : 'Sin actividades registradas aún.'}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
  } else {
    body = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Matriz de Correspondencia PEI 2027–2030 ↔ Plan de Acción y Doble Llave F1↔F2</h2>
          <p class="muted">Verifica que cada Proyecto PEI cuente con su contraparte de Doble Llave (F1↔F2) y su despliegue operativo en el Plan de Acción (Meta 2027).</p>
        </div>
        <button class="btn btn-soft btn-sm no-print" onclick="ANI.syncAllPaFromPei()">↻ Sincronizar Foco y Objetivos PEI → PA</button>
      </div>

      <div class="grid-4" style="margin-bottom:14px">
        <div class="kpi-card kpi-accent-navy"><span class="kpi-label">Cobertura PEI → PA</span><span class="kpi-value">${corr.coveragePct}%</span><span class="kpi-sub">${corr.coveredProjects} de ${state.projects.length} proyectos con PA</span></div>
        <div class="kpi-card kpi-accent-teal"><span class="kpi-label">Doble Llave F1 ↔ F2</span><span class="kpi-value">${corr.doubleKeyPct}%</span><span class="kpi-sub">${corr.doubleKeyProjects} de ${state.projects.length} con contraparte</span></div>
        <div class="kpi-card kpi-accent-amber"><span class="kpi-label">PA sin Proyecto PEI</span><span class="kpi-value">${corr.orphanActions.length}</span><span class="kpi-sub">${corr.orphanActions.length ? 'Requieren vinculación' : 'Correspondencia limpia'}</span></div>
        <div class="kpi-card kpi-accent-navy"><span class="kpi-label">Alertas de Foco</span><span class="kpi-value">${corr.focoMismatches.length}</span><span class="kpi-sub">${corr.focoMismatches.length ? 'Foco PA ≠ Foco PEI' : 'Focos 100% coherentes'}</span></div>
      </div>

      <div class="table-wrap">
        <table class="exec-table">
          <thead>
            <tr>
              <th>Foco</th>
              <th>Proyecto PEI y Objetivo Estratégico</th>
              <th>Meta 2030 (PEI)</th>
              <th>Articulación Doble Llave (F1 ↔ F2)</th>
              <th>Actividades Plan de Acción (Meta 2027 · Unidad)</th>
              <th class="no-print">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${corr.projectRows.length
              ? corr.projectRows.map((row) => {
                  const p = row.project;
                  return `<tr>
                    <td><span class="badge ${p.foco === 'F2' ? 'badge-amber' : p.foco === 'F1' ? 'badge-teal' : 'badge-warn'}">${p.foco || '—'}</span></td>
                    <td><b>${esc(p.proyecto || 'Sin nombre')}</b><br><small class="muted"><b>OE:</b> ${esc(p.objetivo || 'Pendiente')}</small></td>
                    <td><b>${esc(p.meta || 'Por definir')}</b><br><small class="muted">${esc(p.unidad || '—')}</small></td>
                    <td>${row.hasDoubleKey
                      ? `<span class="badge badge-ok">✓ Declarada</span><br><small class="muted">${esc(row.partner ? `[${row.partner.foco}] ${row.partner.proyecto}` : p.doble)}</small>`
                      : `<span class="badge badge-warn">○ Pendiente R3</span>`}</td>
                    <td>${row.linkedActions.length
                      ? row.linkedActions.map((a) => `<div style="margin-bottom:5px">
                          <span class="badge ${paValid(a) ? 'badge-ok' : 'badge-warn'}">${paValid(a) ? '✓' : '○'}</span>
                          <b>${esc(a.actividad || 'Sin nombre')}</b>
                          <small class="muted">· Meta 2027: <b>${esc(a.m2027 || 'Por definir')}</b> (${esc(a.unidad || '—')}) · ${a.avance}%</small>
                        </div>`).join('')
                      : `<span class="badge badge-warn">Sin actividades en Plan de Acción</span>`}</td>
                    <td class="no-print" style="white-space:nowrap">
                      <button class="btn btn-teal btn-xs" onclick="ANI.addActionForProject('${p.id}')">+ Actividad PA</button>
                    </td>
                  </tr>`;
                }).join('')
              : `<tr><td colspan="6" class="muted">Registre proyectos en la Cartera PEI (Módulo 06) para visualizar y gestionar su correspondencia con el Plan de Acción.</td></tr>`}
          </tbody>
        </table>
      </div>

      ${corr.orphanActions.length ? `
        <h3 style="margin-top:16px">Actividades del Plan de Acción pendientes de vincular a un Proyecto PEI (${corr.orphanActions.length})</h3>
        ${corr.orphanActions.map((a) => `
          <div class="callout callout-warn" style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
            <span><b>[${esc(a.foco || '—')}] ${esc(a.actividad || 'Actividad sin nombre')}</b> · Meta 2027: ${esc(a.m2027 || 'Por definir')}</span>
            <select style="width:auto;min-width:240px" onchange="ANI.linkActionProject('${a.id}',this.value)" class="no-print">
              <option value="">Vincular a proyecto PEI…</option>
              ${state.projects.map((p) => `<option value="${p.id}">[${p.foco || '—'}] ${esc(p.proyecto || 'Sin nombre')}</option>`).join('')}
            </select>
          </div>`).join('')}` : ''}
    </div>`;
  }

  return `
  <div class="subtabs no-print">
    ${tabs.map(([id, lbl]) => `<button class="subtab ${paTab === id ? 'active' : ''}" onclick="ANI.setPaTab('${id}')">${esc(lbl)}</button>`).join('')}
  </div>
  ${body}`;
}

/* ==================== MÓDULO 08: CENTRO AUDIOVISUAL Y RECURSOS ==================== */
export function renderMedia(state, mediaUi = {}) {
  const {
    mediaTab = 'todo',
    repoMedia = { ok: false, videos: [], images: [], files: [] },
    sessionBlobs = {}
  } = mediaUi;

  const repoVideos = Array.isArray(repoMedia?.videos) ? repoMedia.videos : [];
  const repoImages = Array.isArray(repoMedia?.images) ? repoMedia.images : [];
  const usedRepoUrls = new Set();

  // Resolver URL activa para cada uno de los 2 slots de video institucional:
  // 1) archivo local en sesión (blob:) -> 2) ruta/URL configurada por usuario -> 3) archivo autodetectado en assets/media/
  const resolveSlotSource = (slot, pool, idx) => {
    const cfg = state.mediaSlots?.[slot.slotId] || {};
    const blob = sessionBlobs[slot.slotId];
    if (blob?.url) {
      return { url: blob.url, sourceLabel: `Vista previa local (${blob.name} · ${formatBytes(blob.size)})`, isBlob: true, cfg };
    }
    if (cfg.url?.trim()) {
      usedRepoUrls.add(cfg.url.trim());
      return { url: cfg.url.trim(), sourceLabel: 'Ruta/URL vinculada', isBlob: false, cfg };
    }
    const exactName = slot.suggestedFile.split('/').pop().toLowerCase();
    const exactMatch = pool.find((f) => f.filename.toLowerCase() === exactName && !usedRepoUrls.has(f.url));
    if (exactMatch) {
      usedRepoUrls.add(exactMatch.url);
      return { url: exactMatch.url, sourceLabel: `Repositorio (${exactMatch.filename} · ${formatBytes(exactMatch.sizeBytes)})`, isBlob: false, cfg };
    }
    const autoMatch = pool.filter((f) => !usedRepoUrls.has(f.url))[0];
    if (autoMatch && idx < pool.length) {
      usedRepoUrls.add(autoMatch.url);
      return { url: autoMatch.url, sourceLabel: `Autodetectado en repositorio (${autoMatch.filename} · ${formatBytes(autoMatch.sizeBytes)})`, isBlob: false, cfg };
    }
    if (slot.defaultUrl) {
      usedRepoUrls.add(slot.defaultUrl);
      return { url: slot.defaultUrl, sourceLabel: `Infografía oficial en ${slot.suggestedFile}`, isBlob: false, cfg };
    }
    return { url: '', sourceLabel: `Pendiente en ${slot.suggestedFile}`, isBlob: false, cfg };
  };

  const resolvedVideoSlots = INSTITUTIONAL_VIDEO_SLOTS.map((slot, i) => ({
    slot,
    ...resolveSlotSource(slot, repoVideos, i)
  }));
  const resolvedImageSlots = STRATEGIC_IMAGE_SLOTS.map((slot, i) => ({
    slot,
    ...resolveSlotSource(slot, repoImages, i)
  }));

  const extraRepoVideos = repoVideos.filter((v) => !usedRepoUrls.has(v.url));
  const extraRepoImages = repoImages.filter((im) => !usedRepoUrls.has(im.url));

  const readyVideosCount = resolvedVideoSlots.filter((v) => v.url).length
    + extraRepoVideos.length
    + state.mediaAssets.filter((m) => m.tipo === 'video' && m.url?.trim()).length;
  const readyImagesCount = resolvedImageSlots.filter((im) => im.url).length
    + extraRepoImages.length
    + state.mediaAssets.filter((m) => m.tipo === 'imagen' && m.url?.trim()).length;

  const tabs = [
    ['todo', 'Vista Integral'],
    ['videos', `Videos Institucionales (${readyVideosCount}/2+)`],
    ['imagenes', `Imágenes y Láminas (${readyImagesCount})`],
    ['canvas', 'Canvas Ejecutivo 2 Focos']
  ];

  const statusBanner = `
  <div class="callout ${repoVideos.length + repoImages.length > 0 ? 'callout-teal' : 'callout-warn'}" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
    <div>
      <b>Inventario verificado de <code>assets/media/</code>:</b>
      <b>${repoVideos.length}</b> video(s) y <b>${repoImages.length}</b> imagen(es) en repositorio ·
      <b>1</b> lienzo interactivo preservado (<code>03_Canvas_2_Focos_ANI.html</code>).
      ${repoVideos.length === 0 && repoImages.length === 0
        ? `<br><span style="font-size:12.2px">Sin material genérico de relleno: al copiar los 2 videos institucionales (<code>.mp4</code>/<code>.webm</code>) o imágenes estratégicas (<code>.png</code>/<code>.jpg</code>/<code>.webp</code>/<code>.svg</code>) en <code>assets/media/</code>, los reproductores y la galería los activan automáticamente con soporte de streaming HTTP 206. También puede probarlos al instante con <b>Previsualizar archivo local</b>.</span>`
        : ''}
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap" class="no-print">
      <button class="btn btn-outline btn-xs" onclick="ANI.refreshRepoMedia(true)">↻ Escanear assets/media</button>
      <button class="btn btn-teal btn-xs" onclick="ANI.addMediaItem()">+ Registrar recurso adicional</button>
    </div>
  </div>`;

  const videosSection = `
  <div class="card">
    <div class="card-header">
      <div>
        <h2>Sala de Videos Institucionales ANI (2 Reproductores Principales)</h2>
        <p class="muted">Reproducción HTML5 nativa con control de avance (HTTP Range 206), pantalla completa, autodetección en <code>assets/media/</code> y previsualización local inmediata.</p>
      </div>
      <span class="badge ${readyVideosCount >= 2 ? 'badge-ok' : 'badge-warn'}">${Math.min(readyVideosCount, 2)}/2 videos activos</span>
    </div>
    <div class="grid-2">
      ${resolvedVideoSlots.map(({ slot, url, sourceLabel, isBlob, cfg }) => {
        const title = cfg.titulo?.trim() || slot.defaultTitle;
        const foco = cfg.foco || slot.defaultFoco;
        const desc = cfg.descripcion?.trim() || slot.summary;
        return `<article class="media-slot-card">
          <div class="entity-head" style="margin-bottom:8px">
            <span class="badge badge-navy">Video 0${slot.order}</span>
            <span class="badge ${foco === 'F2' ? 'badge-amber' : foco === 'F1' ? 'badge-teal' : 'badge-slate'}">${esc(foco)}</span>
            <span class="badge ${url ? 'badge-ok' : 'badge-warn'}">${url ? (isBlob ? 'Sesión local' : 'Listo para reproducir') : 'Pendiente de archivo'}</span>
          </div>
          <h3 style="margin-bottom:4px">${esc(title)}</h3>
          <p class="muted" style="font-size:12.2px;margin-bottom:10px">${esc(desc)}</p>

          ${url
            ? renderSafeMediaPlayer(url, 'video', title, { foco, caption: desc })
            : `<div class="media-placeholder">
                <div class="media-placeholder-icon" aria-hidden="true">▶</div>
                <b>Reproductor HTML5 preparado — archivo pendiente</b>
                <p class="muted" style="font-size:12px;margin:4px 0 10px">Copie el video oficial en <code>${esc(slot.suggestedFile)}</code> (o cualquier <code>.mp4</code>/<code>.webm</code> en <code>assets/media/</code>) o ábralo localmente para validar el reproductor.</p>
                <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap" class="no-print">
                  <label class="btn btn-navy btn-xs" style="cursor:pointer">
                    Previsualizar video local
                    <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" hidden onchange="ANI.previewSlotFile('${slot.slotId}',event)">
                  </label>
                </div>
              </div>`}

          <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;margin-top:8px">
            <small class="muted"><b>Origen:</b> ${esc(sourceLabel)}</small>
            <div style="display:flex;gap:6px" class="no-print">
              ${url ? `<label class="btn btn-outline btn-xs" style="cursor:pointer">Cambiar archivo local<input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" hidden onchange="ANI.previewSlotFile('${slot.slotId}',event)"></label>` : ''}
              ${isBlob ? `<button type="button" class="btn btn-outline btn-xs" onclick="ANI.clearSlotBlob('${slot.slotId}')">Quitar local</button>` : ''}
            </div>
          </div>

          <details class="guide-box no-print" style="margin-top:8px">
            <summary>Configurar título, foco o ruta/URL del Video 0${slot.order}</summary>
            <div class="grid-2" style="margin-top:6px">
              <div>
                <label class="field-label" style="margin-top:0">Título institucional</label>
                <input type="text" value="${esc(cfg.titulo || '')}" placeholder="${esc(slot.defaultTitle)}" oninput="ANI.setMediaSlot('${slot.slotId}','titulo',this.value)">
              </div>
              <div>
                <label class="field-label" style="margin-top:0">Foco estratégico</label>
                <select onchange="ANI.setMediaSlot('${slot.slotId}','foco',this.value,true)">
                  <option value="F1" ${foco === 'F1' ? 'selected' : ''}>F1 · Infraestructura</option>
                  <option value="F2" ${foco === 'F2' ? 'selected' : ''}>F2 · Ruta social</option>
                  <option value="F1+F2" ${foco === 'F1+F2' ? 'selected' : ''}>Institucional (F1 + F2)</option>
                </select>
              </div>
            </div>
            <label class="field-label">Ruta en repositorio (<code>./assets/media/…</code>) o URL oficial HTTPS</label>
            <input type="text" value="${esc(cfg.url || '')}" placeholder="./${esc(slot.suggestedFile)} o https://…" onchange="ANI.setMediaSlot('${slot.slotId}','url',this.value,true)">
            ${repoVideos.length ? `<div style="margin-top:6px"><small class="muted">Archivos detectados: </small>${repoVideos.map((rv) => `<button type="button" class="btn btn-soft btn-xs" style="margin:2px" onclick="ANI.setMediaSlot('${slot.slotId}','url','${esc(rv.url)}',true)">${esc(rv.filename)}</button>`).join('')}</div>` : ''}
            <label class="field-label">Descripción ejecutiva / fuente</label>
            <input type="text" value="${esc(cfg.descripcion || '')}" placeholder="Dependencia ANI, fecha y contexto estratégico" oninput="ANI.setMediaSlot('${slot.slotId}','descripcion',this.value)">
          </details>
        </article>`;
      }).join('')}
    </div>

    ${extraRepoVideos.length ? `
      <h3 style="margin-top:16px">Videos Adicionales Detectados en <code>assets/media/</code> (${extraRepoVideos.length})</h3>
      <div class="grid-2" style="margin-top:8px">
        ${extraRepoVideos.map((v) => `<article class="media-slot-card">
          <div class="entity-head"><span class="badge badge-navy">Video repositorio</span><small class="muted">${esc(v.filename)} · ${formatBytes(v.sizeBytes)}</small></div>
          <h3>${esc(v.title)}</h3>
          ${renderSafeMediaPlayer(v.url, 'video', v.title)}
        </article>`).join('')}
      </div>` : ''}
  </div>`;

  const imagesSection = `
  <div class="card">
    <div class="card-header">
      <div>
        <h2>Galería de Imágenes, Mapas y Láminas Estratégicas ANI</h2>
        <p class="muted">Visualización en alta resolución con visor ampliable (lightbox), autodetección en <code>assets/media/</code> y trazabilidad documental.</p>
      </div>
      <div class="toolbar no-print" style="margin:0">
        <button class="btn btn-teal btn-xs" onclick="ANI.addMediaItem('imagen')">+ Añadir lámina o mapa</button>
      </div>
    </div>

    <div class="grid-2">
      ${resolvedImageSlots.map(({ slot, url, sourceLabel, isBlob, cfg }) => {
        const title = cfg.titulo?.trim() || slot.defaultTitle;
        const foco = cfg.foco || slot.defaultFoco;
        const desc = cfg.descripcion?.trim() || slot.summary;
        return `<article class="media-slot-card">
          <div class="entity-head" style="margin-bottom:8px">
            <span class="badge badge-teal">Lámina 0${slot.order}</span>
            <span class="badge">${esc(foco)}</span>
            ${slot.citation ? citeBadge(slot.citation) : ''}
            <span style="flex:1"></span>
            <span class="badge ${url ? 'badge-ok' : 'badge-warn'}">${url ? 'Cargada' : 'Pendiente'}</span>
          </div>
          <h3 style="margin-bottom:4px">${esc(title)}</h3>
          <p class="muted" style="font-size:12.2px;margin-bottom:10px">${esc(desc)}</p>

          ${url
            ? renderSafeMediaPlayer(url, 'imagen', title, { foco, caption: desc })
            : `<div class="media-placeholder">
                <div class="media-placeholder-icon" aria-hidden="true">▣</div>
                <b>Visor de lámina estratégica preparado</b>
                <p class="muted" style="font-size:12px;margin:4px 0 10px">Guarde la imagen oficial en <code>${esc(slot.suggestedFile)}</code> (<code>.png</code>, <code>.jpg</code>, <code>.webp</code>, <code>.svg</code>) o previsualícela localmente.</p>
                <label class="btn btn-outline btn-xs no-print" style="cursor:pointer">
                  Previsualizar imagen local
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" hidden onchange="ANI.previewSlotFile('${slot.slotId}',event)">
                </label>
              </div>`}

          <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;margin-top:8px">
            <small class="muted"><b>Origen:</b> ${esc(sourceLabel)}</small>
            <div style="display:flex;gap:6px" class="no-print">
              ${url ? `<label class="btn btn-outline btn-xs" style="cursor:pointer">Cambiar imagen local<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" hidden onchange="ANI.previewSlotFile('${slot.slotId}',event)"></label>` : ''}
              ${isBlob ? `<button type="button" class="btn btn-outline btn-xs" onclick="ANI.clearSlotBlob('${slot.slotId}')">Quitar local</button>` : ''}
            </div>
          </div>

          <details class="guide-box no-print" style="margin-top:8px">
            <summary>Configurar título o ruta/URL de Lámina 0${slot.order}</summary>
            <label class="field-label" style="margin-top:6px">Título de la lámina o mapa</label>
            <input type="text" value="${esc(cfg.titulo || '')}" placeholder="${esc(slot.defaultTitle)}" oninput="ANI.setMediaSlot('${slot.slotId}','titulo',this.value)">
            <label class="field-label">Ruta en repositorio (<code>./assets/media/…</code>) o URL oficial HTTPS</label>
            <input type="text" value="${esc(cfg.url || '')}" placeholder="./${esc(slot.suggestedFile)} o https://…" onchange="ANI.setMediaSlot('${slot.slotId}','url',this.value,true)">
            ${repoImages.length ? `<div style="margin-top:6px"><small class="muted">Imágenes detectadas: </small>${repoImages.map((ri) => `<button type="button" class="btn btn-soft btn-xs" style="margin:2px" onclick="ANI.setMediaSlot('${slot.slotId}','url','${esc(ri.url)}',true)">${esc(ri.filename)}</button>`).join('')}</div>` : ''}
            <label class="field-label">Descripción / fuente</label>
            <input type="text" value="${esc(cfg.descripcion || '')}" placeholder="Fuente documental, escala o nota metodológica" oninput="ANI.setMediaSlot('${slot.slotId}','descripcion',this.value)">
          </details>
        </article>`;
      }).join('')}
    </div>

    ${extraRepoImages.length ? `
      <h3 style="margin-top:16px">Imágenes Estratégicas Adicionales en <code>assets/media/</code> (${extraRepoImages.length})</h3>
      <div class="grid-3" style="margin-top:8px">
        ${extraRepoImages.map((im) => `<article class="media-slot-card">
          <div class="entity-head"><span class="badge badge-teal">Imagen repositorio</span><small class="muted">${formatBytes(im.sizeBytes)}</small></div>
          <h3 style="font-size:13.5px">${esc(im.title)}</h3>
          ${renderSafeMediaPlayer(im.url, 'imagen', im.title, { caption: im.filename })}
        </article>`).join('')}
      </div>` : ''}

    ${state.mediaAssets.length ? `
      <h3 style="margin-top:16px">Recursos Audiovisuales Adicionales Vinculados (${state.mediaAssets.length})</h3>
      <div class="grid-2" style="margin-top:8px">
        ${state.mediaAssets.map((m) => `
          <div class="media-slot-card">
            <div class="entity-head">
              <span class="badge ${m.tipo === 'video' ? 'badge-navy' : 'badge-teal'}">${m.tipo === 'video' ? 'Video adicional' : 'Imagen / Mapa'}</span>
              <span class="badge">${esc(m.foco)}</span>
              <span style="flex:1"></span>
              <button class="btn btn-danger btn-xs no-print" onclick="ANI.delMediaItem('${m.id}')">Quitar</button>
            </div>
            ${m.url ? `<div style="margin-bottom:10px">${renderSafeMediaPlayer(m.url, m.tipo, m.titulo || 'Recurso ANI', { foco: m.foco, caption: m.fuente })}</div>` : ''}
            <div class="grid-2">
              <div><label class="field-label">Tipo</label>
                <select onchange="ANI.setMedia('${m.id}','tipo',this.value,true)">
                  <option value="video" ${m.tipo === 'video' ? 'selected' : ''}>Video (.mp4, .webm, YouTube, Vimeo)</option>
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
            <input type="text" value="${esc(m.titulo)}" placeholder="Ej.: Mapa Corredores Férreos ANI / Infografía Ruta Social" oninput="ANI.setMedia('${m.id}','titulo',this.value)">
            <label class="field-label">Ruta en repositorio (<code>./assets/media/…</code>) o URL oficial HTTPS</label>
            <input type="text" value="${esc(m.url)}" placeholder="Ej.: ./assets/media/mapa-ferreo.png o https://…" onchange="ANI.setMedia('${m.id}','url',this.value,true)">
            <label class="field-label">Fuente / dependencia y descripción</label>
            <input type="text" value="${esc(m.fuente)}" placeholder="Oficina de Planeación / Comunicaciones ANI · Fecha" oninput="ANI.setMedia('${m.id}','fuente',this.value)">
          </div>`).join('')}
      </div>` : ''}
  </div>`;

  const canvasSection = `
  <div class="card">
    <div class="card-header">
      <div>
        <h2>Canvas Ejecutivo Original Preservado — 2 Focos ANI 2027–2030</h2>
        <p class="muted">Recurso gráfico interactivo existente en el repositorio (<code>03_Canvas_2_Focos_ANI.html</code>), integrado sin alteraciones.</p>
      </div>
      <div class="toolbar no-print" style="margin:0">
        <button type="button" class="btn btn-outline btn-sm" onclick="ANI.toggleCanvasHeight()">Alternar alto</button>
        <a class="btn btn-navy btn-sm" href="./03_Canvas_2_Focos_ANI.html" target="_blank" rel="noopener">Abrir pantalla completa ↗</a>
      </div>
    </div>
    <iframe id="aniCanvasFrame" class="media-frame" src="./03_Canvas_2_Focos_ANI.html" title="Canvas Ejecutivo 2 Focos ANI 2027-2030"></iframe>
  </div>`;

  const downloadsSection = `
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

  let content = '';
  if (mediaTab === 'videos') content = videosSection;
  else if (mediaTab === 'imagenes') content = imagesSection;
  else if (mediaTab === 'canvas') content = canvasSection + downloadsSection;
  else content = videosSection + imagesSection + canvasSection + downloadsSection;

  return `
  <div class="subtabs no-print">
    ${tabs.map(([id, lbl]) => `<button class="subtab ${mediaTab === id ? 'active' : ''}" onclick="ANI.setMediaTab('${id}')">${esc(lbl)}</button>`).join('')}
  </div>
  ${statusBanner}
  ${content}`;
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
    const accepted = msg.accepted || {};
    const formattedAnswer = formatAgentMarkdown(r.answer || '');

    const citations = Array.isArray(r.verifiedCitations) ? r.verifiedCitations : [];
    const consulted = Array.isArray(r.consultedSources) ? r.consultedSources : [];
    const props = r.proposals || { peiProjects: [], actionItems: [], opportunities: [] };

    const peiCards = (props.peiProjects || []).map((p, pIdx) => {
      const done = Boolean(accepted[`pei-${pIdx}`]);
      return `
      <div class="proposal-card">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap">
          <span class="badge badge-ai">Propuesta Proyecto PEI — No aprobada</span>
          <span class="badge ${p.foco === 'F2' ? 'badge-amber' : 'badge-teal'}">${esc(p.foco)}</span>
        </div>
        <b style="display:block;margin:6px 0 3px;color:var(--navy-900)">${esc(p.proyecto)}</b>
        <div class="muted">Unidad: ${esc(p.unidad)} · Meta 2030: ${esc(p.meta)} · Doble llave: ${esc(p.doble || 'Por definir')}</div>
        <p class="muted" style="margin:5px 0">${esc(p.detalle)}</p>
        ${done
          ? `<span class="badge badge-ok">✓ Incorporado como borrador en Cartera PEI</span>`
          : `<button class="btn btn-navy btn-xs no-print" onclick="ANI.acceptProposal(${mIdx},'pei',${pIdx})">+ Incorporar como borrador a Cartera PEI</button>`}
      </div>`;
    }).join('');

    const paCards = (props.actionItems || []).map((a, aIdx) => {
      const done = Boolean(accepted[`pa-${aIdx}`]);
      return `
      <div class="proposal-card">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap">
          <span class="badge badge-ai">Propuesta Plan de Acción — Borrador no aprobado</span>
          <span class="badge ${a.foco === 'F2' ? 'badge-amber' : 'badge-teal'}">${esc(a.foco)}</span>
        </div>
        <b style="display:block;margin:6px 0 3px;color:var(--navy-900)">${esc(a.actividad)}</b>
        <div class="muted"><b>Objetivo:</b> ${esc(a.objetivo || 'Por definir')} · <b>Proyecto:</b> ${esc(a.proyectoNombre || 'Por vincular')} · <b>Meta 2027:</b> ${esc(a.m2027 || 'Por definir')} · <b>Unidad:</b> ${esc(a.unidad || '—')}</div>
        <p class="muted" style="margin:4px 0">${esc(a.detalle || a.entregable || '')}</p>
        ${done
          ? `<span class="badge badge-ok" style="margin-top:6px">✓ Incorporado como borrador en Plan de Acción</span>`
          : `<button class="btn btn-navy btn-xs no-print" style="margin-top:6px" onclick="ANI.acceptProposal(${mIdx},'pa',${aIdx})">+ Incorporar como borrador al Plan de Acción</button>`}
      </div>`;
    }).join('');

    const oppCards = (props.opportunities || []).map((o, oIdx) => {
      const done = Boolean(accepted[`opp-${oIdx}`]);
      return `
      <div class="proposal-card">
        <span class="badge badge-ai">Propuesta Oportunidad — No aprobada</span>
        <b style="display:block;margin:6px 0 3px;color:var(--navy-900)">[${esc(o.foco)}] ${esc(o.titulo)}</b>
        <p class="muted" style="margin:4px 0">${esc(o.descripcion)}</p>
        ${done
          ? `<span class="badge badge-ok">✓ Incorporada en Matriz de Oportunidades</span>`
          : `<button class="btn btn-navy btn-xs no-print" onclick="ANI.acceptProposal(${mIdx},'opp',${oIdx})">+ Incorporar a Matriz de Oportunidades</button>`}
      </div>`;
    }).join('');

    const auditHtml = r.auditReport?.findings?.length
      ? `<div style="margin-top:10px">
          <b style="font-size:12px;color:var(--navy-900)">Verificación reglada R1–R6 (${r.auditReport.summary.critical} críticos · ${r.auditReport.summary.warnings} alertas · ${r.auditReport.summary.passed || 0} cumplidas):</b>
          ${r.auditReport.findings.slice(0, 6).map((f) => `
            <div class="citation-block" style="border-left:3px solid ${f.severity === 'bad' ? 'var(--bad-600)' : f.severity === 'warn' ? 'var(--amber-500)' : 'var(--teal-600)'}">
              <b>${esc(f.rule)} — ${esc(f.title)}</b> ${citeBadge(f.citation)}<br>
              <span class="muted">${esc(f.detail)}</span>
            </div>`).join('')}
        </div>`
      : '';

    const consultedHtml = r.generationMode === 'arena_api_live' && consulted.length
      ? `<div style="margin-top:8px;font-size:11.5px" class="muted">
          <b>Contexto documental inspeccionado (${consulted.length}):</b>
          ${consulted.map((cs) => citeBadge(cs.id)).join(' ')}
        </div>`
      : '';

    return `<div class="chat-msg assistant">
      <div style="display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap;margin-bottom:8px">
        <span class="badge ${r.generationMode === 'arena_api_live' ? 'badge-ok' : 'badge-warn'}">
          ${r.generationMode === 'arena_api_live'
            ? `Arena API en vivo · ${esc(r.arenaMeta?.reportedModel || 'modelo')}${r.arenaMeta?.routingMode ? ` (${esc(r.arenaMeta.routingMode)})` : ''}`
            : 'Recuperación documental verificada (Arena API pendiente de clave)'}
        </span>
        ${r.arenaMeta?.traceId ? `<span class="badge" title="Identificador de trazabilidad X-Arena-Trace-ID">Trace: ${esc(r.arenaMeta.traceId)}</span>` : ''}
      </div>

      ${r.statusNotice ? `<div class="callout callout-warn" style="padding:9px 12px;font-size:12.2px">${esc(r.statusNotice)}</div>` : ''}
      ${r.error ? `<div class="callout callout-bad" style="padding:9px 12px;font-size:12.2px"><b>Error Arena API (${esc(r.error.code)}):</b> ${esc(r.error.message)}<br>${esc(r.error.userGuidance || '')}${r.error.billingUrl ? ` <a href="${esc(r.error.billingUrl)}" target="_blank" rel="noopener">Gestionar facturación Arena ↗</a>` : ''}</div>` : ''}
      ${r.governanceBadge ? `<div style="margin-bottom:8px"><span class="badge badge-ai">${esc(r.governanceBadge)}</span></div>` : ''}
      ${formattedAnswer ? `<div class="chat-answer-body" style="margin-bottom:10px">${formattedAnswer}</div>` : ''}
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
      ${consultedHtml}
    </div>`;
  }).join('');
}

export function renderAgentModule(state, agentUi) {
  const {
    toolTab = 'chat',
    statusData = null,
    verifyResult = null,
    activeMode = 'consulta',
    selectedModel = '',
    messages = [],
    busy = false,
    searchQuery = '',
    searchResults = null,
    auditReport = null,
    diagnostics = null
  } = agentUi;

  const arena = statusData?.arena || {};
  const kb = statusData?.knowledge || {};
  const isLiveReady = arena.status === 'configured_ready';
  const discoveredModels = Array.isArray(verifyResult?.directModels) ? verifyResult.directModels : [];

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
    ['auditor', 'Auditor PEI ↔ PA y R1–R6'],
    ['diagnostico', 'Diagnóstico Técnico']
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
          <b>Modelo:</b> ${esc(selectedModel || arena.configuredModel || 'Autodetección vía /v1/models')}<br>
          <b>Acervo indexado:</b> ${kb.totalRepoChunks || 0} secciones en ${kb.totalRepoFiles || 4} archivos base + sesión activa
        </p>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0">
          <button class="btn btn-outline btn-xs" onclick="ANI.verifyArena()">Verificar conexión</button>
          <button class="btn btn-soft btn-xs" onclick="ANI.refreshAgentStatus()">Actualizar estado</button>
          <button class="btn btn-outline btn-xs" onclick="ANI.reloadKnowledge()" title="Reindexar carpeta knowledge/ y archivos base">Reindexar acervo</button>
        </div>
        ${discoveredModels.length ? `
          <label class="field-label" style="margin-top:6px">Modelo Arena habilitado (<code>/v1/models</code>)</label>
          <select onchange="ANI.setAgentModel(this.value)" style="margin-bottom:6px">
            <option value="" ${!selectedModel ? 'selected' : ''}>Predeterminado (${esc(arena.configuredModel || discoveredModels[0])})</option>
            ${discoveredModels.map((mid) => `<option value="${esc(mid)}" ${selectedModel === mid ? 'selected' : ''}>${esc(mid)}</option>`).join('')}
          </select>` : ''}
        ${verifyResult ? `<div class="callout ${verifyResult.ok ? 'callout-teal' : 'callout-warn'}" style="padding:8px 10px;font-size:11.8px;margin-top:8px">
          <b>Verificación:</b> ${esc(verifyResult.status)}${verifyResult.modelsCount ? ` (${verifyResult.modelsCount} modelos)` : ''}<br>
          ${esc(verifyResult.recommendedAction || verifyResult.message || '')}
          ${verifyResult.userGuidance ? `<br><span class="muted">${esc(verifyResult.userGuidance)}</span>` : ''}
          ${verifyResult.billingUrl ? `<br><a href="${esc(verifyResult.billingUrl)}" target="_blank" rel="noopener">Gestionar facturación Arena API ↗</a>` : ''}
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
            ${messages.length ? `<button type="button" class="btn btn-outline btn-xs" onclick="ANI.exportChatTrace()">Exportar trazabilidad (.md)</button><button type="button" class="btn btn-outline btn-xs" onclick="ANI.clearChat()">Limpiar</button>` : ''}
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
  } else if (toolTab === 'auditor') {
    body = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Auditor Institucional de Trazabilidad (PEI 6 col. · Plan de Acción 7 col. · R1–R6)</h2>
          <p class="muted">Verifica completitud de las 6 columnas PEI y 7 columnas Plan de Acción, coherencia línea base–metas (R6), doble llave F1↔F2 (R3), competencia R2, 7 Ejes PND y correspondencia PEI ↔ PA.</p>
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
  } else {
    const checks = Array.isArray(diagnostics?.checks) ? diagnostics.checks : [];
    body = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Diagnóstico Técnico Integral del Sistema y Agente Estratégico</h2>
          <p class="muted">Comprobación en tiempo real del servidor API, seguridad, motor documental BM25, estructuras obligatorias PEI/PA, Centro Audiovisual y conexión Arena API.</p>
        </div>
        <div class="toolbar no-print" style="margin:0">
          <button class="btn btn-teal btn-sm" onclick="ANI.runDiagnostics()">↻ Ejecutar diagnóstico</button>
          <button class="btn btn-outline btn-sm" onclick="ANI.verifyArena()">Probar Arena API (/v1/models)</button>
        </div>
      </div>
      ${checks.length
        ? `<div class="diag-grid">
            ${checks.map((ck) => `<div class="diag-card">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px">
                <b style="color:var(--navy-900);font-size:13.2px">${esc(ck.name)}</b>
                <span class="badge ${ck.status === 'ok' ? 'badge-ok' : ck.status === 'bad' ? 'badge-bad' : ck.status === 'info' ? 'badge-navy' : 'badge-warn'}">
                  ${ck.status === 'ok' ? 'Operativo' : ck.status === 'bad' ? 'Error' : ck.status === 'info' ? 'Preparado' : 'Requiere clave'}
                </span>
              </div>
              <p class="muted" style="margin:0;font-size:12.2px">${esc(ck.detail)}</p>
            </div>`).join('')}
          </div>
          <p class="muted" style="margin-top:10px;font-size:11.5px">Última comprobación: <code>${esc(diagnostics.checkedAt || '')}</code></p>`
        : `<p class="muted">Pulse “Ejecutar diagnóstico” para comprobar todos los subsistemas en tiempo real.</p>`}
    </div>`;
  }

  return `
  <div class="subtabs no-print">
    ${tabs.map(([id, lbl]) => `<button class="subtab ${toolTab === id ? 'active' : ''}" onclick="ANI.setAgentTab('${id}')">${esc(lbl)}</button>`).join('')}
  </div>
  ${body}`;
}
