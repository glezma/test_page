// Loads the Zoho SalesIQ web widget (US data centre) with a widget code taken
// from ?wc=… or localStorage, so the code is never committed to the repository.
(function () {
  const STORAGE_KEY = 'atena.salesiq.wc';
  const SCRIPT_HOST = 'https://salesiq.zohopublic.com/widget';

  const $ = (id) => document.getElementById(id);
  const logEl = $('log');
  const statusEl = $('status');

  function log(message) {
    const time = new Date().toLocaleTimeString();
    logEl.textContent += `[${time}] ${message}\n`;
    logEl.scrollTop = logEl.scrollHeight;
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function siq() {
    return window.$zoho && window.$zoho.salesiq;
  }

  // Calls a SalesIQ API only if it exists, so a missing method never breaks the page.
  function call(path, ...args) {
    let target = siq();
    const parts = path.split('.');
    const name = parts.pop();
    for (const part of parts) {
      target = target && target[part];
    }
    if (!target || typeof target[name] !== 'function') {
      log(`API no disponible: $zoho.salesiq.${path}`);
      return undefined;
    }
    return target[name](...args);
  }

  function readWidgetCode() {
    const fromUrl = new URLSearchParams(location.search).get('wc');
    if (fromUrl) {
      localStorage.setItem(STORAGE_KEY, fromUrl.trim());
      history.replaceState(null, '', location.pathname);
    }
    return localStorage.getItem(STORAGE_KEY) || '';
  }

  function onReady() {
    setStatus('listo');
    log('Widget listo.');
    call('language', 'es');
    // Infinite waiting time, as Requirement 8.1 sets on mobile.
    call('chat.waittime', -1);

    const visitor = siq().visitor || {};
    visitor.chat = (visitId, data) => log(`Chat iniciado (visitId ${visitId}).`);
    visitor.offlineMessage = () => log('Mensaje offline enviado.');
    visitor.agentsoffline = () => log('Operadores fuera de línea.');
    visitor.agentsonline = () => log('Operadores en línea.');
    const chat = siq().chat || {};
    chat.agentMessage = () => log('Mensaje de operador recibido.');
    chat.complete = () => log('Chat finalizado.');
  }

  function loadWidget(widgetCode) {
    if (!/^[A-Za-z0-9]+$/.test(widgetCode)) {
      setStatus('código inválido');
      log('El widget code debe ser alfanumérico (por ejemplo siq…).');
      return;
    }
    if (document.getElementById('zsiqscript')) {
      log('El widget ya está cargado. Recarga la página para cambiar de código.');
      return;
    }
    window.$zoho = window.$zoho || {};
    window.$zoho.salesiq = window.$zoho.salesiq || {};
    window.$zoho.salesiq.ready = onReady;

    const script = document.createElement('script');
    script.id = 'zsiqscript';
    script.defer = true;
    script.src = `${SCRIPT_HOST}?wc=${encodeURIComponent(widgetCode)}`;
    script.onerror = () => {
      setStatus('error de carga');
      log('No se pudo cargar el script de SalesIQ (revisa el código o la red).');
    };
    document.body.appendChild(script);
    setStatus('cargando…');
    log('Cargando el widget…');
  }

  $('load').addEventListener('click', () => {
    const widgetCode = $('wc').value.trim();
    localStorage.setItem(STORAGE_KEY, widgetCode);
    loadWidget(widgetCode);
  });
  $('forget').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    $('wc').value = '';
    log('Código olvidado. Recarga la página.');
  });
  $('open').addEventListener('click', () => call('floatwindow.visible', 'show'));
  $('close').addEventListener('click', () => call('floatwindow.visible', 'hide'));
  $('reset').addEventListener('click', () => {
    call('reset');
    log('Visitante reiniciado.');
  });

  const saved = readWidgetCode();
  if (saved) {
    $('wc').value = saved;
    loadWidget(saved);
  }
})();
