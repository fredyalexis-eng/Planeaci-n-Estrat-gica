/**
 * ANI STRATEGY LAB — Prompts institucionales, guardrails y validación de propuestas
 */

export const AGENT_MODES = {
  consulta: {
    label: 'Consulta documental trazable',
    instruction: 'Responde la consulta utilizando exclusivamente la evidencia contenida en los fragmentos documentales entregados. Cita cada afirmación con su código entre corchetes, por ejemplo [MARCO-S2.1]. Si un dato no figura en el acervo, indícalo expresamente como "Información insuficiente en el acervo documental cargado para concluir".'
  },
  analisis: {
    label: 'Análisis de documentos y proyectos',
    instruction: 'Analiza rigurosamente los documentos o proyectos consultados identificando coherencia con Foco 1 y Foco 2, solapes potenciales, cumplimiento de las 6 columnas PEI, estado de líneas base, riesgos y vacíos de información. Sustenta cada hallazgo con citas [ID].'
  },
  pnd_ani: {
    label: 'Cruce PND (7 Ejes) ↔ Competencias ANI',
    instruction: 'Relaciona las iniciativas o ejes del PND disponibles en el contexto con las competencias de la ANI (modos carretero, férreo, fluvial, portuario y aeroportuario, más infraestructura social/productiva cuando corresponda aplicando estrictamente la Recomendación R2 de delimitación de competencia) y con la ruta social preventiva (F2). No inventes contenidos de ejes del PND que estén vacíos.'
  },
  oportunidades: {
    label: 'Identificación de oportunidades estratégicas',
    instruction: 'Identifica oportunidades estratégicas concretas para la ANI 2027–2030 articulando Foco 1 y Foco 2, señalando justificación, beneficio esperado, riesgo de competencia o territorial y cita documental [ID]. Incluye al final un bloque <ani_proposals> con oportunidades estructuradas etiquetadas como propuesta no aprobada.'
  },
  recomendaciones: {
    label: 'Formulación de recomendaciones ejecutivas',
    instruction: 'Formula recomendaciones ejecutivas accionables (distinguiendo qué proviene de R1–R6 del Marco Estratégico y qué es recomendación analítica nueva sujeta a validación), con justificación, beneficio esperado, riesgo asociado, prioridad, horizonte (corto 2027, mediano 2028–2029, largo 2030) y referencias [ID].'
  },
  propuesta_pei: {
    label: 'Propuesta de proyectos para el PEI 2027–2030',
    instruction: 'Formula propuestas técnicas de proyectos para el PEI 2027–2030 cumpliendo las reglas R1, R2, R3 y R6: 1 Foco único (F1 o F2), Objetivo Estratégico (si no hay oficial cargado, escribir "Información insuficiente para concluir — levantar objetivo vigente ANI"), nombre verificable, unidad única, Meta 2030 marcada como "Por definir — línea base pendiente" si no existe línea base verificada, detalle con los 6 criterios F1 o 5 capacidades F2, y Doble Llave F1↔F2. Incluye al final un bloque <ani_proposals> con los proyectos propuestos como BORRADOR NO APROBADO.'
  },
  propuesta_pa: {
    label: 'Propuesta de actividades para el Plan de Acción',
    instruction: 'Formula propuestas de actividades concretas para el Plan de Acción 2027–2030 vinculadas a Foco 1 o Foco 2 y a los proyectos PEI disponibles, indicando entregable, indicador de gestión, unidad, hitos orientativos 2027–2030 ("Por definir" cuando dependa de línea base o presupuesto), rol responsable y riesgos. Incluye al final un bloque <ani_proposals> con las actividades propuestas como BORRADOR NO APROBADO.'
  },
  auditoria: {
    label: 'Auditoría de trazabilidad y Doble Llave',
    instruction: 'Evalúa la calidad técnica y trazabilidad de la cartera PEI, los ejes PND y el Plan de Acción frente a las recomendaciones R1–R6 y el checklist de validación [MARCO-S5.4]. Prioriza las correcciones críticas antes de aprobar filas.'
  }
};

export function buildSystemPrompt(mode = 'consulta') {
  const modeSpec = AGENT_MODES[mode] || AGENT_MODES.consulta;
  return `Eres el AGENTE DE INTELIGENCIA ESTRATÉGICA de ANI STRATEGY LAB, al servicio de la planeación estratégica 2027–2030 de la Agencia Nacional de Infraestructura de Colombia (ANI).

REGLAS INSTITUCIONALES INQUEBRANTABLES:
1. VERACIDAD Y NO INVENCIÓN: Jamás inventes datos oficiales, misiones, visiones, objetivos vigentes, títulos de ejes del PND no cargados, líneas base, presupuestos, cifras ni metas 2030. Todo dato ausente en el contexto documental debe declararse textualmente como "Información insuficiente en el acervo documental cargado para concluir".
2. TRAZABILIDAD OBLIGATORIA: Toda afirmación documental o metodológica debe incluir su referencia exacta entre corchetes usando únicamente los IDs suministrados en el CONTEXTO DOCUMENTAL (ejemplo: [MARCO-S2.1], [MARCO-S4], [PND-EJE-1], [SESION-CARTERA-PEI]). Nunca inventes IDs de cita.
3. DISTINCIÓN ESTATUS OFICIAL VS. PROPUESTA: Nunca presentes propuestas, inferencias ni borradores como decisiones aprobadas por la ANI. Etiqueta explícitamente toda propuesta como "Propuesta técnica sujeta a validación institucional ANI".
4. ARQUITECTURA PEI 2027–2030: Respeta la doble llave estratégica: Foco 1 (Infraestructura dinamizadora para la conectividad y el desarrollo — 6 criterios: seguridad vial, accesibilidad, resiliencia climática, sostenibilidad, innovación, gestión social) y Foco 2 (Ruta social y gestión preventiva de conflictos — 5 capacidades: social, jurídica, ambiental, predial, tecnológica). Aplica la delimitación jurídica de competencia en infraestructura social/productiva (R2).
5. TONO: Español institucional colombiano, ejecutivo, riguroso, claro, estructurado con subtítulos y viñetas concisas.

MODO ACTIVO: ${modeSpec.label}
INSTRUCCIÓN ESPECÍFICA: ${modeSpec.instruction}

FORMATO OPCIONAL DE PROPUESTAS ACCIONABLES:
Solo cuando el modo o el usuario pida proponer proyectos PEI, actividades del Plan de Acción u oportunidades estratégicas, añade al final de tu respuesta un bloque JSON válido delimitado por <ani_proposals> y </ani_proposals> con esta estructura exacta (deja arrays vacíos si no aplica):
<ani_proposals>
{
  "peiProjects": [
    {
      "foco": "F1",
      "objetivo": "Información insuficiente para concluir — levantar objetivo vigente ANI",
      "proyecto": "Nombre técnico verificable",
      "unidad": "km | % | casos | proyectos",
      "lineaBase": "Información insuficiente para concluir",
      "meta": "Por definir — línea base pendiente",
      "modo": "Carretero | Férreo | Fluvial | Portuario | Aeroportuario | Ruta social",
      "ejePnd": "Por vincular",
      "doble": "Proyecto F2/F1 complementario requerido",
      "detalle": "Contribución al foco, criterios F1 o capacidades F2, supuestos y riesgos.",
      "citations": ["MARCO-S2.1"]
    }
  ],
  "actionItems": [
    {
      "foco": "F2",
      "proyectoNombre": "Proyecto PEI asociado",
      "actividad": "Descripción concreta de la actividad",
      "entregable": "Producto verificable",
      "indicador": "Nombre del indicador de gestión",
      "unidad": "Unidad única",
      "responsable": "Rol o dependencia sugerida",
      "m2027": "Hito 2027 (por validar)",
      "m2028": "Hito 2028 (por validar)",
      "m2029": "Hito 2029 (por validar)",
      "m2030": "Hito 2030 (por validar)",
      "presupuesto": "Por definir — restricción presupuestal pendiente",
      "riesgo": "Riesgo principal y mitigación",
      "citations": ["MARCO-S3.7"]
    }
  ],
  "opportunities": [
    {
      "foco": "F1",
      "titulo": "Título de la oportunidad estratégica",
      "ejePnd": "Eje PND o iniciativa asociada",
      "modo": "Modo o capacidad asociada",
      "competencia": "Competencia directa | Articulación | Validar R2",
      "descripcion": "Justificación, beneficio esperado y condición de viabilidad.",
      "evidencia": "Referencia documental",
      "citations": ["MARCO-S4"]
    }
  ]
}
</ani_proposals>`;
}

export function buildContextPrompt(userQuestion, retrievedChunks, auditSummary = null) {
  const formattedChunks = retrievedChunks.length
    ? retrievedChunks.map((c) => (
        `--- FUENTE [${c.id}] ---\n` +
        `Documento: ${c.docTitle}\n` +
        `Sección: ${c.section}\n` +
        `Origen: ${c.sourceFile} (${c.lineRange}) | Estatus: ${c.authorityStatus}\n` +
        `Contenido:\n${c.content}\n`
      )).join('\n')
    : 'No se hallaron fragmentos con coincidencia directa en el acervo.';

  const auditBlock = auditSummary
    ? `\nESTADO RESUMIDO DE AUDITORÍA DE LA SESIÓN:\n` +
      `- Proyectos PEI: ${auditSummary.summary.projectsCount} | Actividades Plan de Acción: ${auditSummary.summary.actionPlanCount} | Ejes PND diligenciados: ${auditSummary.summary.pndAxesFilled}/7\n` +
      `- Hallazgos críticos: ${auditSummary.summary.critical} | Alertas: ${auditSummary.summary.warnings}\n` +
      auditSummary.findings.slice(0, 8).map((f) => `  * [${f.rule}] ${f.title}: ${f.detail} (Ref: [${f.citation}])`).join('\n') + '\n'
    : '';

  return `CONTEXTO DOCUMENTAL VERIFICADO DE ANI STRATEGY LAB:\n\n${formattedChunks}${auditBlock}\n---\nCONSULTA DEL USUARIO:\n${userQuestion}`;
}

/**
 * Extrae y valida propuestas estructuradas y verifica las citas contra el índice real
 */
export function parseAndVerifyAgentOutput(rawText, validChunksMap) {
  let cleanText = String(rawText || '');
  let proposals = { peiProjects: [], actionItems: [], opportunities: [] };

  const match = cleanText.match(/<ani_proposals>([\s\S]*?)<\/ani_proposals>/i);
  if (match) {
    cleanText = cleanText.replace(match[0], '').trim();
    try {
      const parsed = JSON.parse(match[1].trim());
      if (Array.isArray(parsed?.peiProjects)) {
        proposals.peiProjects = parsed.peiProjects.slice(0, 6).map((p) => ({
          foco: p?.foco === 'F2' ? 'F2' : 'F1',
          objetivo: String(p?.objetivo || 'Información insuficiente para concluir — levantar objetivo vigente ANI').slice(0, 400),
          proyecto: String(p?.proyecto || 'Propuesta de proyecto (por nombrar)').slice(0, 240),
          unidad: String(p?.unidad || 'Por definir').slice(0, 80),
          lineaBase: String(p?.lineaBase || 'Información insuficiente para concluir').slice(0, 200),
          meta: String(p?.meta || 'Por definir — línea base pendiente').slice(0, 200),
          modo: String(p?.modo || '').slice(0, 100),
          ejePnd: String(p?.ejePnd || '').slice(0, 120),
          doble: String(p?.doble || '').slice(0, 300),
          detalle: String(p?.detalle || '').slice(0, 1500),
          estatus: 'propuesta_ia',
          citations: (Array.isArray(p?.citations) ? p.citations : []).filter((id) => validChunksMap.has(id))
        }));
      }
      if (Array.isArray(parsed?.actionItems)) {
        proposals.actionItems = parsed.actionItems.slice(0, 8).map((a) => ({
          foco: a?.foco === 'F2' ? 'F2' : 'F1',
          proyectoNombre: String(a?.proyectoNombre || '').slice(0, 240),
          actividad: String(a?.actividad || 'Actividad propuesta').slice(0, 300),
          entregable: String(a?.entregable || '').slice(0, 240),
          indicador: String(a?.indicador || '').slice(0, 240),
          unidad: String(a?.unidad || 'Por definir').slice(0, 80),
          responsable: String(a?.responsable || 'Por asignar').slice(0, 140),
          m2027: String(a?.m2027 || 'Por definir').slice(0, 140),
          m2028: String(a?.m2028 || 'Por definir').slice(0, 140),
          m2029: String(a?.m2029 || 'Por definir').slice(0, 140),
          m2030: String(a?.m2030 || 'Por definir').slice(0, 140),
          presupuesto: String(a?.presupuesto || 'Por definir — restricción presupuestal pendiente').slice(0, 160),
          riesgo: String(a?.riesgo || '').slice(0, 400),
          estado: 'Propuesta IA — No aprobada',
          citations: (Array.isArray(a?.citations) ? a.citations : []).filter((id) => validChunksMap.has(id))
        }));
      }
      if (Array.isArray(parsed?.opportunities)) {
        proposals.opportunities = parsed.opportunities.slice(0, 8).map((o) => ({
          foco: o?.foco === 'F2' ? 'F2' : 'F1',
          titulo: String(o?.titulo || 'Oportunidad propuesta').slice(0, 240),
          ejePnd: String(o?.ejePnd || '').slice(0, 140),
          modo: String(o?.modo || '').slice(0, 120),
          competencia: String(o?.competencia || 'Por validar').slice(0, 120),
          descripcion: String(o?.descripcion || '').slice(0, 1200),
          evidencia: String(o?.evidencia || '').slice(0, 300),
          estatus: 'propuesta_ia',
          citations: (Array.isArray(o?.citations) ? o.citations : []).filter((id) => validChunksMap.has(id))
        }));
      }
    } catch {
      // Si el bloque JSON viniera malformado, se ignora sin romper la respuesta
    }
  }

  // Extraer y verificar citas [ID] mencionadas en el texto
  const citedIds = new Set();
  const unverifiedIds = new Set();
  const citeRegex = /\[([A-Z0-9][A-Z0-9._-]{2,40})\]/g;
  let m;
  while ((m = citeRegex.exec(cleanText)) !== null) {
    const id = m[1];
    if (validChunksMap.has(id)) {
      citedIds.add(id);
    } else {
      unverifiedIds.add(id);
    }
  }

  const verifiedCitations = [...citedIds].map((id) => {
    const c = validChunksMap.get(id);
    return {
      id: c.id,
      docTitle: c.docTitle,
      section: c.section,
      sourceFile: c.sourceFile,
      lineRange: c.lineRange,
      authorityStatus: c.authorityStatus,
      excerpt: c.content.slice(0, 420) + (c.content.length > 420 ? '…' : '')
    };
  });

  return {
    answer: cleanText,
    verifiedCitations,
    unverifiedCitationTags: [...unverifiedIds],
    proposals
  };
}
