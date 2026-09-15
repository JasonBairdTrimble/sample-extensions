// Model Report — model cleanup sample.
//
// Tallies what sits at the model root, counts the model-wide assets, and offers
// to purge the unused ones. The sample shows a read-only pass over the model
// followed by a single write, and how to keep a report in step with a model the
// user is still editing.

const status = document.getElementById('status');
const reportBody = document.getElementById('report');
const refreshButton = document.getElementById('refresh');
const purgeButton = document.getElementById('purge');

function report(message, kind) {
  status.textContent = message;
  status.className = kind ?? '';
}

function renderRows(rows) {
  reportBody.replaceChildren(
    ...rows.map(([label, value]) => {
      const row = document.createElement('tr');
      const name = document.createElement('td');
      const count = document.createElement('td');
      name.textContent = label;
      count.textContent = String(value);
      row.append(name, count);
      return row;
    }),
  );
}

async function buildReport() {
  const model = await SketchUpApi.getActiveModel();

  // Root level only — entities.get() does not recurse into groups and
  // instances, which is what keeps this bounded on a large model. Walk the
  // children yourself if you need a deep count, and stream it rather than
  // materialising everything at once.
  const entities = await model.entities.get();

  const byType = new Map();
  let hidden = 0;
  let untagged = 0;

  for (const entity of entities) {
    // entity.type is the numeric SketchUpApi.EntityType value; index the enum
    // back through itself to get a printable name.
    const name = SketchUpApi.EntityType[entity.type] ?? `Type ${entity.type}`;
    byType.set(name, (byType.get(name) ?? 0) + 1);

    if (entity.hidden) {
      hidden += 1;
    }
    if (entity.tagId === undefined) {
      untagged += 1;
    }
  }

  const [materials, definitions, styles] = await Promise.all([
    model.getMaterials(),
    model.getDefinitions(),
    model.getStyles(),
  ]);

  const typeRows = [...byType.entries()].sort((a, b) => b[1] - a[1]);

  renderRows([
    ...typeRows,
    ['— hidden', hidden],
    ['— untagged', untagged],
    ['Materials', materials.values.length],
    ['Components', definitions.length],
    ['Styles', styles.length],
  ]);

  report(`${entities.length} top-level entities.`, 'ok');
}

async function purgeUnused() {
  purgeButton.disabled = true;
  try {
    const model = await SketchUpApi.getActiveModel();

    // All three purges go in one operation, so the user undoes the cleanup in
    // one step rather than three.
    await model.performOperation(operation => {
      operation.purgeUnusedMaterials();
      operation.purgeUnusedDefinitions();
      operation.purgeUnusedStyles();
    }, 'Purge unused');

    await buildReport();
    report('Purged unused materials, components and styles.', 'ok');
  } catch (error) {
    report(String(error), 'error');
  } finally {
    purgeButton.disabled = false;
  }
}

async function refresh() {
  refreshButton.disabled = true;
  try {
    await buildReport();
  } catch (error) {
    report(String(error), 'error');
  } finally {
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener('click', refresh);
purgeButton.addEventListener('click', purgeUnused);

// Register the command handler before connecting, so a menu click that opened
// this page is not missed while the page was still loading.
SketchUpApi.ui.on('open', () => {
  void refresh();
});

(async () => {
  try {
    await SketchUpApi.connect();
    refreshButton.disabled = false;
    purgeButton.disabled = false;
    await buildReport();
  } catch (error) {
    report(String(error), 'error');
  }
})();
