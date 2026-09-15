// Tab Dashboard — a "tab" window type sample.
//
// Two things worth knowing about window types. First, a host that does not
// implement the type you asked for falls back to a floating window rather than
// refusing the extension, so declaring "tab" costs you the layout you wanted,
// never the extension itself. Second, nothing tells your page which of the two
// it got — so this sample measures itself and says so.

// What the manifest asked for. If the host honoured it we should be at or near
// this width; a fallback floating window is typically far narrower.
const REQUESTED_WIDTH = 900;

const status = document.getElementById('status');
const windowReport = document.getElementById('window-report');
const refreshButton = document.getElementById('refresh');

function report(message, kind) {
  status.textContent = message;
  status.className = kind ?? '';
}

function describeWindow() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // A heuristic, not a protocol call — there is no API that reports the window
  // type back to the page. Treat it as a hint while testing, not a guarantee.
  const looksLikeTab = width >= REQUESTED_WIDTH * 0.75;

  windowReport.textContent =
    `${width} x ${height} — ` +
    (looksLikeTab
      ? 'roughly the requested size, so the host honoured "tab".'
      : 'narrower than requested, so the host most likely fell back to floating.');
}

function fillList(list, labels) {
  list.replaceChildren(
    ...(labels.length === 0 ? ['None in this model.'] : labels).map(label => {
      const row = document.createElement('li');
      row.textContent = label;
      return row;
    }),
  );
}

async function loadDashboard() {
  const model = await SketchUpApi.getActiveModel();

  const [entities, scenes, styles, materials, definitions] = await Promise.all([
    model.entities.get(),
    model.getScenes(),
    model.getStyles(),
    model.getMaterials(),
    model.getDefinitions(),
  ]);

  const rows = [
    ['Title', model.title || '(unsaved)'],
    ['Revision', model.revision],
    ['Top-level entities', entities.length],
    ['Materials', materials.values.length],
    ['Components', definitions.length],
  ];

  document.getElementById('model').replaceChildren(
    ...rows.map(([label, value]) => {
      const row = document.createElement('tr');
      const name = document.createElement('td');
      const cell = document.createElement('td');
      name.textContent = label;
      cell.textContent = String(value);
      row.append(name, cell);
      return row;
    }),
  );

  fillList(
    document.getElementById('scenes'),
    scenes.map(scene => scene.name ?? scene.label ?? `Scene ${scene.id}`),
  );
  fillList(document.getElementById('styles'), styles.map(style => style.name));

  report('Ready.', 'ok');
}

async function refresh() {
  refreshButton.disabled = true;
  try {
    await loadDashboard();
  } catch (error) {
    report(String(error), 'error');
  } finally {
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener('click', refresh);
window.addEventListener('resize', describeWindow);

SketchUpApi.ui.on('open', () => {
  void refresh();
});

describeWindow();

(async () => {
  try {
    await SketchUpApi.connect();
    refreshButton.disabled = false;
    await refresh();
  } catch (error) {
    report(String(error), 'error');
  }
})();
