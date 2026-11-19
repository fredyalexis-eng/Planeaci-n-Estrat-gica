import streamlit as st
import pandas as pd


FOCO_1 = "Infraestructura dinamizadora para la conectividad y el desarrollo"
FOCO_2 = "Ruta social y gestión preventiva de conflictos"

PROYECTOS_PEI = [
    {
        "FOCO (INICIATIVA)": FOCO_1,
        "OBJETIVOS ESTRATÉGICOS": "Incrementar la construcción de vías primarias concesionadas mediante esquemas de APP para mejorar la conectividad y capacidad vial del país.",
        "PROYECTO": "Construcción de Red Vial Primaria Concesionada (APP)",
        "UNIDAD MEDIDA": "Kilómetros (km) construidos",
        "META 2030": "410,49 km",
        "DETALLE": "Obras de construcción de vía nueva y segundas calzadas en la red vial primaria concesionada (Línea base: 3.596,9 km; Meta cuatrienio PND: 410,49 km). Fuente: Indicadores PND, p. 1; ANI_Bases PND, p. 1, 6."
    },
    {
        "FOCO (INICIATIVA)": FOCO_1,
        "OBJETIVOS ESTRATÉGICOS": "Mejorar y rehabilitar la calidad de la red vial primaria concesionada garantizando transitabilidad, seguridad y resiliencia climática.",
        "PROYECTO": "Mejoramiento y Rehabilitación de la Red Vial Primaria Concesionada (APP)",
        "UNIDAD MEDIDA": "Kilómetros (km) mejorados / rehabilitados",
        "META 2030": "474,25 km",
        "DETALLE": "Intervenciones de mejoramiento, rehabilitación y conservación pesada en tramos concesionados bajo APP (Línea base: 4.639,4 km; Meta cuatrienio PND: 474,25 km). Fuente: Indicadores PND, p. 1; ANI_Bases PND, p. 6."
    },
    {
        "FOCO (INICIATIVA)": FOCO_1,
        "OBJETIVOS ESTRATÉGICOS": "Reactivar, rehabilitar y operar la red ferroviaria nacional a cargo de la ANI para impulsar el transporte intermodal de carga y pasajeros.",
        "PROYECTO": "Programa Nacional de Reactivación y Desarrollo Ferroviario",
        "UNIDAD MEDIDA": "Número de kilómetros de vía férrea intervenidos",
        "META 2030": "1.548,4 km",
        "DETALLE": "Adjudicación, contratación y ejecución de obras de mejoramiento, rehabilitación y operación en corredores férreos (Villavicencio–Puerto Gaitán, Yumbo–Caimalito, Bogotá–Belencito, Férreo Central) (Línea base: N/A; Meta cuatrienio PND: 1.548,4 km / 1.543 km). Fuente: Indicadores PND, p. 2; PPTX Planeación, p. 10."
    },
    {
        "FOCO (INICIATIVA)": FOCO_1,
        "OBJETIVOS ESTRATÉGICOS": "Estructurar de manera integral nuevos proyectos de infraestructura de transporte bajo el esquema de APP en fase de factibilidad.",
        "PROYECTO": "Estructuración Integral del Portafolio Intermodal de Transporte (APP)",
        "UNIDAD MEDIDA": "Número de proyectos de infraestructura estructurados",
        "META 2030": "6 proyectos",
        "DETALLE": "Proyectos de infraestructura para el desarrollo y conectividad estructurados en factibilidad bajo esquema APP en todos los modos (Línea base: 43 proyectos; Meta cuatrienio PND: 6 proyectos). Resuelve fallas históricas de maduración como el caso Canal del Dique (+$63.767M en EIA). Fuente: Indicadores PND, p. 2; Bases PND, p. 319, 321."
    },
    {
        "FOCO (INICIATIVA)": FOCO_1,
        "OBJETIVOS ESTRATÉGICOS": "Consolidar la gestión unificada por corredores logísticos unificando red concesionada, no concesionada y accesos portuarios y de frontera.",
        "PROYECTO": "Programa «Vías de la Patria Milagro» / Gestión de Corredores Nacionales",
        "UNIDAD MEDIDA": "Corredores Estratégicos bajo gestión unificada",
        "META 2030": "8 Corredores Estratégicos",
        "DETALLE": "Gestión integral por corredores en 8 ejes: Pacífico-Orinoquía (Buenaventura), Chocó conectado (2), Conexión Venezuela (2), Conectando el Caribe, Mar de Antioquia y Conexión Ecuador. Fuente: Bases PND, p. 319, 321; ANI_Bases PND, p. 6-7."
    },
    {
        "FOCO (INICIATIVA)": FOCO_1,
        "OBJETIVOS ESTRATÉGICOS": "Formular y estructurar la conectividad intermodal y resiliente para la reconstrucción del departamento del Chocó tras la emergencia sísmica.",
        "PROYECTO": "Plan Intermodal del Chocó («Plan Marshall»)",
        "UNIDAD MEDIDA": "Plan Intermodal formulado / % de estructuración",
        "META 2030": "100% formulado y estructurado",
        "DETALLE": "Cartera de conectividad por $1 billón cofinanciada (Obras por Impuestos y capital privado) para 6 proyectos (Quibdó–Ánimas–Nóvita, San José del Palmar–El Cairo, Istmina–Puerto Meluk, Vía al Darién, Tutunendo–Ichó, Aeropuerto Bahía Solano y evaluación del canal interoceánico Cupica). Fuente: Plan Marshall, p. 1-2; Bases PND, p. 442-443."
    },
    {
        "FOCO (INICIATIVA)": FOCO_1,
        "OBJETIVOS ESTRATÉGICOS": "Brindar asistencia técnica y estructurar iniciativas de APP en infraestructura social (salud, educación) y productiva (energía, TIC).",
        "PROYECTO": "Estructuración de APP en Infraestructura Social y Productiva",
        "UNIDAD MEDIDA": "Proyectos de APP social y productiva estructurados",
        "META 2030": "Portafolio Social y Productivo en APP",
        "DETALLE": "Apoyo técnico a ministerios para movilizar capital privado en salud (ej. Hospital Simón Bolívar), educación, infraestructura penitenciaria, energía y TIC sin presionar la caja fiscal. Fuente: Bases PND, p. 280, 321; ANI_Bases PND, p. 1, 6."
    },
    {
        "FOCO (INICIATIVA)": FOCO_1,
        "OBJETIVOS ESTRATÉGICOS": "Garantizar la navegación y la protección ambiental en hidrovías estratégicas de la Nación.",
        "PROYECTO": "Programa de Navegabilidad y Concesiones Fluviales (Canal del Dique y Río Meta)",
        "UNIDAD MEDIDA": "% de avance de obra / Proyectos fluviales en factibilidad",
        "META 2030": "100% de ejecución en Canal del Dique y factibilidad Río Meta",
        "DETALLE": "Gestión del contrato de concesión ambiental y navegación en el Canal del Dique (117 km) tras la radicación del nuevo EIA, y culminación de la estructuración a factibilidad del Río Meta (99 km). Fuente: Libro de la Verdad, p. 116-117; Bases PND, p. 319."
    },
    {
        "FOCO (INICIATIVA)": FOCO_1,
        "OBJETIVOS ESTRATÉGICOS": "Optimizar y expandir la capacidad operativa de terminales aéreos y marítimos bajo concesión.",
        "PROYECTO": "Programa de Modernización de Concesiones Aeroportuarias y Portuarias",
        "UNIDAD MEDIDA": "Contratos de concesión con obras de expansión ejecutadas",
        "META 2030": "100% de concesiones nodo aéreo y marítimo modernizadas",
        "DETALLE": "Seguimiento y ejecución de obras de ampliación en aeropuertos principales (Bogotá, Medellín, Cali, Barranquilla, Cartagena) y supervisión del recaudo de contraprestaciones portuarias/aeroportuarias. Fuente: Bases PND, p. 319, 359; ANI_Bases PND, p. 1."
    },
    {
        "FOCO (INICIATIVA)": FOCO_1,
        "OBJETIVOS ESTRATÉGICOS": "Destrabar proyectos con cuellos de botella y reactivar el capital inmovilizado en el sector.",
        "PROYECTO": "Estrategia «Obras que Avanzan» y Destrabe de Proyectos Concesionados",
        "UNIDAD MEDIDA": "Número de proyectos concesionados destrabados",
        "META 2030": "100% de megaproyectos concesionados paralizados destrabados",
        "DETALLE": "Levantamiento del inventario de restricciones técnicas, prediales, ambientales y financieras en proyectos concesionados con retrasos (recuperando los más de $7,6 billones inmovilizados en el sector). Fuente: Bases PND, p. 320, 401; Libro de la Verdad, p. 113."
    },
    {
        "FOCO (INICIATIVA)": FOCO_1,
        "OBJETIVOS ESTRATÉGICOS": "Modernizar la supervisión y el control mediante herramientas de analítica e inteligencia artificial.",
        "PROYECTO": "Transformación Digital, Gobierno de Datos y Monitoreo Inteligente ANI",
        "UNIDAD MEDIDA": "% de implementación del sistema digital de monitoreo contractual",
        "META 2030": "100% de la gestión contractual bajo monitoreo inteligente",
        "DETALLE": "Despliegue de la Estrategia de Gobierno de Datos y uso de IA para la verificación de tráfico, recaudo de peajes, seguimiento de obras físicas y automatización de trámites (SUIT). Fuente: Bases PND, p. 344, 401; Libro de la Verdad, p. 109."
    },
    {
        "FOCO (INICIATIVA)": FOCO_2,
        "OBJETIVOS ESTRATÉGICOS": "Institucionalizar el diálogo temprano con comunidades para construir acuerdos voluntarios y generar valor local.",
        "PROYECTO": "Estrategia de Ruta Social en Proyectos Concesionados",
        "UNIDAD MEDIDA": "% de nuevas estructuraciones con Ruta Social / Acuerdos formalizados",
        "META 2030": "100% de nuevas estructuraciones con Ruta Social",
        "DETALLE": "Concertación de acuerdos voluntarios entre concesionarios, comunidades y alcaldías para financiar vías secundarias/terciarias e iniciativas productivas locales sin alterar la estabilidad económica de los contratos. Fuente: Bases PND, p. 320, 322; ANI_Bases PND, p. 2, 7-8."
    },
    {
        "FOCO (INICIATIVA)": FOCO_2,
        "OBJETIVOS ESTRATÉGICOS": "Implementar un modelo preventivo con alertas tempranas para reducir la litigiosidad y evitar parálisis de obras.",
        "PROYECTO": "Modelo Preventivo de Gestión de Conflictos y Alertas Tempranas Contractuales",
        "UNIDAD MEDIDA": "Sistema de alertas tempranas operativo / Controversias resueltas",
        "META 2030": "100% de proyectos bajo gestión preventiva (reducción del riesgo litigioso)",
        "DETALLE": "Fortalecimiento de las capacidades prediales, sociales, ambientales, jurídicas y tecnológicas de la ANI para resolver disputas contractuales oportunamente, conteniendo el riesgo litigioso que alcanzó 48 tribunales arbitrales por $20 billones. Fuente: Libro de la Verdad, p. 121-122; ANI_Bases PND, p. 7-8."
    },
    {
        "FOCO (INICIATIVA)": FOCO_2,
        "OBJETIVOS ESTRATÉGICOS": "Incorporar resiliencia climática, sostenibilidad e inclusión de género en todo el ciclo contractual.",
        "PROYECTO": "Estrategia de Sostenibilidad, Adaptación Climática e Inclusión Social ANI",
        "UNIDAD MEDIDA": "Porcentaje de proyectos concesionados con criterios de sostenibilidad e inclusión",
        "META 2030": "100% de contratos concesionados bajo estándares de sostenibilidad y equidad",
        "DETALLE": "Incorporación de guías de Infraestructura Verde, adaptación a cambio climático y cuotas de equidad de género (25% operativo / 45% gerencial en 5G) en estructuración y ejecución. Fuente: Bases PND, p. 319, 322; PPTX Planeación, p. 8, 10."
    }
]


GRUPOS_PRIORIZACION = [
    {
        "titulo": "GRUPO 1: URGENCIA ESTRUCTURAL",
        "proyectos": "Proyectos 1, 2, 4, 10, 13",
        "descripcion": "Recuperar seguridad jurídica, destrabar obras y metas PND.",
        "justificacion": "Constituyen el núcleo de la estabilidad jurídica e institucional. Detener la expansión del riesgo litigioso de $20 billones (Proyecto 13) y destrabar megaproyectos inconclusos (Proyecto 10) es indispensable para habilitar el cumplimiento de los indicadores trazadores del PND de 410,49 km construidos, 474,25 km mejorados y las 6 nuevas estructuraciones APP (Proyectos 1, 2 y 4).",
        "periodo": "Años 2027–2028"
    },
    {
        "titulo": "GRUPO 2: TRANSFORMACIÓN INTERMODAL",
        "proyectos": "Proyectos 3, 5, 6, 8, 12",
        "descripcion": "Reactivación férrea, fluvial, Plan Chocó y Ruta Social.",
        "justificacion": "Materializan el giro estratégico hacia la intermodalidad y el desarrollo regional. Permiten diversificar la matriz logística con 1.548,4 km férreos (Proyecto 3), cumplir los compromisos del «Plan Marshall» en el Pacífico por $1 billón (Proyecto 6) e institucionalizar la legitimidad comunitaria en el territorio (Proyecto 12).",
        "periodo": "Años 2027–2029"
    },
    {
        "titulo": "GRUPO 3: INNOVACIÓN Y FUTURO",
        "proyectos": "Proyectos 7, 9, 11, 14",
        "descripcion": "APP social, modernización aeroportuaria e IA.",
        "justificacion": "Consolidan el posicionamiento de la ANI a 2030 como entidad referente regional. Permiten extender las APP hacia salud y educación (Proyecto 7), modernizar la supervisión con inteligencia artificial (Proyecto 11) y garantizar altos estándares de resiliencia e inclusión (Proyecto 14).",
        "periodo": "Años 2028–2030"
    }
]


def mostrar_cartera_pei():
    st.markdown("## II. Matriz de Proyectos Estratégicos PEI 2027–2030")
    st.caption("Cartera estratégica organizada exclusivamente en los dos focos institucionales.")

    import html

    # Segmentador de iniciativas (focos)
    foco_seleccionado = st.radio(
        "SELECCIONAR INICIATIVA (FOCO)",
        options=["Todos los focos", FOCO_1, FOCO_2],
        horizontal=True,
        index=0,
        key="filtro_foco_cartera_pei"
    )

    # Identificar las columnas originales sin modificar los proyectos
    clave_foco = next(
        clave for clave in PROYECTOS_PEI[0]
        if "FOCO" in clave.upper()
    )

    definicion_columnas = [
        (clave, ancho)
        for clave, ancho in [
            (next(clave for clave in PROYECTOS_PEI[0] if clave.startswith("OBJETIVOS")), 200),
            ("PROYECTO", 190),
            ("UNIDAD MEDIDA", 125),
            ("META 2030", 75),
            ("DETALLE", 310)
        ]
        if clave in PROYECTOS_PEI[0]
    ]

    # Filtrar ?nicamente la visualizaci?n; los datos originales permanecen intactos
    if foco_seleccionado == "Todos los focos":
        proyectos_visibles = PROYECTOS_PEI
    else:
        proyectos_visibles = [
            proyecto for proyecto in PROYECTOS_PEI
            if proyecto.get(clave_foco) == foco_seleccionado
        ]

    st.caption(
        f"Proyectos mostrados: {len(proyectos_visibles)} de {len(PROYECTOS_PEI)}"
    )

    # Las cinco columnas se distribuyen proporcionalmente en todo el ancho.
    ancho_total = sum(ancho for _, ancho in definicion_columnas)
    colgroup = "".join(
        f'<col style="width:{ancho / ancho_total * 100:.4f}%;">'
        for _, ancho in definicion_columnas
    )

    encabezados = "".join(
        f'<th>{html.escape(nombre)}</th>'
        for nombre, _ in definicion_columnas
    )

    filas = ""
    for proyecto in proyectos_visibles:
        celdas = "".join(
            f'<td>{html.escape(str(proyecto.get(nombre, "")))}</td>'
            for nombre, _ in definicion_columnas
        )
        filas += f"<tr>{celdas}</tr>"

    tabla_html = f"""
    <style>
        .pei-tabla-contenedor {{
            width: 100%;
            overflow-x: auto;
            overflow-y: visible;
            border: 1px solid #29465E;
            border-radius: 10px;
        }}
        .pei-tabla {{
            width: 100%;
            min-width: 900px;
            max-width: none;
            border-collapse: separate;
            border-spacing: 0;
            table-layout: fixed;
            font-size: 13px;
            box-sizing: border-box;
            line-height: 1.65;
        }}
        .pei-tabla th {{
            position: sticky;
            top: 0;
            z-index: 2;
            background: #102B46;
            color: white;
            padding: 16px 14px;
            text-align: left;
            font-weight: 800;
            border-bottom: 3px solid #F28C28;
            white-space: normal;
        }}
        .pei-tabla td {{
            padding: 18px 14px;
            vertical-align: top;
            white-space: normal;
            overflow-wrap: anywhere;
            word-break: normal;
            height: auto;
            border-bottom: 1px solid #D5DDE5;
            color: inherit;
            background: #FFFFFF;
        }}
        .pei-tabla tr:nth-child(even) td {{
            background: #F2F3F5;
        }}
        .pei-tabla tr:hover td {{
            background: rgba(242,140,40,0.10);
        }}
    </style>
    <div class="pei-tabla-contenedor">
        <table class="pei-tabla">
            <colgroup>{colgroup}</colgroup><thead><tr>{encabezados}</tr></thead>
            <tbody>{filas}</tbody>
        </table>
    </div>
    """

    @st.dialog("Matriz PEI 2027-2030", width="large")
    def mostrar_tabla_ampliada():
        st.markdown(
            """
            <style>
            div[role="dialog"] {
                width: 95vw !important;
                max-width: 95vw !important;
            }
            </style>
            """,
            unsafe_allow_html=True
        )
        st.markdown(tabla_html, unsafe_allow_html=True)

    import csv
    import io

    archivo_csv = io.StringIO()
    escritor = csv.DictWriter(
        archivo_csv,
        fieldnames=list(PROYECTOS_PEI[0].keys()),
        delimiter=";"
    )
    escritor.writeheader()
    escritor.writerows(proyectos_visibles)

    st.download_button(
        label="Descargar cartera (CSV)",
        data=archivo_csv.getvalue().encode("utf-8-sig"),
        file_name="cartera_PEI_2027_2030.csv",
        mime="text/csv",
        key="descargar_cartera_pei"
    )

    if st.button("Ampliar tabla", key="boton_ampliar_cartera_pei"):
        mostrar_tabla_ampliada()

    st.markdown(tabla_html, unsafe_allow_html=True)

    st.caption(
        "La tabla muestra cinco columnas. El foco seleccionado se identifica "
        "en el segmentador superior. Puedes desplazarte horizontalmente para "
        "consultar todo el contenido."
    )

    st.markdown("### III. Clasificaci?n Priorizada para la Cartera PEI 2027?2030")
    st.caption("Despliegue institucional organizado en los tres niveles de priorizaci?n definidos.")

    columnas = st.columns(3)

    for columna, grupo in zip(columnas, GRUPOS_PRIORIZACION):
        with columna:
            st.markdown(
                f"""
                <div style="
                    background: linear-gradient(145deg,#102B46,#173F60);
                    border-top: 4px solid #F28C28;
                    border-radius: 10px;
                    padding: 18px;
                    min-height: 190px;
                    color: white;">
                    <div style="font-size:13px;font-weight:800;color:#FFAD55;">
                        {grupo['titulo']}
                    </div>
                    <div style="font-size:12px;margin-top:10px;color:#DCE8F1;">
                        {grupo['proyectos']}
                    </div>
                    <div style="font-size:14px;font-weight:700;margin-top:12px;">
                        {grupo['descripcion']}
                    </div>
                    <div style="font-size:12px;margin-top:10px;color:#DCE8F1;">
                        {grupo['periodo']}
                    </div>
                </div>
                """,
                unsafe_allow_html=True
            )
            with st.expander("Ver justificación"):
                st.write(grupo["justificacion"])
