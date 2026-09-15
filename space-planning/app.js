// Room Blocker — space planning sample.
//
// Draws a rectangular room volume from width, depth and height. The point of
// the sample is the shape of a write: gather your numbers first, then do every
// model change inside a single performOperation() so the user gets one undo
// step named "Create room".

// SketchUp stores all geometry in inches, whatever the model's display units
// are set to. Anything you hand the API has to be converted first.
const INCHES_PER_FOOT = 12;

const status = document.getElementById('status');
const createButton = document.getElementById('create');
const askButton = document.getElementById('ask');

function report(message, kind) {
  status.textContent = message;
  status.className = kind ?? '';
}

// Builds the room and returns the group so the caller can name it. Splitting
// this out keeps the two entry points — the panel and the dialog — honest about
// sharing one implementation.
async function blockOutRoom({ width, depth, height, name }) {
  const model = await SketchUpApi.getActiveModel();

  await model.performOperation(async operation => {
    const group = operation.createGroup(operation.model);

    // Wound counter-clockwise on the ground plane, so the face's front points
    // up and a positive push-pull raises the walls rather than sinking them.
    const floor = operation.createFace(group, [
      [0, 0, 0],
      [width, 0, 0],
      [width, depth, 0],
      [0, depth, 0],
    ]);

    operation.facePushPull(floor, height);
    operation.groupSetName(group, name);
  }, 'Create room');
}

async function createFromPanel() {
  const width = Number(document.getElementById('width').value) * INCHES_PER_FOOT;
  const depth = Number(document.getElementById('depth').value) * INCHES_PER_FOOT;
  const height = Number(document.getElementById('height').value) * INCHES_PER_FOOT;
  const name = document.getElementById('name').value.trim() || 'Room';

  if (!(width > 0 && depth > 0 && height > 0)) {
    report('Every dimension has to be greater than zero.', 'error');
    return;
  }

  createButton.disabled = true;
  try {
    await blockOutRoom({ width, depth, height, name });
    report(`Created "${name}".`, 'ok');
  } catch (error) {
    report(String(error), 'error');
  } finally {
    createButton.disabled = false;
  }
}

// getModalInput() presents a host dialog and waits for an answer. Every widget is a
// text field — there are no numeric or checkbox widgets — so the values come
// back as strings and you validate them yourself.
async function createFromDialog() {
  askButton.disabled = true;
  try {
    const answer = await SketchUpApi.ui.getModalInput({
      title: 'Room dimensions',
      message: 'Sizes in feet.',
      actions: 'okcancel',
      inputs: {
        width: { widgetType: 'text', valueType: 'string', label: 'Width', default: '12' },
        depth: { widgetType: 'text', valueType: 'string', label: 'Depth', default: '10' },
        height: { widgetType: 'text', valueType: 'string', label: 'Height', default: '9' },
        name: { widgetType: 'text', valueType: 'string', label: 'Name', default: 'Room' },
      },
    });

    // 'cancel' is possible whichever action set you ask for, because the user
    // can always dismiss the dialog.
    if (answer.action !== 'ok') {
      report('Cancelled.');
      return;
    }

    const width = Number(answer.inputStates.width) * INCHES_PER_FOOT;
    const depth = Number(answer.inputStates.depth) * INCHES_PER_FOOT;
    const height = Number(answer.inputStates.height) * INCHES_PER_FOOT;
    const name = answer.inputStates.name.trim() || 'Room';

    if (!(width > 0 && depth > 0 && height > 0)) {
      report('Those dimensions did not read as positive numbers.', 'error');
      return;
    }

    await blockOutRoom({ width, depth, height, name });
    report(`Created "${name}".`, 'ok');
  } catch (error) {
    report(String(error), 'error');
  } finally {
    askButton.disabled = false;
  }
}

createButton.addEventListener('click', createFromPanel);
askButton.addEventListener('click', createFromDialog);

(async () => {
  try {
    await SketchUpApi.connect();
    createButton.disabled = false;
    report('Ready.', 'ok');
  } catch (error) {
    report(String(error), 'error');
  }
})();
