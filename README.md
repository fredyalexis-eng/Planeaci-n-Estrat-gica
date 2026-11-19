# ANI STRATEGY LAB · Planeación e Inteligencia Estratégica (PEI 2027–2030)

Plataforma web ejecutiva de planeación e inteligencia estratégica para la **Agencia Nacional de Infraestructura de Colombia (ANI)**, evolucionada directamente sobre el marco estratégico y los archivos originales del repositorio.

## 🌐 GitHub Pages (frontend estático en línea)

**URL:** https://fredyalexis-eng.github.io/Planeaci-n-Estrat-gica/

El workflow `.github/workflows/pages.yml` publica exclusivamente los recursos estáticos del frontend (`index.html`, `assets/`, `data/` y los 4 documentos originales), excluyendo el código de servidor (`server/`) y cualquier archivo de variables de entorno (`.env*`).

## 🧭 Nueve módulos integrados

1. **Centro de Mando Ejecutivo** — Estrategia ANI 2027–2030, KPIs, 2 Focos, Hoja de Ruta, checklist automático y síntesis ejecutiva imprimible.
2. **Identidad y Competencias** — Misión, Visión, Objetivos Estratégicos vigentes (marcados como pendientes hasta carga oficial) y matriz modal con regla R2.
3. **Dos Focos y Arquitectura Causal** — Comparativa F1↔F2, Mapa Estratégico (6 niveles), Árboles de Problemas y Objetivos, Teoría del Cambio, 6 Indicadores y 6 Riesgos.
4. **PND (7 Ejes) y Biblioteca Documental** — Trazabilidad de los 7 ejes del PND, las 4 hojas comparables preservadas (*PND, Plan Chocó Renace, Discursos Ministra, Plan Destrabe*), acervo original y carga documental ampliable.
5. **Análisis de Oportunidades** — Recomendaciones estructurales R1–R6 y matriz de oportunidades PND–ANI convertible en borradores PEI.
6. **Cartera PEI y Priorización** — Contrato de 6 columnas, Doble Llave F1↔F2, scoring multicriterio 1–5 (9 criterios), mapa cartesiano y 4 cuadrantes Impacto–Esfuerzo, ranking y cronómetro de taller 20 min.
7. **Plan de Acción 2027–2030** — Desagregación operativa por proyecto PEI, indicadores de gestión, metas anuales 2027–2030, responsables y cronograma plurianual.
8. **Centro Audiovisual y Recursos** — Sala de 2 reproductores HTML5 institucionales (con streaming HTTP `206 Range` y autodetección en `assets/media/`), galería de láminas/mapas estratégicos con visor ampliable (*lightbox*), previsualización local inmediata y `03_Canvas_2_Focos_ANI.html` embebido.
9. **Agente Estratégico IA y Consulta** — Integración exclusiva con Arena API (`https://api.arena.ai`, autodetección de modelos vía `/v1/models`, `X-Arena-Trace-ID` y verificación estricta de citas `[ID]`), buscador documental BM25 en español y auditor automático R1–R6.

## 🎬 Carga de videos e imágenes institucionales

Coloque los archivos oficiales en `assets/media/` (sin renombrar código; `GET /api/media` los detecta automáticamente):
- Videos principales: `assets/media/video_institucional_01.mp4` y `assets/media/video_institucional_02.mp4` (o cualquier `.mp4`/`.webm`).
- Láminas estratégicas: `assets/media/lamina_01_iniciativas_estrategicas.png`, `assets/media/lamina_02_tabla_pei_2027_2030.png` y mapas/infografías adicionales (`.png`, `.jpg`, `.webp`, `.svg`).

## 🚀 Ejecución con servidor y Agente Estratégico (Node.js ≥ 20, sin dependencias externas)

```bash
cp .env.example .env      # Configure ARENA_API_KEY y ARENA_MODEL (nunca versionar .env)
npm start                 # Inicia frontend + API del agente en http://0.0.0.0:3000
npm run verify:arena      # Verifica conexión y modelos habilitados en Arena API
npm test                  # Ejecuta la suite automatizada de pruebas
```

## 📁 Archivos originales preservados

- `index.html` — Interfaz integrada ANI STRATEGY LAB (100% compatible con `localStorage` `ani_pei_2027_2030_v1`)
- `01_Marco_Estrategico_ANI_2027-2030.md` — Marco estratégico completo (intacto e indexado)
- `02_Plantilla_Ejercicio_PEI_2027-2030.csv` — Plantilla Excel/Sheets de 18 columnas (intacta y compatible)
- `03_Canvas_2_Focos_ANI.html` — Canvas ejecutivo visual (intacto e integrado)
- `04_App_Interactiva_ANI.md` — Guía operativa original (intacta)

## 🔒 Seguridad y gobernanza

- Los datos de trabajo se guardan localmente en el navegador (`localStorage`) con exportación/importación JSON y CSV.
- Ninguna credencial se expone en el código cliente ni en el repositorio (`.env` excluido en `.gitignore` y bloqueado por el servidor).
- No se inventan datos institucionales ni metas sin línea base; toda propuesta de IA se etiqueta expresamente como **no aprobada**.
