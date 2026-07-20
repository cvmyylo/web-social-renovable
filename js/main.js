/**
 * Configuración global y autogestionable de la página.
 * Se pueden modificar las URLs, teléfonos, correos y claves aquí sin tocar la estructura HTML.
 */
const CONFIG = {
  // Enlace para la plataforma +Sustentable (configurable)
  urlMasSustentable: "https://massustentable.cl",

  // Correo de contacto y envío de formulario
  emailContacto: "czegers@socialrenovable.cl",

  // Teléfono de contacto
  telefonoContacto: "+56 9 7708 5377",

  // ID de Medición de Google Analytics (ej. "G-XXXXXXXXXX")
  googleAnalyticsId: "G-XXXXXXXXXX",

  clientLogos: [
    "Comaco-Nuevo-1024x287.png",
    "Escudo-UCN-Logos-1024x1024.png",
    "Imagen-Aislantes-Nacionales.png",
    "Logo-CIdere-1024x1024.png",
    "Logo-Construye-2025-removebg-preview.png",
    "Logo-Eaton-1024x334.png",
    "Logo-Gedes.png",
    "Solmax.png",
    "Vector-Logo-PCT-final-1024x548.png",
    "logo-cristoro.png",
    "logo-flesan-1-1024x246.png",
    "logo-primser.png",
    "luval-valvoline-chile-lubricante-logo-top-ok.png",
    "ripley.png",
    "solo-logo-alta-954x1024.png"
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  injectConfig();

  renderClientLogos();

  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initContactForm();
  initGoogleAnalytics(CONFIG.googleAnalyticsId);
});


function injectConfig() {
  // Enlaces de +Sustentable
  const sustentableLinks = document.querySelectorAll(".link-sustentable");
  sustentableLinks.forEach(link => {
    link.href = CONFIG.urlMasSustentable;
  });

  // Correo de contacto
  const emailElements = document.querySelectorAll(".contacto-email");
  emailElements.forEach(el => {
    el.textContent = CONFIG.emailContacto;
    if (el.tagName === "A") {
      el.href = `mailto:${CONFIG.emailContacto}`;
    }
  });

  // Teléfono de contacto
  const phoneElements = document.querySelectorAll(".contacto-telefono");
  phoneElements.forEach(el => {
    el.textContent = CONFIG.telefonoContacto;
    if (el.tagName === "A") {
      el.href = `tel:${CONFIG.telefonoContacto.replace(/\s+/g, '')}`;
    }
  });
}


function renderClientLogos() {
  const container1 = document.getElementById("client-logos-container-1");
  const container2 = document.getElementById("client-logos-container-2");
  if (!container1 || !container2) return;

  const createLogoElements = (container) => {
    CONFIG.clientLogos.forEach(logoName => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "trust-logo-item";

      const imgEl = document.createElement("img");
      imgEl.src = `img/${logoName}`;
      const formattedAlt = logoName
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .replace(/\d+x\d+/g, "");
      imgEl.alt = `Logo ${formattedAlt.trim()}`;
      imgEl.loading = "lazy";

      itemDiv.appendChild(imgEl);
      container.appendChild(itemDiv);
    });
  };

  createLogoElements(container1);
  createLogoElements(container2);
}


function initNavbar() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}


function initMobileMenu() {
  const toggleBtn = document.querySelector(".nav-toggle");
  const menuList = document.querySelector(".nav-menu");
  const menuLinks = document.querySelectorAll(".nav-item a, .nav-menu .btn");

  if (!toggleBtn || !menuList) return;

  toggleBtn.addEventListener("click", () => {
    toggleBtn.classList.toggle("active");
    menuList.classList.toggle("active");
  });

  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      toggleBtn.classList.remove("active");
      menuList.classList.remove("active");
    });
  });
}


function initScrollAnimations() {
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");

          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add("visible"));
  }
}


// Variables globales para control anti-spam y captcha
let expectedCaptchaResult = "";
const pageLoadTime = Date.now();

function generateCaptcha() {
  const questionEl = document.getElementById("captcha-question");
  const inputEl = document.getElementById("form-captcha");
  if (!questionEl || !inputEl) return;

  // Generamos una suma simple para el CAPTCHA matemático
  const num1 = Math.floor(Math.random() * 9) + 1; // 1 a 9
  const num2 = Math.floor(Math.random() * 9) + 1; // 1 a 9
  expectedCaptchaResult = num1 + num2;

  questionEl.textContent = `¿Cuánto es ${num1} + ${num2}?`;
  inputEl.value = ""; // Limpiar respuesta anterior
}

function initContactForm() {
  const contactForm = document.getElementById("contact-form");
  const formMessage = document.getElementById("form-message");

  if (!contactForm || !formMessage) return;

  // Inicializar CAPTCHA tradicional al cargar el formulario
  generateCaptcha();

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("form-nombre").value.trim();
    const empresa = document.getElementById("form-empresa").value.trim();
    const email = document.getElementById("form-email").value.trim();
    const userCaptcha = document.getElementById("form-captcha").value.trim();
    const honeyField = contactForm.querySelector("input[name='_honey']").value.trim();
    const submitBtn = contactForm.querySelector("button[type='submit']");

    // 1. Validar campos obligatorios
    if (!nombre || !empresa || !email || !userCaptcha) {
      showMessage("Por favor, completa todos los campos obligatorios.", "error");
      return;
    }

    // 2. Honeypot check (detección silenciosa de bots)
    if (honeyField) {
      console.warn("Spam detectado vía Honeypot.");
      showMessage("Consulta enviada con éxito.", "success"); // Simular éxito para desalentar al bot
      contactForm.reset();
      generateCaptcha();
      return;
    }

    // 3. Validación de tiempo de llenado mínimo (3 segundos)
    const submitTime = Date.now();
    if (submitTime - pageLoadTime < 3000) {
      console.warn("Spam detectado: Envío extremadamente rápido.");
      showMessage("Hubo un error de verificación. Inténtalo de nuevo en unos segundos.", "error");
      return;
    }

    // 4. Validar resultado del CAPTCHA matemático
    const answer = parseInt(userCaptcha, 10);
    if (isNaN(answer) || answer !== expectedCaptchaResult) {
      showMessage("El resultado de seguridad es incorrecto. Inténtalo de nuevo.", "error");
      generateCaptcha();
      return;
    }

    submitBtn.disabled = true;
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = "Enviando...";

    const formData = new FormData(contactForm);
    // Configurar asunto descriptivo y plantilla para el correo de FormSubmit
    formData.append("_subject", `Nueva consulta web: ${nombre} - ${empresa}`);
    formData.append("_template", "table");

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONFIG.emailContacto}`, {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json"
        }
      });

      const result = await response.json();

      if (response.status === 200 && result.success === "true") {
        showMessage("Recibido. Te respondemos dentro de dos días hábiles.", "success");
        contactForm.reset();
      } else {
        showMessage("Hubo un problema al enviar tu consulta. Por favor, inténtalo más tarde.", "error");
      }
    } catch (error) {
      console.error("Error en envío:", error);
      showMessage("Error de red. Verifica tu conexión e inténtalo nuevamente.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
      generateCaptcha();
    }
  });

  function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = "block";

    setTimeout(() => {
      formMessage.style.display = "none";
    }, 6000);
  }
}

/**
 * Inicializa Google Analytics de forma dinámica si se provee un ID válido.
 */
function initGoogleAnalytics(measurementId) {
  if (!measurementId || measurementId === "G-XXXXXXXXXX") {
    console.log("Google Analytics: No se ha configurado un ID de medición activo.");
    return;
  }

  // Cargar el script global de gtag.js de forma asíncrona
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Definir dataLayer y la función gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag("js", new Date());
  window.gtag("config", measurementId);
  console.log(`Google Analytics: Inicializado con el ID ${measurementId}`);
}
