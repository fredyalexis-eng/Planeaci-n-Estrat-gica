from pathlib import Path
import re
import unicodedata
import pymupdf
from docx import Document


CARPETA_DOCUMENTOS = Path("knowledge/documentos")


def documento_excluido(ruta):
    nombre = unicodedata.normalize("NFD", ruta.stem.lower())
    nombre = "".join(
        c for c in nombre
        if unicodedata.category(c) != "Mn"
    )
    nombre = re.sub(r"[^a-z0-9]+", " ", nombre).strip()

    return "planeacion estrategica 2022 2026" in nombre


def leer_pdf(ruta):
    contenido = []
    documento = pymupdf.open(ruta)

    try:
        for numero, pagina in enumerate(documento, start=1):
            texto = pagina.get_text().strip()
            if texto:
                contenido.append({
                    "ubicacion": f"Página {numero}",
                    "texto": texto
                })
    finally:
        documento.close()

    return contenido


def leer_word(ruta):
    documento = Document(ruta)
    contenido = []

    for parrafo in documento.paragraphs:
        texto = parrafo.text.strip()
        if texto:
            estilo = parrafo.style.name if parrafo.style else "Texto"
            contenido.append({
                "ubicacion": estilo,
                "texto": texto
            })

    for numero, tabla in enumerate(documento.tables, start=1):
        for fila in tabla.rows:
            celdas = [celda.text.strip() for celda in fila.cells]
            texto = " | ".join(celdas)
            if texto.strip(" |"):
                contenido.append({
                    "ubicacion": f"Tabla {numero}",
                    "texto": texto
                })

    return contenido


def leer_documento(ruta):
    extension = ruta.suffix.lower()

    if extension == ".pdf":
        secciones = leer_pdf(ruta)
    elif extension == ".docx":
        secciones = leer_word(ruta)
    else:
        return None

    return {
        "archivo": ruta.name,
        "formato": extension,
        "secciones": secciones,
        "total_caracteres": sum(
            len(seccion["texto"]) for seccion in secciones
        )
    }


def cargar_documentos():
    documentos = []
    errores = []

    CARPETA_DOCUMENTOS.mkdir(parents=True, exist_ok=True)

    archivos = [
        archivo for archivo in CARPETA_DOCUMENTOS.rglob("*")
        if archivo.is_file()
        and archivo.suffix.lower() in (".pdf", ".docx")
        and not documento_excluido(archivo)
    ]

    archivos.sort(key=lambda archivo: str(archivo).lower())

    for archivo in archivos:
        try:
            documento = leer_documento(archivo)
            if documento:
                documentos.append(documento)
        except Exception as error:
            errores.append({
                "archivo": archivo.name,
                "error": str(error)
            })

    return documentos, errores
