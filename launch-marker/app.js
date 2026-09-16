// Launch Marker — headless, and runs at launch.
//
// "loadAtLaunch": true creates this page when SketchUp starts; the headless
// window type means it never gets a window. So the only proof it ran is what it
// does to the model: a marker cube at the origin.
//
// A headless extension has nowhere to draw and its console is not the host's,
// so anything it needs to say has to go through a host dialog.

// SketchUp works in inches.
const SIZE = 12;

async function drawMarker(model) {
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
}

async function say(message) {
  try {
    await SketchUpApi.ui.getModalInput({ title: 'Launch Marker', message });
  } catch (error) {
    console.log(`[Launch Marker] could not report: ${error}`);
  }
}

// Reports which model it wrote to and whether the write actually landed, so a
// draw that succeeds against a model the user never sees is distinguishable
// from one that throws.
async function drawAndReport(occasion) {
  try {
    const model = await SketchUpApi.getActiveModel();
    const before = (await model.entities.get()).length;

    await drawMarker(model);

    const after = await model.refresh();
    const count = (await after.entities.get()).length;

    await say(
      `${occasion}\n` +
        `model ${model.id} "${model.title || 'untitled'}"\n` +
        `revision ${model.revision} -> ${after.revision}\n` +
        `entities ${before} -> ${count}`,
    );
  } catch (error) {
    await say(`${occasion}\nfailed: ${error}`);
  }
}

SketchUpApi.ui.on('stamp', () => {
  void drawAndReport('from the menu');
});

(async () => {
  try {
    await SketchUpApi.connect();
    await drawAndReport('at launch');
  } catch (error) {
    await say(`could not connect: ${error}`);
  }
})();
