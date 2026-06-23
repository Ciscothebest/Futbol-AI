const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Ensure artifacts directory is used
const scratchDir = "C:\\Users\\franc\\.gemini\\antigravity\\brain\\e1ff1b25-ac6e-4287-a7d0-731ae6bba77f";
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BROWSER_PATH = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

async function run() {
  console.log("⚽ INICIANDO SCRIPT DE CAPTURAS DE ONBOARDING...");
  
  // 1. Iniciar servidor backend en segundo plano y redirigir logs para depuración
  console.log("1. Arrancando servidor backend en puerto 3001...");
  const stdoutLog = fs.openSync(path.join(scratchDir, 'server_stdout.log'), 'w');
  const stderrLog = fs.openSync(path.join(scratchDir, 'server_stderr.log'), 'w');
  const server = spawn('node', ['backend/server.js'], {
    cwd: __dirname,
    stdio: ['ignore', stdoutLog, stderrLog],
    detached: false
  });
  
  // Esperar a que el backend esté listo
  await new Promise(resolve => setTimeout(resolve, 3500));
  
  let browser;
  let page;
  const screenshots = [];
  
  try {
    // 1.5. Registrar y loguear al usuario de prueba para obtener un token JWT válido
    console.log("1.5. Obteniendo token JWT real del servidor backend...");
    let token = '';
    let userObj = {};
    
    const testUsername = `scout_test_${Date.now()}`;
    const testPassword = 'password123';
    
    try {
      await fetch('http://127.0.0.1:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: testUsername,
          password: testPassword,
          nombres: 'Test',
          apellidos: 'Scout',
          telefono: '+34 600 111 222',
          email: `${testUsername}@scout.com`
        })
      });
    } catch (e) {
      console.warn("    Error en registro:", e.message);
    }
    
    const loginRes = await fetch('http://127.0.0.1:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        password: testPassword
      })
    });
    
    if (loginRes.ok) {
      const data = await loginRes.json();
      token = data.token;
      userObj = data.user;
      userObj.onboardingComplete = false; // Forzar onboarding
      console.log(`    ✅ Token JWT obtenido correctamente. Usuario: ${userObj.username}`);
    } else {
      throw new Error(`Error en login: ${loginRes.statusText}`);
    }
    
    // 2. Iniciar navegador
    console.log("2. Abriendo navegador controlado por Puppeteer...");
    browser = await puppeteer.launch({
      executablePath: BROWSER_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    
    // 3. Abrir la página del frontend a través del servidor Express local
    const filePath = 'http://127.0.0.1:3001/index.html';
    console.log(`3. Cargando app desde URL del servidor: ${filePath}`);
    
    // Inject localStorage before loading to bypass authentication redirect to landing.html
    console.log("4. Inyectando estado de onboarding de prueba con token JWT real...");
    await page.evaluateOnNewDocument((t, u) => {
      localStorage.setItem('scout_ai_token', t);
      localStorage.setItem('scout_ai_user', JSON.stringify(u));
    }, token, userObj);
    
    await page.goto(filePath);
    
    // Esperar a que Leaflet y onboarding se monten
    await page.waitForSelector('#onboarding-screen', { visible: true });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const countries = [
      "Spain",
      "United Kingdom",
      "Germany",
      "France",
      "Italy",
      "Portugal",
      "Netherlands",
      "Brazil",
      "Argentina",
      "Mexico",
      "Colombia",
      "United States of America",
      "Japan",
      "Saudi Arabia",
      "Turkey"
    ];
    
    // 5. Capturar las vistas de cada liga
    console.log("5. Iniciando ciclo de selección de ligas y capturas...");
    for (let i = 0; i < countries.length; i++) {
      const country = countries[i];
      console.log(`   [${i+1}/${countries.length}] Seleccionando liga para: ${country}...`);
      
      // Ejecutar selección programática
      await page.evaluate((c) => {
        if (typeof window.selectCountryDirectly === 'function') {
          window.selectCountryDirectly(c);
          window.goToStep2();
        } else {
          console.error("Helper selectCountryDirectly not found!");
        }
      }, country);
      
      // Esperar a que carguen los equipos del backend y se resuelvan logotipos asíncronos
      await new Promise(resolve => setTimeout(resolve, 4500));
      
      // Tomar captura
      const screenshotName = `onboarding_${country.replace(/\s+/g, '_')}.png`;
      const screenshotPath = path.join(scratchDir, screenshotName);
      
      const cardEl = await page.$('.onboarding-card');
      if (cardEl) {
        await cardEl.screenshot({ path: screenshotPath });
      } else {
        await page.screenshot({ path: screenshotPath });
      }
      
      screenshots.push({ country, path: screenshotPath, filename: screenshotName });
      
      // Regresar al mapa
      await page.evaluate(() => {
        if (typeof window.goToStep1 === 'function') {
          window.goToStep1();
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log("6. Cerrando navegador de capturas...");
    await browser.close();
    
  } catch (err) {
    console.error("❌ ERROR DURANTE LA CAPTURA DE PANTALLAS:", err);
    if (page) {
      try {
        const currentUrl = page.url();
        console.log(`[DIAGNÓSTICO] URL actual en fallo: ${currentUrl}`);
        const bodyContent = await page.evaluate(() => document.body ? document.body.innerHTML.substring(0, 800) : 'Body is null');
        console.log(`[DIAGNÓSTICO] Contenido HTML (primeros 800 caracteres):\n${bodyContent}`);
      } catch (e) {
        console.error("[DIAGNÓSTICO] No se pudieron obtener detalles de la página:", e);
      }
    }
    if (browser) await browser.close();
    server.kill();
    process.exit(1);
  }
  
  // Apagar el servidor
  console.log("7. Apagando servidor backend de pruebas...");
  server.kill();
  
  // 8. Generar HTML del Reporte
  console.log("8. Generando archivo de reporte HTML intermedio...");
  const htmlPath = path.join(scratchDir, 'temp_report.html');
  let htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>FutbolAI - Reporte Visual de Ligas</title>
    <style>
      @page {
        size: A4 landscape;
        margin: 0;
      }
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        margin: 0;
        padding: 0;
        background: #080e1a;
        color: #fff;
        -webkit-print-color-adjust: exact;
      }
      .cover-page {
        width: 297mm;
        height: 210mm;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: radial-gradient(circle at center, #0e1e38 0%, #050b14 100%);
        border: 4px solid #00f0ff;
        padding: 40px;
        text-align: center;
      }
      .cover-logo {
        font-size: 70px;
        margin-bottom: 20px;
      }
      .cover-title {
        font-size: 38px;
        font-weight: 900;
        color: #fff;
        margin: 0 0 10px 0;
        letter-spacing: -1px;
      }
      .cover-title span {
        background: linear-gradient(135deg, #00f0ff 0%, #a50044 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .cover-subtitle {
        font-size: 16px;
        color: rgba(255,255,255,0.6);
        margin: 0 0 40px 0;
        max-width: 600px;
        line-height: 1.6;
      }
      .cover-meta {
        font-size: 12px;
        color: #00f0ff;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-weight: 700;
      }
      .page-break {
        page-break-after: always;
      }
      .league-page {
        width: 297mm;
        height: 210mm;
        box-sizing: border-box;
        padding: 25px 35px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: #080e1a;
      }
      .league-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1.5px solid rgba(0, 240, 255, 0.2);
        padding-bottom: 10px;
        margin-bottom: 15px;
      }
      .league-title-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .league-icon {
        font-size: 26px;
      }
      .league-title {
        font-size: 22px;
        font-weight: 800;
        color: #fff;
        margin: 0;
      }
      .league-subtitle {
        font-size: 12px;
        color: rgba(255,255,255,0.55);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .league-tag {
        background: rgba(0, 240, 255, 0.1);
        border: 1px solid #00f0ff;
        color: #00f0ff;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .image-container {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        border-radius: 16px;
        background: rgba(0,0,0,0.3);
        border: 1.5px solid rgba(255, 255, 255, 0.05);
        box-shadow: inset 0 0 30px rgba(0, 240, 255, 0.03);
      }
      .screenshot-img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      .league-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 15px;
        font-size: 10px;
        color: rgba(255,255,255,0.4);
        border-top: 1px solid rgba(255,255,255,0.05);
        padding-top: 8px;
      }
      .footer-brand {
        font-weight: 700;
        letter-spacing: 0.5px;
        color: rgba(255,255,255,0.5);
      }
    </style>
  </head>
  <body>
    <!-- PORTADA -->
    <div class="cover-page">
      <div class="cover-logo">⚽</div>
      <h1 class="cover-title">FutbolAI <span>Scout Platform</span></h1>
      <p class="cover-subtitle">Reporte Técnico y Capturas de Onboarding Visual: Análisis de Ligas Profesionales y Resolución Universal de Escudos Oficiales</p>
      <div class="cover-meta">Documento de Verificación Visual de Calidad • Temporada 2024/25</div>
    </div>
    
    <div class="page-break"></div>
  `;
  
  for (let i = 0; i < screenshots.length; i++) {
    const s = screenshots[i];
    const relativeImgPath = s.filename; // same folder
    
    htmlContent += `
    <div class="league-page">
      <div class="league-header">
        <div class="league-title-group">
          <span class="league-icon">🛡️</span>
          <div>
            <h2 class="league-title">${s.country}</h2>
            <div class="league-subtitle">Exploración en Onboarding Paso 2</div>
          </div>
        </div>
        <span class="league-tag">LIGA DETECTADA</span>
      </div>
      
      <div class="image-container">
        <img class="screenshot-img" src="${relativeImgPath}" alt="${s.country}">
      </div>
      
      <div class="league-footer">
        <span class="footer-brand">⚽ FutbolAI Scout Intelligence</span>
        <span>Pág. ${i + 2} de ${screenshots.length + 1}</span>
      </div>
    </div>
    `;
    
    if (i < screenshots.length - 1) {
      htmlContent += `<div class="page-break"></div>`;
    }
  }
  
  htmlContent += `
  </body>
  </html>
  `;
  
  fs.writeFileSync(htmlPath, htmlContent);
  
  // 9. Imprimir PDF
  console.log("9. Iniciando impresora PDF a través de Puppeteer...");
  let pdfBrowser;
  try {
    pdfBrowser = await puppeteer.launch({
      executablePath: BROWSER_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const pdfPage = await pdfBrowser.newPage();
    const htmlUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
    await pdfPage.goto(htmlUrl, { waitUntil: 'networkidle0' });
    
    const pdfOutputPath = path.join(scratchDir, 'Reporte_Onboarding_Ligas.pdf');
    await pdfPage.pdf({
      path: pdfOutputPath,
      format: 'A4',
      landscape: true,
      printBackground: true
    });
    
    await pdfBrowser.close();
    console.log(`\n\n✅ ¡ÉXITO! PDF final generado correctamente en:\n   ${pdfOutputPath}\n\n`);
    
  } catch (err) {
    console.error("❌ ERROR AL IMPRIMIR EL PDF:", err);
    if (pdfBrowser) await pdfBrowser.close();
    process.exit(1);
  }
  
  // 10. Limpiar archivos temporales
  console.log("10. Limpiando archivos temporales del reporte...");
  try {
    fs.unlinkSync(htmlPath);
    console.log("✅ Limpieza de archivos temporales completada. PNG y PDF preservados en la carpeta de artefactos.");
  } catch (err) {
    console.warn("⚠️ Advertencia al limpiar archivos temporales:", err);
  }
  
  console.log("🏁 SCRIPT FINALIZADO.");
}

run();
