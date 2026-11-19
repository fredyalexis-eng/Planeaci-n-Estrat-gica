
import streamlit as st

from modules.database import (
    ESTADOS_PLAN,
    consultar_pei_para_plan,
    registrar_actividad,
    actualizar_actividad,
    consultar_plan_accion,
    cambiar_estado_plan,
)


def mostrar_plan_accion():

    st.title("Plan de Acción 2027")

    st.caption(
        "Construcción, edición controlada y seguimiento de actividades "
        "institucionales articuladas con el PEI 2027–2030."
    )
    # ========================================================
    # MENSAJE DE CONFIRMACIÓN DESPUÉS DE UNA ACTUALIZACIÓN
    # ========================================================

    mensaje = st.session_state.pop("mensaje_plan_accion", None)

    if mensaje:
        st.success(mensaje)
    (
        pestaña_formulario,
        pestaña_edicion,
        pestaña_consulta,
        pestaña_estados,
    ) = st.tabs(
        [
            "Formular actividades",
            "Editar actividades",
            "Consultar actividades",
            "Gestión de estados",
        ]
    )

    # ========================================================
    # 1. FORMULAR ACTIVIDADES
    # ========================================================

    with pestaña_formulario:

        st.subheader("Registro de actividades del Plan de Acción")

        propuestas_pei = consultar_pei_para_plan()

        if not propuestas_pei:

            st.warning(
                "Todavía no existen propuestas PEI disponibles. "
                "Primero debes registrar una propuesta en el módulo PEI."
            )

        else:

            opciones_pei = {
                (
                    f'PEI #{registro["id"]} | '
                    f'{registro["area"]} | '
                    f'{registro["proyecto"]}'
                ): registro
                for registro in propuestas_pei
            }

            seleccion_pei = st.selectbox(
                "Selecciona la propuesta PEI relacionada",
                options=list(opciones_pei.keys()),
                key="seleccion_pei_plan",
            )

            pei = opciones_pei[seleccion_pei]

            st.markdown("### Información heredada del PEI")

            st.caption(
                "Estos datos se consultan desde el PEI y no se modifican "
                "al registrar actividades."
            )

            col1, col2 = st.columns(2)

            with col1:

                st.text_input(
                    "Área responsable",
                    value=str(pei["area"]),
                    disabled=True,
                )

                st.text_input(
                    "Foco estratégico",
                    value=str(pei["foco"]),
                    disabled=True,
                )

                st.text_area(
                    "Objetivo estratégico",
                    value=str(pei["objetivo_estrategico"]),
                    disabled=True,
                    height=110,
                )

            with col2:

                st.text_input(
                    "Proyecto",
                    value=str(pei["proyecto"]),
                    disabled=True,
                )

                st.text_input(
                    "Unidad de medida del PEI",
                    value=str(pei["unidad_medida"]),
                    disabled=True,
                )

                st.text_input(
                    "Meta 2030 del PEI",
                    value=str(pei["meta_2030"]),
                    disabled=True,
                )

            st.divider()

            st.markdown("### Información propia de la actividad")

            with st.form("formulario_plan_accion"):

                actividad = st.text_area(
                    "Actividad",
                    placeholder=(
                        "Describe la actividad que desarrollará el área..."
                    ),
                    height=110,
                )

                col1, col2 = st.columns(2)

                with col1:

                    unidad_medida = st.text_input(
                        "Unidad de medida de la actividad",
                        placeholder=(
                            "Ejemplo: reuniones, documentos, kilómetros..."
                        ),
                    )

                with col2:

                    meta_2027 = st.text_input(
                        "Meta 2027",
                        placeholder="Escribe la meta prevista para 2027",
                    )

                detalle = st.text_area(
                    "Detalle",
                    placeholder=(
                        "Información complementaria de la actividad..."
                    ),
                    height=100,
                )

                guardar = st.form_submit_button(
                    "Guardar actividad",
                    type="primary",
                    use_container_width=True,
                )

                if guardar:

                    if not all(
                        [
                            actividad.strip(),
                            unidad_medida.strip(),
                            meta_2027.strip(),
                        ]
                    ):

                        st.error(
                            "Completa actividad, unidad de medida y meta 2027."
                        )

                    else:

                        try:

                            registro_id = registrar_actividad(
                                pei_id=pei["id"],
                                actividad=actividad.strip(),
                                unidad_medida=unidad_medida.strip(),
                                meta_2027=meta_2027.strip(),
                                detalle=detalle.strip(),
                            )

                            st.success(
                                "Actividad registrada correctamente. "
                                f"Identificador: {registro_id}"
                            )

                            st.rerun()

                        except Exception as error:

                            st.error(
                                f"No fue posible guardar la actividad: {error}"
                            )

    # ========================================================
    # 2. EDICIÓN CONTROLADA DE ACTIVIDADES
    # ========================================================

    with pestaña_edicion:

        st.subheader("Edición controlada de actividades")

        st.info(
            "Únicamente se pueden editar actividades en estado "
            "En construcción. Las actividades En revisión o Cerradas "
            "tienen protegido su contenido."
        )

        actividades = consultar_plan_accion()

        actividades_editables = [
            registro
            for registro in actividades
            if registro["estado"] == "En construcción"
        ]

        if not actividades_editables:

            st.warning(
                "No hay actividades en estado En construcción "
                "disponibles para edición."
            )

        else:

            opciones_edicion = {
                (
                    f'Actividad #{registro["id"]} | '
                    f'{registro["area"]} | '
                    f'{registro["actividad"][:70]}'
                ): registro
                for registro in actividades_editables
            }

            seleccion_edicion = st.selectbox(
                "Selecciona la actividad que deseas editar",
                options=list(opciones_edicion.keys()),
                key="seleccion_edicion_actividad",
            )

            registro_edicion = opciones_edicion[seleccion_edicion]

            actividad_id = registro_edicion["id"]

            st.markdown("---")

            st.markdown(
                f"**Actividad seleccionada:** #{actividad_id}"
            )

            st.markdown(
                f'**Área responsable:** {registro_edicion["area"]}'
            )

            st.markdown(
                f'**Estado actual:** {registro_edicion["estado"]}'
            )

            st.markdown("### Información heredada del PEI")

            st.caption(
                "Estos campos son de consulta. "
                "La actividad conserva su vínculo con la propuesta PEI."
            )

            col1, col2 = st.columns(2)

            with col1:

                st.text_input(
                    "Foco estratégico",
                    value=str(registro_edicion["foco"]),
                    disabled=True,
                    key=f"edicion_foco_pa_{actividad_id}",
                )

                st.text_area(
                    "Objetivo estratégico",
                    value=str(
                        registro_edicion["objetivo_estrategico"]
                    ),
                    disabled=True,
                    height=100,
                    key=f"edicion_objetivo_pa_{actividad_id}",
                )

            with col2:

                st.text_input(
                    "Proyecto relacionado",
                    value=str(registro_edicion["proyecto"]),
                    disabled=True,
                    key=f"edicion_proyecto_pa_{actividad_id}",
                )

                st.text_input(
                    "Meta 2030 del PEI",
                    value=str(registro_edicion["meta_2030"]),
                    disabled=True,
                    key=f"edicion_meta_pei_pa_{actividad_id}",
                )

            st.divider()

            st.markdown("### Información editable de la actividad")

            with st.form(
                f"formulario_edicion_actividad_{actividad_id}"
            ):

                actividad_editada = st.text_area(
                    "Actividad",
                    value=registro_edicion["actividad"],
                    height=110,
                    key=f"editar_actividad_{actividad_id}",
                )

                col1, col2 = st.columns(2)

                with col1:

                    unidad_editada = st.text_input(
                        "Unidad de medida de la actividad",
                        value=registro_edicion[
                            "unidad_medida_actividad"
                        ],
                        key=f"editar_unidad_pa_{actividad_id}",
                    )

                with col2:

                    meta_editada = st.text_input(
                        "Meta 2027",
                        value=registro_edicion["meta_2027"],
                        key=f"editar_meta_pa_{actividad_id}",
                    )

                detalle_editado = st.text_area(
                    "Detalle",
                    value=registro_edicion["detalle"] or "",
                    height=100,
                    key=f"editar_detalle_pa_{actividad_id}",
                )

                guardar_cambios = st.form_submit_button(
                    "Guardar cambios de la actividad",
                    type="primary",
                    use_container_width=True,
                )

                if guardar_cambios:

                    if not all(
                        [
                            actividad_editada.strip(),
                            unidad_editada.strip(),
                            meta_editada.strip(),
                        ]
                    ):

                        st.error(
                            "Completa actividad, unidad de medida y meta 2027."
                        )

                    else:

                        try:

                            actualizar_actividad(
                                actividad_id=actividad_id,
                                actividad=actividad_editada.strip(),
                                unidad_medida=unidad_editada.strip(),
                                meta_2027=meta_editada.strip(),
                                detalle=detalle_editado.strip(),
                            )

                            st.session_state["mensaje_plan_accion"] = (
                                f"La actividad #{actividad_id} "
                                "fue actualizada correctamente."
                            )

                            st.rerun()

                        except Exception as error:

                            st.error(
                                f"No fue posible actualizar la actividad: {error}"
                            )

    # ========================================================
    # 3. CONSULTAR ACTIVIDADES
    # ========================================================

    with pestaña_consulta:

        st.subheader("Actividades registradas")

        actividades = consultar_plan_accion()

        if not actividades:

            st.info(
                "Todavía no existen actividades registradas en el "
                "Plan de Acción 2027."
            )

        else:

            col1, col2 = st.columns(2)

            areas = sorted({
                registro["area"]
                for registro in actividades
            })

            estados = sorted({
                registro["estado"]
                for registro in actividades
            })

            with col1:

                filtro_area = st.selectbox(
                    "Filtrar por área",
                    ["Todas las áreas"] + areas,
                    key="filtro_area_plan",
                )

            with col2:

                filtro_estado = st.selectbox(
                    "Filtrar por estado",
                    ["Todos los estados"] + estados,
                    key="filtro_estado_plan",
                )

            registros_filtrados = actividades

            if filtro_area != "Todas las áreas":

                registros_filtrados = [
                    registro
                    for registro in registros_filtrados
                    if registro["area"] == filtro_area
                ]

            if filtro_estado != "Todos los estados":

                registros_filtrados = [
                    registro
                    for registro in registros_filtrados
                    if registro["estado"] == filtro_estado
                ]

            st.caption(
                f"Actividades encontradas: {len(registros_filtrados)}"
            )

            datos_tabla = [
                {
                    "ID": registro["id"],
                    "Área": registro["area"],
                    "Foco": registro["foco"],
                    "Objetivo estratégico": (
                        registro["objetivo_estrategico"]
                    ),
                    "Proyecto": registro["proyecto"],
                    "Actividad": registro["actividad"],
                    "Unidad de medida": (
                        registro["unidad_medida_actividad"]
                    ),
                    "Meta 2027": registro["meta_2027"],
                    "Estado": registro["estado"],
                }
                for registro in registros_filtrados
            ]

            st.dataframe(
                datos_tabla,
                use_container_width=True,
                hide_index=True,
            )

            with st.expander("Consultar detalle de una actividad"):

                opciones_actividades = {
                    (
                        f'Actividad #{registro["id"]} | '
                        f'{registro["area"]} | '
                        f'{registro["actividad"][:70]}'
                    ): registro
                    for registro in registros_filtrados
                }

                if opciones_actividades:

                    seleccion = st.selectbox(
                        "Selecciona una actividad",
                        options=list(opciones_actividades.keys()),
                        key="detalle_actividad",
                    )

                    registro = opciones_actividades[seleccion]

                    st.markdown("**Relación con el PEI**")

                    st.write("Foco:", registro["foco"])

                    st.write(
                        "Objetivo estratégico:",
                        registro["objetivo_estrategico"],
                    )

                    st.write("Proyecto:", registro["proyecto"])

                    st.write("Meta 2030:", registro["meta_2030"])

                    st.markdown("**Información de la actividad**")

                    st.write("Actividad:", registro["actividad"])

                    st.write(
                        "Unidad de medida:",
                        registro["unidad_medida_actividad"],
                    )

                    st.write("Meta 2027:", registro["meta_2027"])

                    st.write("Detalle:", registro["detalle"])

                    st.write("Estado:", registro["estado"])

    # ========================================================
    # 4. GESTIÓN DE ESTADOS
    # ========================================================

    with pestaña_estados:

        st.subheader("Gestión de estados de las actividades")

        actividades = consultar_plan_accion()

        if not actividades:

            st.info(
                "No hay actividades disponibles para gestionar."
            )

        else:

            opciones_actividades = {
                (
                    f'Actividad #{registro["id"]} | '
                    f'{registro["area"]} | '
                    f'{registro["actividad"][:70]}'
                ): registro
                for registro in actividades
                if registro["estado"] != "Cerrado"
            }

            if not opciones_actividades:

                st.success(
                    "Todas las actividades registradas están cerradas. "
                    "Sus datos se encuentran protegidos."
                )

            else:

                seleccion = st.selectbox(
                    "Selecciona la actividad",
                    options=list(opciones_actividades.keys()),
                    key="actividad_estado",
                )

                registro = opciones_actividades[seleccion]

                st.write("Estado actual:", registro["estado"])

                estados_disponibles = [
                    estado
                    for estado in ESTADOS_PLAN
                    if estado != registro["estado"]
                ]

                nuevo_estado = st.selectbox(
                    "Nuevo estado",
                    options=estados_disponibles,
                    key=f'nuevo_estado_{registro["id"]}',
                )

                st.warning(
                    "Una actividad cerrada no podrá modificarse ni "
                    "eliminarse según las reglas de protección."
                )

                if st.button(
                    "Actualizar estado de la actividad",
                    type="primary",
                ):

                    try:

                        cambiar_estado_plan(
                            actividad_id=registro["id"],
                            nuevo_estado=nuevo_estado,
                        )

                        st.success(
                            f"Estado actualizado a: {nuevo_estado}"
                        )

                        st.rerun()

                    except Exception as error:

                        st.error(
                            f"No fue posible actualizar el estado: {error}"
                        )
