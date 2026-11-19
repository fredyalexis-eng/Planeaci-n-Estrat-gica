import re
import unicodedata

from modules.lector_documental import cargar_documentos


PALABRAS_COMUNES = {
    "de", "la", "el", "los", "las", "un", "una", "unos", "unas",
    "y", "o", "en", "por", "para", "con", "del", "al", "que",
    "se", "su", "sus", "es", "son", "como", "sobre", "entre",
    "esta", "este", "estos", "estas", "desde", "hasta", "cual",
    "cuales", "puede", "pueden", "debe", "deben"
}


def normalizar(texto):
    texto = texto.lower()
    texto = unicodedata.normalize("NFD", texto)
    texto = "".join(
        caracter for caracter in texto
        if unicodedata.category(caracter) != "Mn"
    )
    return texto


def obtener_terminos(texto):
    palabras = re.findall(r"[a-z0-9]+", normalizar(texto))
    return [
        palabra for palabra in palabras
        if len(palabra) > 2 and palabra not in PALABRAS_COMUNES
    ]


def dividir_fragmentos(texto, max_caracteres=1400):
    parrafos = [
        p.strip() for p in texto.splitlines()
        if p.strip()
    ]

    fragmentos = []
    actual = ""

    for parrafo in parrafos:
        if len(parrafo) > max_caracteres:
            if actual:
                fragmentos.append(actual)
                actual = ""

            for inicio in range(0, len(parrafo), max_caracteres):
                fragmentos.append(
                    parrafo[inicio:inicio + max_caracteres]
                )
            continue

        if len(actual) + len(parrafo) + 1 <= max_caracteres:
            actual = (actual + "\n" + parrafo).strip()
        else:
            if actual:
                fragmentos.append(actual)
            actual = parrafo

    if actual:
        fragmentos.append(actual)

    return fragmentos


def construir_indice():
    documentos, errores = cargar_documentos()
    indice = []

    for documento in documentos:
        for seccion in documento["secciones"]:
            fragmentos = dividir_fragmentos(seccion["texto"])

            for fragmento in fragmentos:
                indice.append({
                    "archivo": documento["archivo"],
                    "formato": documento["formato"],
                    "ubicacion": seccion["ubicacion"],
                    "texto": fragmento,
                    "terminos": set(obtener_terminos(fragmento))
                })

    return indice, errores


def buscar_documentos(consulta, limite=5):
    indice, errores = construir_indice()
    terminos_consulta = set(obtener_terminos(consulta))

    if not terminos_consulta:
        return [], errores

    resultados = []

    for fragmento in indice:
        coincidencias = terminos_consulta.intersection(
            fragmento["terminos"]
        )

        if not coincidencias:
            continue

        cobertura = len(coincidencias) / len(terminos_consulta)
        puntuacion = len(coincidencias) + cobertura

        resultados.append({
            "archivo": fragmento["archivo"],
            "ubicacion": fragmento["ubicacion"],
            "texto": fragmento["texto"],
            "coincidencias": sorted(coincidencias),
            "puntuacion": round(puntuacion, 3)
        })

    resultados.sort(
        key=lambda resultado: resultado["puntuacion"],
        reverse=True
    )

    return resultados[:limite], errores
