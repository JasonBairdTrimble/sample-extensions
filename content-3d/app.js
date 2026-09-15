// Bollard Stamper — content and 3D support sample.
//
// Builds one component definition and places many instances of it. That is the
// distinction worth internalising: the geometry is authored once inside the
// definition, and each instance is just a transformation pointing at it. Edit
// the definition later and every instance follows.

const INCHES_PER_FOOT = 12;

const DEFINITION_NAME = 'Sample Bollard';
const BOLLARD_RADIUS = 4;
const BOLLARD_HEIGHT = 36;
const BOLLARD_SEGMENTS = 16;

const status = document.getElementById('status');
const stampButton = document.getElementById('stamp');

function report(message, kind) {
  status.textContent = message;
  status.className = kind ?? '';
}

// Authors the bollard geometry inside a fresh definition and returns its ref.
function buildDefinition(operation) {
  const definition = operation.createDefinition(DEFINITION_NAME);

  // createCircle hands back both the curve and the edges that make it up; the
  // edges are what you need to close a face across.
  const { edges } = operation.createCircle(
    definition,
    [0, 0, 0],
    [0, 0, 1],
    BOLLARD_RADIUS,
    BOLLARD_SEGMENTS,
  );

  const cap = operation.createFaceFromEdges(definition, edges);
  operation.facePushPull(cap, BOLLARD_HEIGHT);

  return definition;
}

async function stampRow() {
  const count = Math.trunc(Number(document.getElementById('count').value));
  const spacing = Number(document.getElementById('spacing').value) * INCHES_PER_FOOT;

  if (!(count >= 1 && spacing > 0)) {
    report('Count and spacing both have to be positive.', 'error');
    return;
  }

  stampButton.disabled = true;
  try {
    const model = await SketchUpApi.getActiveModel();

    // Reuse the definition if a previous run already made it, so stamping twice
    // adds instances rather than a second identical component.
    const definitions = await model.getDefinitions();
    const existing = definitions.find(definition => definition.name === DEFINITION_NAME);

    await model.performOperation(operation => {
      const definition = existing ?? buildDefinition(operation);

      for (let index = 0; index < count; index += 1) {
        // A plain [x, y, z] array is the translation shorthand for a
        // transformation — no need to build a full 4x4 matrix to place something.
        operation.createInstance(operation.model, definition, [index * spacing, 0, 0]);
      }
    }, 'Stamp bollards');

    report(
      `Stamped ${count} ${count === 1 ? 'instance' : 'instances'}` +
        `${existing ? ' of the existing component' : ' of a new component'}.`,
      'ok',
    );
  } catch (error) {
    report(String(error), 'error');
  } finally {
    stampButton.disabled = false;
  }
}

stampButton.addEventListener('click', stampRow);

(async () => {
  try {
    await SketchUpApi.connect();
    stampButton.disabled = false;
    report('Ready.', 'ok');
  } catch (error) {
    report(String(error), 'error');
  }
})();
