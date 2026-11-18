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
  { col: 'FOCO (INICIATIVA)', rule: 'Únicamente F1 o F2. Si contribuye a ambos, elegir el foco principal y justificar la articulación en Detalle y Doble Llave.', avoid: 'Dejar vacío o inventar un tercer foco.' },
  { col: 'OBJETIVOS ESTRATÉGICOS', rule: 'Seleccionar o copiar un objetivo estratégico vigente de la ANI. Mientras no esté cargado, usar "Información insuficiente para concluir".', avoid: 'Redactar objetivos nuevos improvisados en cada fila.' },
  { col: 'PROYECTO', rule: 'Nombre único, concreto y verificable, indicando modo de transporte (F1) o frente de capacidad/territorio (F2).', avoid: 'Nombres genéricos como "mejorar infraestructura".' },
  { col: 'UNIDAD MEDIDA', rule: 'Una sola unidad verificable: km, %, casos, proyectos, corredores, índice, etc.', avoid: 'Mezclar varias unidades o escribir "varios".' },
  { col: 'META 2030', rule: 'Número + unidad + horizonte 2030 únicamente si existe línea base verificada; de lo contrario escribir "Por definir — línea base pendiente".', avoid: 'Fijar metas numéricas sin línea base oficial.' },
  { col: 'DETALLE', rule: 'Explicar contribución al Foco, cumplimiento de los 6 criterios F1 o 5 capacidades F2, supuestos y riesgos principales.', avoid: 'Texto promocional sin trazabilidad técnica.' }
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
  }
];
