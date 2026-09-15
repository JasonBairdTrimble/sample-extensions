// Field Notes — field coordination sample.
//
// Pins a leader-line text annotation to whatever the user has selected, and
// files the selected geometry under a coloured "Field Notes" tag. The sample is
// really about two things: reacting to the selection as it changes, and reading
// geometry back out of an operation before the operation closes.

const NOTE_TAG = 'Field Notes';

// How far above the selection the note floats, in inches.
const LEADER_RISE = 24;

const status = document.getElementById('status');
const selectionLine = document.getElementById('selection');
const noteInput = document.getElementById('note');
const pinButton = document.getElementById('pin');

let selectionCount = 0;

function report(message, kind) {
  status.textContent = message;
  status.className = kind ?? '';
}

function describeSelection(count) {
  selectionCount = count;
  pinButton.disabled = count === 0;
  selectionLine.textContent =
    count === 0
      ? 'Select something in the model.'
      : `${count} ${count === 1 ? 'entity' : 'entities'} selected.`;
}

async function pinNote() {
  const text = noteInput.value.trim();
  if (text === '') {
    report('Type a note first.', 'error');
    return;
  }

  pinButton.disabled = true;
  try {
    const model = await SketchUpApi.getActiveModel();
    const selection = await model.getSelection();

    if (selection.drawingElements.length === 0) {
      report('Nothing is selected.', 'error');
      return;
    }

    // Bounds come from outside the operation — reads do not need one. Union the
    // per-entity boxes so the note lands over the middle of the whole selection.
    const boxes = await Promise.all(
      selection.drawingElements.map(element => element.getBounds()),
    );
    const bounds = boxes.reduce((combined, box) => combined.add(box));
    const anchor = bounds.center;

    await model.performOperation(async operation => {
      // createTag is idempotent in the sense that matters here: look the tag up
      // first so repeated runs reuse it instead of piling up duplicates.
      const tagManager = await model.getTagManager();
      const existing = tagManager.getTagByName(NOTE_TAG);
      const tagRef = existing ?? operation.createTag(NOTE_TAG);

      if (existing === undefined) {
        operation.tagSetColor(tagRef, new SketchUpApi.Color(255, 149, 0, 255));
      }

      for (const element of selection.drawingElements) {
        operation.drawingElementSetTag(element, tagRef);
      }

      // A leader vector makes this a 3D text with a leader line. Omit the
      // vector and you get a 2D screen-space label that always faces the camera.
      operation.createText(
        operation.model,
        text,
        { point: [anchor.x, anchor.y, bounds.max.z] },
        [0, 0, LEADER_RISE],
      );
    }, 'Pin field note');

    report(`Pinned "${text}" to ${selectionCount} selected.`, 'ok');
  } catch (error) {
    report(String(error), 'error');
  } finally {
    pinButton.disabled = selectionCount === 0;
  }
}

pinButton.addEventListener('click', pinNote);

(async () => {
  try {
    await SketchUpApi.connect();
    const model = await SketchUpApi.getActiveModel();

    describeSelection((await model.getSelectionMetadata()).totalNumberOfElements);

    // Only metadata is streamed, not the entities themselves — that is what
    // makes it cheap enough to leave running while the panel is open.
    model.observeSelectionMetadata(metadata => {
      describeSelection(metadata.totalNumberOfElements);
    });

    report('Ready.', 'ok');
  } catch (error) {
    report(String(error), 'error');
  }
})();
