import streamlit as st
import requests

from modules.buscador_documental import construir_indice, obtener_terminos


# ============================================================
# CONFIGURACIÓN DEL MODELO LOCAL
# ============================================================

OLLAMA_URL = "http://localhost:11434/api/chat"
MODELO_OLLAMA = "qwen3.5:4b"
TIMEOUT_OLLAMA = 180


# ============================================================
# INSTRUCCIONES DEL AGENTE ESTRATÉGICO ANI
# ============================================================

INSTRUCCIONES_AGENTE = """
Eres el Agente Estratégico ANI, asesor de alta dirección especializado
en planeación institucional, articulación de políticas públicas y
desarrollo de capacidades institucionales.

TU MISIÓN

Ayudar a los equipos de la ANI a descubrir cómo sus funciones,
competencias y capacidades pueden contribuir a las prioridades
nacionales, sectoriales y territoriales y a los dos focos estratégicos
institucionales.

No eres un resumidor de documentos ni un expositor de información
que los equipos ya conocen. Eres un asesor que identifica oportunidades,
conexiones, brechas, riesgos e iniciativas de valor institucional.

IDENTIDAD ANI

Foco 1: Infraestructura dinamizadora para la conectividad y el desarrollo.
Foco 2: Ruta social y gestión preventiva de conflictos.

Misión:
Impulsar y desarrollar proyectos integrales de infraestructura
concesionada para transformar territorios, vidas y propósitos de manera
sostenible, resiliente e incluyente fortaleciendo el tejido social,
la equidad y la competitividad del país.

Visión:
En el año 2030 la ANI será la entidad referente en la estructuración
y gestión de proyectos de infraestructura para promover el desarrollo
integral de los territorios y sus comunidades.

REGLAS DE ANÁLISIS

1. Consulta la evidencia documental antes de formular conclusiones.
   No afirmes haber consultado fuentes que no fueron recuperadas.

2. Utiliza las funciones, competencias y normas como contexto de análisis.
   No las transcribas ni las enumeres, salvo que el usuario lo solicite.

3. No repitas la pregunta ni expliques extensamente información
   institucional que el equipo ya conoce.

4. Identifica conexiones concretas entre las capacidades del equipo
   y las prioridades nacionales, sectoriales y territoriales.

5. Examina qué puede aportar la ANI y cuál es su papel:
   responsable directo, participante, articulador, apoyo o actor
   complementario. No atribuyas competencias ajenas a la ANI.

6. Busca oportunidades de contribución, proyectos de valor,
   articulaciones con otros equipos, brechas de capacidad,
   riesgos de implementación y posibles duplicidades.

7. Diferencia funciones formales, capacidades existentes,
   capacidades potenciales y necesidades de fortalecimiento.

8. No conviertas automáticamente una función en un proyecto.
   Justifica por qué una oportunidad merece convertirse en iniciativa
   institucional y cuál sería su contribución estratégica.

9. No inventes funciones, proyectos aprobados, actividades,
   indicadores, metas, cifras, compromisos, normas ni decisiones.

10. Distingue normas vinculantes, documentos técnicos, diagnósticos,
    documentos de empalme y declaraciones. No presentes diagnósticos
    o denuncias como hechos judicialmente probados.

11. Las Bases del PND 2026-2030 fueron presentadas el 13 de noviembre
    de 2026 y están en formulación. No las presentes como ley expedida.

12. Si falta información indispensable, señala exactamente qué falta
    y formula una sola pregunta concreta para continuar.

13. Las propuestas son recomendaciones técnicas sujetas a validación
    de los equipos responsables. Nunca las presentes como decisiones
    aprobadas por la ANI.

ORIENTACIÓN PARA LA FORMULACIÓN

Cuando exista fundamento documental suficiente, formula propuestas
para el PEI 2027-2030 y el Plan de Acción 2027.

PEI:
Foco / Objetivo Estratégico / Proyecto / Unidad de medida /
Meta 2030 / Detalle.

Plan de Acción:
Foco / Objetivo Estratégico / Proyecto / Actividad / Meta 2027 /
Unidad de medida / Detalle.

Las metas 2030 y 2027 deben escribirse exactamente:
Por definir por el grupo

Las actividades del Plan de Acción deben derivarse de proyectos PEI.
No inventes cifras ni supongas proporcionalidad entre las metas 2027
y 2030. Puedes recomendar criterios técnicos para definirlas.

ESTILO Y EXTENSIÓN

- Responde en español, con lenguaje ejecutivo, preciso y técnico.
- Por defecto, máximo 250 palabras.
- Si la consulta es sencilla, responde en pocos párrafos.
- No produzcas informes extensos, salvo que el usuario los solicite.
- No incluyas introducciones genéricas ni conclusiones repetitivas.
- No enumeres funciones conocidas para demostrar que las encontraste.
- Dedica la mayor parte de la respuesta al análisis y al valor agregado.
- Separa brevemente evidencia, análisis y propuesta cuando sea útil.
- Cita archivo y página únicamente cuando estén disponibles.
- Si no hay evidencia suficiente, dilo claramente.
- Prioriza recomendaciones concretas y accionables.

REGLAS ESTRICTAS DE TRAZABILIDAD Y COMPETENCIAS

1. Antes de formular una propuesta, clasifica mentalmente cada afirmaci?n:
   a) Hecho expresamente documentado.
   b) Competencia formal acreditada en documentos ANI.
   c) Oportunidad potencial de participaci?n.
   d) Recomendaci?n que requiere validaci?n humana.

2. Una prioridad del Gobierno o del PND NO constituye por s? misma
   una funci?n, obligaci?n o competencia de la ANI.

3. La participaci?n de ANI en una instancia de articulaci?n no significa
   que sea responsable de ejecutar, financiar, contratar, supervisar
   o validar todos los proyectos asociados.

4. No atribuyas a ANI funciones de INV?AS, Ministerio de Transporte,
   Aerocivil, entidades territoriales ni otras entidades.

5. No inventes auditor?as, estudios, validaciones, informes vinculantes,
   metodolog?as, protocolos, obligaciones ni actividades institucionales.

6. No conviertas proyectos anunciados por el Gobierno en proyectos
   a cargo de ANI. Distingue anuncio, formulaci?n, estructuraci?n,
   financiaci?n, contrataci?n y ejecuci?n.

7. Cuando no se haya recuperado evidencia de las funciones ANI aplicables,
   no formules proyectos, indicadores ni actividades como si fueran
   competencia acreditada. Identifica la oportunidad y solicita validar
   la competencia con el ?rea responsable.

8. Para cada hallazgo identifica el documento y p?gina que lo sustentan.
   Si dos fuentes tienen distinta naturaleza, explica esa diferencia.
   Las Bases del PND en formulaci?n no son norma vinculante.

9. Una propuesta PEI o de Plan de Acci?n solo puede formularse cuando
   exista conexi?n demostrable entre prioridad, competencia ANI y
   capacidad institucional. De lo contrario, clasif?cala como
   oportunidad por validar, sin completar artificialmente las tablas.

10. Nunca inventes criterios cuantitativos. Las metas 2030 y 2027 deben
    conservar exactamente: Por definir por el grupo.

11. No presentes como hecho una inferencia del modelo. Usa expresiones
    como "podr?a explorarse", "sujeto a validaci?n" o "la evidencia
    disponible no permite atribuir esta responsabilidad".

12. Si la evidencia no acredita el rol de ANI, dilo expresamente.
    Es preferible una respuesta limitada y rigurosa a una propuesta
    aparentemente completa pero sin fundamento documental.

REGLAS ADICIONALES DE CONTROL

- No inventes fechas de análisis ni fechas de documentos.
- No atribuyas efectos económicos, sociales o jurídicos sin evidencia.
- No inventes números de artículos, funciones o evidencias.
- No presentes ejemplos hipotéticos como proyectos recomendados.
- No propongas indicadores si no explicas qué resultado institucional medirían.
- No completes tablas con objetivos o proyectos genéricos.
- Si la evidencia solo permite identificar una oportunidad, preséntala
  como oportunidad por validar, no como proyecto formulado.
- Prioriza tres hallazgos estratégicos como máximo.
- No reproduzcas extensas tablas si el usuario no las solicita.

PREGUNTA CENTRAL QUE DEBES RESOLVER

¿Qué puede aportar este equipo, desde sus competencias y capacidades,
a las prioridades estratégicas de la ANI y del país, qué oportunidades
de contribución se pueden construir y qué se necesita validar para
convertirlas en proyectos y actividades institucionales?
"""


# ============================================================
# RECUPERACIÓN DE EVIDENCIA DOCUMENTAL
# ============================================================

def construir_evidencia(pregunta):

    indice, errores = construir_indice()
    terminos_consulta = set(obtener_terminos(pregunta))

    pregunta_normalizada = pregunta.lower()
    consulta_choco = any(
        termino in pregunta_normalizada
        for termino in ("choc?", "choco", "marshall", "intermodal")
    )

    resultados_prioritarios = []
    resultados_busqueda = []

    for fragmento in indice:

        archivo = fragmento["archivo"].lower()
        ubicacion = fragmento["ubicacion"]
        terminos = fragmento["terminos"]

        es_marshall = (
            "choco" in archivo
            and "marshall" in archivo
        )

        es_pnd = "bases_pnd_2026_2030" in archivo

        numero_pagina = "".join(
            caracter for caracter in ubicacion
            if caracter.isdigit()
        )

        prioridad = False
        tipo_prioridad = ""

        if consulta_choco and es_marshall:
            prioridad = True
            tipo_prioridad = "fuente prioritaria: Plan Marshall"

        elif consulta_choco and es_pnd:

            # P?gina 84: reconstrucci?n y Plan del Choc?.
            if numero_pagina == "84" and (
                {"plan", "choco"}.issubset(terminos)
                or {"reconstruir", "choco"}.issubset(terminos)
            ):
                prioridad = True
                tipo_prioridad = "PND: reconstrucci?n del Choc?, p?gina 84"

            # P?gina 339: recuperaci?n de conectividad vial
            # expresamente vinculada al Plan Marshall.
            elif numero_pagina == "339" and {
                "marshall", "recuperacion", "conectividad"
            }.issubset(terminos):
                prioridad = True
                tipo_prioridad = "PND: recuperaci?n vial y Plan Marshall, p?gina 339"

            # P?gina 461: participaci?n expresa de ANI en
            # la formulaci?n del Plan Intermodal del Choc?.
            elif numero_pagina == "461" and {
                "plan", "intermodal", "choco", "agencia"
            }.issubset(terminos):
                prioridad = True
                tipo_prioridad = "PND: participaci?n de ANI en Plan Intermodal, p?gina 461"

        if prioridad:
            resultados_prioritarios.append({
                "archivo": fragmento["archivo"],
                "ubicacion": ubicacion,
                "texto": fragmento["texto"],
                "coincidencias": [tipo_prioridad],
                "puntuacion": 100
            })

        # En consultas sobre Choc?, el PND se incorpora mediante
        # los apartados estrat?gicos seleccionados expresamente.
        # Se evita a?adir p?ginas gen?ricas del mismo documento.
        if consulta_choco and es_pnd and not prioridad:
            continue

        coincidencias = terminos_consulta.intersection(terminos)

        if coincidencias:
            cobertura = len(coincidencias) / max(
                len(terminos_consulta), 1
            )

            # Evita resultados complementarios basados en
            # coincidencias aisladas o palabras demasiado generales.
            if len(coincidencias) < 2 or cobertura < 0.30:
                continue

            resultados_busqueda.append({
                "archivo": fragmento["archivo"],
                "ubicacion": ubicacion,
                "texto": fragmento["texto"],
                "coincidencias": sorted(coincidencias),
                "puntuacion": round(
                    len(coincidencias) + cobertura, 3
                )
            })

    claves_prioritarias = {
        (r["archivo"], r["ubicacion"], r["texto"])
        for r in resultados_prioritarios
    }

    resultados_busqueda = [
        r for r in resultados_busqueda
        if (r["archivo"], r["ubicacion"], r["texto"])
        not in claves_prioritarias
    ]

    resultados_busqueda.sort(
        key=lambda r: r["puntuacion"],
        reverse=True
    )

    resultados = (
        resultados_prioritarios
        + resultados_busqueda[:3]
    )

    if not resultados:
        evidencia = (
            "No se encontraron fragmentos documentales pertinentes. "
            "No inventes evidencia ni atribuyas contenido a documentos "
            "que no fueron recuperados."
        )
    else:
        bloques = []

        for numero, resultado in enumerate(resultados, start=1):
            bloques.append(
                f"""
EVIDENCIA {numero}
Archivo: {resultado['archivo']}
Ubicaci?n: {resultado['ubicacion']}
Coincidencias: {', '.join(resultado['coincidencias'])}

Contenido:
{resultado['texto']}
"""
            )

        evidencia = "\\n".join(bloques)

    if errores:
        evidencia += "\\n\\nADVERTENCIA: Documentos con errores de lectura:\\n"

        for error in errores:
            evidencia += (
                f"- {error['archivo']}: {error['error']}\\n"
            )

    return evidencia, resultados


# ============================================================
# CONSULTA A OLLAMA
# ============================================================

def consultar_ollama(pregunta, historial, evidencia):

    mensajes = [
        {
            "role": "system",
            "content": INSTRUCCIONES_AGENTE
        },
        {
            "role": "system",
            "content": (
                "EVIDENCIA DOCUMENTAL RECUPERADA:\n\n"
                + evidencia
                + "\n\nUtiliza esta evidencia con rigor. "
                "Si no es suficiente, declara la limitación. "
                "No inventes contenido ni referencias."
            )
        }
    ]

    # Conserva los últimos intercambios de la conversación.
    for mensaje in historial[-8:]:

        if mensaje["role"] in ("user", "assistant"):

            mensajes.append({
                "role": mensaje["role"],
                "content": mensaje["content"]
            })

    mensajes.append({
        "role": "user",
        "content": pregunta
    })

    respuesta = requests.post(
        OLLAMA_URL,
        json={
            "model": MODELO_OLLAMA,
            "messages": mensajes,
            "think": False,
            "stream": False,
            "options": {
                "temperature": 0.2,
                "num_ctx": 8192,
                "num_predict": 750
            }
        },
        timeout=TIMEOUT_OLLAMA
    )

    respuesta.raise_for_status()

    datos = respuesta.json()

    contenido = datos.get("message", {}).get("content", "").strip()

    if not contenido:
        raise ValueError(
            "El modelo terminó la consulta sin generar una respuesta visible."
        )

    return contenido


# ============================================================
# INTERFAZ DEL AGENTE
# ============================================================

def mostrar_agente():

    st.markdown("""
    <style>
    /* Fondo y tipografía de los mensajes */
    [data-testid="stChatMessage"] {
        background-color: #F1F5F9 !important;
        border: 1px solid #CBD5E1 !important;
        border-radius: 12px !important;
        padding: 14px 18px !important;
    }

    /* Texto completo de los mensajes: azul oscuro */
    [data-testid="stChatMessage"] *,
    [data-testid="stChatMessage"] [data-testid="stMarkdownContainer"],
    [data-testid="stChatMessage"] [data-testid="stMarkdownContainer"] * {
        color: #172B4D !important;
        -webkit-text-fill-color: #172B4D !important;
    }

    /* Enlaces */
    [data-testid="stChatMessage"] a {
        color: #075985 !important;
        -webkit-text-fill-color: #075985 !important;
        text-decoration: underline !important;
    }

    /* Bloques de código */
    [data-testid="stChatMessage"] code {
        background-color: #E2E8F0 !important;
        color: #7C2D12 !important;
        -webkit-text-fill-color: #7C2D12 !important;
    }

    /* Cuadro para escribir consultas */
    [data-testid="stChatInput"] textarea {
        background-color: #FFFFFF !important;
        color: #172B4D !important;
        -webkit-text-fill-color: #172B4D !important;
        caret-color: #172B4D !important;
    }

    [data-testid="stChatInput"] textarea::placeholder {
        color: #64748B !important;
        -webkit-text-fill-color: #64748B !important;
        opacity: 1 !important;
    }

    [data-testid="stChatInput"] button {
        color: #075985 !important;
    }
    </style>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div style="
        background: linear-gradient(120deg, #091D30, #123D5B);
        padding: 30px 34px;
        border-radius: 16px;
        border-left: 5px solid #F4A62A;
        margin-bottom: 22px;
    ">
        <div style="color:#F4A62A; font-size:11px;
                    font-weight:800; letter-spacing:2px;">
            ASESOR DE PLANEACIÓN INSTITUCIONAL
        </div>
        <h1 style="color:#FFFFFF; margin:10px 0;">
            Agente Estratégico ANI
        </h1>
        <p style="color:#E5EEF5; font-size:14px; line-height:1.7;">
            Inteligencia estratégica para orientar la formulación
            del PEI 2027–2030 y del Plan de Acción 2027.
        </p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div style="
        background:#102D43;
        border:1px solid #28516B;
        border-radius:12px;
        padding:18px 22px;
        color:#FFFFFF;
        line-height:1.7;
        margin-bottom:22px;
    ">
        <strong style="color:#F4A62A;">
            ¿En qué puedo ayudarte?
        </strong><br>
        Analizo las consultas a partir de los documentos disponibles,
        identifico relaciones estratégicas y formulo recomendaciones
        sujetas a validación de los equipos responsables.
    </div>
    """, unsafe_allow_html=True)

    col1, col2 = st.columns([5, 1])

    with col1:
        st.subheader("Conversación estratégica")

    with col2:

        if st.button("Nueva conversación", use_container_width=True):

            st.session_state.conversacion_agente_ani = []
            st.session_state.evidencias_agente_ani = {}
            st.rerun()

    if "conversacion_agente_ani" not in st.session_state:
        st.session_state.conversacion_agente_ani = []

    if "evidencias_agente_ani" not in st.session_state:
        st.session_state.evidencias_agente_ani = {}

    for numero, mensaje in enumerate(
        st.session_state.conversacion_agente_ani
    ):

        with st.chat_message(mensaje["role"]):

            st.markdown(mensaje["content"])

            if mensaje["role"] == "assistant":

                evidencias = (
                    st.session_state.evidencias_agente_ani.get(
                        numero, []
                    )
                )

                if evidencias:

                    with st.expander("Ver documentos consultados"):

                        for evidencia in evidencias:

                            st.markdown(
                                f"- **{evidencia['archivo']}** "
                                f"— {evidencia['ubicacion']}"
                            )

    pregunta = st.chat_input(
        "Escribe tu consulta estratégica..."
    )

    if pregunta:

        historial_previo = list(
            st.session_state.conversacion_agente_ani
        )

        st.session_state.conversacion_agente_ani.append({
            "role": "user",
            "content": pregunta
        })

        with st.chat_message("user"):
            st.markdown(pregunta)

        with st.chat_message("assistant"):

            try:

                with st.spinner(
                    "Consultando documentos y analizando con Qwen 3.5..."
                ):

                    evidencia, resultados = construir_evidencia(
                        pregunta
                    )

                    respuesta = consultar_ollama(
                        pregunta,
                        historial_previo,
                        evidencia
                    )

                st.markdown(respuesta)

                if resultados:

                    with st.expander("Ver documentos consultados"):

                        for resultado in resultados:

                            st.markdown(
                                f"- **{resultado['archivo']}** "
                                f"— {resultado['ubicacion']}"
                            )

                indice_respuesta = (
                    len(st.session_state.conversacion_agente_ani)
                )

                st.session_state.conversacion_agente_ani.append({
                    "role": "assistant",
                    "content": respuesta
                })

                st.session_state.evidencias_agente_ani[
                    indice_respuesta
                ] = resultados

            except requests.exceptions.Timeout:

                st.error(
                    "La consulta superó el tiempo de espera. "
                    "Intenta nuevamente."
                )

            except requests.exceptions.ConnectionError:

                st.error(
                    "No fue posible conectar con Ollama. "
                    "Verifica que Ollama esté ejecutándose."
                )

            except requests.exceptions.RequestException as error:

                st.error(
                    f"Problema al consultar Ollama: {error}"
                )

            except Exception as error:

                st.error(
                    f"No fue posible completar el análisis: {error}"
                )

    st.divider()

    st.caption(
        "PEI: Foco / Objetivo Estratégico / Proyecto / Unidad de medida / "
        "Meta 2030 / Detalle. "
        "Plan de Acción: Foco / Objetivo Estratégico / Proyecto / "
        "Actividad / Meta 2027 / Unidad de medida / Detalle. "
        "Las metas serán definidas por los grupos responsables."
    )
