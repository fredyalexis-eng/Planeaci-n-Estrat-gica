/**
 * ANI STRATEGY LAB — Catálogo Estratégico y Base Documental Verificada
 *
 * Fuente estricta: Archivos existentes del repositorio
 *   - 01_Marco_Estrategico_ANI_2027-2030.md
 *   - 02_Plantilla_Ejercicio_PEI_2027-2030.csv
 *   - 03_Canvas_2_Focos_ANI.html
 *   - 04_App_Interactiva_ANI.md
 *
 * Regla de oro: Cero contenidos institucionales inventados. Todo dato ausente
 * queda expresamente identificado como pendiente de carga oficial ANI.
 */

export const STORAGE_KEY = 'ani_pei_2027_2030_v1';

export const STATUS_LABELS = {
  marco_repositorio: { label: 'Marco Base (Repositorio)', cls: 'badge-navy' },
  oficial_ani: { label: 'Oficial ANI (Verificado)', cls: 'badge-ok' },
  validado_taller: { label: 'Validado en Taller', cls: 'badge-teal' },
  en_construccion: { label: 'En Construcción', cls: 'badge-slate' },
  propuesta_ia: { label: 'Propuesta IA — No aprobada', cls: 'badge-ai' },
  ejemplo_ilustrativo: { label: 'Ejemplo Ilustrativo — No es dato ANI', cls: 'badge-warn' },
  pendiente: { label: 'Pendiente de carga oficial', cls: 'badge-warn' }
};

export const FOCOS = {
  F1: {
    code: 'F1',
    shortName: 'Infraestructura dinamizadora',
    fullName: 'Infraestructura dinamizadora para la conectividad y el desarrollo',
    role: 'Oferta multimodal · Foco de portafolio',
    color: 'teal',
    citation: 'MARCO-S2.1',
    description:
      'Portafolio integrado de infraestructura carretera, férrea, fluvial, portuaria y aeroportuaria — así como infraestructura social y productiva cuando corresponda dentro de sus competencias. Orientado a completar corredores estratégicos, eliminar cuellos de botella, mejorar accesos, articular modos y modernizar activos existentes.',
    implication:
      'Es un foco de portafolio, no de obra aislada. Exige criterio jurídico escrito de delimitación de competencia para infraestructura social y productiva (Recomendación R2).',
    modos: [
      'Carretero',
      'Férreo',
      'Fluvial',
      'Portuario',
      'Aeroportuario',
      'Infraestructura social/productiva (condicionada — R2)'
    ],
    tagLabel: 'Criterios transversales obligatorios (6)',
    tags: [
      'Seguridad vial',
      'Accesibilidad',
      'Resiliencia climática',
      'Sostenibilidad ambiental',
      'Innovación',
      'Gestión social'
    ]
  },
  F2: {
    code: 'F2',
    shortName: 'Ruta social y prevención de conflictos',
    fullName: 'Ruta social y gestión preventiva de conflictos',
    role: 'Viabilidad territorial · Foco habilitador',
    color: 'amber',
    citation: 'MARCO-S2.1',
    description:
      'Ruta social basada en diálogo, confianza, participación y beneficios compartidos. Modelo preventivo sustentado en alertas tempranas, conocimiento territorial, diálogo permanente y resolución oportuna de controversias, fortaleciendo las capacidades institucionales.',
    implication:
      'Es un foco de viabilidad. Su resultado esperado: menos conflictos territoriales, menos demandas contra el Estado y protección efectiva de los recursos públicos.',
    modos: [
      'Gestión social y diálogo',
      'Alertas tempranas territoriales',
      'Gestión jurídica preventiva',
      'Gestión ambiental',
      'Gestión predial',
      'Capacidad tecnológica y datos'
    ],
    tagLabel: 'Capacidades institucionales por fortalecer (5 brechas)',
    tags: [
      'Social',
      'Jurídica',
      'Ambiental',
      'Predial',
      'Tecnológica'
    ]
  }
};

export const COMPETENCE_MODES = [
  {
    id: 'carretero',
    modo: 'Carretero',
    foco: 'F1',
    alcanceMarco: 'Completar corredores estratégicos, eliminar cuellos de botella, mejorar accesos y modernizar activos con los 6 criterios transversales.',
    riesgoR2: 'Estándar misional',
    citation: 'MARCO-S2.1'
  },
  {
    id: 'ferreo',
    modo: 'Férreo',
    foco: 'F1',
    alcanceMarco: 'Integración al portafolio multimodal, articulación intermodal y modernización de corredores y activos.',
    riesgoR2: 'Estándar misional',
    citation: 'MARCO-S2.1'
  },
  {
    id: 'fluvial',
    modo: 'Fluvial',
    foco: 'F1',
    alcanceMarco: 'Articulación dentro del portafolio integrado multimodal para conectividad y desarrollo territorial.',
    riesgoR2: 'Verificar alcance con entidades del sector',
    citation: 'MARCO-S2.1'
  },
  {
    id: 'portuario',
    modo: 'Portuario',
    foco: 'F1',
    alcanceMarco: 'Mejora de accesos, eliminación de cuellos de botella logísticos, articulación modal y resiliencia climática.',
    riesgoR2: 'Estándar misional',
    citation: 'MARCO-S2.1'
  },
  {
    id: 'aeroportuario',
    modo: 'Aeroportuario',
    foco: 'F1',
    alcanceMarco: 'Modernización de activos, accesibilidad, sostenibilidad, innovación y conectividad nacional/regional.',
    riesgoR2: 'Estándar misional',
    citation: 'MARCO-S2.1'
  },
  {
    id: 'social_productiva',
    modo: 'Infraestructura social y productiva ("cuando corresponda")',
    foco: 'F1',
    alcanceMarco: 'Mencionada en Foco 1 condicionada a las competencias de la ANI. El marco base advierte que el criterio está abierto y exige delimitación jurídica escrita (Recomendación R2).',
    riesgoR2: 'ALTO — Riesgo de desbordamiento (R2)',
    citation: 'MARCO-S2.2'
  },
  {
    id: 'ruta_social',
    modo: 'Viabilidad territorial y prevención de conflictos (5 capacidades)',
    foco: 'F2',
    alcanceMarco: 'Alertas tempranas, diálogo permanente, participación, beneficios compartidos y cierre de brechas social, jurídica, ambiental, predial y tecnológica.',
    riesgoR2: 'Habilitador transversal obligatorio (R3/R4)',
    citation: 'MARCO-S2.1'
  }
];

export const DOCUMENTAL_FINDINGS = [
  {
    tipo: 'Relación estructural F1 ↔ F2',
    hallazgo: 'F1 define qué se construye o moderniza; F2 define cómo se hace viable en territorio. Son complementarios e interdependientes: F1 sin F2 = obra bloqueada; F2 sin F1 = gestión sin resultado físico.',
    badge: 'Complementariedad',
    cls: 'badge-teal',
    citation: 'MARCO-S2.2'
  },
  {
    tipo: 'Solape potencial controlado',
    hallazgo: 'No hay duplicidad entre focos, pero "gestión social" aparece en F1 y es el núcleo de F2. Regla metodológica: la gestión social opera como criterio transversal en F1 y como resultado principal en F2.',
    badge: 'Regla de deslinde',
    cls: 'badge-navy',
    citation: 'MARCO-S2.2'
  },
  {
    tipo: 'Riesgo de desbordamiento (R2)',
    hallazgo: 'F1 incluye "infraestructura social y productiva cuando corresponda dentro de sus competencias" sin definir el criterio habilitante. Exige delimitación jurídica escrita antes de aprobar proyectos.',
    badge: 'Alerta alta',
    cls: 'badge-bad',
    citation: 'MARCO-S2.2'
  },
  {
    tipo: 'Tensión operativa implícita',
    hallazgo: 'No existe contradicción explícita, pero sí tensión real entre la velocidad de ejecución del portafolio (F1) y los tiempos requeridos para el diálogo territorial genuino (F2). Debe gestionarse desde la estructuración, no negarse.',
    badge: 'Gestión activa',
    cls: 'badge-warn',
    citation: 'MARCO-S2.2'
  }
];

export const STRATEGIC_MAP = [
  {
    level: 1,
    name: 'Capacidades Institucionales (Foco 2)',
    role: 'Base habilitadora',
    accent: 'amber',
    items: ['Capacidad Social', 'Capacidad Jurídica', 'Capacidad Ambiental', 'Capacidad Predial', 'Capacidad Tecnológica'],
    logic: 'Cerrar las 5 brechas institucionales exigidas por F2 habilita procesos preventivos reales en territorio.',
    citation: 'MARCO-S3.1'
  },
  {
    level: 2,
    name: 'Procesos Internos Críticos',
    role: 'Mecanismos preventivos',
    accent: 'navy',
    items: ['Alertas tempranas', 'Conocimiento territorial', 'Diálogo permanente', 'Resolución oportuna', 'Gestión predial y ambiental'],
    logic: 'Los procesos preventivos anticipan controversias y habilitan la ejecución física y contractual del portafolio.',
    citation: 'MARCO-S3.1'
  },
  {
    level: 3,
    name: 'Infraestructura y Movilidad (Foco 1)',
    role: 'Entrega multimodal',
    accent: 'teal',
    items: ['Corredores estratégicos completos', 'Cuellos de botella eliminados', 'Modos articulados (5 modos)', 'Activos modernizados con 6 criterios'],
    logic: 'Con viabilidad territorial asegurada, el portafolio multimodal produce conectividad efectiva y resiliente.',
    citation: 'MARCO-S3.1'
  },
  {
    level: 4,
    name: 'Desarrollo Nacional y Territorial',
    role: 'Resultado estratégico',
    accent: 'navy',
    items: ['Conectividad interregional', 'Accesibilidad territorial', 'Productividad regional', 'Beneficios compartidos'],
    logic: 'La infraestructura articulada dinamiza las economías regionales y cierra brechas de acceso.',
    citation: 'MARCO-S3.1'
  },
  {
    level: 5,
    name: 'Ciudadano, Comunidades y Usuarios',
    role: 'Valor público',
    accent: 'teal',
    items: ['Seguridad vial', 'Accesibilidad universal', 'Confianza comunitaria', 'Participación efectiva'],
    logic: 'El desarrollo territorial se traduce en servicios seguros, legítimos y valorados por usuarios y comunidades.',
    citation: 'MARCO-S3.1'
  },
  {
    level: 6,
    name: 'Gobernanza, Sostenibilidad y Finanzas Públicas',
    role: 'Impacto institucional superior',
    accent: 'ok',
    items: ['Reducción de demandas contra el Estado', 'Protección de recursos públicos', 'Resiliencia climática', 'Sostenibilidad ambiental'],
    logic: 'Protege el patrimonio público, la reputación institucional y la sostenibilidad de largo plazo al 2030.',
    citation: 'MARCO-S3.1'
  }
];

export const PROBLEM_OBJECTIVE_TREES = {
  citationProblem: 'MARCO-S3.2',
  citationObjective: 'MARCO-S3.3',
  problem: {
    central: 'Proyectos de infraestructura con baja viabilidad territorial y conectividad incompleta',
    directCauses: [
      'Cuellos de botella y corredores estratégicos incompletos (F1)',
      'Conflictos territoriales no gestionados preventivamente (F2)',
      'Activos de infraestructura existentes no modernizados (F1)'
    ],
    indirectCauses: [
      'Capacidades sociales, jurídicas, ambientales, prediales y tecnológicas débiles',
      'Falta de conocimiento territorial sistemático y de alertas tempranas',
      'Modos de transporte no articulados (carretero, férreo, fluvial, portuario, aeroportuario)'
    ],
    consequences: [
      'Demoras en ejecución, sobrecostos y demandas contra el Estado',
      'Desconfianza comunitaria y bloqueo de obras en territorio',
      'Pérdida de recursos públicos y afectación de la reputación institucional'
    ]
  },
  objective: {
    central: 'Infraestructura conectada, resiliente y socialmente viable al 2030',
    branchF1: [
      'Completar corredores estratégicos dentro de un portafolio multimodal integrado',
      'Eliminar cuellos de botella y mejorar accesos regionales/logísticos',
      'Modernizar activos existentes aplicando los 6 criterios transversales'
    ],
    branchF2: [
      'Consolidar diálogo, confianza, participación y beneficios compartidos',
      'Operar sistema de alertas tempranas y resolución oportuna de controversias',
      'Fortalecer las 5 capacidades institucionales (social, jurídica, ambiental, predial, tecnológica)'
    ],
    impact: 'Conectividad efectiva para el desarrollo nacional/territorial + reducción de conflictos y demandas + protección de recursos públicos'
  }
};

export const THEORY_OF_CHANGE = [
  { eslabon: '1. Problema', f1: 'Desconexión, cuellos de botella y modos de transporte desarticulados.', f2: 'Conflictos territoriales, desconfianza comunitaria y demandas contra el Estado.' },
  { eslabon: '2. Supuesto', f1: 'Si se completa el portafolio con criterios transversales, mejora la conectividad.', f2: 'Si hay diálogo preventivo y capacidades fortalecidas, disminuye la conflictividad.' },
  { eslabon: '3. Intervención', f1: 'Portafolio multimodal integrado + modernización de activos.', f2: 'Ruta social preventiva + sistema de alertas tempranas + cierre de 5 brechas.' },
  { eslabon: '4. Producto', f1: 'Corredores completados, accesos mejorados y activos modernizados.', f2: 'Mesas territoriales, protocolos preventivos y sistema de alertas operando.' },
  { eslabon: '5. Resultado', f1: 'Movilidad eficiente, accesibilidad, seguridad vial y resiliencia.', f2: 'Menos controversias escaladas y menos demandas asociadas a proyectos.' },
  { eslabon: '6. Impacto', f1: 'Desarrollo territorial y productividad regional.', f2: 'Protección de recursos públicos y legitimidad institucional.' },
  { eslabon: '7. Riesgo crítico', f1: 'Desbordamiento de competencia (social/productiva), sobrecostos, eventos climáticos.', f2: 'Capacidades no financiadas y tensión con tiempos de diálogo territorial.' },
  { eslabon: '8. Indicador', f1: '3 indicadores propuestos en §3.6 (sujetos a levantamiento de línea base ANI).', f2: '3 indicadores propuestos en §3.6 (sujetos a levantamiento de línea base ANI).' }
];

export const PROPOSED_INDICATORS = [
  {
    id: 'IND-F1-1',
    foco: 'F1',
    nombre: '% corredores estratégicos completados',
    formula: '(km completados / km programados) × 100',
    frecuencia: 'Semestral',
    responsable: 'Gestión de proyectos',
    fuente: 'Sistema de proyectos ANI',
    lineaBaseDefault: 'Información insuficiente para concluir',
    citation: 'MARCO-S3.6'
  },
  {
    id: 'IND-F1-2',
    foco: 'F1',
    nombre: 'Cuellos de botella eliminados',
    formula: 'Conteo verificado',
    frecuencia: 'Anual',
    responsable: 'Planeación',
    fuente: 'Inventario ANI',
    lineaBaseDefault: 'Información insuficiente para concluir',
    citation: 'MARCO-S3.6'
  },
  {
    id: 'IND-F1-3',
    foco: 'F1',
    nombre: '% activos modernizados con criterios transversales',
    formula: '(activos modernizados / activos priorizados) × 100',
    frecuencia: 'Anual',
    responsable: 'Infraestructura',
    fuente: 'Fichas técnicas',
    lineaBaseDefault: 'Información insuficiente para concluir',
    citation: 'MARCO-S3.6'
  },
  {
    id: 'IND-F2-1',
    foco: 'F2',
    nombre: '% conflictos gestionados preventivamente',
    formula: '(casos con alerta + gestión oportuna / casos totales) × 100',
    frecuencia: 'Trimestral',
    responsable: 'Gestión social',
    fuente: 'Sistema de alertas',
    lineaBaseDefault: 'Información insuficiente para concluir',
    citation: 'MARCO-S3.6'
  },
  {
    id: 'IND-F2-2',
    foco: 'F2',
    nombre: 'Demandas contra el Estado asociadas a proyectos',
    formula: 'Conteo',
    frecuencia: 'Semestral',
    responsable: 'Jurídica',
    fuente: 'Sistema jurídico',
    lineaBaseDefault: 'Información insuficiente para concluir',
    citation: 'MARCO-S3.6'
  },
  {
    id: 'IND-F2-3',
    foco: 'F2',
    nombre: 'Capacidades fortalecidas (5 frentes)',
    formula: 'Índice por frente (a diseñar)',
    frecuencia: 'Anual',
    responsable: 'Talento humano',
    fuente: 'Evaluación ANI',
    lineaBaseDefault: 'Información insuficiente para concluir',
    citation: 'MARCO-S3.6'
  }
];

export const ROADMAP_2027_2030 = [
  {
    horizonte: 'Corto plazo · 2027',
    fase: 'Alistamiento, delimitación y líneas base',
    f1: 'Delimitar competencia jurídica (social/productiva), priorizar corredores estratégicos y levantar líneas base oficiales.',
    f2: 'Diseñar ruta social preventiva, estructurar sistema de alertas tempranas y mapear territorios prioritarios.',
    transversal: 'Diligenciar tabla PEI con reglas de validación obligatorias y calibrar scoring 1–5 en taller.',
    citation: 'MARCO-S3.7'
  },
  {
    horizonte: 'Mediano plazo · 2028–2029',
    fase: 'Ejecución articulada y cierre de brechas',
    f1: 'Ejecutar portafolio multimodal priorizado, eliminar cuellos de botella y modernizar activos existentes.',
    f2: 'Fortalecer con plan y presupuesto las 5 capacidades (social, jurídica, ambiental, predial, tecnológica) y sostener diálogo permanente.',
    transversal: 'Seguimiento y medición semestral de indicadores, gestión activa de riesgos y ajustes de Plan de Acción.',
    citation: 'MARCO-S3.7'
  },
  {
    horizonte: 'Largo plazo · 2030',
    fase: 'Consolidación y evaluación de impacto',
    f1: 'Portafolio multimodal integrado operando con estándares de seguridad vial, accesibilidad y resiliencia climática.',
    f2: 'Modelo preventivo de gestión social institucionalizado con reducción verificable de controversias y demandas.',
    transversal: 'Evaluación integral de impacto PEI 2027–2030, rendición de cuentas y sistematización de lecciones aprendidas.',
    citation: 'MARCO-S3.7'
  }
];

export const RECOMMENDATIONS = [
  {
    code: 'R1',
    titulo: 'Trazabilidad obligatoria PND → PEI',
    detalle: '1 proyecto = 1 fila = 1 Foco principal + Objetivo Estratégico + Unidad de Medida + Meta 2030 + Detalle. Sin las 6 columnas completas, no entra al PEI.',
    justificacion: 'La tabla es el contrato de trazabilidad PND → PEI. Evita proyectos huérfanos o sin métrica.',
    beneficio: 'Trazabilidad total, auditoría limpia y decisiones medibles.',
    riesgo: 'Sobrecarga inicial de diligenciamiento en los equipos.',
    prioridad: 'Alta',
    horizonte: 'Corto (0–12 meses)',
    citation: 'MARCO-S4'
  },
  {
    code: 'R2',
    titulo: 'Delimitar competencia en Foco 1 (infraestructura social/productiva)',
    detalle: 'Definir por escrito cuándo la ANI asume infraestructura social o productiva ("cuando corresponda") con criterios jurídicos y de competencia explícitos.',
    justificacion: 'El insumo inicial deja el criterio abierto; sin delimitación existe riesgo de desbordamiento misional.',
    beneficio: 'Foco institucional preservado y menor exposición a riesgo jurídico.',
    riesgo: 'Discusión de fronteras interinstitucionales en el sector.',
    prioridad: 'Alta',
    horizonte: 'Corto (0–12 meses)',
    citation: 'MARCO-S4'
  },
  {
    code: 'R3',
    titulo: 'Doble llave obligatoria F1 ↔ F2',
    detalle: 'Todo proyecto F1 declara su plan/proyecto de gestión social (F2) y todo proyecto F2 declara su proyecto o corredor físico asociado (F1).',
    justificacion: 'F1 sin F2 = obra bloqueada; F2 sin F1 = gestión sin resultado físico.',
    beneficio: 'Viabilidad territorial incorporada desde la fase de diseño y estructuración.',
    riesgo: 'Mayores tiempos en la etapa de estructuración temprana.',
    prioridad: 'Alta',
    horizonte: 'Corto–Mediano',
    citation: 'MARCO-S4'
  },
  {
    code: 'R4',
    titulo: 'Cerrar las 5 brechas de capacidad del Foco 2',
    detalle: 'Estructurar plan y presupuesto específico para fortalecer las capacidades social, jurídica, ambiental, predial y tecnológica.',
    justificacion: 'El Foco 2 las exige explícitamente; sin estas 5 capacidades la ruta social no es ejecutable.',
    beneficio: 'Menos conflictos territoriales, menos demandas y protección de recursos públicos.',
    riesgo: 'Restricción presupuestal y tiempos de fortalecimiento institucional.',
    prioridad: 'Alta',
    horizonte: 'Mediano (1–3 años)',
    citation: 'MARCO-S4'
  },
  {
    code: 'R5',
    titulo: 'Priorizar cartera con scoring multicriterio 1–5 (9 criterios)',
    detalle: 'Calificar impacto institucional, impacto nacional, alineación estratégica, factibilidad técnica/financiera/jurídica/política, riesgo y tiempo.',
    justificacion: 'Evita que el PEI se convierta en un listado desordenado sin jerarquía ejecutiva.',
    beneficio: 'Identificación objetiva de Quick Wins, Iniciativas Estratégicas y Transformaciones en la Matriz Impacto–Esfuerzo.',
    riesgo: 'Sesgo subjetivo si no se calibra colectivamente en taller.',
    prioridad: 'Media–Alta',
    horizonte: 'Corto (0–12 meses)',
    citation: 'MARCO-S4'
  },
  {
    code: 'R6',
    titulo: 'Medir resultado e impacto con línea base previa',
    detalle: 'Cada Meta 2030 debe contar con fórmula, frecuencia, rol responsable y fuente oficial. Levantar línea base antes de fijar cualquier meta numérica.',
    justificacion: 'Sin línea base verificada no existe meta técnicamente defendible.',
    beneficio: 'Gestión orientada a resultados (alineada con MIPG/DNP) y rendición de cuentas rigurosa.',
    riesgo: 'Datos de línea base insuficientes en la etapa inicial.',
    prioridad: 'Media–Alta',
    horizonte: 'Corto–Mediano',
    citation: 'MARCO-S4'
  }
];

export const STRATEGIC_RISKS = [
  { categoria: 'Estratégico', riesgo: 'Desbordamiento de competencia en F1 (infraestructura social/productiva)', probImpacto: 'Media / Alto*', accion: 'R2: Establecer criterio escrito de competencia jurídica.', citation: 'MARCO-S4-RIESGOS' },
  { categoria: 'Social', riesgo: 'Conflicto territorial bloquea ejecución de proyecto', probImpacto: 'Alta / Alto*', accion: 'R3 + R4: Ruta social preventiva, doble llave y alertas tempranas.', citation: 'MARCO-S4-RIESGOS' },
  { categoria: 'Jurídico', riesgo: 'Demandas contra el Estado asociadas a proyectos', probImpacto: 'Media / Alto*', accion: 'Fortalecer capacidad jurídica preventiva y gestión predial oportuna.', citation: 'MARCO-S4-RIESGOS' },
  { categoria: 'Ambiental / Climático', riesgo: 'Activo no resiliente afectado por evento climático extremo', probImpacto: 'Media / Alto*', accion: 'Exigir resiliencia climática y sostenibilidad como criterio transversal en F1.', citation: 'MARCO-S4-RIESGOS' },
  { categoria: 'Financiero', riesgo: 'Portafolio estratégico sin cierre o respaldo presupuestal', probImpacto: 'Información insuficiente para concluir', accion: 'Levantar restricción presupuestal oficial (MFMP/MGMP) durante el ejercicio.', citation: 'MARCO-S4-RIESGOS' },
  { categoria: 'Tecnológico / Datos', riesgo: 'Ausencia de sistema de alertas tempranas e interoperabilidad', probImpacto: 'Media / Medio*', accion: 'Desarrollar capacidad tecnológica de F2 y gobierno de datos territoriales.', citation: 'MARCO-S4-RIESGOS' }
];

export const BASE_DOC_SHEETS = [
  { id: 'pnd', name: 'PND', full: 'Plan Nacional de Desarrollo', color: 'navy', hint: 'Mandatos, capítulos e iniciativas del PND aplicables a infraestructura y gestión social.' },
  { id: 'choco', name: 'Plan Chocó Renace', full: 'Plan Chocó Renace', color: 'teal', hint: 'Compromisos territoriales, corredores, accesibilidad y ruta social asociados a Chocó.' },
  { id: 'ministra', name: 'Discursos Ministra', full: 'Discursos de la Ministra de Transporte', color: 'amber', hint: 'Lineamientos estratégicos sectoriales, prioridades modales y énfasis sociales.' },
  { id: 'destrabe', name: 'Plan Destrabe', full: 'Plan Destrabe', color: 'navy', hint: 'Acciones para resolver cuellos de botella prediales, ambientales, sociales, jurídicos y contractuales.' }
];

export const SCORING_CRITERIA = [
  ['impInst', 'Impacto institucional', 'impacto'],
  ['impNac', 'Impacto nacional', 'impacto'],
  ['alineacion', 'Alineación estratégica', 'impacto'],
  ['factTec', 'Factibilidad técnica', 'factibilidad'],
  ['factFin', 'Factibilidad financiera', 'factibilidad'],
  ['factJur', 'Factibilidad jurídica', 'factibilidad'],
  ['factPol', 'Factibilidad política', 'factibilidad'],
  ['riesgo', 'Riesgo (5 = riesgo alto)', 'contexto'],
  ['tiempo', 'Tiempo (5 = más tiempo)', 'contexto']
];

export const PEI_FILL_RULES = [
  { col: 'Foco', rule: 'Únicamente F1 o F2. Si contribuye a ambos, elegir el foco principal y justificar la articulación en Detalle y Doble Llave.', avoid: 'Dejar vacío o inventar un tercer foco.' },
  { col: 'Objetivo Estratégico', rule: 'Seleccionar o copiar un objetivo estratégico vigente de la ANI. Mientras no esté cargado, usar "Información insuficiente para concluir".', avoid: 'Redactar objetivos nuevos improvisados en cada fila.' },
  { col: 'Proyecto', rule: 'Nombre único, concreto y verificable, indicando modo de transporte (F1) o frente de capacidad/territorio (F2).', avoid: 'Nombres genéricos como "mejorar infraestructura".' },
  { col: 'Unidad de medida', rule: 'Una sola unidad verificable: km, %, casos, proyectos, corredores, índice, etc.', avoid: 'Mezclar varias unidades o escribir "varios".' },
  { col: 'Meta 2030', rule: 'Número + unidad + horizonte 2030 únicamente si existe línea base verificada; de lo contrario escribir "Por definir — línea base pendiente".', avoid: 'Fijar metas numéricas sin línea base oficial.' },
  { col: 'Detalle', rule: 'Explicar contribución al Foco, cumplimiento de los 6 criterios F1 o 5 capacidades F2, supuestos y riesgos principales.', avoid: 'Texto promocional sin trazabilidad técnica.' }
];

export const PA_FILL_RULES = [
  { col: 'Foco', rule: 'F1 o F2, coherente con el Foco del Proyecto PEI del cual se deriva.', avoid: 'Asignar una actividad a un foco distinto al de su proyecto PEI.' },
  { col: 'Objetivo Estratégico', rule: 'Hereda y mantiene correspondencia directa con el Objetivo Estratégico del Proyecto PEI asociado (o registra "Información insuficiente para concluir" hasta carga oficial).', avoid: 'Desalinear el objetivo operativo respecto al PEI 2027–2030.' },
  { col: 'Proyecto', rule: 'Proyecto estratégico de la Cartera PEI 2027–2030 al que materializa esta actividad.', avoid: 'Registrar actividades aisladas sin correspondencia con el PEI.' },
  { col: 'Actividad', rule: 'Acción operativa concreta, verificable y programable que materializa el Proyecto PEI en la vigencia.', avoid: 'Repetir el nombre del proyecto sin desagregación operativa.' },
  { col: 'Meta 2027', rule: 'Compromiso anual verificable para 2027 sustentado en línea base; si no existe línea base oficial, escribir "Por definir — línea base pendiente".', avoid: 'Fijar cifras 2027 sin soporte documental ni presupuestal.' },
  { col: 'Unidad de medida', rule: 'Una sola unidad medible y consistente con la actividad (documentos, km, %, mesas, casos, protocolos, hitos).', avoid: 'Dejar en blanco o mezclar unidades heterogéneas.' },
  { col: 'Detalle', rule: 'Alcance técnico, entregable verificable, articulación F1↔F2, dependencia responsable, supuestos y mitigación de riesgos.', avoid: 'Descripciones vagas sin producto ni condición de verificación.' }
];

export const ILLUSTRATIVE_CSV_EXAMPLES = [
  {
    foco: 'F1',
    objetivo: 'Información insuficiente para concluir — levantar objetivo vigente ANI',
    proyecto: '[Ejemplo ilustrativo: Corredor X — tramo Y]',
    unidad: 'km',
    lineaBase: 'Pendiente — Información insuficiente para concluir',
    meta: 'Por definir — línea base pendiente',
    modo: 'Carretero',
    ejePnd: 'Por vincular',
    criterios: ['Seguridad vial', 'Accesibilidad', 'Resiliencia climática', 'Sostenibilidad ambiental', 'Innovación', 'Gestión social'],
    detalle: 'Completa corredor, elimina cuello de botella. Criterios: seguridad vial, accesibilidad, resiliencia climática, sostenibilidad, innovación, gestión social.',
    doble: 'F2 asociado: [Sistema de alertas tempranas territoriales]',
    estatus: 'ejemplo_ilustrativo',
    citation: 'PLANTILLA-PEI-CSV'
  },
  {
    foco: 'F2',
    objetivo: 'Información insuficiente para concluir — levantar objetivo vigente ANI',
    proyecto: '[Ejemplo ilustrativo: Sistema de alertas tempranas territoriales]',
    unidad: '% casos gestionados',
    lineaBase: 'Pendiente — Información insuficiente para concluir',
    meta: 'Por definir — línea base pendiente',
    modo: 'Alertas tempranas territoriales',
    ejePnd: 'Por vincular',
    criterios: ['Social', 'Jurídica', 'Ambiental', 'Predial', 'Tecnológica'],
    detalle: 'Capacidades: social, jurídica, ambiental, predial, tecnológica. Reduce demandas contra el Estado, protege recursos públicos.',
    doble: 'F1 asociado: [Corredor X — tramo Y]',
    estatus: 'ejemplo_ilustrativo',
    citation: 'PLANTILLA-PEI-CSV'
  }
];

export const REPO_DOCUMENTS = [
  {
    id: 'repo-marco',
    file: '01_Marco_Estrategico_ANI_2027-2030.md',
    title: 'Marco Estratégico ANI — PEI 2027–2030',
    type: 'Markdown · 244 líneas',
    citation: 'MARCO-S1..S5.4',
    status: 'marco_repositorio',
    description: 'Documento rector del repositorio: resumen ejecutivo, análisis de los 2 focos, mapa estratégico, árboles de problemas y objetivos, teoría del cambio, 6 indicadores, hoja de ruta 2027–2030, recomendaciones R1–R6, riesgos, reglas de llenado y taller de 20 minutos.'
  },
  {
    id: 'repo-csv',
    file: '02_Plantilla_Ejercicio_PEI_2027-2030.csv',
    title: 'Plantilla Tabular Ejercicio PEI 2027–2030',
    type: 'CSV · 18 columnas',
    citation: 'PLANTILLA-PEI-CSV',
    status: 'ejemplo_ilustrativo',
    description: 'Plantilla compatible con Excel y Google Sheets con las 6 columnas contractuales PEI, los 9 criterios de scoring (1–5), doble llave F1–F2, línea base, validación y 2 ejemplos ilustrativos de formato.'
  },
  {
    id: 'repo-canvas',
    file: '03_Canvas_2_Focos_ANI.html',
    title: 'Canvas Ejecutivo Visual — 2 Focos ANI 2027–2030',
    type: 'HTML interactivo',
    citation: 'CANVAS-2FOCOS-HTML',
    status: 'marco_repositorio',
    description: 'Lámina ejecutiva original del repositorio con síntesis visual de Foco 1, Foco 2, regla de oro, flujo causal, matriz Impacto–Esfuerzo y hoja de ruta 2027–2030.'
  },
  {
    id: 'repo-guia',
    file: '04_App_Interactiva_ANI.md',
    title: 'Guía Operativa — Copiloto PEI 2027–2030',
    type: 'Markdown · 28 líneas',
    citation: 'GUIA-APP-S1',
    status: 'marco_repositorio',
    description: 'Descripción original del flujo guiado, las 4 hojas documentales (PND, Plan Chocó Renace, Discursos Ministra, Plan Destrabe) y los principios de operación segura.'
  }
];

export const AGENT_QUICK_PROMPTS = [
  {
    mode: 'consulta',
    label: 'Síntesis de los 2 Focos y Doble Llave',
    prompt: '¿Cómo se relacionan el Foco 1 y el Foco 2 del PEI 2027–2030, cuál es su solape potencial y cómo opera la regla de doble llave? Cita las secciones exactas.'
  },
  {
    mode: 'pnd_ani',
    label: 'Delimitación de competencia PND–ANI (R2)',
    prompt: 'Analiza cómo se vinculan las iniciativas del PND con las competencias modales de la ANI y qué riesgo existe frente a infraestructura social y productiva.'
  },
  {
    mode: 'oportunidades',
    label: 'Oportunidades y brechas de capacidad F2',
    prompt: 'Identifica las principales oportunidades estratégicas y las 5 brechas de capacidad que la ANI debe cerrar en 2027–2030 según el acervo disponible.'
  },
  {
    mode: 'propuesta_pei',
    label: 'Formular par de proyectos PEI (F1 + F2)',
    prompt: 'Propón un par articulado de proyectos borrador para el PEI 2027–2030 (uno en Foco 1 y su doble llave en Foco 2) respetando estrictamente las reglas de no inventar líneas base ni objetivos.'
  },
  {
    mode: 'propuesta_pa',
    label: 'Proponer actividades Plan de Acción 2027–2030',
    prompt: 'Con base en la Hoja de Ruta 2027–2030 y las recomendaciones R1–R6, propón actividades estructuradas de corto y mediano plazo para el Plan de Acción.'
  },
  {
    mode: 'auditoria',
    label: 'Auditar mi Cartera PEI y Plan de Acción',
    prompt: 'Audita el estado actual de mi Cartera PEI, los 7 Ejes del PND y el Plan de Acción frente a las reglas R1–R6 y el checklist de validación.'
  }
];

/**
 * Índice documental local de respaldo para cuando el frontend se consulta
 * desde GitHub Pages sin servidor backend conectado (100% fiel al repositorio).
 */
export const STATIC_FALLBACK_CHUNKS = [
  {
    id: 'MARCO-S1',
    docTitle: 'Marco Estratégico ANI — PEI 2027–2030',
    section: '1. Resumen Ejecutivo',
    sourceFile: '01_Marco_Estrategico_ANI_2027-2030.md',
    lineRange: 'L8–L21',
    authorityStatus: 'marco_repositorio',
    tags: ['ANI', 'PND', 'PEI', 'F1', 'F2'],
    content: 'Arquitectura: 2 Focos = Iniciativas del PND. Todo proyecto ANI 2027-2030 debe trazarse a 1 Foco. Instrumento: Tabla PEI (FOCO → OBJETIVO ESTRATÉGICO → PROYECTO → UNIDAD DE MEDIDA → META 2030 → DETALLE). Foco 1: Infraestructura dinamizadora para la conectividad y el desarrollo (oferta multimodal). Foco 2: Ruta social y gestión preventiva de conflictos (viabilidad territorial). Riesgo mayor: proyectos huérfanos, metas no medibles, desbordamiento de competencia en Foco 1. Mensaje ejecutivo: Los 2 focos no compiten, se necesitan. Foco 1 sin Foco 2 = obra bloqueada. Foco 2 sin Foco 1 = gestión sin resultado físico.'
  },
  {
    id: 'MARCO-S2.1',
    docTitle: 'Marco Estratégico ANI — PEI 2027–2030',
    section: '2.1 Extracción literal: Foco 1, Foco 2 y Tabla PEI',
    sourceFile: '01_Marco_Estrategico_ANI_2027-2030.md',
    lineRange: 'L25–L33',
    authorityStatus: 'marco_repositorio',
    tags: ['F1', 'F2', 'PEI', 'Competencias'],
    content: 'Foco 1: Portafolio integrado carretero, férreo, fluvial, portuario, aeroportuario + social/productiva cuando corresponda. Completar corredores, eliminar cuellos de botella, articular modos, modernizar activos. Criterios: seguridad vial, accesibilidad, resiliencia climática, sostenibilidad, innovación, gestión social. Es un foco de portafolio, no de obra aislada; exige criterio de delimitación de competencia. Foco 2: Ruta social basada en diálogo, confianza, participación, beneficios compartidos. Modelo preventivo, alertas tempranas, conocimiento territorial, diálogo permanente, resolución oportuna. Fortalecer capacidades sociales, jurídicas, ambientales, prediales, tecnológicas. Resultado: menos conflictos, menos demandas contra el Estado, protección de recursos públicos. Tabla PEI: contrato de trazabilidad de 6 columnas; si una fila no llena las 6 columnas, no entra al PEI.'
  },
  {
    id: 'MARCO-S2.2',
    docTitle: 'Marco Estratégico ANI — PEI 2027–2030',
    section: '2.2 Análisis documental: relaciones, solapes y riesgos',
    sourceFile: '01_Marco_Estrategico_ANI_2027-2030.md',
    lineRange: 'L35–L45',
    authorityStatus: 'marco_repositorio',
    tags: ['F1', 'F2', 'Riesgos', 'Competencias'],
    content: 'Relación: F1 (qué se construye/moderniza) ↔ F2 (cómo se hace viable en territorio), complementarios. Solape potencial: gestión social aparece en F1 y es el núcleo de F2; regla: gestión social como criterio de F1 y como resultado de F2. Riesgo de desbordamiento: F1 incluye infraestructura social y productiva cuando corresponda dentro de sus competencias sin definir el criterio. Tensión implícita: velocidad de portafolio (F1) vs. tiempos de diálogo territorial (F2). Capacidades exigidas por F2: sociales, jurídicas, ambientales, prediales y tecnológicas (5 brechas). Criterios transversales F1: seguridad vial, accesibilidad, resiliencia climática, sostenibilidad ambiental, innovación y gestión social.'
  },
  {
    id: 'MARCO-S2.3',
    docTitle: 'Marco Estratégico ANI — PEI 2027–2030',
    section: '2.3 Información insuficiente para concluir',
    sourceFile: '01_Marco_Estrategico_ANI_2027-2030.md',
    lineRange: 'L46–L52',
    authorityStatus: 'marco_repositorio',
    tags: ['Brechas', 'Misión', 'Visión', 'PEI'],
    content: 'Información insuficiente para concluir en el repositorio base: Misión, visión y objetivos estratégicos vigentes de la ANI; cartera actual de proyectos, líneas base, presupuesto y metas 2030 reales; indicadores actuales, riesgos materializados y capacidades medidas. Ninguna meta 2030 numérica puede fijarse sin levantar estos insumos oficiales.'
  },
  {
    id: 'MARCO-S3.6',
    docTitle: 'Marco Estratégico ANI — PEI 2027–2030',
    section: '3.6 Indicadores propuestos (sin línea base inventada)',
    sourceFile: '01_Marco_Estrategico_ANI_2027-2030.md',
    lineRange: 'L139–L151',
    authorityStatus: 'marco_repositorio',
    tags: ['Indicadores', 'F1', 'F2', 'Línea Base'],
    content: 'F1: (1) % corredores estratégicos completados = (km completados / km programados) × 100, semestral, Gestión de proyectos; (2) Cuellos de botella eliminados = conteo verificado, anual, Planeación; (3) % activos modernizados con criterios transversales, anual, Infraestructura. F2: (4) % conflictos gestionados preventivamente = (casos con alerta + gestión oportuna / casos totales) × 100, trimestral, Gestión social; (5) Demandas contra el Estado asociadas a proyectos = conteo, semestral, Jurídica; (6) Capacidades fortalecidas (5 frentes) = índice por frente, anual, Talento humano. Líneas base y metas 2030: Información insuficiente para concluir.'
  },
  {
    id: 'MARCO-S3.7',
    docTitle: 'Marco Estratégico ANI — PEI 2027–2030',
    section: '3.7 Hoja de ruta 2027–2030',
    sourceFile: '01_Marco_Estrategico_ANI_2027-2030.md',
    lineRange: 'L153–L160',
    authorityStatus: 'marco_repositorio',
    tags: ['Hoja de Ruta', 'Plan de Acción', 'F1', 'F2'],
    content: 'Corto plazo (2027): F1 delimitar competencia, priorizar corredores y línea base; F2 diseñar ruta social, alertas tempranas y mapear territorios; Transversal llenar tabla PEI con validación y scoring 1–5. Mediano plazo (2028–2029): F1 ejecutar portafolio y modernizar activos; F2 fortalecer las 5 capacidades y diálogo permanente; Transversal medición semestral y gestión de riesgos. Largo plazo (2030): F1 portafolio integrado operando; F2 modelo preventivo institucionalizado; Transversal evaluación de impacto y lecciones aprendidas.'
  },
  {
    id: 'MARCO-S4',
    docTitle: 'Marco Estratégico ANI — PEI 2027–2030',
    section: '4. Recomendaciones estratégicas R1–R6',
    sourceFile: '01_Marco_Estrategico_ANI_2027-2030.md',
    lineRange: 'L163–L174',
    authorityStatus: 'marco_repositorio',
    tags: ['Recomendaciones', 'PEI', 'F1', 'F2', 'Oportunidades'],
    content: 'R1 (Alta, Corto): Trazabilidad obligatoria 1 proyecto = 1 fila = 1 Foco + 6 columnas completas. R2 (Alta, Corto): Delimitar por escrito cuándo la ANI asume infraestructura social/productiva con criterios jurídicos y de competencia. R3 (Alta, Corto-Mediano): Doble llave F1+F2 obligatoria entre proyectos físicos y ruta social. R4 (Alta, Mediano): Cerrar las 5 capacidades de F2 (social, jurídica, ambiental, predial, tecnológica) con plan y presupuesto. R5 (Media-Alta, Corto): Priorizar con scoring 1–5 en 9 criterios y Matriz Impacto–Esfuerzo. R6 (Media-Alta, Corto-Mediano): Medir resultado e impacto con fórmula, frecuencia, responsable, fuente y línea base previa.'
  },
  {
    id: 'MARCO-S5.1',
    docTitle: 'Marco Estratégico ANI — PEI 2027–2030',
    section: '5.1 Reglas de llenado y 5.4 Checklist de validación PEI',
    sourceFile: '01_Marco_Estrategico_ANI_2027-2030.md',
    lineRange: 'L191–L235',
    authorityStatus: 'marco_repositorio',
    tags: ['PEI', 'Reglas', 'Checklist', 'Taller'],
    content: 'Reglas de llenado: Foco único (F1 o F2); Objetivo Estratégico vigente ANI (no inventar); Proyecto único y verificable con modo o frente; Unidad única; Meta 2030 solo si hay línea base, si no marcar "Por definir — línea base pendiente"; Detalle con criterios F1 o capacidades F2, supuestos y riesgos. Checklist de 7 puntos: foco único, objetivo vigente, unidad verificable, meta con línea base o por definir, criterios F1/capacidades F2 en detalle, scoring 1–5 completo y doble llave F1↔F2 declarada.'
  },
  {
    id: 'IDENTIDAD-ANI',
    docTitle: 'Identidad Institucional ANI (Módulo Agente Estratégico)',
    section: 'Misión y Visión 2030 ANI',
    sourceFile: 'modules/agente_estrategico.py',
    lineRange: 'L37–L48',
    authorityStatus: 'marco_repositorio',
    tags: ['Misión', 'Visión', 'Identidad', 'F1', 'F2'],
    content: 'Misión ANI: Impulsar y desarrollar proyectos integrales de infraestructura concesionada para transformar territorios, vidas y propósitos de manera sostenible, resiliente e incluyente fortaleciendo el tejido social, la equidad y la competitividad del país. Visión ANI: En el año 2030 la ANI será la entidad referente en la estructuración y gestión de proyectos de infraestructura para promover el desarrollo integral de los territorios y sus comunidades.'
  },
  {
    id: 'PND-7-EJES',
    docTitle: 'Bases Plan Nacional de Desarrollo 2026–2030 — Colombia, la patria milagro',
    section: '7 Ejes Estratégicos (Bases en formulación, noviembre 2026)',
    sourceFile: 'assets/bases_pnd_siete_ejes.png',
    lineRange: 'Lámina DNP/ANI',
    authorityStatus: 'en_construccion',
    tags: ['PND', 'Ejes', 'F1', 'F2'],
    content: 'Bases del Plan Nacional de Desarrollo 2026–2030 "Colombia, la patria milagro" (documento en formulación, noviembre 2026 — no ley expedida). 7 Ejes Estratégicos: (1) Milagro de las regiones; (2) Talento, conocimiento e innovación para el desarrollo; (3) Patriotismo constitucional; (4) Milagro social; (5) Milagro económico; (6) Transformación del Estado: un Estado que se acerca; (7) Reconstrucción, transformación y resiliencia.'
  },
  {
    id: 'DOFA-ANI',
    docTitle: 'Matriz DOFA Estratégica Institucional ANI',
    section: 'Fortalezas, Debilidades, Oportunidades y Amenazas',
    sourceFile: 'assets/dofa_ani_estrategico.png',
    lineRange: 'Lámina ANI',
    authorityStatus: 'marco_repositorio',
    tags: ['DOFA', 'Oportunidades', 'Riesgos', 'Capacidades', 'F1', 'F2'],
    content: 'Fortalezas: (1) Experiencia y Conocimiento Técnico en infraestructura y sector transporte; (2) Capacidad de Ejecución a gran escala; (3) Gestión de Riesgos contractuales y financieros; (4) Marco Legal y Regulatorio sólido; (5) Posicionamiento y experiencia con APPs. Debilidades: (1) Coordinación y Comunicación entre áreas; (2) Rezago tecnológico y sistemas de información; (3) Recursos Humanos (falta de planta y rotación de contratistas); (4) Cultura Organizacional; (5) Flexibilidad y Adaptabilidad; (6) Falta de articulación entre áreas. Oportunidades: (1) Expansión a otros sectores (salud, educación, agua, social) y modos distintos al carretero; (2) Nuevas fuentes de financiación; (3) Incorporación de tecnología y gestión de conocimiento; (4) Relacionamiento con Ministerios y entidades del gobierno; (5) Cooperación internacional. Amenazas: (1) Inestabilidad política y social; (2) Restricciones presupuestales; (3) Conflictos sociales y ambientales; (4) Riesgos jurídicos.'
  },
  {
    id: 'CARTERA-PEI-14',
    docTitle: 'Matriz de Proyectos Estratégicos PEI 2027–2030 (14 Proyectos)',
    section: 'II. Matriz Institucional Foco 1 (11) y Foco 2 (3)',
    sourceFile: 'modules/cartera_pei.py',
    lineRange: 'L9–L135',
    authorityStatus: 'en_construccion',
    tags: ['PEI', 'Proyectos', 'F1', 'F2', 'PND'],
    content: 'Foco 1 (11 proyectos): (1) Construcción Red Vial Primaria APP — 410,49 km (LB 3.596,9 km); (2) Mejoramiento y Rehabilitación Red Vial Primaria APP — 474,25 km (LB 4.639,4 km); (3) Reactivación y Desarrollo Ferroviario — 1.548,4 km; (4) Estructuración Portafolio Intermodal APP — 6 proyectos (LB 43); (5) Vías de la Patria Milagro — 8 Corredores Estratégicos; (6) Plan Intermodal del Chocó (Plan Marshall) — 100% formulado ($1 billón, 6 proyectos); (7) Estructuración APP Infraestructura Social y Productiva; (8) Navegabilidad Fluvial Canal del Dique (117 km) y Río Meta (99 km); (9) Modernización Concesiones Aeroportuarias y Portuarias; (10) Estrategia Obras que Avanzan y Destrabe de Proyectos Concesionados; (11) Transformación Digital, Gobierno de Datos y Monitoreo Inteligente ANI. Foco 2 (3 proyectos): (12) Estrategia de Ruta Social en Proyectos Concesionados — 100% nuevas estructuraciones; (13) Modelo Preventivo de Gestión de Conflictos y Alertas Tempranas Contractuales (contención riesgo litigioso 48 tribunales / $20 billones); (14) Estrategia de Sostenibilidad, Adaptación Climática e Inclusión Social ANI (cuotas equidad 25% operativo / 45% gerencial en 5G).'
  },
  {
    id: 'PRIORIZACION-3-GRUPOS',
    docTitle: 'Clasificación Priorizada Cartera PEI 2027–2030',
    section: 'III. Tres Grupos de Priorización Institucional',
    sourceFile: 'modules/cartera_pei.py',
    lineRange: 'L138–L163',
    authorityStatus: 'en_construccion',
    tags: ['Priorización', 'PEI', 'Hoja de Ruta', 'F1', 'F2'],
    content: 'Grupo 1 — Urgencia Estructural (2027–2028, Proyectos 1, 2, 4, 10, 13): recuperar seguridad jurídica, contener riesgo litigioso ($20 billones), destrabar obras y habilitar metas trazadoras PND. Grupo 2 — Transformación Intermodal (2027–2029, Proyectos 3, 5, 6, 8, 12): reactivación férrea (1.548,4 km), fluvial, 8 corredores nacionales, Plan Chocó ($1 billón) y Ruta Social. Grupo 3 — Innovación y Futuro (2028–2030, Proyectos 7, 9, 11, 14): APP social y productiva, modernización aeroportuaria/portuaria, gobierno de datos/IA y sostenibilidad e inclusión.'
  }
];

/* ---------- INSUMOS INTEGRADOS DESDE MODULES/ Y ASSETS/ DEL REPOSITORIO ---------- */
export const ANI_INSTITUTIONAL_IDENTITY = {
  mision: 'Impulsar y desarrollar proyectos integrales de infraestructura concesionada para transformar territorios, vidas y propósitos de manera sostenible, resiliente e incluyente fortaleciendo el tejido social, la equidad y la competitividad del país.',
  vision: 'En el año 2030 la ANI será la entidad referente en la estructuración y gestión de proyectos de infraestructura para promover el desarrollo integral de los territorios y sus comunidades.',
  fuente: 'Insumo del repositorio: modules/agente_estrategico.py (sujeto a verificación contra acto administrativo oficial vigente de la ANI)',
  notaPnd: 'Las Bases del Plan Nacional de Desarrollo 2026–2030 "Colombia, la patria milagro" fueron presentadas en noviembre de 2026 y se encuentran en formulación (no constituyen aún ley expedida).'
};

export const PND_7_AXES_OFFICIAL = [
  { numero: 1, nombre: 'Milagro de las regiones', color: '#F2A900', focoSugerido: 'F1+F2', cita: 'Bases PND 2026–2030 "Colombia, la patria milagro" (noviembre 2026 — en formulación) · assets/bases_pnd_siete_ejes.png' },
  { numero: 2, nombre: 'Talento, conocimiento e innovación para el desarrollo', color: '#1A73E8', focoSugerido: 'F1+F2', cita: 'Bases PND 2026–2030 "Colombia, la patria milagro" (noviembre 2026 — en formulación) · assets/bases_pnd_siete_ejes.png' },
  { numero: 3, nombre: 'Patriotismo constitucional', color: '#E66A1F', focoSugerido: 'F2', cita: 'Bases PND 2026–2030 "Colombia, la patria milagro" (noviembre 2026 — en formulación) · assets/bases_pnd_siete_ejes.png' },
  { numero: 4, nombre: 'Milagro social', color: '#189D47', focoSugerido: 'F2', cita: 'Bases PND 2026–2030 "Colombia, la patria milagro" (noviembre 2026 — en formulación) · assets/bases_pnd_siete_ejes.png' },
  { numero: 5, nombre: 'Milagro económico', color: '#00A99D', focoSugerido: 'F1', cita: 'Bases PND 2026–2030 "Colombia, la patria milagro" (noviembre 2026 — en formulación) · assets/bases_pnd_siete_ejes.png' },
  { numero: 6, nombre: 'Transformación del Estado: un Estado que se acerca', color: '#F2B705', focoSugerido: 'F2', cita: 'Bases PND 2026–2030 "Colombia, la patria milagro" (noviembre 2026 — en formulación) · assets/bases_pnd_siete_ejes.png' },
  { numero: 7, nombre: 'Reconstrucción, transformación y resiliencia', color: '#146EBE', focoSugerido: 'F1+F2', cita: 'Bases PND 2026–2030 "Colombia, la patria milagro" (noviembre 2026 — en formulación) · assets/bases_pnd_siete_ejes.png' }
];

export const DOFA_ANI_MATRIX = {
  image: './assets/dofa_ani_estrategico.png',
  citation: 'DOFA-ANI',
  fortalezas: [
    ['Experiencia y Conocimiento Técnico', 'Amplia experiencia en la gestión de proyectos de infraestructura, especialmente carreteras. Equipos técnicos y jurídicos robustos en el sector transporte.'],
    ['Capacidad de Ejecución', 'Historial de ejecución exitosa de proyectos de infraestructura a gran escala.'],
    ['Gestión de Riesgos', 'Experiencia en la identificación y gestión de riesgos contractuales y financieros.'],
    ['Marco Legal y Regulatorio', 'Sólido marco legal y regulatorio para la estructuración y ejecución de proyectos de infraestructura.'],
    ['Posicionamiento y experiencia con APPs', 'Mecanismo efectivo de financiación y estructuración de megaproyectos en el país.']
  ],
  debilidades: [
    ['Coordinación y Comunicación', 'Desafíos en la coordinación y comunicación entre áreas. Falta de claridad en roles y responsabilidades.'],
    ['Tecnología', 'Rezago tecnológico y falta de sistemas de información adecuados.'],
    ['Recursos Humanos', 'Falta de personal de planta y alta rotación de contratistas. Dificultades para atraer y retener talento.'],
    ['Cultura Organizacional', 'Necesidad de fortalecer la cultura organizacional y mejorar la comunicación interna.'],
    ['Flexibilidad y Adaptabilidad', 'Rigidez en la estructura y operación de la agencia. Dificultad para adaptarse a los cambios y demandas del entorno.'],
    ['Falta de articulación entre áreas', 'Lentitud en los procesos y toma de decisiones por ausencia de articulación.']
  ],
  oportunidades: [
    ['Expansión a Otros Sectores y Modos', 'Oportunidad de expandir la gestión de proyectos a otros sectores (salud, educación, agua, social) y fortalecimiento de otros modos distintos al carretero.'],
    ['Nuevas Fuentes de Financiación', 'Exploración de fuentes alternativas de financiación.'],
    ['Incorporación de Tecnología', 'Incorporar tecnología y mejorar sistemas de información para mejorar eficiencia, productividad y capitalizar la gestión de conocimiento.'],
    ['Relacionamiento con Ministerios y Entidades', 'Extrapolar capacidades y buscar sinergias en pro de mejorar la asignación de recursos presupuestales y ejecución de proyectos en curso.'],
    ['Cooperación Internacional', 'Fortalecer la cooperación internacional para el desarrollo de proyectos de infraestructura.']
  ],
  amenazas: [
    ['Inestabilidad Política y Social', 'El contexto político y social complejo puede afectar la ejecución de los proyectos.'],
    ['Restricciones Presupuestales', 'Las restricciones presupuestales y la incertidumbre en la disponibilidad de recursos pueden afectar la viabilidad de los proyectos.'],
    ['Conflictos Sociales y Ambientales', 'La oposición de las comunidades y los desafíos ambientales pueden retrasar o impedir la ejecución de los proyectos.'],
    ['Riesgos Jurídicos', 'Los riesgos jurídicos asociados a los proyectos pueden afectar la capacidad de financiación.']
  ]
};

export const OFFICIAL_PEI_PORTFOLIO = [
  { num: 1, foco: 'F1', grupo: 1, objetivo: 'Incrementar la construcción de vías primarias concesionadas mediante esquemas de APP para mejorar la conectividad y capacidad vial del país.', proyecto: 'Construcción de Red Vial Primaria Concesionada (APP)', unidad: 'Kilómetros (km) construidos', lineaBase: '3.596,9 km (Indicadores PND, p. 1)', meta: '410,49 km', doble: '[F2] Modelo Preventivo de Gestión de Conflictos y Alertas Tempranas Contractuales', detalle: 'Obras de construcción de vía nueva y segundas calzadas en la red vial primaria concesionada (Línea base: 3.596,9 km; Meta cuatrienio PND: 410,49 km). Fuente: Indicadores PND, p. 1; ANI_Bases PND, p. 1, 6.' },
  { num: 2, foco: 'F1', grupo: 1, objetivo: 'Mejorar y rehabilitar la calidad de la red vial primaria concesionada garantizando transitabilidad, seguridad y resiliencia climática.', proyecto: 'Mejoramiento y Rehabilitación de la Red Vial Primaria Concesionada (APP)', unidad: 'Kilómetros (km) mejorados / rehabilitados', lineaBase: '4.639,4 km (Indicadores PND, p. 1)', meta: '474,25 km', doble: '[F2] Estrategia de Ruta Social en Proyectos Concesionados', detalle: 'Intervenciones de mejoramiento, rehabilitación y conservación pesada en tramos concesionados bajo APP (Línea base: 4.639,4 km; Meta cuatrienio PND: 474,25 km). Fuente: Indicadores PND, p. 1; ANI_Bases PND, p. 6.' },
  { num: 3, foco: 'F1', grupo: 2, objetivo: 'Reactivar, rehabilitar y operar la red ferroviaria nacional a cargo de la ANI para impulsar el transporte intermodal de carga y pasajeros.', proyecto: 'Programa Nacional de Reactivación y Desarrollo Ferroviario', unidad: 'Número de kilómetros de vía férrea intervenidos', lineaBase: 'N/A — Indicadores PND, p. 2 (meta trazadora PND)', meta: '1.548,4 km', doble: '[F2] Estrategia de Ruta Social en Proyectos Concesionados', detalle: 'Adjudicación, contratación y ejecución de obras de mejoramiento, rehabilitación y operación en corredores férreos (Villavicencio–Puerto Gaitán, Yumbo–Caimalito, Bogotá–Belencito, Férreo Central) (Línea base: N/A; Meta cuatrienio PND: 1.548,4 km / 1.543 km). Fuente: Indicadores PND, p. 2; PPTX Planeación, p. 10.' },
  { num: 4, foco: 'F1', grupo: 1, objetivo: 'Estructurar de manera integral nuevos proyectos de infraestructura de transporte bajo el esquema de APP en fase de factibilidad.', proyecto: 'Estructuración Integral del Portafolio Intermodal de Transporte (APP)', unidad: 'Número de proyectos de infraestructura estructurados', lineaBase: '43 proyectos (Indicadores PND, p. 2)', meta: '6 proyectos', doble: '[F2] Estrategia de Ruta Social en Proyectos Concesionados (100% nuevas estructuraciones)', detalle: 'Proyectos de infraestructura para el desarrollo y conectividad estructurados en factibilidad bajo esquema APP en todos los modos (Línea base: 43 proyectos; Meta cuatrienio PND: 6 proyectos). Resuelve fallas históricas de maduración como el caso Canal del Dique (+$63.767M en EIA). Fuente: Indicadores PND, p. 2; Bases PND, p. 319, 321.' },
  { num: 5, foco: 'F1', grupo: 2, objetivo: 'Consolidar la gestión unificada por corredores logísticos unificando red concesionada, no concesionada y accesos portuarios y de frontera.', proyecto: 'Programa «Vías de la Patria Milagro» / Gestión de Corredores Nacionales', unidad: 'Corredores Estratégicos bajo gestión unificada', lineaBase: 'Bases PND, p. 319, 321 (8 corredores priorizados)', meta: '8 Corredores Estratégicos', doble: '[F2] Estrategia de Ruta Social en Proyectos Concesionados', detalle: 'Gestión integral por corredores en 8 ejes: Pacífico-Orinoquía (Buenaventura), Chocó conectado (2), Conexión Venezuela (2), Conectando el Caribe, Mar de Antioquia y Conexión Ecuador. Fuente: Bases PND, p. 319, 321; ANI_Bases PND, p. 6-7.' },
  { num: 6, foco: 'F1', grupo: 2, objetivo: 'Formular y estructurar la conectividad intermodal y resiliente para la reconstrucción del departamento del Chocó tras la emergencia sísmica.', proyecto: 'Plan Intermodal del Chocó («Plan Marshall»)', unidad: 'Plan Intermodal formulado / % de estructuración', lineaBase: 'Plan Marshall, p. 1-2; Bases PND, p. 442-443', meta: '100% formulado y estructurado', doble: '[F2] Estrategia de Ruta Social en Proyectos Concesionados', detalle: 'Cartera de conectividad por $1 billón cofinanciada (Obras por Impuestos y capital privado) para 6 proyectos (Quibdó–Ánimas–Nóvita, San José del Palmar–El Cairo, Istmina–Puerto Meluk, Vía al Darién, Tutunendo–Ichó, Aeropuerto Bahía Solano y evaluación del canal interoceánico Cupica). Fuente: Plan Marshall, p. 1-2; Bases PND, p. 442-443.' },
  { num: 7, foco: 'F1', grupo: 3, objetivo: 'Brindar asistencia técnica y estructurar iniciativas de APP en infraestructura social (salud, educación) y productiva (energía, TIC).', proyecto: 'Estructuración de APP en Infraestructura Social y Productiva', unidad: 'Proyectos de APP social y productiva estructurados', lineaBase: 'Bases PND, p. 280, 321 (requiere delimitación R2)', meta: 'Portafolio Social y Productivo en APP', doble: '[F2] Estrategia de Sostenibilidad, Adaptación Climática e Inclusión Social ANI', detalle: 'Apoyo técnico a ministerios para movilizar capital privado en salud (ej. Hospital Simón Bolívar), educación, infraestructura penitenciaria, energía y TIC sin presionar la caja fiscal. Fuente: Bases PND, p. 280, 321; ANI_Bases PND, p. 1, 6.' },
  { num: 8, foco: 'F1', grupo: 2, objetivo: 'Garantizar la navegación y la protección ambiental en hidrovías estratégicas de la Nación.', proyecto: 'Programa de Navegabilidad y Concesiones Fluviales (Canal del Dique y Río Meta)', unidad: '% de avance de obra / Proyectos fluviales en factibilidad', lineaBase: 'Canal del Dique (117 km) y Río Meta (99 km) — Libro de la Verdad, p. 116-117', meta: '100% de ejecución en Canal del Dique y factibilidad Río Meta', doble: '[F2] Estrategia de Ruta Social y Sostenibilidad Ambiental ANI', detalle: 'Gestión del contrato de concesión ambiental y navegación en el Canal del Dique (117 km) tras la radicación del nuevo EIA, y culminación de la estructuración a factibilidad del Río Meta (99 km). Fuente: Libro de la Verdad, p. 116-117; Bases PND, p. 319.' },
  { num: 9, foco: 'F1', grupo: 3, objetivo: 'Optimizar y expandir la capacidad operativa de terminales aéreos y marítimos bajo concesión.', proyecto: 'Programa de Modernización de Concesiones Aeroportuarias y Portuarias', unidad: 'Contratos de concesión con obras de expansión ejecutadas', lineaBase: 'Concesiones nodo aéreo y marítimo vigentes (Bases PND, p. 319, 359)', meta: '100% de concesiones nodo aéreo y marítimo modernizadas', doble: '[F2] Estrategia de Sostenibilidad, Adaptación Climática e Inclusión Social ANI', detalle: 'Seguimiento y ejecución de obras de ampliación en aeropuertos principales (Bogotá, Medellín, Cali, Barranquilla, Cartagena) y supervisión del recaudo de contraprestaciones portuarias/aeroportuarias. Fuente: Bases PND, p. 319, 359; ANI_Bases PND, p. 1.' },
  { num: 10, foco: 'F1', grupo: 1, objetivo: 'Destrabar proyectos con cuellos de botella y reactivar el capital inmovilizado en el sector.', proyecto: 'Estrategia «Obras que Avanzan» y Destrabe de Proyectos Concesionados', unidad: 'Número de proyectos concesionados destrabados', lineaBase: 'Inventario de restricciones ($7,6 billones inmovilizados — Libro de la Verdad, p. 113)', meta: '100% de megaproyectos concesionados paralizados destrabados', doble: '[F2] Modelo Preventivo de Gestión de Conflictos y Alertas Tempranas Contractuales', detalle: 'Levantamiento del inventario de restricciones técnicas, prediales, ambientales y financieras en proyectos concesionados con retrasos (recuperando los más de $7,6 billones inmovilizados en el sector). Fuente: Bases PND, p. 320, 401; Libro de la Verdad, p. 113.' },
  { num: 11, foco: 'F1', grupo: 3, objetivo: 'Modernizar la supervisión y el control mediante herramientas de analítica e inteligencia artificial.', proyecto: 'Transformación Digital, Gobierno de Datos y Monitoreo Inteligente ANI', unidad: '% de implementación del sistema digital de monitoreo contractual', lineaBase: 'Diagnóstico Gobierno de Datos / SUIT (Bases PND, p. 344, 401; Libro de la Verdad, p. 109)', meta: '100% de la gestión contractual bajo monitoreo inteligente', doble: '[F2] Modelo Preventivo de Gestión de Conflictos y Alertas Tempranas Contractuales', detalle: 'Despliegue de la Estrategia de Gobierno de Datos y uso de IA para la verificación de tráfico, recaudo de peajes, seguimiento de obras físicas y automatización de trámites (SUIT). Fuente: Bases PND, p. 344, 401; Libro de la Verdad, p. 109.' },
  { num: 12, foco: 'F2', grupo: 2, objetivo: 'Institucionalizar el diálogo temprano con comunidades para construir acuerdos voluntarios y generar valor local.', proyecto: 'Estrategia de Ruta Social en Proyectos Concesionados', unidad: '% de nuevas estructuraciones con Ruta Social / Acuerdos formalizados', lineaBase: 'Bases PND, p. 320, 322; ANI_Bases PND, p. 2, 7-8', meta: '100% de nuevas estructuraciones con Ruta Social', doble: '[F1] Portafolio Intermodal APP, Vías de la Patria Milagro, Ferroviario y Plan Chocó', detalle: 'Concertación de acuerdos voluntarios entre concesionarios, comunidades y alcaldías para financiar vías secundarias/terciarias e iniciativas productivas locales sin alterar la estabilidad económica de los contratos. Fuente: Bases PND, p. 320, 322; ANI_Bases PND, p. 2, 7-8.' },
  { num: 13, foco: 'F2', grupo: 1, objetivo: 'Implementar un modelo preventivo con alertas tempranas para reducir la litigiosidad y evitar parálisis de obras.', proyecto: 'Modelo Preventivo de Gestión de Conflictos y Alertas Tempranas Contractuales', unidad: 'Sistema de alertas tempranas operativo / Controversias resueltas', lineaBase: '48 tribunales arbitrales por $20 billones (Libro de la Verdad, p. 121-122)', meta: '100% de proyectos bajo gestión preventiva (reducción del riesgo litigioso)', doble: '[F1] Estrategia Obras que Avanzan y Red Vial Primaria Concesionada APP', detalle: 'Fortalecimiento de las capacidades prediales, sociales, ambientales, jurídicas y tecnológicas de la ANI para resolver disputas contractuales oportunamente, conteniendo el riesgo litigioso que alcanzó 48 tribunales arbitrales por $20 billones. Fuente: Libro de la Verdad, p. 121-122; ANI_Bases PND, p. 7-8.' },
  { num: 14, foco: 'F2', grupo: 3, objetivo: 'Incorporar resiliencia climática, sostenibilidad e inclusión de género en todo el ciclo contractual.', proyecto: 'Estrategia de Sostenibilidad, Adaptación Climática e Inclusión Social ANI', unidad: 'Porcentaje de proyectos concesionados con criterios de sostenibilidad e inclusión', lineaBase: 'Estándares 5G: 25% operativo / 45% gerencial (Bases PND, p. 319, 322)', meta: '100% de contratos concesionados bajo estándares de sostenibilidad y equidad', doble: '[F1] Concesiones Viales, Férreas, Fluviales, Portuarias, Aeroportuarias y APP Social', detalle: 'Incorporación de guías de Infraestructura Verde, adaptación a cambio climático y cuotas de equidad de género (25% operativo / 45% gerencial en 5G) en estructuración y ejecución. Fuente: Bases PND, p. 319, 322; PPTX Planeación, p. 8, 10.' }
];

export const OFFICIAL_PEI_PRIORITY_GROUPS = [
  {
    id: 1,
    titulo: 'GRUPO 1: URGENCIA ESTRUCTURAL',
    proyectos: 'Proyectos 1, 2, 4, 10, 13',
    descripcion: 'Recuperar seguridad jurídica, destrabar obras y metas PND.',
    justificacion: 'Constituyen el núcleo de la estabilidad jurídica e institucional. Detener la expansión del riesgo litigioso de $20 billones (Proyecto 13) y destrabar megaproyectos inconclusos (Proyecto 10) es indispensable para habilitar el cumplimiento de los indicadores trazadores del PND de 410,49 km construidos, 474,25 km mejorados y las 6 nuevas estructuraciones APP (Proyectos 1, 2 y 4).',
    periodo: 'Años 2027–2028'
  },
  {
    id: 2,
    titulo: 'GRUPO 2: TRANSFORMACIÓN INTERMODAL',
    proyectos: 'Proyectos 3, 5, 6, 8, 12',
    descripcion: 'Reactivación férrea, fluvial, Plan Chocó y Ruta Social.',
    justificacion: 'Materializan el giro estratégico hacia la intermodalidad y el desarrollo regional. Permiten diversificar la matriz logística con 1.548,4 km férreos (Proyecto 3), cumplir los compromisos del «Plan Marshall» en el Pacífico por $1 billón (Proyecto 6) e institucionalizar la legitimidad comunitaria en el territorio (Proyecto 12).',
    periodo: 'Años 2027–2029'
  },
  {
    id: 3,
    titulo: 'GRUPO 3: INNOVACIÓN Y FUTURO',
    proyectos: 'Proyectos 7, 9, 11, 14',
    descripcion: 'APP social, modernización aeroportuaria e IA.',
    justificacion: 'Consolidan el posicionamiento de la ANI a 2030 como entidad referente regional. Permiten extender las APP hacia salud y educación (Proyecto 7), modernizar la supervisión con inteligencia artificial (Proyecto 11) y garantizar altos estándares de resiliencia e inclusión (Proyecto 14).',
    periodo: 'Años 2028–2030'
  }
];

export const DB_SEED_RECORDS = {
  sourceFile: 'data/strategy_lab.db',
  areas: [{ id: 1, nombre: 'GIT de Planeación - GC', activa: true, fecha: '2026-11-14' }],
  pei: [
    {
      dbId: 1,
      area: 'GIT de Planeación - GC',
      foco: 'F2',
      objetivo: 'Implementar una estrategia integral de gestión del conocimiento, innovación y memoria institucional que permita preservar el conocimiento crítico de la ANI, facilitar su acceso y reutilización, fortalecer la toma de decisiones basada en evidencia y reducir el riesgo de pérdida de conocimiento institucional',
      proyecto: 'Analítica institucional',
      unidad: 'productos implementados',
      lineaBase: 'Registro base data/strategy_lab.db (GIT de Planeación - GC)',
      meta: 'Implementar 12 ejercicios de analítica instiucional',
      detalle: 'Propuesta registrada por GIT de Planeación - GC en data/strategy_lab.db (Estado: Aprobado, 2026-11-14). Capacidad tecnológica y de gestión del conocimiento.',
      responsable: 'GIT de Planeación - GC',
      estatus: 'oficial'
    }
  ],
  actionPlan: [
    { dbId: 1, peiDbId: 1, codigo: 'PA-DB-01', foco: 'F2', actividad: 'Hacer 2 ejercicios de analítica institucional', m2027: '2', unidad: 'ejercicios realizados', detalle: 'Registro importado de data/strategy_lab.db (detalle pendiente de completar por el área)', responsable: 'GIT de Planeación - GC', lineaBase: 'Registro data/strategy_lab.db', estado: 'En construcción' },
    { dbId: 2, peiDbId: 1, codigo: 'PA-DB-02', foco: 'F2', actividad: 'Hacer 2 ejercicios de analítica institucional', m2027: '2', unidad: 'ejercicios realizados', detalle: 'aprobadas y validadas y en uso', responsable: 'GIT de Planeación - GC', lineaBase: 'Registro data/strategy_lab.db', estado: 'En construcción' },
    { dbId: 3, peiDbId: 1, codigo: 'PA-DB-03', foco: 'F2', actividad: 'hacer ejercicios de analítica', m2027: '2', unidad: 'ejercicios realizados', detalle: 'Prueba de edición y persistencia DATA', responsable: 'GIT de Planeación - GC', lineaBase: 'Registro data/strategy_lab.db', estado: 'En construcción' }
  ]
};
