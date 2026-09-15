// Launch Marker — headless, and runs at launch.
//
// "loadAtLaunch": true creates this page when SketchUp starts; the headless
// window type means it never gets a window. So the only proof it ran is what it
// does to the model: a marker cube at the origin.

// SketchUp works in inches.
const SIZE = 12;

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

// Both paths do the same thing, so neither depends on the other having run.
SketchUpApi.ui.on('stamp', () => {
  drawMarker().catch(error => console.log(`[Launch Marker] ${error}`));
});

(async () => {
  try {
    await SketchUpApi.connect();
    await drawMarker();
  } catch (error) {
    console.log(`[Launch Marker] failed at launch: ${error}`);
  }
})();
