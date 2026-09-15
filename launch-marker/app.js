// Launch Marker — headless, and runs at launch.
//
// "loadAtLaunch": true creates this page when SketchUp starts; the headless
// window type means it never gets a window. So the only proof it ran is what it
// does to the model: a marker cube at the origin.
//
// A headless extension is NOT reloaded when the user opens a different model —
// it keeps running and the model changes underneath it. Drawing only at startup
// would therefore mark the first model and nothing after it, so the extension
// watches for a new model and marks that too.

// SketchUp works in inches.
const SIZE = 12;

// The most recent model we have seen, to compare the next one against.
let lastSeen;

async function drawMarker() {
  const model = await SketchUpApi.getActiveModel();

  await model.performOperation(operation => {
    const group = operation.createGroup(operation.model);
    const base = operation.createFace(group, [
      [0, 0, 0],
      [SIZE, 0, 0],
      [SIZE, SIZE, 0],
      [0, SIZE, 0],
    ]);
    operation.facePushPull(base, SIZE);
    operation.groupSetName(group, 'Launch Marker');
  }, 'Draw launch marker');

  console.log('[Launch Marker] drew a marker at the origin');
}

function draw() {
  drawMarker().catch(error => console.log(`[Launch Marker] ${error}`));
}

// Both paths do the same thing, so neither depends on the other having run.
SketchUpApi.ui.on('stamp', draw);

(async () => {
  try {
    await SketchUpApi.connect();

    lastSeen = await SketchUpApi.getActiveModel();
    await drawMarker();

    // Fires for every model change, so most callbacks are edits to the model we
    // have already marked. isDifferentModel compares against the PREVIOUS one,
    // which is why the last sighting has to be kept. Our own marker bumps the
    // revision and lands here too, and is correctly ignored as the same model.
    SketchUpApi.observeActiveModel(modelInfo => {
      const isNewModel = modelInfo.isDifferentModel(lastSeen);
      lastSeen = modelInfo;

      if (isNewModel) {
        console.log('[Launch Marker] a different model is active');
        draw();
      }
    });
  } catch (error) {
    console.log(`[Launch Marker] failed at launch: ${error}`);
  }
})();
