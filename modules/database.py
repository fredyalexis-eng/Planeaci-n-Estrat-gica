
from pathlib import Path
import sqlite3
from contextlib import contextmanager


# ============================================================
# 1. RUTAS Y CONFIGURACIÓN
# ============================================================

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
DB_PATH = DATA_DIR / "strategy_lab.db"

DATA_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# 2. REGLAS ESTRUCTURALES
# ============================================================

FOCOS_ESTRATEGICOS = [
    "Infraestructura dinamizadora para la conectividad y el desarrollo",
    "Ruta social y gestión preventiva de conflictos"
]

ESTADOS_PEI = [
    "Borrador",
    "En revisión",
    "Aprobado"
]

ESTADOS_PLAN = [
    "En construcción",
    "En revisión",
    "Cerrado"
]


# ============================================================
# 3. CONEXIÓN A LA BASE DE DATOS
# ============================================================

@contextmanager
def conectar():

    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")

    try:
        yield conn
        conn.commit()

    except Exception:
        conn.rollback()
        raise

    finally:
        conn.close()


# ============================================================
# 4. INICIALIZACIÓN DE LA BASE DE DATOS
# ============================================================

def inicializar_bd():

    with conectar() as conn:

        conn.executescript("""

        CREATE TABLE IF NOT EXISTS areas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE,
            activa INTEGER NOT NULL DEFAULT 1,
            fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP
        );


        CREATE TABLE IF NOT EXISTS pei (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            area_id INTEGER NOT NULL,

            foco TEXT NOT NULL CHECK (
                foco IN (
                    'Infraestructura dinamizadora para la conectividad y el desarrollo',
                    'Ruta social y gestión preventiva de conflictos'
                )
            ),

            objetivo_estrategico TEXT NOT NULL,
            proyecto TEXT NOT NULL,
            unidad_medida TEXT NOT NULL,
            meta_2030 TEXT NOT NULL,
            detalle TEXT,

            estado TEXT NOT NULL DEFAULT 'Borrador'
                CHECK (
                    estado IN (
                        'Borrador',
                        'En revisión',
                        'Aprobado'
                    )
                ),

            fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion TEXT DEFAULT CURRENT_TIMESTAMP,
            fecha_aprobacion TEXT,

            FOREIGN KEY (area_id)
                REFERENCES areas(id)
        );


        CREATE TABLE IF NOT EXISTS plan_accion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            pei_id INTEGER NOT NULL,

            actividad TEXT NOT NULL,
            unidad_medida TEXT NOT NULL,
            meta_2027 TEXT NOT NULL,
            detalle TEXT,

            estado TEXT NOT NULL DEFAULT 'En construcción'
                CHECK (
                    estado IN (
                        'En construcción',
                        'En revisión',
                        'Cerrado'
                    )
                ),

            fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion TEXT DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (pei_id)
                REFERENCES pei(id)
        );


        CREATE TABLE IF NOT EXISTS auditoria (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            tabla TEXT NOT NULL,
            registro_id INTEGER NOT NULL,
            accion TEXT NOT NULL,
            usuario TEXT,
            descripcion TEXT,

            fecha TEXT DEFAULT CURRENT_TIMESTAMP
        );


        CREATE INDEX IF NOT EXISTS idx_pei_area
            ON pei(area_id);

        CREATE INDEX IF NOT EXISTS idx_pei_foco
            ON pei(foco);

        CREATE INDEX IF NOT EXISTS idx_pei_estado
            ON pei(estado);

        CREATE INDEX IF NOT EXISTS idx_pa_pei
            ON plan_accion(pei_id);

        """)

        # ----------------------------------------------------
        # PROTECCIONES DEL PEI
        # ----------------------------------------------------

        conn.executescript("""

        DROP TRIGGER IF EXISTS validar_pei_para_plan;

        DROP TRIGGER IF EXISTS validar_actualizacion_plan;

        DROP TRIGGER IF EXISTS bloquear_pei_aprobado;


        CREATE TRIGGER bloquear_pei_aprobado

        BEFORE UPDATE ON pei

        WHEN OLD.estado = 'Aprobado'
        OR (
            OLD.estado = 'En revisión'
            AND (
                NEW.area_id IS NOT OLD.area_id
                OR NEW.foco IS NOT OLD.foco
                OR NEW.objetivo_estrategico IS NOT OLD.objetivo_estrategico
                OR NEW.proyecto IS NOT OLD.proyecto
                OR NEW.unidad_medida IS NOT OLD.unidad_medida
                OR NEW.meta_2030 IS NOT OLD.meta_2030
                OR NEW.detalle IS NOT OLD.detalle
            )
        )

        BEGIN
            SELECT RAISE(
                ABORT,
                'El contenido del PEI está protegido por su estado actual.'
            );
        END;


        CREATE TRIGGER IF NOT EXISTS bloquear_eliminacion_pei

        BEFORE DELETE ON pei

        WHEN OLD.estado = 'Aprobado'

        BEGIN
            SELECT RAISE(
                ABORT,
                'No se puede eliminar un registro PEI aprobado.'
            );
        END;


        """)

        # ----------------------------------------------------
        # PROTECCIONES DEL PLAN DE ACCIÓN
        # ----------------------------------------------------

        # Se reemplaza el trigger anterior para incorporar
        # la protección del estado En revisión.

        conn.executescript("""

        DROP TRIGGER IF EXISTS bloquear_plan_cerrado;


        CREATE TRIGGER bloquear_plan_cerrado

        BEFORE UPDATE ON plan_accion

        WHEN
            OLD.estado = 'Cerrado'

            OR (
                OLD.estado = 'En revisión'
                AND (
                    NEW.pei_id IS NOT OLD.pei_id
                    OR NEW.actividad IS NOT OLD.actividad
                    OR NEW.unidad_medida IS NOT OLD.unidad_medida
                    OR NEW.meta_2027 IS NOT OLD.meta_2027
                    OR NEW.detalle IS NOT OLD.detalle
                )
            )

        BEGIN
            SELECT RAISE(
                ABORT,
                'El contenido de esta actividad está protegido por su estado actual.'
            );
        END;


        DROP TRIGGER IF EXISTS bloquear_eliminacion_plan_cerrado;


        CREATE TRIGGER bloquear_eliminacion_plan_cerrado

        BEFORE DELETE ON plan_accion

        WHEN OLD.estado IN ('En revisión', 'Cerrado')

        BEGIN
            SELECT RAISE(
                ABORT,
                'No se pueden eliminar actividades en revisión o cerradas.'
            );
        END;


        """)


# ============================================================
# 5. REGISTRO DE ÁREAS
# ============================================================

def registrar_area(nombre):

    nombre = str(nombre).strip()

    if not nombre:
        raise ValueError("El nombre del área es obligatorio.")

    with conectar() as conn:

        cursor = conn.execute(
            """
            INSERT INTO areas (nombre)
            VALUES (?)
            """,
            (nombre,)
        )

        return cursor.lastrowid


def consultar_areas():

    with conectar() as conn:

        return conn.execute(
            """
            SELECT id, nombre
            FROM areas
            WHERE activa = 1
            ORDER BY nombre
            """
        ).fetchall()


# ============================================================
# 6. REGISTRO DE PROPUESTAS PEI
# ============================================================

def registrar_pei(
    area_id,
    foco,
    objetivo,
    proyecto,
    unidad_medida,
    meta_2030,
    detalle=""
):

    if foco not in FOCOS_ESTRATEGICOS:
        raise ValueError("El foco estratégico no está autorizado.")

    campos = [
        objetivo,
        proyecto,
        unidad_medida,
        meta_2030
    ]

    if not all(str(campo).strip() for campo in campos):
        raise ValueError("Completa los campos obligatorios del PEI.")

    with conectar() as conn:

        cursor = conn.execute(
            """
            INSERT INTO pei (
                area_id,
                foco,
                objetivo_estrategico,
                proyecto,
                unidad_medida,
                meta_2030,
                detalle
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                area_id,
                foco,
                str(objetivo).strip(),
                str(proyecto).strip(),
                str(unidad_medida).strip(),
                str(meta_2030).strip(),
                str(detalle or "").strip()
            )
        )

        registro_id = cursor.lastrowid

        conn.execute(
            """
            INSERT INTO auditoria (
                tabla,
                registro_id,
                accion,
                descripcion
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                "pei",
                registro_id,
                "CREACIÓN",
                "Registro PEI creado."
            )
        )

        return registro_id


# ============================================================
# 7. ACTUALIZACIÓN DE PROPUESTAS PEI
# ============================================================

def actualizar_pei(
    registro_id,
    foco,
    objetivo,
    proyecto,
    unidad_medida,
    meta_2030,
    detalle=""
):

    if foco not in FOCOS_ESTRATEGICOS:
        raise ValueError("El foco estratégico no está autorizado.")

    campos = [
        objetivo,
        proyecto,
        unidad_medida,
        meta_2030
    ]

    if not all(str(campo).strip() for campo in campos):
        raise ValueError("Completa todos los campos obligatorios.")

    with conectar() as conn:

        registro = conn.execute(
            "SELECT estado FROM pei WHERE id = ?",
            (registro_id,)
        ).fetchone()

        if registro is None:
            raise ValueError("No existe el registro PEI.")

        if registro["estado"] != "Borrador":
            raise ValueError(
                "Solo se pueden editar propuestas PEI en estado Borrador. "
                "Las propuestas en revisión o aprobadas están protegidas."
            )

        conn.execute(
            """
            UPDATE pei
            SET foco = ?,
                objetivo_estrategico = ?,
                proyecto = ?,
                unidad_medida = ?,
                meta_2030 = ?,
                detalle = ?,
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (
                foco,
                str(objetivo).strip(),
                str(proyecto).strip(),
                str(unidad_medida).strip(),
                str(meta_2030).strip(),
                str(detalle or "").strip(),
                registro_id
            )
        )

        conn.execute(
            """
            INSERT INTO auditoria (
                tabla,
                registro_id,
                accion,
                descripcion
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                "pei",
                registro_id,
                "ACTUALIZACIÓN",
                "Registro PEI actualizado."
            )
        )


# ============================================================
# 8. CAMBIO DE ESTADO DEL PEI
# ============================================================

def cambiar_estado_pei(registro_id, nuevo_estado):

    if nuevo_estado not in ESTADOS_PEI:
        raise ValueError("Estado no permitido.")

    with conectar() as conn:

        registro = conn.execute(
            "SELECT estado FROM pei WHERE id = ?",
            (registro_id,)
        ).fetchone()

        if registro is None:
            raise ValueError("No existe el registro PEI.")

        if registro["estado"] == "Aprobado":
            raise ValueError("El PEI aprobado está bloqueado.")

        conn.execute(
            """
            UPDATE pei
            SET estado = ?,
                fecha_actualizacion = CURRENT_TIMESTAMP,
                fecha_aprobacion = CASE
                    WHEN ? = 'Aprobado'
                    THEN CURRENT_TIMESTAMP
                    ELSE NULL
                END
            WHERE id = ?
            """,
            (nuevo_estado, nuevo_estado, registro_id)
        )

        conn.execute(
            """
            INSERT INTO auditoria (
                tabla,
                registro_id,
                accion,
                descripcion
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                "pei",
                registro_id,
                "CAMBIO DE ESTADO",
                f"Nuevo estado: {nuevo_estado}"
            )
        )


# ============================================================
# 9. CONSULTAS PEI
# ============================================================

def consultar_pei():

    with conectar() as conn:

        return conn.execute(
            """
            SELECT
                p.id,
                a.nombre AS area,
                p.foco,
                p.objetivo_estrategico,
                p.proyecto,
                p.unidad_medida,
                p.meta_2030,
                p.detalle,
                p.estado,
                p.fecha_creacion,
                p.fecha_aprobacion

            FROM pei p

            INNER JOIN areas a
                ON p.area_id = a.id

            ORDER BY p.id DESC
            """
        ).fetchall()


def consultar_pei_aprobado():

    with conectar() as conn:

        return conn.execute(
            """
            SELECT
                p.id,
                a.nombre AS area,
                p.foco,
                p.objetivo_estrategico,
                p.proyecto,
                p.unidad_medida,
                p.meta_2030,
                p.detalle

            FROM pei p

            INNER JOIN areas a
                ON p.area_id = a.id

            WHERE p.estado = 'Aprobado'

            ORDER BY a.nombre, p.id
            """
        ).fetchall()


def consultar_pei_para_plan():

    with conectar() as conn:

        return conn.execute(
            """
            SELECT
                p.id,
                a.nombre AS area,
                p.foco,
                p.objetivo_estrategico,
                p.proyecto,
                p.unidad_medida,
                p.meta_2030,
                p.detalle,
                p.estado

            FROM pei p

            INNER JOIN areas a
                ON p.area_id = a.id

            ORDER BY a.nombre, p.id
            """
        ).fetchall()


# ============================================================
# 10. REGISTRO DE ACTIVIDADES DEL PLAN DE ACCIÓN
# ============================================================

def registrar_actividad(
    pei_id,
    actividad,
    unidad_medida,
    meta_2027,
    detalle=""
):

    campos = [
        actividad,
        unidad_medida,
        meta_2027
    ]

    if not all(str(campo).strip() for campo in campos):
        raise ValueError("Completa los campos obligatorios.")

    with conectar() as conn:

        pei = conn.execute(
            "SELECT id FROM pei WHERE id = ?",
            (pei_id,)
        ).fetchone()

        if pei is None:
            raise ValueError("El proyecto PEI seleccionado no existe.")

        cursor = conn.execute(
            """
            INSERT INTO plan_accion (
                pei_id,
                actividad,
                unidad_medida,
                meta_2027,
                detalle
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                pei_id,
                str(actividad).strip(),
                str(unidad_medida).strip(),
                str(meta_2027).strip(),
                str(detalle or "").strip()
            )
        )

        registro_id = cursor.lastrowid

        conn.execute(
            """
            INSERT INTO auditoria (
                tabla,
                registro_id,
                accion,
                descripcion
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                "plan_accion",
                registro_id,
                "CREACIÓN",
                f"Actividad vinculada al PEI {pei_id}."
            )
        )

        return registro_id


# ============================================================
# 11. ACTUALIZACIÓN DE ACTIVIDADES
# ============================================================

def actualizar_actividad(
    actividad_id,
    actividad,
    unidad_medida,
    meta_2027,
    detalle=""
):

    campos = [
        actividad,
        unidad_medida,
        meta_2027
    ]

    if not all(str(campo).strip() for campo in campos):
        raise ValueError("Completa los campos obligatorios.")

    with conectar() as conn:

        registro = conn.execute(
            "SELECT estado FROM plan_accion WHERE id = ?",
            (actividad_id,)
        ).fetchone()

        if registro is None:
            raise ValueError("La actividad no existe.")

        if registro["estado"] != "En construcción":
            raise ValueError(
                "Solo se pueden editar actividades en estado "
                "En construcción. Las actividades en revisión "
                "o cerradas están protegidas."
            )

        conn.execute(
            """
            UPDATE plan_accion
            SET actividad = ?,
                unidad_medida = ?,
                meta_2027 = ?,
                detalle = ?,
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (
                str(actividad).strip(),
                str(unidad_medida).strip(),
                str(meta_2027).strip(),
                str(detalle or "").strip(),
                actividad_id
            )
        )

        conn.execute(
            """
            INSERT INTO auditoria (
                tabla,
                registro_id,
                accion,
                descripcion
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                "plan_accion",
                actividad_id,
                "ACTUALIZACIÓN",
                "Actividad del Plan de Acción actualizada."
            )
        )


# ============================================================
# 12. CAMBIO DE ESTADO DEL PLAN DE ACCIÓN
# ============================================================

def cambiar_estado_plan(actividad_id, nuevo_estado):

    if nuevo_estado not in ESTADOS_PLAN:
        raise ValueError("Estado del Plan de Acción no permitido.")

    with conectar() as conn:

        registro = conn.execute(
            "SELECT estado FROM plan_accion WHERE id = ?",
            (actividad_id,)
        ).fetchone()

        if registro is None:
            raise ValueError("La actividad no existe.")

        if registro["estado"] == "Cerrado":
            raise ValueError("La actividad ya está cerrada.")

        conn.execute(
            """
            UPDATE plan_accion
            SET estado = ?,
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (nuevo_estado, actividad_id)
        )

        conn.execute(
            """
            INSERT INTO auditoria (
                tabla,
                registro_id,
                accion,
                descripcion
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                "plan_accion",
                actividad_id,
                "CAMBIO DE ESTADO",
                f"Nuevo estado: {nuevo_estado}"
            )
        )


# ============================================================
# 13. CONSULTA CONSOLIDADA DEL PLAN DE ACCIÓN
# ============================================================

def consultar_plan_accion():

    with conectar() as conn:

        return conn.execute(
            """
            SELECT
                pa.id,
                a.nombre AS area,

                p.id AS pei_id,
                p.foco,
                p.objetivo_estrategico,
                p.proyecto,

                p.unidad_medida AS unidad_medida_pei,
                p.meta_2030,

                pa.actividad,
                pa.unidad_medida AS unidad_medida_actividad,
                pa.meta_2027,
                pa.detalle,

                pa.estado,
                pa.fecha_creacion

            FROM plan_accion pa

            INNER JOIN pei p
                ON pa.pei_id = p.id

            INNER JOIN areas a
                ON p.area_id = a.id

            ORDER BY pa.id DESC
            """
        ).fetchall()


# ============================================================
# 14. CONSULTA DE TRAZABILIDAD
# ============================================================

def consultar_auditoria():

    with conectar() as conn:

        return conn.execute(
            """
            SELECT
                id,
                tabla,
                registro_id,
                accion,
                usuario,
                descripcion,
                fecha

            FROM auditoria

            ORDER BY id DESC
            """
        ).fetchall()


# ============================================================
# 15. INICIALIZACIÓN AUTOMÁTICA
# ============================================================

inicializar_bd()
