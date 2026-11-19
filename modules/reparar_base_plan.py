
from pathlib import Path
import sqlite3
from datetime import datetime

from modules.database import DB_PATH as RUTA_BD


def reparar():

    # ============================================================
    # 1. RUTAS
    # ============================================================

    db_path = Path(RUTA_BD)

    backups_dir = db_path.parent.parent / "backups"
    backups_dir.mkdir(parents=True, exist_ok=True)

    print("\n==============================================")
    print("REPARACIÓN DE LA TABLA PLAN DE ACCIÓN")
    print("==============================================")

    print(f"\nBase de datos: {db_path}")

    if not db_path.exists():
        print("\nERROR: No se encontró la base de datos.")
        return

    # ============================================================
    # 2. CONEXIÓN Y VERIFICACIONES INICIALES
    # ============================================================

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row

    try:

        tablas = conn.execute("""
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
              AND name = 'plan_accion'
        """).fetchall()

        if not tablas:
            print("\nERROR: No existe la tabla plan_accion.")
            return

        esquema = conn.execute("""
            SELECT sql
            FROM sqlite_master
            WHERE type = 'table'
              AND name = 'plan_accion'
        """).fetchone()["sql"]

        print("\nESQUEMA ACTUAL:")
        print(esquema)

        # ========================================================
        # 3. VERIFICAR ESTADOS EXISTENTES
        # ========================================================

        registros = conn.execute("""
            SELECT id, estado
            FROM plan_accion
            ORDER BY id
        """).fetchall()

        print("\nESTADOS ENCONTRADOS:")

        for registro in registros:
            print(
                f"ID {registro['id']}: "
                f"{repr(registro['estado'])}"
            )

        estados_permitidos = {
            "En construcci?n",
            "En revisi?n",
            "En construcción",
            "En revisión",
            "Cerrado"
        }

        estados_actuales = {
            registro["estado"]
            for registro in registros
        }

        desconocidos = estados_actuales - estados_permitidos

        if desconocidos:
            print("\nREPARACIÓN CANCELADA.")
            print("Se encontraron estados no reconocidos:")

            for estado in desconocidos:
                print(repr(estado))

            print("\nNo se realizaron modificaciones.")
            return

        # ========================================================
        # 4. COMPROBAR SI YA ESTÁ REPARADA
        # ========================================================

        esquema_incorrecto = (
            "En construcci?n" in esquema
            or "En revisi?n" in esquema
        )

        datos_incorrectos = (
            "En construcci?n" in estados_actuales
            or "En revisi?n" in estados_actuales
        )

        if not esquema_incorrecto and not datos_incorrectos:
            print("\nLa tabla ya tiene estados correctos.")
            print("No es necesario realizar la reparación.")
            return

        # ========================================================
        # 5. CREAR COPIA DE SEGURIDAD
        # ========================================================

        fecha = datetime.now().strftime("%Y%m%d_%H%M%S")

        backup_path = (
            backups_dir /
            f"strategy_lab_antes_reparacion_{fecha}.db"
        )

        backup_conn = sqlite3.connect(backup_path)

        try:
            conn.backup(backup_conn)
        finally:
            backup_conn.close()

        print("\nCOPIA DE SEGURIDAD CREADA:")
        print(backup_path)

        # ========================================================
        # 6. CERRAR CONEXIÓN Y PREPARAR TRANSACCIÓN
        # ========================================================

        conn.close()

        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row

        conn.execute("PRAGMA foreign_keys = OFF")
        conn.execute("BEGIN IMMEDIATE")

        try:

            # ====================================================
            # 7. ELIMINAR SOLAMENTE LOS TRIGGERS DE PLAN DE ACCIÓN
            # ====================================================

            conn.execute("""
                DROP TRIGGER IF EXISTS bloquear_plan_cerrado
            """)

            conn.execute("""
                DROP TRIGGER IF EXISTS bloquear_eliminacion_plan_cerrado
            """)

            # ====================================================
            # 8. CREAR TABLA NUEVA CON ESTADOS CORRECTOS
            # ====================================================

            conn.execute("""
                CREATE TABLE plan_accion_nueva (

                    id INTEGER PRIMARY KEY AUTOINCREMENT,

                    pei_id INTEGER NOT NULL,

                    actividad TEXT NOT NULL,

                    unidad_medida TEXT NOT NULL,

                    meta_2027 TEXT NOT NULL,

                    detalle TEXT,

                    estado TEXT NOT NULL
                        DEFAULT 'En construcción'

                        CHECK (
                            estado IN (
                                'En construcción',
                                'En revisión',
                                'Cerrado'
                            )
                        ),

                    fecha_creacion TEXT
                        DEFAULT CURRENT_TIMESTAMP,

                    fecha_actualizacion TEXT
                        DEFAULT CURRENT_TIMESTAMP,

                    FOREIGN KEY (pei_id)
                        REFERENCES pei(id)
                )
            """)

            # ====================================================
            # 9. COPIAR TODOS LOS REGISTROS
            # ====================================================

            conn.execute("""
                INSERT INTO plan_accion_nueva (
                    id,
                    pei_id,
                    actividad,
                    unidad_medida,
                    meta_2027,
                    detalle,
                    estado,
                    fecha_creacion,
                    fecha_actualizacion
                )

                SELECT
                    id,
                    pei_id,
                    actividad,
                    unidad_medida,
                    meta_2027,
                    detalle,

                    CASE estado
                        WHEN 'En construcci?n'
                            THEN 'En construcción'

                        WHEN 'En revisi?n'
                            THEN 'En revisión'

                        ELSE estado
                    END,

                    fecha_creacion,
                    fecha_actualizacion

                FROM plan_accion
                ORDER BY id
            """)

            # ====================================================
            # 10. REEMPLAZAR LA TABLA ANTIGUA
            # ====================================================

            conn.execute("""
                DROP TABLE plan_accion
            """)

            conn.execute("""
                ALTER TABLE plan_accion_nueva
                RENAME TO plan_accion
            """)

            # ====================================================
            # 11. RECREAR ÍNDICE
            # ====================================================

            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_pa_pei
                ON plan_accion(pei_id)
            """)

            # ====================================================
            # 12. RESTAURAR PROTECCIONES DE PLAN DE ACCIÓN
            # ====================================================

            conn.execute("""
                CREATE TRIGGER bloquear_plan_cerrado
                BEFORE UPDATE ON plan_accion

                BEGIN

                    SELECT
                    CASE

                        WHEN OLD.estado = 'Cerrado'
                        THEN RAISE(
                            ABORT,
                            'Un plan cerrado no puede modificarse'
                        )

                        WHEN OLD.estado = 'En revisión'
                             AND (
                                 NEW.pei_id IS NOT OLD.pei_id
                                 OR NEW.actividad IS NOT OLD.actividad
                                 OR NEW.unidad_medida IS NOT OLD.unidad_medida
                                 OR NEW.meta_2027 IS NOT OLD.meta_2027
                                 OR NEW.detalle IS NOT OLD.detalle
                             )

                        THEN RAISE(
                            ABORT,
                            'Un plan en revisión no puede modificar su contenido'
                        )

                    END;

                END
            """)

            conn.execute("""
                CREATE TRIGGER bloquear_eliminacion_plan_cerrado
                BEFORE DELETE ON plan_accion

                WHEN OLD.estado IN ('En revisión', 'Cerrado')

                BEGIN

                    SELECT RAISE(
                        ABORT,
                        'No se puede eliminar un plan en revisión o cerrado'
                    );

                END
            """)

            # ====================================================
            # 13. VERIFICAR INTEGRIDAD REFERENCIAL
            # ====================================================

            errores = conn.execute("""
                PRAGMA foreign_key_check
            """).fetchall()

            if errores:
                raise RuntimeError(
                    f"Se encontraron errores de integridad: {errores}"
                )

            # ====================================================
            # 14. CONFIRMAR CAMBIOS
            # ====================================================

            conn.commit()

        except Exception:

            conn.rollback()
            raise

        # ========================================================
        # 15. VERIFICACIÓN FINAL
        # ========================================================

        print("\n==============================================")
        print("VERIFICACIÓN FINAL")
        print("==============================================")

        filas = conn.execute("""
            SELECT
                id,
                pei_id,
                actividad,
                unidad_medida,
                meta_2027,
                detalle,
                estado,
                fecha_creacion,
                fecha_actualizacion

            FROM plan_accion

            ORDER BY id
        """).fetchall()

        print(f"\nTOTAL DE ACTIVIDADES: {len(filas)}")

        for fila in filas:

            print("\n----------------------------------------------")
            print(f"ID: {fila['id']}")
            print(f"PEI: {fila['pei_id']}")
            print(f"Actividad: {fila['actividad']}")
            print(f"Unidad: {fila['unidad_medida']}")
            print(f"Meta 2027: {fila['meta_2027']}")
            print(f"Detalle: {fila['detalle']}")
            print(f"Estado: {repr(fila['estado'])}")

        esquema_nuevo = conn.execute("""
            SELECT sql
            FROM sqlite_master
            WHERE type = 'table'
              AND name = 'plan_accion'
        """).fetchone()["sql"]

        print("\nESTADO CORRECTO EN EL ESQUEMA:")
        print("En construcción" in esquema_nuevo)

        print("\nTRIGGERS RESTAURADOS:")

        triggers = conn.execute("""
            SELECT name
            FROM sqlite_master
            WHERE type = 'trigger'
              AND name IN (
                  'bloquear_plan_cerrado',
                  'bloquear_eliminacion_plan_cerrado'
              )
            ORDER BY name
        """).fetchall()

        for trigger in triggers:
            print("-", trigger["name"])

        print("\n==============================================")
        print("REPARACIÓN FINALIZADA")
        print("==============================================")

        print(f"\nCopia de seguridad: {backup_path}")

    except Exception as error:

        print("\nERROR DURANTE LA REPARACIÓN:")
        print(str(error))

        print("\nVerifica la copia de seguridad antes de intentar")
        print("cualquier otra operación.")

    finally:

        conn.close()


if __name__ == "__main__":
    reparar()
