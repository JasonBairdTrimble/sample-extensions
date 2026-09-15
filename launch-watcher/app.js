// Launch Watcher — a headless, load-at-launch sample.
//
// Two manifest settings work together here. "window": { "type": "headless" }
// means the extension never gets a window, and "loadAtLaunch": true means the
// page is created at startup instead of waiting for a menu click. Together they
// give you an extension that is running before the user asks for anything.
//
// The catch is that a headless extension has no window to report through. This
// one talks back two ways: console.log for a live session, and a host dialog
// raised from a menu command, which needs no window of its own.

const startedAt = Date.now();

let changeCount = 0;
let lastRevision;
let watching = false;

function log(message) {
  console.log(`[Launch Watcher] ${message}`);
}

function elapsedDescription() {
  const seconds = Math.round((Date.now() - startedAt) / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

// Registered before connect(), because a headless extension that is already
// running when the user picks the menu item would otherwise miss the command.
SketchUpApi.ui.on('report', async () => {
  const message = watching
    ? `Running for ${elapsedDescription()}.\n` +
      `Model changes seen: ${changeCount}.\n` +
      `Current revision: ${lastRevision ?? 'unknown'}.`
    : 'Started, but not connected to a model yet.';

  log(message.replace(/\n/g, ' '));

  try {
    // No inputs means a plain message box rather than a form.
    await SketchUpApi.ui.getModalInput({
      title: 'Launch Watcher',
      message,
    });
  } catch (error) {
    log(`could not show the report: ${error}`);
  }
});

(async () => {
  try {
    await SketchUpApi.connect();

    const model = await SketchUpApi.getActiveModel();
    lastRevision = model.revision;
    watching = true;
    log(`connected at launch; model revision ${lastRevision}`);

    // Fires on every model change, and on a switch to a different model.
    SketchUpApi.observeActiveModel(async modelMeta => {
      const current = await modelMeta.getModel();

      if (modelMeta.isDifferentModel(current)) {
        changeCount = 0;
        log(`switched to a different model: ${current.title || '(unsaved)'}`);
      } else if (modelMeta.isModelChanged(current)) {
        changeCount += 1;
      }

      lastRevision = current.revision;
    });
  } catch (error) {
    log(`failed to start: ${error}`);
  }
})();
