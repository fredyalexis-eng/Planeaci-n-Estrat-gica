
import streamlit as st

from modules.database import (
    FOCOS_ESTRATEGICOS,
    ESTADOS_PEI,
    registrar_area,
    consultar_areas,
    registrar_pei,
    actualizar_pei,
    cambiar_estado_pei,
    consultar_pei,
)


def mostrar_pei():

    st.title("PEI 2027–2030")

    st.caption(
        "Construcción, edición controlada y gestión de propuestas "
        "estratégicas por áreas de la Agencia Nacional de Infraestructura."
    )

    pestaña_area, pestaña_formulario, pestaña_edicion, pestaña_consulta = st.tabs(
        [
            "Administración de áreas",
            "Formular PEI",
            "Editar borradores",
            "Consultar propuestas",
        ]
    )

    # ========================================================
    # 1. ADMINISTRACIÓN DE ÁREAS
    # ========================================================

    with pestaña_area:

        st.subheader("Registro de áreas")

        with st.form("formulario_nueva_area"):

            nombre_area = st.text_input(
                "Nombre del área o dependencia",
                placeholder="Escribe el nombre oficial del área",
            )

            guardar_area = st.form_submit_button(
                "Registrar área",
                type="primary",
            )

            if guardar_area:

                if not nombre_area.strip():

                    st.error("Debes escribir el nombre del área.")

                else:

                    try:

                        registrar_area(nombre_area.strip())

                        st.success("Área registrada correctamente.")

                        st.rerun()

                    except Exception as error:

                        st.error(
                            f"No fue posible registrar el área: {error}"
                        )

        areas = consultar_areas()

        st.markdown("#### Áreas registradas")

        if areas:

            st.dataframe(
                [
                    {
                        "Identificador": area["id"],
                        "Área o dependencia": area["nombre"],
                    }
                    for area in areas
                ],
                use_container_width=True,
                hide_index=True,
            )

        else:

            st.info("Todavía no hay áreas registradas.")

    # ========================================================
    # 2. FORMULACIÓN DE PROPUESTAS PEI
    # ========================================================

    with pestaña_formulario:

        st.subheader("Formulación de propuestas estratégicas")

        areas = consultar_areas()

        if not areas:

            st.warning(
                "Primero registra las áreas o dependencias "
                "en la pestaña Administración de áreas."
            )

        else:

            mapa_areas = {
                area["nombre"]: area["id"]
                for area in areas
            }

            with st.form("formulario_pei"):

                area_seleccionada = st.selectbox(
                    "Área responsable",
                    options=list(mapa_areas.keys()),
                )

                foco = st.selectbox(
                    "Foco (iniciativa estratégica)",
                    options=FOCOS_ESTRATEGICOS,
                )

                objetivo = st.text_area(
                    "Objetivo estratégico",
                    placeholder="Describe el objetivo estratégico...",
                    height=100,
                )

                proyecto = st.text_input(
                    "Proyecto",
                    placeholder="Nombre del proyecto",
                )

                unidad_medida = st.text_input(
                    "Unidad de medida",
                    placeholder=(
                        "Ejemplo: kilómetros, proyectos, porcentaje..."
                    ),
                )

                meta_2030 = st.text_input(
                    "Meta 2030",
                    placeholder="Escribe la meta prevista para 2030",
                )

                detalle = st.text_area(
                    "Detalle",
                    placeholder=(
                        "Información complementaria de la propuesta..."
                    ),
                    height=100,
                )

                guardar_pei = st.form_submit_button(
                    "Guardar propuesta PEI",
                    type="primary",
                )

                if guardar_pei:

                    if not all(
                        [
                            objetivo.strip(),
                            proyecto.strip(),
                            unidad_medida.strip(),
                            meta_2030.strip(),
                        ]
                    ):

                        st.error(
                            "Completa objetivo, proyecto, unidad de medida "
                            "y meta 2030."
                        )

                    else:

                        try:

                            registro_id = registrar_pei(
                                area_id=mapa_areas[area_seleccionada],
                                foco=foco,
                                objetivo=objetivo,
                                proyecto=proyecto,
                                unidad_medida=unidad_medida,
                                meta_2030=meta_2030,
                                detalle=detalle,
                            )

                            st.success(
                                "Propuesta PEI registrada correctamente. "
                                f"Identificador: {registro_id}"
                            )

                            st.rerun()

                        except Exception as error:

                            st.error(
                                f"No fue posible guardar la propuesta: {error}"
                            )

    # ========================================================
    # 3. EDICIÓN CONTROLADA DE BORRADORES
    # ========================================================

    with pestaña_edicion:

        st.subheader("Edición controlada de propuestas PEI")

        st.info(
            "Únicamente se pueden modificar propuestas que estén "
            "en estado Borrador. Las propuestas En revisión o Aprobadas "
            "no permiten cambios en su contenido."
        )

        todos_los_registros = consultar_pei()

        registros_borrador = [
            registro
            for registro in todos_los_registros
            if registro["estado"] == "Borrador"
        ]

        if not registros_borrador:

            st.warning(
                "No hay propuestas PEI en estado Borrador "
                "disponibles para edición."
            )

        else:

            opciones_edicion = {
                (
                    f'PEI #{registro["id"]} · '
                    f'{registro["area"]} · '
                    f'{registro["proyecto"]}'
                ): registro
                for registro in registros_borrador
            }

            seleccion_edicion = st.selectbox(
                "Selecciona la propuesta que deseas editar",
                options=list(opciones_edicion.keys()),
                key="seleccion_edicion_pei",
            )

            registro_edicion = opciones_edicion[seleccion_edicion]

            registro_id = registro_edicion["id"]

            st.markdown("---")

            st.markdown(
                f"**Propuesta seleccionada:** PEI #{registro_id}"
            )

            st.markdown(
                f"**Área responsable:** {registro_edicion['area']}"
            )

            st.markdown(
                f"**Estado actual:** {registro_edicion['estado']}"
            )

            st.caption(
                "El área responsable se conserva. "
                "La edición no cambia la trazabilidad de la propuesta."
            )

            with st.form(
                f"formulario_edicion_pei_{registro_id}"
            ):

                foco_edicion = st.selectbox(
                    "Foco (iniciativa estratégica)",
                    options=FOCOS_ESTRATEGICOS,
                    index=FOCOS_ESTRATEGICOS.index(
                        registro_edicion["foco"]
                    ),
                    key=f"editar_foco_{registro_id}",
                )

                objetivo_edicion = st.text_area(
                    "Objetivo estratégico",
                    value=registro_edicion["objetivo_estrategico"],
                    height=100,
                    key=f"editar_objetivo_{registro_id}",
                )

                proyecto_edicion = st.text_input(
                    "Proyecto",
                    value=registro_edicion["proyecto"],
                    key=f"editar_proyecto_{registro_id}",
                )

                unidad_edicion = st.text_input(
                    "Unidad de medida",
                    value=registro_edicion["unidad_medida"],
                    key=f"editar_unidad_{registro_id}",
                )

                meta_edicion = st.text_input(
                    "Meta 2030",
                    value=registro_edicion["meta_2030"],
                    key=f"editar_meta_{registro_id}",
                )

                detalle_edicion = st.text_area(
                    "Detalle",
                    value=registro_edicion["detalle"] or "",
                    height=100,
                    key=f"editar_detalle_{registro_id}",
                )

                guardar_cambios = st.form_submit_button(
                    "Guardar cambios de la propuesta",
                    type="primary",
                )

                if guardar_cambios:

                    if not all(
                        [
                            objetivo_edicion.strip(),
                            proyecto_edicion.strip(),
                            unidad_edicion.strip(),
                            meta_edicion.strip(),
                        ]
                    ):

                        st.error(
                            "Completa objetivo, proyecto, unidad de medida "
                            "y meta 2030."
                        )

                    else:

                        try:

                            actualizar_pei(
                                registro_id=registro_id,
                                foco=foco_edicion,
                                objetivo=objetivo_edicion,
                                proyecto=proyecto_edicion,
                                unidad_medida=unidad_edicion,
                                meta_2030=meta_edicion,
                                detalle=detalle_edicion,
                            )

                            st.success(
                                f"La propuesta PEI #{registro_id} "
                                "fue actualizada correctamente."
                            )

                            st.rerun()

                        except Exception as error:

                            st.error(
                                f"No fue posible actualizar la propuesta: {error}"
                            )

    # ========================================================
    # 4. CONSULTA Y GESTIÓN DE ESTADOS
    # ========================================================

    with pestaña_consulta:

        st.subheader("Propuestas PEI registradas")

        registros = consultar_pei()

        if not registros:

            st.info(
                "Todavía no existen propuestas PEI. "
                "Cuando las áreas comiencen a registrarlas, "
                "aparecerán en este espacio."
            )

        else:

            areas_disponibles = sorted(
                {
                    registro["area"]
                    for registro in registros
                }
            )

            filtro_area = st.selectbox(
                "Filtrar por área",
                ["Todas las áreas"] + areas_disponibles,
                key="filtro_area_consulta_pei",
            )

            if filtro_area != "Todas las áreas":

                registros = [
                    registro
                    for registro in registros
                    if registro["area"] == filtro_area
                ]

            st.dataframe(
                [
                    {
                        "ID": registro["id"],
                        "Área": registro["area"],
                        "Foco": registro["foco"],
                        "Objetivo estratégico": (
                            registro["objetivo_estrategico"]
                        ),
                        "Proyecto": registro["proyecto"],
                        "Unidad de medida": registro["unidad_medida"],
                        "Meta 2030": registro["meta_2030"],
                        "Estado": registro["estado"],
                    }
                    for registro in registros
                ],
                use_container_width=True,
                hide_index=True,
            )

            st.divider()

            st.markdown("#### Gestión de estados")

            registros_modificables = [
                registro
                for registro in registros
                if registro["estado"] != "Aprobado"
            ]

            if registros_modificables:

                opciones_registros = {
                    (
                        f'PEI #{registro["id"]} · '
                        f'{registro["area"]} · '
                        f'{registro["proyecto"]}'
                    ): registro
                    for registro in registros_modificables
                }

                seleccion = st.selectbox(
                    "Selecciona una propuesta",
                    options=list(opciones_registros.keys()),
                    key="seleccion_estado_pei",
                )

                registro = opciones_registros[seleccion]

                estados_disponibles = [
                    estado
                    for estado in ESTADOS_PEI
                    if estado != registro["estado"]
                ]

                if estados_disponibles:

                    nuevo_estado = st.selectbox(
                        "Nuevo estado",
                        options=estados_disponibles,
                        key=f"estado_pei_{registro['id']}",
                    )

                    if st.button(
                        "Actualizar estado del PEI",
                        type="primary",
                    ):

                        try:

                            cambiar_estado_pei(
                                registro_id=registro["id"],
                                nuevo_estado=nuevo_estado,
                            )

                            st.success(
                                f"Estado actualizado a: {nuevo_estado}"
                            )

                            st.rerun()

                        except Exception as error:

                            st.error(
                                f"No fue posible cambiar el estado: {error}"
                            )

            else:

                st.info(
                    "Todas las propuestas de esta consulta están aprobadas. "
                    "Sus datos se encuentran protegidos."
                )
