// Scene Switcher — visualization sample.
//
// Lists the model's scenes and styles and switches between them. Note the
// asymmetry the sample is built to show: activating a scene is a plain await on
// the model, while selecting a style is a model *edit* and has to go inside an
// operation.

const status = document.getElementById('status');
const sceneList = document.getElementById('scenes');
const styleList = document.getElementById('styles');
const refreshButton = document.getElementById('refresh');

function report(message, kind) {
  status.textContent = message;
  status.className = kind ?? '';
}

function renderList(list, items, currentId, onPick) {
  if (items.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'None in this model.';
    list.replaceChildren(empty);
    return;
  }

  list.replaceChildren(
    ...items.map(item => {
      const row = document.createElement('li');
      const button = document.createElement('button');
      button.textContent = item.label;
      button.setAttribute('aria-current', String(item.id === currentId));
      button.addEventListener('click', () => void onPick(item));
      row.append(button);
      return row;
    }),
  );
}

async function loadScenes(model) {
  const [scenes, current] = await Promise.all([
    model.getScenes(),
    model.getCurrentScene(),
  ]);

  renderList(
    sceneList,
    // A scene's name can be undefined, so fall back to its label before its id.
    scenes.map(scene => ({
      id: scene.id,
      label: scene.name ?? scene.label ?? `Scene ${scene.id}`,
      scene,
    })),
    current?.id,
    async item => {
      try {
        // Activating a scene is not a model edit — no operation needed.
        await model.setCurrentScene(item.scene);
        report(`Switched to "${item.label}".`, 'ok');
        await loadScenes(model);
      } catch (error) {
        report(String(error), 'error');
      }
    },
  );
}

async function loadStyles(model) {
  const [styles, selected] = await Promise.all([
    model.getStyles(),
    model.getSelectedStyle(),
  ]);

  renderList(
    styleList,
    styles.map(style => ({ id: style.id, label: style.name, style })),
    selected?.style?.id,
    async item => {
      try {
        // Selecting a style *is* a model edit, so it goes in an operation and
        // lands in the undo stack.
        await model.performOperation(operation => {
          operation.setSelectedStyle(item.style);
        }, 'Set style');
        report(`Style set to "${item.label}".`, 'ok');
        await loadStyles(model);
      } catch (error) {
        report(String(error), 'error');
      }
    },
  );
}

async function refresh() {
  refreshButton.disabled = true;
  try {
    const model = await SketchUpApi.getActiveModel();
    await Promise.all([loadScenes(model), loadStyles(model)]);
    report('Ready.', 'ok');
  } catch (error) {
    report(String(error), 'error');
  } finally {
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener('click', refresh);

SketchUpApi.ui.on('open', () => {
  void refresh();
});

(async () => {
  try {
    await SketchUpApi.connect();
    refreshButton.disabled = false;
    await refresh();
  } catch (error) {
    report(String(error), 'error');
  }
})();
