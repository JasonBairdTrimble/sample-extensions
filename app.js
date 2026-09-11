document.getElementById('script').textContent = 'script: ran';
document.getElementById('script').style.color = '#0a7f28';
document.getElementById('origin').textContent = 'origin: ' + location.origin;
document.getElementById('secure').textContent = 'secure context: ' + window.isSecureContext;

(async () => {
  const line = document.getElementById('jsa');
  try {
    await SketchUpApi.connect();
    const version = SketchUpApi.serverProtocolVersion();
    line.textContent = `JSA: connected, host protocol ${version.major}.${version.minor}.${version.patch}`;
  } catch (error) {
    line.textContent = 'JSA: ' + error;
  }
})();
