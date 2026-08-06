/**
 * Módulo de Verificación de Folio ISO 59004
 * Social Renovable Latam SpA
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("verifica-form");
  const input = document.getElementById("folio-input");
  const submitBtn = document.getElementById("verify-btn");

  const loadingContainer = document.getElementById("verifica-loading");
  const resultValid = document.getElementById("result-valid");
  const resultInvalid = document.getElementById("result-invalid");
  const resultError = document.getElementById("result-error");

  // Referencias a los campos de visualización de resultados válidos
  const resFolio = document.getElementById("res-folio");
  const resOrganizacion = document.getElementById("res-organizacion");
  const resFecha = document.getElementById("res-fecha");
  const resRubro = document.getElementById("res-rubro");
  const resPais = document.getElementById("res-pais");
  const resAcciones = document.getElementById("res-acciones");
  const resPriorizadas = document.getElementById("res-priorizadas");
  const resPrimerPaso = document.getElementById("res-primer-paso");

  // Referencia a mensaje de error
  const errMessage = document.getElementById("err-message");
  const errFolioBuscado = document.getElementById("err-folio-buscado");

  if (!form || !input || !submitBtn) return;

  // 1. Detección automática de parámetro de URL (?folio=... o ?f=...)
  const urlParams = new URLSearchParams(window.location.search);
  const paramFolio = urlParams.get("folio") || urlParams.get("f");

  if (paramFolio && paramFolio.trim().length > 0) {
    const sanitizedFolio = paramFolio.trim();
    input.value = sanitizedFolio;
    consultarFolioISO(sanitizedFolio, false);
  }

  // 2. Manejo del envío manual de formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const folio = input.value.trim();
    if (!folio) {
      input.focus();
      return;
    }
    consultarFolioISO(folio, true);
  });

  /**
   * Ejecuta la consulta GET al endpoint de la API Vercel
   * @param {string} folio Código único del informe
   * @param {boolean} updateUrl True si debe actualizar la barra de direcciones
   */
  async function consultarFolioISO(folio, updateUrl) {
    // Actualizar URL limpia en el navegador sin recargar la página
    if (updateUrl) {
      const newUrl = `${window.location.pathname}?folio=${encodeURIComponent(folio)}`;
      window.history.replaceState(null, "", newUrl);
    }

    // Estado inicial: mostrar loader y ocultar tarjetas previas
    ocultarResultados();
    mostrarCargando(true);

    // Obtener la URL base desde CONFIG o usar la por defecto
    const baseUrl = (typeof CONFIG !== "undefined" && CONFIG.apiVerificaUrl)
      ? CONFIG.apiVerificaUrl
      : "https://TU-APP-NEXTJS.vercel.app/api/verifica";

    const endpoint = `${baseUrl.replace(/\/+$/, "")}/${encodeURIComponent(folio)}`;

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      });

      let data = {};
      try {
        data = await response.json();
      } catch (errJson) {
        console.warn("Respuesta sin cuerpo JSON válido:", errJson);
      }

      const esValido = Boolean(data.valido === true || (data.existe === true && data.valido !== false));
      const esInvalido = Boolean(data.valido === false || data.existe === false || response.status === 404);

      if (response.ok && esValido) {
        // HTTP 200 - Informe Válido y Encontrado
        renderResultadoValido(data);
      } else if (esInvalido) {
        // HTTP 404, valido: false o existe: false
        renderResultadoInvalido(folio, data.error || "Folio no encontrado en los registros oficiales.");
      } else {
        // Otro código HTTP o respuesta inesperada
        renderResultadoInvalido(folio, data.error || `No se pudo verificar el folio (Código ${response.status}).`);
      }
    } catch (error) {
      console.error("Error de red o conexión:", error);
      mostrarErrorRed();
    } finally {
      mostrarCargando(false);
    }
  }

  function renderResultadoValido(data) {
    if (resFolio) resFolio.textContent = data.folio || input.value;
    if (resOrganizacion) resOrganizacion.textContent = data.organizacion || "No especificada";
    if (resFecha) resFecha.textContent = formatearFecha(data.fecha);
    if (resRubro) resRubro.textContent = data.rubro || "No indicado";
    if (resPais) resPais.textContent = data.pais || "Chile";

    if (data.resumen) {
      if (resAcciones) resAcciones.textContent = data.resumen.accionesMarcadas ?? 0;
      if (resPriorizadas) resPriorizadas.textContent = data.resumen.priorizadas ?? 0;
      if (resPrimerPaso) {
        const esPrimerPaso = Boolean(data.resumen.primerPaso);
        resPrimerPaso.textContent = esPrimerPaso ? "✓ Completado" : "En proceso";
        resPrimerPaso.className = esPrimerPaso ? "badge-status badge-success" : "badge-status badge-neutral";
      }
    }

    if (resultValid) {
      resultValid.style.display = "block";
      resultValid.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function renderResultadoInvalido(folio, mensaje) {
    if (errFolioBuscado) errFolioBuscado.textContent = folio;
    if (errMessage) errMessage.textContent = mensaje;

    if (resultInvalid) {
      resultInvalid.style.display = "block";
      resultInvalid.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function mostrarErrorRed() {
    if (resultError) {
      resultError.style.display = "block";
      resultError.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function ocultarResultados() {
    if (resultValid) resultValid.style.display = "none";
    if (resultInvalid) resultInvalid.style.display = "none";
    if (resultError) resultError.style.display = "none";
  }

  function mostrarCargando(isLoading) {
    if (isLoading) {
      if (loadingContainer) loadingContainer.style.display = "flex";
      submitBtn.disabled = true;
      submitBtn.dataset.originalHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = `
        <span class="btn-spinner" aria-hidden="true"></span>
        <span>Consultando base de datos oficial...</span>
      `;
    } else {
      if (loadingContainer) loadingContainer.style.display = "none";
      submitBtn.disabled = false;
      if (submitBtn.dataset.originalHtml) {
        submitBtn.innerHTML = submitBtn.dataset.originalHtml;
      }
    }
  }

  /**
   * Formatea cadenas ISO 8601 a fecha legible en español (ej: "6 de agosto de 2026")
   */
  function formatearFecha(isoString) {
    if (!isoString) return "Fecha no especificada";
    try {
      const fecha = new Date(isoString);
      if (isNaN(fecha.getTime())) return isoString;

      return fecha.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC"
      });
    } catch (e) {
      return isoString;
    }
  }
});
