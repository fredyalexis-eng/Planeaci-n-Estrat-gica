/**
 * ANI STRATEGY LAB — Manifiesto Estructural del Centro Audiovisual
 *
 * Define los espacios institucionales para los 2 videos oficiales y las
 * imágenes/láminas estratégicas sin utilizar material genérico de relleno.
 * Todo archivo colocado en `assets/media/` se detecta y enlaza automáticamente.
 */

export const INSTITUTIONAL_VIDEO_SLOTS = [
  {
    slotId: 'video-ani-01',
    order: 1,
    defaultTitle: 'Video Institucional 01 — Estrategia ANI y Conectividad Multimodal 2027–2030',
    suggestedFile: 'assets/media/video_institucional_01.mp4',
    defaultFoco: 'F1',
    summary: 'Espacio principal para la pieza audiovisual institucional de presentación estratégica y portafolio multimodal integrado (carretero, férreo, fluvial, portuario y aeroportuario).'
  },
  {
    slotId: 'video-ani-02',
    order: 2,
    defaultTitle: 'Video Institucional 02 — Ruta Social, Territorio y Gestión Preventiva',
    suggestedFile: 'assets/media/video_institucional_02.mp4',
    defaultFoco: 'F2',
    summary: 'Espacio principal para la pieza audiovisual institucional sobre diálogo territorial, participación, beneficios compartidos y gestión preventiva de conflictos.'
  }
];

export const STRATEGIC_IMAGE_SLOTS = [
  {
    slotId: 'img-lamina-focos',
    order: 1,
    defaultTitle: 'Lámina Estratégica 01 — Iniciativas Estratégicas PND (Foco 1 y Foco 2)',
    suggestedFile: 'assets/media/lamina_01_iniciativas_estrategicas.png',
    defaultFoco: 'F1+F2',
    citation: 'MARCO-S2.1',
    summary: 'Insumo gráfico fuente referenciado en 01_Marco_Estrategico_ANI_2027-2030.md (§2.1): definición de los dos focos estratégicos, criterios transversales F1 y capacidades F2.'
  },
  {
    slotId: 'img-lamina-tabla-pei',
    order: 2,
    defaultTitle: 'Lámina Estratégica 02 — Matriz Contractual Tabla PEI 2027–2030',
    suggestedFile: 'assets/media/lamina_02_tabla_pei_2027_2030.png',
    defaultFoco: 'F1+F2',
    citation: 'MARCO-S2.1',
    summary: 'Insumo gráfico fuente referenciado en 01_Marco_Estrategico_ANI_2027-2030.md (§2.1): estructura de trazabilidad de 6 columnas (Foco, Objetivos, Proyecto, Unidad, Meta 2030, Detalle).'
  }
];

/**
 * Valida estrictamente rutas multimedia permitidas (bloquea javascript:, data:text/html, etc.)
 */
export function sanitizeMediaUrl(rawUrl) {
  const s = String(rawUrl || '').trim();
  if (!s) return '';
  if (s.startsWith('blob:')) return s;
  if (/^https:\/\//i.test(s)) return s;
  if (/^\.?\/?assets\/(?:media\/)?[A-Za-z0-9._% -]+\.(?:mp4|webm|ogg|ogv|mov|m4v|png|jpe?g|webp|svg|gif)$/i.test(s) && !s.includes('..')) {
    return s.startsWith('./') ? s : s.startsWith('/') ? `.${s}` : `./${s}`;
  }
  if (/^\.?\/?assets\/media\/[A-Za-z0-9._% -]+$/i.test(s) && !s.includes('..')) {
    return s.startsWith('./') ? s : s.startsWith('/') ? `.${s}` : `./${s}`;
  }
  return '';
}

export function formatBytes(bytes = 0) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
