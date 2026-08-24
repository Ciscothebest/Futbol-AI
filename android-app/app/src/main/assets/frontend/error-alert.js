/**
 * Futbol AI - Sistema Global de Alertas Pop-Up de Errores
 * Captura automática de excepciones JS, promesas rechazadas, errores de red y respuestas de API con error (4xx/5xx).
 */

(function () {
  'use strict';

  // Inyectar estilos CSS para la Alerta Pop-Up si no existen
  function injectErrorStyles() {
    if (document.getElementById('app-error-alert-styles')) return;

    const style = document.createElement('style');
    style.id = 'app-error-alert-styles';
    style.textContent = `
      .app-error-overlay {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgba(4, 8, 16, 0.82);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease-in-out;
      }
      .app-error-overlay.active {
        opacity: 1;
        pointer-events: auto;
      }
      .app-error-modal {
        max-width: 480px;
        width: 100%;
        background: linear-gradient(145deg, rgba(12, 18, 34, 0.98), rgba(8, 12, 22, 0.99));
        border: 1.5px solid #ff4a4e;
        border-radius: 20px;
        padding: 28px 24px;
        box-shadow: 0 0 50px rgba(255, 74, 78, 0.35), 0 10px 30px rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(20px);
        text-align: center;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: scale(0.92);
        transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        color: #ffffff;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      }
      .app-error-overlay.active .app-error-modal {
        transform: scale(1);
      }
      .app-error-modal.warning {
        border-color: #ffb703;
        box-shadow: 0 0 50px rgba(255, 183, 3, 0.35), 0 10px 30px rgba(0, 0, 0, 0.8);
      }
      .app-error-modal.info {
        border-color: #00f0ff;
        box-shadow: 0 0 50px rgba(0, 240, 255, 0.35), 0 10px 30px rgba(0, 0, 0, 0.8);
      }
      .app-error-close-btn {
        position: absolute;
        top: 14px;
        right: 16px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.6);
        font-size: 18px;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
      }
      .app-error-close-btn:hover {
        background: rgba(255, 74, 78, 0.2);
        color: #ff4a4e;
        border-color: #ff4a4e;
        transform: rotate(90deg);
      }
      .app-error-icon-container {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: rgba(255, 74, 78, 0.12);
        border: 1px solid rgba(255, 74, 78, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        margin-bottom: 16px;
        box-shadow: 0 0 20px rgba(255, 74, 78, 0.2);
      }
      .app-error-modal.warning .app-error-icon-container {
        background: rgba(255, 183, 3, 0.12);
        border-color: rgba(255, 183, 3, 0.3);
        box-shadow: 0 0 20px rgba(255, 183, 3, 0.2);
      }
      .app-error-modal.info .app-error-icon-container {
        background: rgba(0, 240, 255, 0.12);
        border-color: rgba(0, 240, 255, 0.3);
        box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
      }
      .app-error-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        background: rgba(255, 74, 78, 0.2);
        color: #ff6b6e;
        border: 1px solid rgba(255, 74, 78, 0.3);
        margin-bottom: 12px;
      }
      .app-error-modal.warning .app-error-badge {
        background: rgba(255, 183, 3, 0.2);
        color: #ffc93c;
        border-color: rgba(255, 183, 3, 0.3);
      }
      .app-error-modal.info .app-error-badge {
        background: rgba(0, 240, 255, 0.2);
        color: #64f4ff;
        border-color: rgba(0, 240, 255, 0.3);
      }
      .app-error-title {
        font-size: 20px;
        font-weight: 800;
        color: #ffffff;
        margin: 0 0 10px 0;
        line-height: 1.3;
      }
      .app-error-message {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.5;
        margin: 0 0 18px 0;
        word-break: break-word;
      }
      .app-error-details-box {
        width: 100%;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 10px 12px;
        font-family: 'Consolas', 'Courier New', monospace;
        font-size: 11.5px;
        color: rgba(255, 150, 150, 0.9);
        text-align: left;
        max-height: 120px;
        overflow-y: auto;
        margin-bottom: 20px;
        white-space: pre-wrap;
        word-break: break-all;
      }
      .app-error-action-btn {
        width: 100%;
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 700;
        background: linear-gradient(135deg, #ff4a4e 0%, #d90429 100%);
        color: #ffffff;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(255, 74, 78, 0.4);
        transition: all 0.2s ease-in-out;
      }
      .app-error-action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 74, 78, 0.6);
      }
      .app-error-modal.warning .app-error-action-btn {
        background: linear-gradient(135deg, #ffb703 0%, #fb8500 100%);
        color: #080e1a;
        box-shadow: 0 4px 15px rgba(255, 183, 3, 0.4);
      }
      .app-error-modal.info .app-error-action-btn {
        background: linear-gradient(135deg, #00f0ff 0%, #0072ff 100%);
        color: #080e1a;
        box-shadow: 0 4px 15px rgba(0, 240, 255, 0.4);
      }
    `;
    document.head.appendChild(style);
  }

  // Crear la estructura HTML del Modal de Alerta
  function createErrorModalElement() {
    injectErrorStyles();

    let overlay = document.getElementById('app-error-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'app-error-overlay';
      overlay.className = 'app-error-overlay';
      overlay.innerHTML = `
        <div class="app-error-modal" id="app-error-modal">
          <button class="app-error-close-btn" id="app-error-close-btn" aria-label="Cerrar">✕</button>
          <div class="app-error-icon-container" id="app-error-icon">🚨</div>
          <span class="app-error-badge" id="app-error-badge">ERROR DE SISTEMA</span>
          <h3 class="app-error-title" id="app-error-title">Error Inesperado</h3>
          <p class="app-error-message" id="app-error-message">Se ha producido un problema en la aplicación.</p>
          <div class="app-error-details-box" id="app-error-details" style="display: none;"></div>
          <button class="app-error-action-btn" id="app-error-action-btn">Entendido</button>
        </div>
      `;
      document.body.appendChild(overlay);

      // Event listeners para cerrar
      document.getElementById('app-error-close-btn').addEventListener('click', window.closeAppErrorAlert);
      document.getElementById('app-error-action-btn').addEventListener('click', window.closeAppErrorAlert);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          window.closeAppErrorAlert();
        }
      });
    }
    return overlay;
  }

  // Función pública para mostrar la alerta pop-up
  window.showAppErrorAlert = function (options = {}) {
    const {
      title = 'Error de Infraestructura / Sistema',
      message = 'Ha ocurrido un error al procesar la solicitud.',
      details = null,
      type = 'error', // 'error', 'warning', 'info'
      status = null,
      source = null
    } = typeof options === 'string' ? { message: options } : options;

    if (!document.body) {
      document.addEventListener('DOMContentLoaded', () => window.showAppErrorAlert(options));
      return;
    }

    const overlay = createErrorModalElement();
    const modal = document.getElementById('app-error-modal');
    const iconEl = document.getElementById('app-error-icon');
    const badgeEl = document.getElementById('app-error-badge');
    const titleEl = document.getElementById('app-error-title');
    const msgEl = document.getElementById('app-error-message');
    const detailsEl = document.getElementById('app-error-details');

    // Configurar variante según tipo
    modal.className = `app-error-modal ${type}`;

    if (type === 'warning') {
      iconEl.textContent = '⚠️';
      badgeEl.textContent = status ? `ADVERTENCIA ${status}` : 'ADVERTENCIA';
    } else if (type === 'info') {
      iconEl.textContent = 'ℹ️';
      badgeEl.textContent = status ? `ESTADO ${status}` : 'INFORMACIÓN';
    } else {
      iconEl.textContent = '🚨';
      badgeEl.textContent = status ? `ERROR ${status}` : 'ERROR DE APLICACIÓN';
    }

    titleEl.textContent = title;
    msgEl.textContent = message;

    if (details) {
      detailsEl.textContent = typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details);
      detailsEl.style.display = 'block';
    } else {
      detailsEl.style.display = 'none';
      detailsEl.textContent = '';
    }

    overlay.classList.add('active');
  };

  // Función para cerrar la alerta pop-up
  window.closeAppErrorAlert = function () {
    const overlay = document.getElementById('app-error-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  };

  // 1. Capturar Excepciones JavaScript No Tratadas
  window.addEventListener('error', function (event) {
    // Evitar interceptar errores sintéticos menores de carga de scripts si no son relevantes
    if (event.filename && event.filename.includes('extension')) return;

    const errorMsg = event.message || 'Error desconocido de tiempo de ejecución JavaScript';
    const details = event.error && event.error.stack ? event.error.stack : `Archivo: ${event.filename || 'Desconocido'}:${event.lineno || 0}:${event.colno || 0}`;

    window.showAppErrorAlert({
      title: 'Error de Ejecución Frontend',
      message: errorMsg,
      details: details,
      type: 'error',
      source: 'uncaught_error'
    });
  });

  // 2. Capturar Promesas Rechazadas No Tradas (Unhandled Rejections)
  window.addEventListener('unhandledrejection', function (event) {
    const reason = event.reason;
    let message = 'Se produjo un rechazo de promesa no controlado.';
    let details = null;

    if (typeof reason === 'string') {
      message = reason;
    } else if (reason && reason.message) {
      message = reason.message;
      details = reason.stack || JSON.stringify(reason);
    } else if (reason) {
      details = JSON.stringify(reason);
    }

    // Ignorar redirecciones manuales o cancelaciones
    if (message.includes('Sesión expirada') || message.includes('Failed to fetch')) {
      if (message.includes('Failed to fetch')) {
        message = 'Error de Conexión: No se pudo establecer comunicación con el servidor.';
      }
    }

    window.showAppErrorAlert({
      title: 'Error Asíncrono / Promesa Rechazada',
      message: message,
      details: details,
      type: 'error',
      source: 'unhandled_rejection'
    });
  });

  // 3. Interceptar Fetch HTTP Globalmente para Respuestas 4xx/5xx y Errores de Red
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const [resource, config = {}] = args;
    
    // Si la llamada explícitamente pide omitir la alerta global
    if (config && config.skipErrorAlert) {
      return originalFetch.apply(this, args);
    }

    try {
      const response = await originalFetch.apply(this, args);

      // Si la respuesta no es OK (HTTP status >= 400)
      if (!response.ok && response.status !== 401) { // 401 suele manejarse con redirección de sesión
        const clonedResponse = response.clone();
        clonedResponse.json().then(data => {
          if (response.status === 429 || data.error === 'rate_limit_exceeded' || data.rateLimit) {
            const retrySec = data.retryAfterSec || 300;
            if (typeof window.showRateLimitModal === 'function') {
              window.showRateLimitModal(retrySec);
            } else {
              window.showAppErrorAlert({
                title: 'Exceso de intentos',
                message: `Has hecho muchas preguntas en tan período de tiempo, puedes volver a preguntar en ${retrySec} segundos.`,
                type: 'warning',
                status: 429,
                source: 'rate_limit'
              });
            }
            return;
          }

          const errorMessage = data.error || data.message || `El servidor respondió con código de estado HTTP ${response.status}`;
          const errorDetails = data.details || (data.path ? `Ruta Endpoint: ${data.path}` : `URL: ${typeof resource === 'string' ? resource : resource.url}`);

          window.showAppErrorAlert({
            title: `Error del Servidor (${response.status})`,
            message: errorMessage,
            details: errorDetails,
            type: response.status >= 500 ? 'error' : 'warning',
            status: response.status,
            source: 'api_fetch'
          });
        }).catch(() => {
          clonedResponse.text().then(text => {
            if (response.status === 429) {
              if (typeof window.showRateLimitModal === 'function') {
                window.showRateLimitModal(300);
              } else {
                window.showAppErrorAlert({
                  title: 'Exceso de intentos',
                  message: 'Has hecho muchas preguntas en tan período de tiempo, puedes volver a preguntar en 5 minutos.',
                  type: 'warning',
                  status: 429,
                  source: 'rate_limit'
                });
              }
              return;
            }
            window.showAppErrorAlert({
              title: `Error del Servidor (${response.status})`,
              message: text || `El servidor respondió con código de estado HTTP ${response.status}`,
              details: `URL: ${typeof resource === 'string' ? resource : resource.url}`,
              type: response.status >= 500 ? 'error' : 'warning',
              status: response.status,
              source: 'api_fetch'
            });
          }).catch(() => {});
        });
      }

      return response;
    } catch (fetchError) {
      // Error de red (offline, DNS, timeout, conexión rechazada)
      window.showAppErrorAlert({
        title: 'Error de Red / Conexión',
        message: 'No se pudo conectar con el servidor backend de Futbol AI. Verifica tu conexión a internet o el estado del servidor.',
        details: fetchError.message || String(fetchError),
        type: 'error',
        source: 'network_error'
      });
      throw fetchError;
    }
  };

  console.log('✅ [Futbol AI] Sistema Global de Alertas Pop-Up de Errores activado.');
})();
