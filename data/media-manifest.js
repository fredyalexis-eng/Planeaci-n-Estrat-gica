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
    defaultTitle: 'Bases Plan Nacional de Desarrollo 2026–2030 — 7 Ejes Estratégicos (Colombia, la patria milagro)',
    defaultUrl: './assets/bases_pnd_siete_ejes.png',
    suggestedFile: 'assets/bases_pnd_siete_ejes.png',
    defaultFoco: 'F1+F2',
    citation: 'PND-7-EJES',
    summary: 'Infografía institucional ANI sobre las Bases del PND 2026–2030 (DNP, noviembre 2026): Milagro de las regiones; Talento, conocimiento e innovación; Patriotismo constitucional; Milagro social; Milagro económico; Transformación del Estado; Reconstrucción, transformación y resiliencia.'
  },
  {
    slotId: 'img-lamina-tabla-pei',
    order: 2,
    defaultTitle: 'Matriz DOFA Estratégica Institucional — ANI',
    defaultUrl: './assets/dofa_ani_estrategico.png',
    suggestedFile: 'assets/dofa_ani_estrategico.png',
    defaultFoco: 'F1+F2',
    citation: 'DOFA-ANI',
    summary: 'Matriz DOFA institucional ANI incorporada al repositorio: 5 Fortalezas (experiencia técnica, ejecución, riesgos, marco legal, APP), 6 Debilidades, 5 Oportunidades (expansión multisectorial e intermodal, financiación, tecnología, articulación, cooperación) y 4 Amenazas.'
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
