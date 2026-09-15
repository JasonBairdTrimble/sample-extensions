// Entity Report — counts what is at the top level of the model.

const status = document.getElementById('status');
const reportBody = document.getElementById('report');
const refreshButton = document.getElementById('refresh');

async function refresh() {
  refreshButton.disabled = true;
  try {
    const model = await SketchUpApi.getActiveModel();
    const entities = await model.entities.get();

    const counts = new Map();
    for (const entity of entities) {
      // entity.type is a number; index the enum through itself for a name.
      const name = SketchUpApi.EntityType[entity.type] ?? `Type ${entity.type}`;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    reportBody.replaceChildren(
      ...rows.map(([name, count]) => {
        const row = document.createElement('tr');
        const label = document.createElement('td');
        const value = document.createElement('td');
        label.textContent = name;
        value.textContent = String(count);
        row.append(label, value);
        return row;
      }),
    );

    status.textContent = `${entities.length} top-level entities.`;
    status.className = 'ok';
  } catch (error) {
    status.textContent = String(error);
    status.className = 'error';
  } finally {
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener('click', refresh);
SketchUpApi.ui.on('open', () => void refresh());

(async () => {
  try {
    await SketchUpApi.connect();
    await refresh();
  } catch (error) {
    status.textContent = String(error);
    status.className = 'error';
  }
})();
