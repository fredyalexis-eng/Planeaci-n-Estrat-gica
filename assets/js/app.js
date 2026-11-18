/**
 * ANI STRATEGY LAB — Controlador Principal de los 9 Módulos Estratégicos
 *
 * - Evolución directa sobre el repositorio fredyalexis-eng/Planeaci-n-Estrat-gica
 * - 100% retrocompatible con localStorage `ani_pei_2027_2030_v1`
 * - Corrige los 3 defectos detectados (value de select Foco, foco del cursor en oninput, tablas CSS)
 * - Conecta de forma segura con `/api/agent/*` (adaptador Arena API + RAG BM25 + auditor R1–R6)
 */
import {
  STORAGE_KEY,
  ILLUSTRATIVE_CSV_EXAMPLES,
  AGENT_QUICK_PROMPTS
} from '../../data/knowledge-base.js';
import {
  esc,
  defaultState,
  migrateState,
  loadStateFromStorage,
  persistStateToStorage,
  createProject,
  createOpportunity,
  createActionItem,
  createMediaItem,
  docComplete,
  pndAxisComplete,
  projValid,
  projChecklist,
  projScore,
  projCategory,
  projHasBaselineIssue,
  computeMetrics,
  buildPeiCsv,
  buildActionPlanCsv,
  buildCsv,
  importPeiFromCsv
} from './state.js';
import {
  renderDashboard,
  renderIdentity,
  renderFocos,
  renderPndDocs,
  renderOpportunities
} from './render-strategy.js';
import {
  renderPei,
  renderActionPlan,
  renderMedia,
  renderAgentModule,
  renderChatFeedHtml
} from './render-execution.js';
import {
  fetchAgentStatus,
  verifyArenaConnection,
  searchKnowledge,
  runAudit,
  fetchCitationChunk,
  sendAgentMessage,
  setBackendBase
} from './agent-client.js';

export const MODULES = [
  { id: 'dashboard', num: '01', group: 'Dirección Estratégica', name: 'Centro de Mando', sub: 'Estrategia ANI 2027–2030', eyebrow: 'Módulo 01 · Visión Ejecutiva' },
  { id: 'identity', num: '02', group: 'Dirección Estratégica', name: 'Identidad y Competencias', sub: 'Misión, Visión, Objetivos, R2', eyebrow: 'Módulo 02 · Marco Institucional' },
  { id: 'focos', num: '03', group: 'Dirección Estratégica', name: 'Dos Focos y Mapa Causal', sub: 'F1 ↔ F2, Árboles, ToC, KPIs', eyebrow: 'Módulo 03 · Arquitectura Estratégica' },
  { id: 'pnd-docs', num: '04', group: 'Inteligencia y Análisis', name: 'PND (7 Ejes) y Biblioteca', sub: 'Ejes PND y acervo documental', eyebrow: 'Módulo 04 · Conocimiento Estratégico' },
  { id: 'opportunities', num: '05', group: 'Inteligencia y Análisis', name: 'Análisis de Oportunidades', sub: 'Recomendaciones R1–R6 y cruces', eyebrow: 'Módulo 05 · Oportunidades PND–ANI' },
  { id: 'pei', num: '06', group: 'Portafolio y Ejecución', name: 'Cartera PEI y Priorización', sub: 'Tabla PEI, scoring 1–5 y matriz', eyebrow: 'Módulo 06 · Plan Estratégico Institucional' },
  { id: 'action-plan', num: '07', group: 'Portafolio y Ejecución', name: 'Plan de Acción 2027–2030', sub: 'Actividades, metas y cronograma', eyebrow: 'Módulo 07 · Despliegue Operativo' },
  { id: 'media', num: '08', group: 'Recursos e Inteligencia IA', name: 'Centro Audiovisual', sub: 'Canvas, videos e imágenes ANI', eyebrow: 'Módulo 08 · Recursos Institucionales' },
  { id: 'agent', num: '09', group: 'Recursos e Inteligencia IA', name: 'Agente IA y Consulta', sub: 'Copiloto, BM25 y auditoría R1–R6', eyebrow: 'Módulo 09 · Inteligencia Estratégica IA' }
];

export function formatTimer(sec) {
  const safe = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

export function createAniApp() {
  let state = loadStateFromStorage();

  const ui = {
    activeModule: 'dashboard',
    focosTab: 'comparativa',
    pndTab: 'ejes',
    activeDoc: 'pnd',
    oppFilter: '',
    peiTab: 'fichas',
    filterFoco: '',
    searchProj: '',
    paTab: 'fichas',
    paFilter: '',
    timerSec: 20 * 60,
    timerHandle: null,
    drawerOpen: false
  };

  const agentUi = {
    toolTab: 'chat',
    statusData: null,
    verifyResult: null,
    activeMode: 'consulta',
    messages: [],
    busy: false,
    searchQuery: '',
    searchResults: null,
    auditReport: null
  };

  const $ = (id) => (typeof document !== 'undefined' ? document.getElementById(id) : null);

  function toast(message) {
    const el = $('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 2500);
  }

  function updateSaveChip() {
    const chip = $('saveStatus');
    if (!chip) return;
    const t = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    chip.textContent = `Guardado local · ${t}`;
  }

  function getNavBadge(modId, m) {
    if (modId === 'dashboard') return `${m.pct}%`;
    if (modId === 'identity') return `${m.identityDone}/3`;
    if (modId === 'focos') return '2';
    if (modId === 'pnd-docs') return `${m.axesDone}/7`;
    if (modId === 'opportunities') return String(6 + m.oppTotal);
    if (modId === 'pei') return String(m.projTotal);
    if (modId === 'action-plan') return String(m.paTotal);
    if (modId === 'media') return String(1 + state.mediaAssets.length);
    if (modId === 'agent') return 'IA';
    return '';
  }

  function renderSidebar() {
    const nav = $('sidebarNav');
    const m = computeMetrics(state);
    const bar = $('globalProgressFill');
    const pctLbl = $('globalProgressPct');
    if (bar) bar.style.width = `${m.pct}%`;
    if (pctLbl) pctLbl.textContent = `${m.pct}%`;
    if (!nav) return;

    let lastGroup = '';
    const html = [];
    for (const mod of MODULES) {
      if (mod.group !== lastGroup) {
        lastGroup = mod.group;
        html.push(`<div class="nav-group-label">${esc(mod.group)}</div>`);
      }
      const badge = getNavBadge(mod.id, m);
      html.push(`<button type="button" class="nav-item ${ui.activeModule === mod.id ? 'active' : ''}" onclick="ANI.go('${mod.id}')">
        <span class="nav-num">${mod.num}</span>
        <span class="nav-label"><b>${esc(mod.name)}</b><small>${esc(mod.sub)}</small></span>
        ${badge ? `<span class="nav-count">${esc(badge)}</span>` : ''}
      </button>`);
    }
    nav.innerHTML = html.join('');
  }

  function updateTopbar() {
    const mod = MODULES.find((x) => x.id === ui.activeModule) || MODULES[0];
    const eye = $('topbarEyebrow');
    const title = $('topbarTitle');
    if (eye) eye.textContent = mod.eyebrow;
    if (title) title.textContent = mod.name;
  }

  function updateSidebarAgentStatus() {
    const el = $('sidebarAgentStatus');
    if (!el) return;
    const st = agentUi.statusData?.arena?.status;
    if (st === 'configured_ready') {
      el.innerHTML = `<span class="status-dot ok"></span>Arena API: clave configurada`;
    } else if (st === 'static_host_mode') {
      el.innerHTML = `<span class="status-dot warn"></span>Modo estático · BM25 activo`;
    } else {
      el.innerHTML = `<span class="status-dot warn"></span>Arena API: pendiente de clave`;
    }
  }

  /**
   * Guardado quirúrgico (corrige Defecto #2): persiste en localStorage y actualiza
   * contadores/barra lateral SIN reconstruir el campo donde el usuario está escribiendo.
   */
  function save(fullRerender = false) {
    persistStateToStorage(state);
    updateSaveChip();
    renderSidebar();
    if (fullRerender) {
      renderActiveModule();
    }
  }

  function renderModuleHtml(modId) {
    switch (modId) {
      case 'dashboard': return renderDashboard(state);
      case 'identity': return renderIdentity(state);
      case 'focos': return renderFocos(state, ui.focosTab);
      case 'pnd-docs': return renderPndDocs(state, ui.pndTab, ui.activeDoc);
      case 'opportunities': return renderOpportunities(state, ui.oppFilter);
      case 'pei': return renderPei(state, { ...ui, timerLabel: formatTimer(ui.timerSec) });
      case 'action-plan': return renderActionPlan(state, ui.paTab, ui.paFilter);
      case 'media': return renderMedia(state);
      case 'agent': return renderAgentModule(state, agentUi);
      default: return renderDashboard(state);
    }
  }

  function renderActiveModule() {
    updateTopbar();
    renderSidebar();
    const container = $('moduleContainer');
    if (!container) return;
    container.innerHTML = `<section class="module-view active" id="view-${ui.activeModule}">${renderModuleHtml(ui.activeModule)}</section>`;
    syncDrawerFeed();
  }

  function syncDrawerFeed() {
    const df = $('drawerChatFeed');
    if (df) {
      df.innerHTML = renderChatFeedHtml(agentUi.messages);
      df.scrollTop = df.scrollHeight;
    }
    const af = $('agentChatFeed');
    if (af) {
      af.scrollTop = af.scrollHeight;
    }
  }

  function patchProjectHeadDom(id) {
    if (typeof document === 'undefined') return;
    const p = state.projects.find((x) => x.id === id);
    if (!p) return;
    const titleEl = document.querySelector(`[data-proj-title="${id}"]`);
    if (titleEl) titleEl.textContent = p.proyecto || 'Proyecto sin nombre';
    const validEl = document.querySelector(`[data-proj-valid="${id}"]`);
    const ok = projValid(p) && !projHasBaselineIssue(p);
    if (validEl) {
      validEl.className = `badge ${ok ? 'badge-ok' : 'badge-warn'}`;
      validEl.textContent = ok ? 'Fila válida' : 'Incompleta / revisar';
    }
    const catEl = document.querySelector(`[data-proj-cat="${id}"]`);
    if (catEl) {
      const cat = projCategory(p);
      const sc = projScore(p);
      catEl.className = `badge ${cat.cls}`;
      catEl.textContent = `${cat.label} (${sc.total.toFixed(1)})`;
    }
    const checksEl = document.querySelector(`[data-proj-checks="${id}"]`);
    if (checksEl) {
      checksEl.innerHTML = projChecklist(p)
        .map(([lbl, cOk]) => `<span class="badge ${cOk ? 'badge-ok' : 'badge-warn'}">${cOk ? '✓' : '○'} ${esc(lbl)}</span>`)
        .join('');
    }
  }

  function downloadFile(filename, content, mimeType) {
    if (typeof document === 'undefined') return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast(`Exportado: ${filename}`);
  }

  function openModal(title, bodyHtml) {
    const ov = $('appModal');
    const t = $('modalTitle');
    const b = $('modalBody');
    if (!ov || !t || !b) return;
    t.textContent = title;
    b.innerHTML = bodyHtml;
    ov.classList.add('open');
  }

  function closeModal() {
    $('appModal')?.classList.remove('open');
  }

  async function inspectCitation(citeId) {
    openModal(`Referencia documental [${citeId}]`, `<p class="muted">Consultando fuente verificable…</p>`);
    const chunk = await fetchCitationChunk(citeId);
    if (chunk) {
      openModal(
        `Fuente verificada [${chunk.id}]`,
        `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
          <span class="badge badge-navy">${esc(chunk.docTitle)}</span>
          <span class="badge badge-teal">${esc(chunk.sourceFile)} (${esc(chunk.lineRange)})</span>
        </div>
        <h3 style="margin:0 0 8px;color:var(--navy-900)">${esc(chunk.section)}</h3>
        <pre class="doc-pre">${esc(chunk.content)}</pre>`
      );
      return;
    }
    // Buscar también en el espacio de trabajo local
    const mAxis = citeId.match(/^PND-EJE-(\d)$/);
    if (mAxis) {
      const ax = state.pndAxes[Number(mAxis[1]) - 1];
      if (ax) {
        openModal(`Fuente de sesión [${citeId}]`, `<pre class="doc-pre">Eje ${ax.numero}: ${esc(ax.nombre || 'Pendiente')}\nResumen: ${esc(ax.resumen)}\nRelación ANI: ${esc(ax.relacionAni)}\nCita: ${esc(ax.cita || 'Pendiente')}</pre>`);
        return;
      }
    }
    openModal(`Referencia [${citeId}]`, `<p class="muted">Fragmento correspondiente al acervo activo de sesión o al archivo <code>01_Marco_Estrategico_ANI_2027-2030.md</code>.</p>`);
  }

  /* ---------- API PÚBLICA DEL CONTROLADOR ---------- */
  const api = {
    getState: () => state,
    getUi: () => ui,
    renderModuleHtml,

    go(modId) {
      if (!MODULES.some((m) => m.id === modId)) return;
      ui.activeModule = modId;
      api.closeSidebar();
      api.closeDropdowns();
      renderActiveModule();
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      if (modId === 'agent' && agentUi.toolTab === 'auditor' && !agentUi.auditReport) {
        api.executeAudit();
      }
    },

    toggleSidebar() {
      $('sidebar')?.classList.toggle('open');
      $('sidebarBackdrop')?.classList.toggle('open');
    },
    closeSidebar() {
      $('sidebar')?.classList.remove('open');
      $('sidebarBackdrop')?.classList.remove('open');
    },
    toggleDropdown(id) {
      $(id)?.classList.toggle('open');
    },
    closeDropdowns() {
      if (typeof document === 'undefined') return;
      document.querySelectorAll('.dropdown.open').forEach((d) => d.classList.remove('open'));
    },
    toggleDrawer(force) {
      const dr = $('copilotDrawer');
      if (!dr) return;
      ui.drawerOpen = typeof force === 'boolean' ? force : !ui.drawerOpen;
      dr.classList.toggle('open', ui.drawerOpen);
      if (ui.drawerOpen) syncDrawerFeed();
    },
    closeModal,
    inspectCitation,

    async viewRepoFile(relFile) {
      openModal(relFile, `<p class="muted">Cargando archivo original del repositorio…</p>`);
      try {
        const res = await fetch(`./${relFile}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        openModal(
          `Archivo original: ${relFile}`,
          `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">
            <span class="badge badge-ok">Archivo original preservado sin modificaciones</span>
            <a class="btn btn-outline btn-xs" href="./${esc(relFile)}" download>Descargar</a>
          </div>
          <pre class="doc-pre">${esc(text)}</pre>`
        );
      } catch (err) {
        openModal(relFile, `<p class="muted">No se pudo cargar el archivo (${esc(err.message)}).</p>`);
      }
    },

    /* Módulo 02: Identidad */
    setIdentity(key, val) {
      state.identity[key] = val;
      const rerender = key.endsWith('Status');
      save(rerender);
    },
    addObjective() {
      const nextNum = String(state.identity.objetivos.length + 1).padStart(2, '0');
      state.identity.objetivos.push({ codigo: `OE-${nextNum}`, nombre: '', foco: 'F1+F2', fuente: '', estatus: 'en_construccion' });
      save(true);
    },
    setObjective(idx, key, val) {
      if (!state.identity.objetivos[idx]) return;
      state.identity.objetivos[idx][key] = val;
      save(false);
    },
    removeObjective(idx) {
      state.identity.objetivos.splice(idx, 1);
      save(true);
    },
    setCompetence(modeId, key, val) {
      if (!state.identity.competences[modeId]) state.identity.competences[modeId] = {};
      state.identity.competences[modeId][key] = val;
      save(false);
    },

    /* Módulo 03: Focos */
    setFocosTab(tab) {
      ui.focosTab = tab;
      renderActiveModule();
    },
    setIndicatorBaseline(indId, val) {
      state.indicatorBaselines[indId] = val;
      save(false);
    },

    /* Módulo 04: PND 7 Ejes y Biblioteca */
    setPndTab(tab) {
      ui.pndTab = tab;
      renderActiveModule();
    },
    setPndAxis(idx, key, val) {
      const ax = state.pndAxes[idx];
      if (!ax) return;
      ax[key] = val;
      ax.estatus = pndAxisComplete(ax) ? 'en_construccion' : 'pendiente';
      save(false);
      const pill = $(`pnd-pill-${idx}`);
      if (pill) {
        const ok = pndAxisComplete(ax);
        pill.className = `badge ${ok ? 'badge-ok' : 'badge-warn'}`;
        pill.textContent = ok ? 'Documentado' : 'Pendiente de carga oficial';
      }
    },
    deriveOppFromAxis(idx) {
      const ax = state.pndAxes[idx];
      if (!ax) return;
      state.opportunities.unshift(createOpportunity({
        foco: ax.foco || 'F1',
        titulo: ax.nombre ? `Articulación ANI con Eje ${ax.numero}: ${ax.nombre}` : `Oportunidad derivada del Eje PND ${ax.numero}`,
        ejePnd: `Eje ${ax.numero}`,
        competencia: ax.competenciaTipo || 'Competencia directa',
        descripcion: ax.relacionAni || ax.resumen || '',
        evidencia: ax.cita || `PND · Eje ${ax.numero}`,
        estatus: 'en_construccion'
      }));
      save(false);
      api.go('opportunities');
      toast(`Oportunidad creada desde Eje PND ${ax.numero}`);
    },
    setActiveDoc(docId) {
      ui.activeDoc = docId;
      renderActiveModule();
    },
    setDoc(docId, key, val) {
      if (!state.docs[docId]) return;
      state.docs[docId][key] = val;
      save(false);
      const pill = $('doc-complete-pill');
      if (pill) {
        const ok = docComplete(state.docs[docId]);
        pill.className = `badge ${ok ? 'badge-ok' : 'badge-warn'}`;
        pill.textContent = ok ? 'Ficha completa' : 'Pendiente de diligenciar';
      }
    },
    setDocList(docId, listKey, idx, val) {
      if (!state.docs[docId]) return;
      state.docs[docId][listKey][idx] = val;
      save(false);
      const pill = $('doc-complete-pill');
      if (pill) {
        const ok = docComplete(state.docs[docId]);
        pill.className = `badge ${ok ? 'badge-ok' : 'badge-warn'}`;
        pill.textContent = ok ? 'Ficha completa' : 'Pendiente de diligenciar';
      }
    },
    addDocList(docId, listKey) {
      if (!state.docs[docId]) return;
      if (!state.docs[docId][listKey].length) state.docs[docId][listKey].push('');
      state.docs[docId][listKey].push('');
      save(true);
    },
    delDocList(docId, listKey, idx) {
      if (!state.docs[docId]) return;
      state.docs[docId][listKey].splice(idx, 1);
      save(true);
    },
    uploadCustomDoc(ev) {
      const file = ev?.target?.files?.[0];
      if (!file) return;
      if (file.size > 512 * 1024) {
        toast('Archivo mayor a 512 KB. Para documentos extensos colóquelos en /knowledge.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        state.customDocs.push({
          titulo: file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '),
          nombreArchivo: file.name,
          fecha: new Date().toISOString().slice(0, 10),
          foco: 'F1+F2',
          cita: '',
          estatus: 'en_construccion',
          contenido: String(reader.result || '').slice(0, 20000)
        });
        save(true);
        toast(`Documento incorporado: ${file.name}`);
      };
      reader.readAsText(file);
    },
    setCustomDoc(idx, key, val) {
      if (!state.customDocs[idx]) return;
      state.customDocs[idx][key] = val;
      save(false);
    },
    removeCustomDoc(idx) {
      state.customDocs.splice(idx, 1);
      save(true);
    },

    /* Módulo 05: Oportunidades */
    setOppFilter(val) {
      ui.oppFilter = val;
      renderActiveModule();
    },
    addOpportunity() {
      state.opportunities.unshift(createOpportunity({ foco: ui.oppFilter || 'F1' }));
      save(true);
      toast('Oportunidad creada');
    },
    setOpp(id, key, val) {
      const o = state.opportunities.find((x) => x.id === id);
      if (!o) return;
      o[key] = val;
      save(key === 'foco');
    },
    deleteOpportunity(id) {
      state.opportunities = state.opportunities.filter((x) => x.id !== id);
      save(true);
    },
    promoteOppToPei(id) {
      const o = state.opportunities.find((x) => x.id === id);
      if (!o) return;
      const foco = o.foco === 'F2' ? 'F2' : 'F1';
      state.projects.unshift(createProject({
        foco,
        objetivo: 'Información insuficiente para concluir — levantar objetivo vigente ANI',
        proyecto: o.titulo || 'Borrador desde oportunidad estratégica',
        unidad: '',
        lineaBase: 'Información insuficiente para concluir',
        meta: 'Por definir — línea base pendiente',
        ejePnd: o.ejePnd || '',
        modo: o.modo || '',
        detalle: `${o.descripcion || ''}${o.evidencia ? ` (Ref.: ${o.evidencia})` : ''}`.trim(),
        estatus: o.estatus === 'propuesta_ia' ? 'propuesta_ia' : 'en_construccion'
      }));
      ui.peiTab = 'fichas';
      save(false);
      api.go('pei');
      toast('Convertida en borrador de Proyecto PEI');
    },

    /* Módulo 06: Cartera PEI y Priorización */
    setPeiTab(tab) {
      ui.peiTab = tab;
      renderActiveModule();
    },
    setPeiFilter(val) {
      ui.filterFoco = val;
      renderActiveModule();
    },
    setPeiSearch(val) {
      ui.searchProj = val;
      renderActiveModule();
      const inp = typeof document !== 'undefined' ? document.querySelector('#view-pei input[type="search"]') : null;
      if (inp) { inp.focus(); inp.setSelectionRange(val.length, val.length); }
    },
    addProject(foco = '') {
      state.projects.unshift(createProject({
        foco,
        lineaBase: 'Información insuficiente para concluir',
        meta: 'Por definir — línea base pendiente'
      }));
      save(true);
      toast('Proyecto PEI creado');
    },
    quickAddProject(foco) {
      ui.peiTab = 'fichas';
      ui.filterFoco = '';
      state.projects.unshift(createProject({
        foco,
        lineaBase: 'Información insuficiente para concluir',
        meta: 'Por definir — línea base pendiente'
      }));
      save(false);
      api.go('pei');
      toast(`Nuevo proyecto ${foco} creado`);
    },
    loadIllustrativeExamples() {
      ILLUSTRATIVE_CSV_EXAMPLES.forEach((ex) => state.projects.push(createProject(ex)));
      save(true);
      toast('2 ejemplos ilustrativos de formato cargados (no son datos oficiales)');
    },
    dupProject(id) {
      const orig = state.projects.find((x) => x.id === id);
      if (!orig) return;
      const copy = createProject({ ...JSON.parse(JSON.stringify(orig)), id: undefined, proyecto: `${orig.proyecto} (copia)` });
      state.projects.push(copy);
      save(true);
      toast('Proyecto duplicado');
    },
    delProject(id) {
      if (typeof confirm === 'function' && !confirm('¿Eliminar este proyecto de la Cartera PEI?')) return;
      state.projects = state.projects.filter((x) => x.id !== id);
      save(true);
      toast('Proyecto eliminado');
    },
    setProj(id, key, val, rerender = false) {
      const p = state.projects.find((x) => x.id === id);
      if (!p) return;
      p[key] = val;
      save(rerender);
      if (!rerender) patchProjectHeadDom(id);
    },
    toggleProjCriterio(id, tag) {
      const p = state.projects.find((x) => x.id === id);
      if (!p) return;
      const set = new Set(p.criterios || []);
      if (set.has(tag)) set.delete(tag); else set.add(tag);
      p.criterios = [...set];
      save(true);
    },
    setScore(id, key, val) {
      const p = state.projects.find((x) => x.id === id);
      if (!p) return;
      p.scores[key] = Math.min(5, Math.max(1, Number(val) || 3));
      const out = $(`out-${id}-${key}`);
      if (out) out.textContent = String(p.scores[key]);
      save(false);
      patchProjectHeadDom(id);
    },

    /* Cronómetro Taller 20 min (preservado) */
    timerStart() {
      if (ui.timerHandle) return;
      ui.timerHandle = setInterval(() => {
        if (ui.timerSec > 0) {
          ui.timerSec -= 1;
          const el = $('workshopTimer');
          if (el) el.textContent = formatTimer(ui.timerSec);
        } else {
          api.timerPause();
          toast('Tiempo del taller de 20 minutos cumplido');
        }
      }, 1000);
    },
    timerPause() {
      if (ui.timerHandle) {
        clearInterval(ui.timerHandle);
        ui.timerHandle = null;
      }
    },
    timerReset() {
      api.timerPause();
      ui.timerSec = 20 * 60;
      const el = $('workshopTimer');
      if (el) el.textContent = '20:00';
    },

    /* Módulo 07: Plan de Acción */
    setPaTab(tab) {
      ui.paTab = tab;
      renderActiveModule();
    },
    setPaFilter(val) {
      ui.paFilter = val;
      renderActiveModule();
    },
    addActionItem(overrides = {}) {
      const code = `PA-${String(state.actionPlan.length + 1).padStart(2, '0')}`;
      state.actionPlan.unshift(createActionItem({ codigo: code, foco: ui.paFilter || '', ...overrides }));
      save(true);
      toast('Actividad del Plan de Acción creada');
    },
    addActionForProject(projId) {
      const p = state.projects.find((x) => x.id === projId);
      if (!p) return;
      const code = `PA-${String(state.actionPlan.length + 1).padStart(2, '0')}`;
      state.actionPlan.unshift(createActionItem({
        codigo: code,
        proyectoId: p.id,
        proyectoNombre: p.proyecto || 'Proyecto PEI',
        foco: p.foco || 'F1',
        estatus: p.estatus === 'propuesta_ia' ? 'propuesta_ia' : 'en_construccion'
      }));
      ui.paTab = 'fichas';
      ui.paFilter = '';
      save(false);
      api.go('action-plan');
      toast('Actividad vinculada al proyecto PEI');
    },
    linkActionProject(actionId, projId) {
      const a = state.actionPlan.find((x) => x.id === actionId);
      const p = state.projects.find((x) => x.id === projId);
      if (!a) return;
      a.proyectoId = projId;
      a.proyectoNombre = p ? p.proyecto : '';
      if (p?.foco) a.foco = p.foco;
      save(true);
    },
    setAction(id, key, val, rerender = false) {
      const a = state.actionPlan.find((x) => x.id === id);
      if (!a) return;
      a[key] = key === 'avance' ? Number(val) || 0 : val;
      if (key === 'avance') {
        const av = $(`pa-av-${id}`);
        if (av) av.textContent = String(a.avance);
      }
      if (key === 'actividad' && typeof document !== 'undefined') {
        const t = document.querySelector(`[data-pa-title="${id}"]`);
        if (t) t.textContent = a.actividad || 'Actividad en formulación';
      }
      save(rerender);
    },
    dupActionItem(id) {
      const orig = state.actionPlan.find((x) => x.id === id);
      if (!orig) return;
      state.actionPlan.push(createActionItem({
        ...orig,
        id: undefined,
        codigo: `PA-${String(state.actionPlan.length + 1).padStart(2, '0')}`,
        actividad: `${orig.actividad} (copia)`
      }));
      save(true);
    },
    delActionItem(id) {
      if (typeof confirm === 'function' && !confirm('¿Eliminar esta actividad del Plan de Acción?')) return;
      state.actionPlan = state.actionPlan.filter((x) => x.id !== id);
      save(true);
    },

    /* Módulo 08: Centro Audiovisual */
    addMediaItem() {
      state.mediaAssets.unshift(createMediaItem({ tipo: 'video', foco: 'F1+F2' }));
      save(true);
    },
    setMedia(id, key, val, rerender = false) {
      const m = state.mediaAssets.find((x) => x.id === id);
      if (!m) return;
      m[key] = val;
      save(rerender);
    },
    delMediaItem(id) {
      state.mediaAssets = state.mediaAssets.filter((x) => x.id !== id);
      save(true);
    },

    /* Módulo 09: Agente Estratégico IA, Buscador y Auditor */
    setAgentTab(tab) {
      agentUi.toolTab = tab;
      renderActiveModule();
      if (tab === 'auditor' && !agentUi.auditReport) api.executeAudit();
    },
    openAuditTab() {
      agentUi.toolTab = 'auditor';
      api.go('agent');
      api.executeAudit();
    },
    setAgentMode(mode) {
      agentUi.activeMode = mode;
    },
    clearChat() {
      agentUi.messages = [];
      renderActiveModule();
      syncDrawerFeed();
    },
    async refreshAgentStatus() {
      agentUi.statusData = await fetchAgentStatus();
      updateSidebarAgentStatus();
      if (ui.activeModule === 'agent') renderActiveModule();
    },
    async verifyArena() {
      toast('Verificando conexión con Arena API…');
      try {
        const data = await verifyArenaConnection();
        agentUi.verifyResult = data.verification || data;
        if (data.arena && agentUi.statusData) agentUi.statusData.arena = data.arena;
      } catch (err) {
        agentUi.verifyResult = { ok: false, status: 'offline', message: `Backend no disponible (${err.message}).` };
      }
      updateSidebarAgentStatus();
      if (ui.activeModule === 'agent') renderActiveModule();
    },
    saveBackendUrl(url) {
      try {
        setBackendBase(url);
        toast(url.trim() ? 'Endpoint HTTPS del backend guardado' : 'Usando servidor del mismo origen');
        api.refreshAgentStatus();
      } catch (err) {
        toast(err.message);
      }
    },
    async askAgent(text, modeOverride = '') {
      const message = String(text || '').trim();
      if (!message || agentUi.busy) return;
      const mode = modeOverride || agentUi.activeMode || 'consulta';
      agentUi.activeMode = mode;
      agentUi.busy = true;

      const history = agentUi.messages
        .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.payload?.answer))
        .map((m) => ({ role: m.role, content: m.role === 'user' ? m.content : m.payload.answer }));

      agentUi.messages.push({ role: 'user', mode, content: message });
      if (ui.activeModule === 'agent') renderActiveModule();
      syncDrawerFeed();

      const payload = await sendAgentMessage({ message, mode, workspace: state, history });
      agentUi.messages.push({ role: 'assistant', mode, payload });
      agentUi.busy = false;

      if (ui.activeModule === 'agent') renderActiveModule();
      syncDrawerFeed();
    },
    submitAgentForm(ev) {
      ev.preventDefault();
      const inp = $('agentInput');
      if (!inp?.value.trim()) return;
      const val = inp.value;
      inp.value = '';
      api.askAgent(val);
    },
    submitDrawerForm(ev) {
      ev.preventDefault();
      const inp = $('drawerInput');
      const sel = $('drawerModeSelect');
      if (!inp?.value.trim()) return;
      const val = inp.value;
      inp.value = '';
      api.askAgent(val, sel?.value || agentUi.activeMode);
    },
    runQuickPrompt(idx) {
      const qp = AGENT_QUICK_PROMPTS[idx];
      if (!qp) return;
      agentUi.toolTab = 'chat';
      api.askAgent(qp.prompt, qp.mode);
    },
    acceptProposal(msgIdx, kind, itemIdx) {
      const msg = agentUi.messages[msgIdx];
      const props = msg?.payload?.proposals;
      if (!props) return;
      if (kind === 'pei' && props.peiProjects?.[itemIdx]) {
        const p = props.peiProjects[itemIdx];
        state.projects.unshift(createProject({ ...p, estatus: 'propuesta_ia' }));
        save(false);
        toast('Borrador incorporado a Cartera PEI (marcado Propuesta IA — No aprobada)');
      } else if (kind === 'pa' && props.actionItems?.[itemIdx]) {
        const a = props.actionItems[itemIdx];
        const code = `PA-${String(state.actionPlan.length + 1).padStart(2, '0')}`;
        state.actionPlan.unshift(createActionItem({ ...a, codigo: code, estatus: 'propuesta_ia', estado: 'Propuesta IA — No aprobada' }));
        save(false);
        toast('Borrador incorporado al Plan de Acción (No aprobado)');
      } else if (kind === 'opp' && props.opportunities?.[itemIdx]) {
        const o = props.opportunities[itemIdx];
        state.opportunities.unshift(createOpportunity({ ...o, estatus: 'propuesta_ia' }));
        save(false);
        toast('Oportunidad incorporada como Propuesta IA — No aprobada');
      }
    },
    async submitSearch(ev) {
      ev.preventDefault();
      const q = $('kbSearchInput')?.value?.trim() || '';
      agentUi.searchQuery = q;
      const data = await searchKnowledge(q, state);
      agentUi.searchResults = data.results || [];
      renderActiveModule();
    },
    async quickTopSearch(ev) {
      ev.preventDefault();
      const q = $('topSearchInput')?.value?.trim() || '';
      if (!q) return;
      agentUi.toolTab = 'buscador';
      agentUi.searchQuery = q;
      ui.activeModule = 'agent';
      const data = await searchKnowledge(q, state);
      agentUi.searchResults = data.results || [];
      renderActiveModule();
    },
    async executeAudit() {
      agentUi.auditReport = await runAudit(state);
      if (ui.activeModule === 'agent' && agentUi.toolTab === 'auditor') renderActiveModule();
      toast('Auditoría R1–R6 actualizada');
    },

    /* Exportación, Importación y Respaldo (100% compatible con v1) */
    exportJson() {
      api.closeDropdowns();
      downloadFile('ANI_PEI_2027-2030_respaldo.json', JSON.stringify(state, null, 2), 'application/json');
    },
    exportPeiCsv() {
      api.closeDropdowns();
      downloadFile('ANI_PEI_2027-2030_tabla.csv', buildPeiCsv(state.projects), 'text/csv;charset=utf-8');
    },
    exportActionCsv() {
      api.closeDropdowns();
      downloadFile('ANI_Plan_Accion_2027-2030.csv', buildActionPlanCsv(state.actionPlan), 'text/csv;charset=utf-8');
    },
    exportOppCsv() {
      api.closeDropdowns();
      const head = ['FOCO', 'TÍTULO', 'EJE PND', 'MODO/FRENTE', 'COMPETENCIA ANI', 'DESCRIPCIÓN', 'EVIDENCIA', 'ESTATUS'];
      const rows = state.opportunities.map((o) => [o.foco, o.titulo, o.ejePnd, o.modo, o.competencia, o.descripcion, o.evidencia, o.estatus]);
      downloadFile('ANI_Oportunidades_2027-2030.csv', buildCsv(head, rows), 'text/csv;charset=utf-8');
    },
    importJson(ev) {
      api.closeDropdowns();
      const file = ev?.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result || ''));
          if (!parsed || typeof parsed !== 'object' || (!parsed.docs && !parsed.projects)) {
            throw new Error('Estructura JSON no reconocida');
          }
          state = migrateState(parsed);
          save(true);
          toast('Respaldo JSON importado con compatibilidad total');
        } catch (err) {
          toast(`Error al importar JSON: ${err.message}`);
        }
      };
      reader.readAsText(file);
    },
    importPeiCsvFile(ev) {
      const file = ev?.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const imported = importPeiFromCsv(String(reader.result || ''));
        if (!imported.length) {
          toast('No se encontraron filas válidas en el CSV');
          return;
        }
        state.projects.push(...imported);
        save(true);
        toast(`${imported.length} proyecto(s) importado(s) desde CSV`);
      };
      reader.readAsText(file);
    },
    resetAll() {
      api.closeDropdowns();
      if (typeof confirm === 'function' && !confirm('¿Reiniciar todos los datos locales de este navegador? Exporte JSON antes si desea conservar un respaldo.')) return;
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      state = defaultState();
      save(true);
      toast('Espacio de trabajo local reiniciado');
    },

    init() {
      renderActiveModule();
      if (state.updatedAt) updateSaveChip();
      api.refreshAgentStatus();

      if (typeof document !== 'undefined') {
        document.addEventListener('click', (ev) => {
          const citeBtn = ev.target.closest?.('[data-cite]');
          if (citeBtn) {
            ev.preventDefault();
            inspectCitation(citeBtn.getAttribute('data-cite'));
            return;
          }
          if (!ev.target.closest?.('.dropdown')) {
            api.closeDropdowns();
          }
        });
        document.addEventListener('keydown', (ev) => {
          if (ev.key === 'Escape') {
            closeModal();
            api.toggleDrawer(false);
            api.closeSidebar();
            api.closeDropdowns();
          }
        });
      }
    }
  };

  return api;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const app = createAniApp();
  window.ANI = app;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
  } else {
    app.init();
  }
}
