# App Interactiva ANI · PEI 2027–2030

Archivo principal: **`index.html`** (un solo archivo, sin dependencias).

## Qué hace
- **5 pasos guiados:** Panel → Documentos (4 hojas) → Ejercicio PEI (tabla) → Priorización (scoring 1–5 + matriz) → Resumen ejecutivo.
- **4 hojas de documentos:** PND, Plan Chocó Renace, Discursos Ministra, Plan Destrabe. Cada una con: resumen de lo principal, puntos principales, **relación ANI** (qué le pide / qué le ofrece / qué debe hacer), contribución concreta, foco F1/F2, evidencia/cita y pendientes.
- **Ejercicio dinámico:** crear/duplicar/eliminar proyectos, diligenciar las 6 columnas en línea, doble llave F1↔F2, scoring con sliders, ranking y matriz Impacto vs. Esfuerzo automáticos.
- **Todo se diligencia en línea:** guardado automático, avance %, checklist, resumen auto-generado, exportar CSV/JSON, importar JSON, imprimir/PDF, taller con cronómetro 20 min.

## Seguridad y gratuidad (entorno no público)
- **100% local y gratuito:** sin servidor, sin cuentas, sin librerías externas, sin rastreadores. Funciona sin internet.
- **Datos solo en tu navegador** (`localStorage`). Nada se publica ni se envía. Para compartir: Exportar JSON/CSV y enviarlo por tu canal institucional.
- **No inventa información:** los 4 documentos quedan como hojas vacías listas para diligenciar. Si un dato no está en el documento, la app guía a escribir *Información insuficiente para concluir*.

## Cómo usar
1. Abre `index.html` en el navegador (o usa la vista previa en vivo).
2. Paso 1: diligencia cada documento (pega/resume solo lo que dice).
3. Paso 2: crea proyectos con la tabla (1 proyecto = 1 fila = 1 foco).
4. Paso 3: puntúa 1–5 y ubica en la matriz.
5. Paso 4: revisa el resumen y exporta CSV (tabla) + JSON (respaldo).

## Archivos del repo
- `01_Marco_Estrategico_ANI_2027-2030.md` — marco completo
- `02_Plantilla_Ejercicio_PEI_2027-2030.csv` — plantilla Excel/Sheets
- `03_Canvas_2_Focos_ANI.html` — canvas visual
- `index.html` — **app interactiva (esta)**
