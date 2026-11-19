/**
 * ANI STRATEGY LAB — Motor de Conocimiento Documental y Auditoría (RAG / BM25)
 * Indexa de forma trazable los documentos del repositorio (sin alterarlos),
 * los archivos adicionales en /knowledge y el contexto de trabajo de la sesión.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const SPANISH_STOPWORDS = new Set([
  'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para',
  'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'mas', 'pero', 'sus', 'le', 'ya', 'o',
  'este', 'si', 'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'tambien',
  'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos',
  'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto',
  'mi', 'antes', 'algunos', 'unos', 'yo', 'otro', 'otras', 'otra', 'el', 'tanto', 'esa',
  'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas',
  'algunas', 'algo', 'nosotros', 'mis', 'tu', 'te', 'ti', 'tus', 'ellas', 'nosotras',
  'vosotros', 'os', 'mio', 'mia', 'mios', 'mias', 'tuyo', 'tuya', 'suyo', 'suya', 'nuestro',
  'nuestra', 'ser', 'es', 'son', 'fue', 'han', 'ha', 'era', 'sido', 'sea', 'cada', 'solo',
  'puede', 'pueden', 'debe', 'deben', 'como', 'cuales', 'cual', 'que', 'ver', 'asi'
]);

export function normalizeText(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function lightSpanishStem(token) {
  if (/^(f[12]|r[1-6]|eje[1-7]|oe\d+|pa\d+)$/.test(token)) return token;
  if (token.length <= 4) return token;
  const suffixes = [
    'amientos', 'imientos', 'aciones', 'iciones', 'adoras', 'adores', 'idades',
    'amiento', 'imiento', 'acion', 'icion', 'adora', 'ador', 'idad', 'ivas', 'ivos',
    'ales', 'ibles', 'ables', 'mente', 'anzas', 'anza', 'encias', 'encia',
    'iva', 'ivo', 'osa', 'oso', 'es', 'os', 'as', 'o', 'a', 's'
  ];
  for (const suf of suffixes) {
    if (token.length - suf.length >= 4 && token.endsWith(suf)) {
      return token.slice(0, -suf.length);
    }
  }
  return token;
}

export function tokenize(text = '') {
  const norm = normalizeText(text);
  if (!norm) return [];
  const out = [];

  // Preservar identificadores compuestos estratégicos (Foco 1/2, Eje 1-7, R1-R6, conceptos clave)
  for (const m of norm.matchAll(/\bfoco\s+([12])\b/g)) out.push(`f${m[1]}`, `foco${m[1]}`);
  for (const m of norm.matchAll(/\beje\s+([1-7])\b/g)) out.push(`eje${m[1]}`);
  for (const m of norm.matchAll(/\brecomendacion\s+([1-6])\b/g)) out.push(`r${m[1]}`);
  if (norm.includes('doble llave')) out.push('doblellave');
  if (norm.includes('linea base') || norm.includes('lineas base')) out.push('lineabase');
  if (norm.includes('alertas tempranas') || norm.includes('alerta temprana')) out.push('alertastempranas');
  if (norm.includes('cuellos de botella') || norm.includes('cuello de botella')) out.push('cuellosbotella');
  if (norm.includes('ruta social')) out.push('rutasocial');
  if (norm.includes('plan de accion')) out.push('planaccion');
  if (norm.includes('choco renace')) out.push('chocorenace');
  if (norm.includes('plan destrabe')) out.push('plandestrabe');

  for (const tok of norm.split(' ')) {
    if (tok.length < 2) continue;
    if (SPANISH_STOPWORDS.has(tok)) continue;
    out.push(lightSpanishStem(tok));
  }
  return out;
}

function slugifyId(str) {
  return normalizeText(str)
    .toUpperCase()
    .replace(/\s+/g, '-')
    .slice(0, 28)
    .replace(/-+$/, '');
}

function stripHtml(html = '') {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parsea un documento Markdown en fragmentos trazables por encabezados ## / ###
 */
function parseMarkdownSections(content, { docPrefix, sourceFile, docTitle, authorityStatus, baseTags = [] }) {
  const lines = content.split(/\r?\n/);
  const chunks = [];
  let currentHeading = 'Encabezado y regla metodológica';
  let currentLevel = 1;
  let startLine = 1;
  let buffer = [];
  let autoIdx = 0;

  const deriveSectionCode = (heading) => {
    const numMatch = heading.match(/^(\d+(?:\.\d+)?)\b/);
    if (numMatch) return `S${numMatch[1]}`;
    if (/marco de decisi/i.test(heading)) return 'INTRO';
    if (/riesgos/i.test(heading)) return 'S4-RIESGOS';
    if (/archivos entregados/i.test(heading)) return 'ANEXO';
    if (/encabezado/i.test(heading)) return 'S0';
    autoIdx += 1;
    return `S${autoIdx}`;
  };

  const flush = (endLine) => {
    const text = buffer.join('\n').trim();
    if (!text || text.length < 30) return;
    const code = deriveSectionCode(currentHeading);
    let id = `${docPrefix}-${code}`;
    let dup = 2;
    while (chunks.some((c) => c.id === id)) {
      id = `${docPrefix}-${code}-${dup++}`;
    }
    const tags = [...baseTags];
    if (/\bf1\b|foco 1|infraestructura dinamizadora|multimodal|corredor/i.test(text)) tags.push('F1');
    if (/\bf2\b|foco 2|ruta social|conflicto|alertas tempranas|predial/i.test(text)) tags.push('F2');
    if (/pnd|plan nacional/i.test(text)) tags.push('PND');
    if (/pei|meta 2030|objetivo/i.test(text)) tags.push('PEI');
    if (/indicador|linea base|frecuencia/i.test(text)) tags.push('Indicadores');
    if (/recomendacion|\br[1-6]\b/i.test(text)) tags.push('Recomendaciones');
    if (/riesgo/i.test(text)) tags.push('Riesgos');
    if (/informacion insuficiente/i.test(text)) tags.push('Brechas');

    chunks.push({
      id,
      docTitle,
      section: currentHeading,
      sourceFile,
      lineRange: `L${startLine}–L${endLine}`,
      authorityStatus,
      level: currentLevel,
      tags: [...new Set(tags)],
      content: text
    });
  };

  lines.forEach((line, idx) => {
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (m) {
      flush(idx);
      currentLevel = m[1].length;
      currentHeading = m[2].trim();
      startLine = idx + 1;
      buffer = [line];
    } else {
      buffer.push(line);
    }
  });
  flush(lines.length);
  return chunks;
}

export class KnowledgeEngine {
  constructor(repoRoot) {
    this.repoRoot = repoRoot;
    this.repoChunks = [];
    this.repoFiles = [];
    this.loadedAt = null;
  }

  async loadRepositoryKnowledge() {
    const chunks = [];
    const filesMeta = [];

    const coreSources = [
      {
        relPath: '01_Marco_Estrategico_ANI_2027-2030.md',
        prefix: 'MARCO',
        title: 'Marco Estratégico ANI — PEI 2027–2030',
        type: 'markdown',
        authorityStatus: 'marco_repositorio',
        tags: ['ANI', 'PEI 2027-2030', 'Marco Base']
      },
      {
        relPath: '02_Plantilla_Ejercicio_PEI_2027-2030.csv',
        prefix: 'PLANTILLA-PEI',
        title: 'Plantilla Ejercicio PEI 2027–2030 (18 columnas)',
        type: 'csv',
        authorityStatus: 'ejemplo_ilustrativo',
        tags: ['PEI 2027-2030', 'Plantilla', 'Scoring', 'Doble Llave']
      },
      {
        relPath: '03_Canvas_2_Focos_ANI.html',
        prefix: 'CANVAS-2FOCOS',
        title: 'Canvas Ejecutivo 2 Focos ANI 2027–2030',
        type: 'html',
        authorityStatus: 'marco_repositorio',
        tags: ['F1', 'F2', 'Canvas', 'Hoja de Ruta']
      },
      {
        relPath: '04_App_Interactiva_ANI.md',
        prefix: 'GUIA-APP',
        title: 'Guía Metodológica App Interactiva ANI PEI 2027–2030',
        type: 'markdown',
        authorityStatus: 'marco_repositorio',
        tags: ['Documentos', 'PND', 'Chocó Renace', 'Discursos Ministra', 'Plan Destrabe']
      }
    ];

    for (const src of coreSources) {
      const fullPath = path.join(this.repoRoot, src.relPath);
      try {
        const raw = await fs.readFile(fullPath, 'utf8');
        const stat = await fs.stat(fullPath);
        let added = [];
        if (src.type === 'markdown') {
          added = parseMarkdownSections(raw, {
            docPrefix: src.prefix,
            sourceFile: src.relPath,
            docTitle: src.title,
            authorityStatus: src.authorityStatus,
            baseTags: src.tags
          });
        } else if (src.type === 'csv') {
          const nonEmpty = raw.split(/\r?\n/).filter((l) => l.replace(/,/g, '').trim().length > 0);
          added = [{
            id: `${src.prefix}-CSV`,
            docTitle: src.title,
            section: 'Estructura contractual de columnas y ejemplos ilustrativos de formato (no son datos oficiales ANI)',
            sourceFile: src.relPath,
            lineRange: `L1–L${nonEmpty.length}`,
            authorityStatus: src.authorityStatus,
            level: 2,
            tags: src.tags,
            content: nonEmpty.join('\n')
          }];
        } else if (src.type === 'html') {
          const clean = stripHtml(raw);
          added = [{
            id: `${src.prefix}-HTML`,
            docTitle: src.title,
            section: 'Síntesis visual ejecutiva: 2 Focos, tabla PEI, mapa estratégico, matriz y hoja de ruta',
            sourceFile: src.relPath,
            lineRange: `L1–L${raw.split(/\r?\n/).length}`,
            authorityStatus: src.authorityStatus,
            level: 2,
            tags: src.tags,
            content: clean
          }];
        }
        chunks.push(...added);
        filesMeta.push({
          file: src.relPath,
          title: src.title,
          authorityStatus: src.authorityStatus,
          sizeBytes: stat.size,
          chunkCount: added.length,
          origin: 'repositorio_raiz'
        });
      } catch {
        // Archivo opcional ausente; no falla el arranque
      }
    }

    // Indexar automáticamente documentos ampliados en /knowledge
    const knowledgeDir = path.join(this.repoRoot, 'knowledge');
    try {
      const entries = await fs.readdir(knowledgeDir, { withFileTypes: true });
      for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
        if (!entry.isFile() || entry.name.startsWith('.')) continue;
        const ext = path.extname(entry.name).toLowerCase();
        if (!['.md', '.txt', '.csv', '.json'].includes(ext)) continue;
        const relPath = path.posix.join('knowledge', entry.name);
        const fullPath = path.join(knowledgeDir, entry.name);
        const raw = await fs.readFile(fullPath, 'utf8');
        const stat = await fs.stat(fullPath);
        if (!raw.trim()) continue;

        const baseName = path.basename(entry.name, ext);
        const prefix = `DOC-${slugifyId(baseName)}`;
        let added = [];

        if (ext === '.md') {
          added = parseMarkdownSections(raw, {
            docPrefix: prefix,
            sourceFile: relPath,
            docTitle: baseName.replace(/[_-]+/g, ' '),
            authorityStatus: 'documento_ampliado',
            baseTags: ['Acervo Ampliado']
          });
        } else {
          // Partir textos largos en bloques de ~2200 caracteres
          const maxLen = 2200;
          const text = ext === '.json' ? raw.slice(0, 20000) : raw;
          let part = 1;
          for (let i = 0; i < text.length; i += maxLen) {
            const slice = text.slice(i, i + maxLen).trim();
            if (!slice) continue;
            added.push({
              id: `${prefix}-P${part}`,
              docTitle: baseName.replace(/[_-]+/g, ' '),
              section: `Fragmento ${part}`,
              sourceFile: relPath,
              lineRange: `Bloque ${part}`,
              authorityStatus: 'documento_ampliado',
              level: 2,
              tags: ['Acervo Ampliado'],
              content: slice
            });
            part += 1;
          }
        }
        chunks.push(...added);
        filesMeta.push({
          file: relPath,
          title: baseName.replace(/[_-]+/g, ' '),
          authorityStatus: 'documento_ampliado',
          sizeBytes: stat.size,
          chunkCount: added.length,
          origin: 'carpeta_knowledge'
        });
      }
    } catch {
      // Carpeta knowledge opcional
    }

    this.repoChunks = chunks;
    this.repoFiles = filesMeta;
    this.loadedAt = new Date().toISOString();
    return this.getSummary();
  }

  getSummary() {
    return {
      loadedAt: this.loadedAt,
      totalRepoFiles: this.repoFiles.length,
      totalRepoChunks: this.repoChunks.length,
      files: this.repoFiles,
      chunkIndex: this.repoChunks.map((c) => ({
        id: c.id,
        docTitle: c.docTitle,
        section: c.section,
        sourceFile: c.sourceFile,
        lineRange: c.lineRange,
        authorityStatus: c.authorityStatus,
        tags: c.tags
      }))
    };
  }

  /**
   * Convierte el estado vivo del usuario (PND 7 ejes, documentos, identidad, PEI, Plan de Acción)
   * en fragmentos trazables adicionales solo para la consulta actual.
   */
  buildWorkspaceChunks(workspace) {
    if (!workspace || typeof workspace !== 'object') return [];
    const extra = [];

    // 1. Identidad institucional
    const idn = workspace.identity;
    if (idn && (idn.mision?.trim() || idn.vision?.trim() || idn.naturaleza?.trim() || (idn.objetivos || []).length)) {
      const lines = [];
      if (idn.mision?.trim()) lines.push(`Misión registrada (${idn.misionStatus || 'en_construccion'}): ${idn.mision.trim()}`);
      if (idn.vision?.trim()) lines.push(`Visión registrada (${idn.visionStatus || 'en_construccion'}): ${idn.vision.trim()}`);
      if (idn.naturaleza?.trim()) lines.push(`Naturaleza y competencias: ${idn.naturaleza.trim()}`);
      if (idn.fuenteNormativa?.trim()) lines.push(`Fuente normativa declarada: ${idn.fuenteNormativa.trim()}`);
      if (Array.isArray(idn.objetivos) && idn.objetivos.length) {
        lines.push('Objetivos estratégicos cargados:');
        idn.objetivos.forEach((o) => {
          lines.push(`- [${o.codigo || 'OE'}] ${o.nombre || ''} (Foco: ${o.foco || 'Transversal'}, Estado: ${o.estatus || 'en_construccion'}, Fuente: ${o.fuente || 'Sin fuente'})`);
        });
      }
      if (lines.length) {
        extra.push({
          id: 'SESION-IDENTIDAD',
          docTitle: 'Identidad Institucional y Objetivos ANI (Sesión de Trabajo)',
          section: 'Misión, Visión y Objetivos Estratégicos registrados',
          sourceFile: 'Sesión activa · Módulo Identidad',
          lineRange: idn.fuenteNormativa || 'Registro de usuario',
          authorityStatus: idn.misionStatus === 'oficial_ani' ? 'oficial_verificado' : 'en_construccion',
          tags: ['ANI', 'Misión', 'Visión', 'Objetivos', 'Competencias'],
          content: lines.join('\n')
        });
      }
    }

    // 2. Siete ejes del PND
    if (Array.isArray(workspace.pndAxes)) {
      workspace.pndAxes.forEach((ax, idx) => {
        const hasData = ax && (ax.nombre?.trim() || ax.resumen?.trim() || ax.relacionAni?.trim() || ax.oportunidades?.trim());
        if (!hasData) return;
        const num = ax.numero || idx + 1;
        extra.push({
          id: `PND-EJE-${num}`,
          docTitle: `Plan Nacional de Desarrollo — Eje ${num}`,
          section: ax.nombre?.trim() || `Eje ${num} (título pendiente)`,
          sourceFile: 'Sesión activa · Módulo PND 7 Ejes',
          lineRange: ax.cita?.trim() || 'Cita pendiente',
          authorityStatus: ax.estatus || 'en_construccion',
          tags: ['PND', `Eje ${num}`, ax.foco || ''].filter(Boolean),
          content: [
            `Eje PND #${num}: ${ax.nombre || 'Por definir'}`,
            `Mandatos / contenido clave: ${ax.resumen || 'Pendiente'}`,
            `Tipo de competencia ANI: ${ax.competenciaTipo || 'Por definir'}`,
            `Foco estratégico vinculado: ${ax.foco || 'Por definir'}`,
            `Relación con la ANI: ${ax.relacionAni || 'Pendiente'}`,
            `Oportunidades identificadas: ${ax.oportunidades || 'Pendiente'}`,
            `Cita / evidencia documental: ${ax.cita || 'Sin cita registrada'}`
          ].join('\n')
        });
      });
    }

    // 3. Cuatro hojas documentales base (PND, Chocó Renace, Ministra, Destrabe)
    const docLabels = {
      pnd: 'Plan Nacional de Desarrollo (Ficha Documental)',
      choco: 'Plan Chocó Renace',
      ministra: 'Discursos de la Ministra de Transporte',
      destrabe: 'Plan Destrabe'
    };
    if (workspace.docs && typeof workspace.docs === 'object') {
      for (const [key, doc] of Object.entries(workspace.docs)) {
        if (!doc) continue;
        const hasData = doc.titulo?.trim() || doc.resumen?.trim() || doc.relacion?.trim() ||
          (doc.puntos || []).some((x) => x?.trim()) || (doc.contribuciones || []).some((x) => x?.trim());
        if (!hasData) continue;
        extra.push({
          id: `FICHA-${key.toUpperCase()}`,
          docTitle: doc.titulo?.trim() || docLabels[key] || key,
          section: `Análisis documental y relación ANI (${doc.fecha || 'vigencia pendiente'})`,
          sourceFile: `Sesión activa · Biblioteca (${docLabels[key] || key})`,
          lineRange: doc.evidencia?.trim() || 'Evidencia pendiente',
          authorityStatus: 'en_construccion',
          tags: ['Documentos', key.toUpperCase(), doc.foco || ''].filter(Boolean),
          content: [
            `Documento: ${doc.titulo || docLabels[key] || key}`,
            `Emisor: ${doc.emisor || 'No registrado'} | Fecha: ${doc.fecha || 'No registrada'}`,
            `Resumen principal: ${doc.resumen || 'Pendiente'}`,
            `Puntos principales: ${(doc.puntos || []).filter(Boolean).join('; ') || 'Ninguno'}`,
            `Tipo relación ANI: ${doc.relacionTipo || 'Por definir'} | Foco: ${doc.foco || 'Por definir'}`,
            `Relación ANI: ${doc.relacion || 'Pendiente'}`,
            `Contribuciones ANI: ${(doc.contribuciones || []).filter(Boolean).join('; ') || 'Ninguna'}`,
            `Evidencia / cita: ${doc.evidencia || 'Pendiente'}`,
            `Información insuficiente / pendientes: ${doc.pendiente || 'No especificado'}`
          ].join('\n')
        });
      }
    }

    // 4. Documentos adicionales cargados en la biblioteca del navegador
    if (Array.isArray(workspace.customDocs)) {
      workspace.customDocs.slice(0, 30).forEach((cd, idx) => {
        if (!cd?.contenido?.trim()) return;
        extra.push({
          id: `BIBLIO-${idx + 1}`,
          docTitle: cd.titulo?.trim() || `Documento adicional ${idx + 1}`,
          section: cd.fuente?.trim() || 'Documento incorporado por el usuario',
          sourceFile: `Sesión activa · Biblioteca (${cd.nombreArchivo || 'manual'})`,
          lineRange: cd.cita?.trim() || cd.fecha || 'Registro usuario',
          authorityStatus: cd.estatus || 'en_construccion',
          tags: ['Biblioteca', cd.foco || '', cd.categoria || ''].filter(Boolean),
          content: String(cd.contenido).slice(0, 4000)
        });
      });
    }

    // 5. Oportunidades estratégicas
    if (Array.isArray(workspace.opportunities) && workspace.opportunities.length) {
      const oppLines = workspace.opportunities.slice(0, 40).map((o, i) =>
        `${i + 1}. [${o.foco || 'Sin foco'}] ${o.titulo || 'Sin título'} | Eje PND: ${o.ejePnd || '—'} | Modo/Frente: ${o.modo || '—'} | Competencia: ${o.competencia || '—'} | Estado: ${o.estatus || 'en_construccion'} | Detalle: ${o.descripcion || '—'} | Cita: ${o.evidencia || '—'}`
      );
      extra.push({
        id: 'SESION-OPORTUNIDADES',
        docTitle: 'Matriz de Oportunidades Estratégicas (Sesión)',
        section: `${workspace.opportunities.length} oportunidades registradas`,
        sourceFile: 'Sesión activa · Módulo Oportunidades',
        lineRange: 'Registro activo',
        authorityStatus: 'en_construccion',
        tags: ['Oportunidades', 'PND', 'F1', 'F2'],
        content: oppLines.join('\n')
      });
    }

    // 6. Cartera PEI
    if (Array.isArray(workspace.projects) && workspace.projects.length) {
      const projLines = workspace.projects.slice(0, 50).map((p, i) =>
        `${i + 1}. [${p.foco || 'Sin foco'}] Proyecto: "${p.proyecto || 'Sin nombre'}" | Objetivo: ${p.objetivo || 'Pendiente'} | Unidad: ${p.unidad || 'Pendiente'} | Línea base: ${p.lineaBase || 'Pendiente'} | Meta 2030: ${p.meta || 'Por definir'} | Doble llave: ${p.doble || 'No declarada'} | Eje PND: ${p.ejePnd || '—'} | Modo: ${p.modo || '—'} | Estatus: ${p.estatus || 'en_construccion'} | Detalle: ${p.detalle || '—'}`
      );
      extra.push({
        id: 'SESION-CARTERA-PEI',
        docTitle: 'Cartera de Proyectos PEI 2027–2030 (Sesión)',
        section: `${workspace.projects.length} proyectos en cartera de trabajo`,
        sourceFile: 'Sesión activa · Módulo Cartera PEI',
        lineRange: 'Tabla PEI activa',
        authorityStatus: 'en_construccion',
        tags: ['PEI', 'Proyectos', 'F1', 'F2', 'Cartera', 'Meta 2030'],
        content: projLines.join('\n')
      });
    }

    // 7. Plan de Acción
    if (Array.isArray(workspace.actionPlan) && workspace.actionPlan.length) {
      const paLines = workspace.actionPlan.slice(0, 60).map((a, i) =>
        `${i + 1}. [${a.foco || '—'}] Actividad: "${a.actividad || 'Sin nombre'}" | Proyecto PEI: ${a.proyectoNombre || a.proyectoId || 'Sin vincular'} | Entregable: ${a.entregable || '—'} | Indicador: ${a.indicador || '—'} (${a.unidad || '—'}) | Metas 2027-2030: ${a.m2027 || '—'}/${a.m2028 || '—'}/${a.m2029 || '—'}/${a.m2030 || '—'} | Responsable: ${a.responsable || '—'} | Recursos: ${a.presupuesto || 'Por definir'} | Estado: ${a.estado || 'Formulada'}`
      );
      extra.push({
        id: 'SESION-PLAN-ACCION',
        docTitle: 'Plan de Acción Institucional 2027–2030 (Sesión)',
        section: `${workspace.actionPlan.length} actividades programadas`,
        sourceFile: 'Sesión activa · Módulo Plan de Acción',
        lineRange: 'Matriz Plan de Acción',
        authorityStatus: 'en_construccion',
        tags: ['Plan de Acción', 'Actividades', 'PEI', 'Cronograma'],
        content: paLines.join('\n')
      });
    }

    return extra;
  }

  /**
   * Búsqueda Okapi BM25 con refuerzo semántico por título, sección y etiquetas
   */
  search(query, { workspace = null, topK = 8, filterTag = '' } = {}) {
    const extra = this.buildWorkspaceChunks(workspace);
    let corpus = [...this.repoChunks, ...extra];
    if (filterTag) {
      const normFilter = normalizeText(filterTag);
      corpus = corpus.filter((c) =>
        c.tags.some((t) => normalizeText(t).includes(normFilter)) ||
        normalizeText(c.docTitle).includes(normFilter)
      );
    }
    if (!corpus.length) return [];

    const qTokens = tokenize(query);
    if (!qTokens.length) {
      return corpus.slice(0, topK).map((c) => ({ ...c, score: 1 }));
    }

    const docsTokens = corpus.map((c) => {
      const headerTokens = tokenize(`${c.id} ${c.docTitle} ${c.section} ${(c.tags || []).join(' ')}`);
      const bodyTokens = tokenize(c.content);
      // Ponderar título/sección x2
      const combined = [...headerTokens, ...headerTokens, ...bodyTokens];
      const freq = new Map();
      for (const t of combined) freq.set(t, (freq.get(t) || 0) + 1);
      return { len: combined.length || 1, freq };
    });

    const N = corpus.length;
    const avgdl = docsTokens.reduce((sum, d) => sum + d.len, 0) / N;
    const df = new Map();
    for (const qt of new Set(qTokens)) {
      let count = 0;
      for (const d of docsTokens) {
        if (d.freq.has(qt)) count += 1;
      }
      df.set(qt, count);
    }

    const k1 = 1.5;
    const b = 0.75;
    const scored = corpus.map((chunk, idx) => {
      const d = docsTokens[idx];
      let score = 0;
      for (const qt of qTokens) {
        const tf = d.freq.get(qt) || 0;
        if (!tf) continue;
        const n = df.get(qt) || 0;
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        const num = tf * (k1 + 1);
        const den = tf + k1 * (1 - b + b * (d.len / avgdl));
        score += idf * (num / den);
      }
      // Coincidencia exacta de frase corta
      const normQ = normalizeText(query);
      if (normQ.length >= 4 && normalizeText(`${chunk.section} ${chunk.content}`).includes(normQ)) {
        score += 2.2;
      }
      return { ...chunk, score: Number(score.toFixed(4)) };
    });

    const hits = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
    return hits.slice(0, topK);
  }

  getAllChunksMap(workspace = null) {
    const map = new Map();
    for (const c of [...this.repoChunks, ...this.buildWorkspaceChunks(workspace)]) {
      map.set(c.id, c);
    }
    return map;
  }

  /**
   * Auditoría institucional de trazabilidad basada en las reglas R1–R6 del Marco Estratégico
   */
  auditWorkspace(workspace = {}) {
    const findings = [];
    const projects = Array.isArray(workspace.projects) ? workspace.projects : [];
    const actionPlan = Array.isArray(workspace.actionPlan) ? workspace.actionPlan : [];
    const pndAxes = Array.isArray(workspace.pndAxes) ? workspace.pndAxes : [];
    const identity = workspace.identity || {};
    const docs = workspace.docs || {};

    // Identidad institucional
    if (!identity.mision?.trim() || !identity.vision?.trim()) {
      findings.push({
        severity: 'warn',
        rule: 'Brecha §2.3',
        citation: 'MARCO-S2.3',
        title: 'Misión y/o Visión oficial ANI pendientes de carga',
        detail: 'El marco base señala Misión, Visión y Objetivos vigentes como información insuficiente para concluir hasta cargar el acto o documento oficial.'
      });
    }

    // 7 Ejes PND
    const filledAxes = pndAxes.filter((a) => a?.nombre?.trim() && a?.relacionAni?.trim()).length;
    if (filledAxes < 7) {
      findings.push({
        severity: 'warn',
        rule: 'Trazabilidad PND',
        citation: 'MARCO-S1',
        title: `Ejes del PND documentados: ${filledAxes} de 7`,
        detail: `Faltan ${7 - filledAxes} ejes del PND por completar con nombre oficial, relación con competencias ANI y cita verificable.`
      });
    } else {
      findings.push({
        severity: 'ok',
        rule: 'Trazabilidad PND',
        citation: 'MARCO-S1',
        title: 'Los 7 Ejes del PND cuentan con análisis de relación ANI',
        detail: 'Todos los ejes tienen título y análisis de articulación registrados.'
      });
    }

    // 4 hojas documentales
    const docKeys = ['pnd', 'choco', 'ministra', 'destrabe'];
    const completedDocs = docKeys.filter((k) => {
      const d = docs[k];
      return d && d.resumen?.trim()?.length >= 20 && d.relacion?.trim()?.length >= 20;
    }).length;
    if (completedDocs < 4) {
      findings.push({
        severity: 'info',
        rule: 'Biblioteca Base',
        citation: 'GUIA-APP-S1',
        title: `Fichas documentales completadas: ${completedDocs} de 4`,
        detail: 'Revise las hojas PND, Plan Chocó Renace, Discursos Ministra y Plan Destrabe con evidencia/cita.'
      });
    }

    // Cartera PEI — R1, R2, R3, R4, R6
    if (projects.length === 0) {
      findings.push({
        severity: 'warn',
        rule: 'R1 · Cartera PEI',
        citation: 'MARCO-S4',
        title: 'La Cartera PEI 2027–2030 aún no tiene proyectos registrados',
        detail: 'Registre proyectos cumpliendo las 6 columnas contractuales (Foco, Objetivo, Proyecto, Unidad, Meta 2030, Detalle).'
      });
    } else {
      const f1Count = projects.filter((p) => p.foco === 'F1').length;
      const f2Count = projects.filter((p) => p.foco === 'F2').length;

      if (f1Count > 0 && f2Count === 0) {
        findings.push({
          severity: 'bad',
          rule: 'R3 · Doble Llave F1↔F2',
          citation: 'MARCO-S1',
          title: 'Desbalance crítico: hay proyectos F1 pero ningún proyecto F2',
          detail: 'Regla del Marco Estratégico: "Foco 1 sin Foco 2 = obra bloqueada". Incorpore proyectos de ruta social y prevención de conflictos.'
        });
      } else if (f2Count > 0 && f1Count === 0) {
        findings.push({
          severity: 'bad',
          rule: 'R3 · Doble Llave F1↔F2',
          citation: 'MARCO-S1',
          title: 'Desbalance crítico: hay proyectos F2 pero ningún proyecto F1',
          detail: 'Regla del Marco Estratégico: "Foco 2 sin Foco 1 = gestión sin resultado físico".'
        });
      }

      projects.forEach((p, idx) => {
        const label = p.proyecto?.trim() || `Proyecto #${idx + 1}`;
        const missingCols = [];
        if (!['F1', 'F2'].includes(p.foco)) missingCols.push('Foco (F1/F2)');
        if (!p.objetivo?.trim()) missingCols.push('Objetivo Estratégico');
        if (!p.proyecto?.trim()) missingCols.push('Nombre de Proyecto');
        if (!p.unidad?.trim()) missingCols.push('Unidad de Medida');
        if (!p.meta?.trim()) missingCols.push('Meta 2030');
        if (!p.detalle?.trim()) missingCols.push('Detalle');

        if (missingCols.length) {
          findings.push({
            severity: 'bad',
            rule: 'R1 · 6 Columnas PEI',
            citation: 'MARCO-S5.1',
            title: `"${label}" tiene columnas obligatorias vacías`,
            detail: `Falta diligenciar: ${missingCols.join(', ')}. Sin las 6 columnas no entra al PEI.`
          });
        }

        if (!p.doble?.trim()) {
          findings.push({
            severity: 'warn',
            rule: 'R3 · Doble Llave',
            citation: 'MARCO-S4',
            title: `"${label}" no declara su Doble Llave F1↔F2`,
            detail: 'Todo proyecto F1 debe declarar su gestión social F2 asociada y todo proyecto F2 su proyecto físico asociado.'
          });
        }

        // R6: Meta numérica fijada sin línea base
        const hasNumericMeta = /\d/.test(p.meta || '') && !/por definir|pendiente|insuficiente/i.test(p.meta || '');
        const lacksBaseline = !p.lineaBase?.trim() || /pendiente|insuficiente|por definir/i.test(p.lineaBase || '');
        if (hasNumericMeta && lacksBaseline) {
          findings.push({
            severity: 'bad',
            rule: 'R6 · Línea Base Previa',
            citation: 'MARCO-S3.6',
            title: `"${label}" fija meta numérica sin línea base verificada`,
            detail: 'Regla §5.1 y R6: No fije meta numérica 2030 sin línea base. Marque "Por definir — línea base pendiente" hasta levantar el dato oficial.'
          });
        }

        // R2: Alerta de delimitación de competencia en infraestructura social/productiva
        if (p.foco === 'F1' && (/social|productiv/i.test(p.modo || '') || /infraestructura social|infraestructura productiva/i.test(p.detalle || ''))) {
          findings.push({
            severity: 'warn',
            rule: 'R2 · Competencia ANI',
            citation: 'MARCO-S2.2',
            title: `"${label}" requiere validación jurídica de competencia (R2)`,
            detail: 'Involucra infraestructura social/productiva: verifique por escrito el criterio jurídico que habilita la competencia de la ANI para evitar desbordamiento.'
          });
        }

        // Vínculo con Plan de Acción
        const linkedActions = actionPlan.filter((a) => a.proyectoId === p.id);
        if (linkedActions.length === 0) {
          findings.push({
            severity: 'info',
            rule: 'Despliegue PEI → PA',
            citation: 'MARCO-S3.7',
            title: `"${label}" aún no tiene actividades en el Plan de Acción`,
            detail: 'Desagregue el proyecto en actividades anualizadas (2027–2030) con responsable e indicador de gestión.'
          });
        }
      });

      // R4: Cobertura de las 5 capacidades de F2
      const requiredCaps = ['Social', 'Jurídica', 'Ambiental', 'Predial', 'Tecnológica'];
      const textF2 = projects
        .filter((p) => p.foco === 'F2')
        .map((p) => `${p.detalle || ''} ${(p.criterios || []).join(' ')}`)
        .join(' ');
      const missingCaps = requiredCaps.filter((cap) => !normalizeText(textF2).includes(normalizeText(cap)));
      if (f2Count > 0 && missingCaps.length > 0) {
        findings.push({
          severity: 'info',
          rule: 'R4 · 5 Capacidades F2',
          citation: 'MARCO-S2.2',
          title: `Brechas de capacidad F2 sin cobertura explícita: ${missingCaps.join(', ')}`,
          detail: 'El Foco 2 exige fortalecer 5 capacidades: social, jurídica, ambiental, predial y tecnológica.'
        });
      }
    }

    // Actividades huérfanas en Plan de Acción
    const orphanActions = actionPlan.filter((a) => !a.proyectoId && !a.proyectoNombre?.trim());
    if (orphanActions.length > 0) {
      findings.push({
        severity: 'warn',
        rule: 'Trazabilidad PA',
        citation: 'MARCO-S4',
        title: `${orphanActions.length} actividad(es) del Plan de Acción sin proyecto PEI vinculado`,
        detail: 'Toda actividad del Plan de Acción debe responder a un proyecto estratégico del PEI y a un Foco (F1 o F2).'
      });
    }

    const summary = {
      critical: findings.filter((f) => f.severity === 'bad').length,
      warnings: findings.filter((f) => f.severity === 'warn').length,
      info: findings.filter((f) => f.severity === 'info').length,
      passed: findings.filter((f) => f.severity === 'ok').length,
      projectsCount: projects.length,
      actionPlanCount: actionPlan.length,
      pndAxesFilled: filledAxes
    };

    return { summary, findings, auditedAt: new Date().toISOString() };
  }
}
