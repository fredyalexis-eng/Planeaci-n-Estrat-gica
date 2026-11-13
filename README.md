# Planeación Estratégica ANI · PEI 2027–2030

App interactiva + marco estratégico a partir de los 2 Focos (Iniciativas del PND) y la tabla PEI.

## 🌐 GitHub Pages (app en línea)

**URL:** https://fredyalexis-eng.github.io/Planeaci-n-Estrat-gica/

La app es `index.html` (un solo archivo, 100% local, sin servidor). Se publica con GitHub Pages vía Actions (`.github/workflows/pages.yml`).

### Activación (una sola vez, después de mergear el PR a `main`)
1. En GitHub: **Settings → Pages**
2. **Source:** `GitHub Actions`
3. Espera 1–2 min a que termine el workflow **Deploy GitHub Pages**
4. Abre la URL de arriba

> Cada push a `main` republica automáticamente la app.

## 📁 Archivos
- `index.html` — **App interactiva** (5 pasos: Panel → Documentos → Ejercicio PEI → Priorización → Resumen)
- `01_Marco_Estrategico_ANI_2027-2030.md` — marco completo
- `02_Plantilla_Ejercicio_PEI_2027-2030.csv` — plantilla Excel/Sheets
- `03_Canvas_2_Focos_ANI.html` — canvas visual
- `04_App_Interactiva_ANI.md` — guía de uso

## 🔒 Seguridad
La app guarda los datos **solo en el navegador** (`localStorage`). No envía datos a ningún servidor. Para compartir: Exportar JSON/CSV desde la propia app.
