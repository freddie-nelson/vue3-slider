const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("events");
const ts = require("typescript");
const { reactive, nextTick } = require("vue");

const root = path.resolve(__dirname, "..");
const cache = path.join(root, "node_modules", ".cache");
fs.mkdirSync(cache, { recursive: true });
const fixture = fs.mkdtempSync(path.join(cache, "slider-bounds-"));
const files = [
  ["store.ts", "store.cjs"],
  ["hooks/useModelValue.ts", "model.cjs"],
  ["hooks/useDragHandler.ts", "drag.cjs"],
  ["hooks/observers.ts", "observers.cjs"],
];
for (const [source, output] of files) {
  const result = ts.transpileModule(fs.readFileSync(path.join(root, "src", source), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2018 },
  });
  fs.writeFileSync(path.join(fixture, output), result.outputText);
}
const { useStore } = require(path.join(fixture, "store.cjs"));
const useModelValue = require(path.join(fixture, "model.cjs")).default;
const useDragHandler = require(path.join(fixture, "drag.cjs")).default;
const { useFilledWidthObserver } = require(path.join(fixture, "observers.cjs"));

async function run() {
  let failures = 0;
  const cases = [
    { name: "maximum", position: 85, raw: 85, bounds: { max: 60 }, expected: 60 },
    { name: "minimum", position: 15, raw: 15, bounds: { min: 40 }, expected: 40 },
    { name: "valid value", position: 85, raw: 85, bounds: { min: 40 }, expected: 85 },
    { name: "coarse step", step: 10, position: 85, raw: 90, bounds: { max: 65 }, expected: 65 },
    { name: "valid custom step", customSliderSteps: [0, 50, 100], position: 50, raw: 50, bounds: { max: 60 }, expected: 50 },
    { name: "custom step maximum", modelValue: 40, customSliderSteps: [0, 40, 80, 100], position: 80, raw: 80, bounds: { max: 60 }, expected: 40 },
    { name: "custom step minimum", modelValue: 60, customSliderSteps: [0, 20, 60, 100], position: 20, raw: 20, bounds: { min: 40 }, expected: 60 },
    { name: "negative domain", min: -100, position: 95, raw: 90, bounds: { max: 60 }, expected: 60 },
  ];
  for (const scenario of cases) {
    const target = new EventEmitter();
    global.window = {
      scrollX: 0, scrollY: 0,
      addEventListener: (name, handler) => target.on(name, handler),
      removeEventListener: (name, handler) => target.removeListener(name, handler),
    };
    global.ResizeObserver = class { observe() {} unobserve() {} };
    global.document = { createElement: () => ({ clientWidth: 100, clientHeight: 10, getBoundingClientRect: () => ({ x: 0, y: 0, width: 100, height: 10 }) }) };
    try {
      const props = reactive({
        modelValue: 50, min: 0, max: 100, step: 1, orientation: "horizontal",
        flip: false, sticky: false, repeat: false, circleOffset: 0, circleGap: 0,
        ...scenario,
      });
      const store = useStore(props);
      store.sliderWidth.value = 100;
      store.pixelsPerStep.value = 100 / (props.max - props.min);
      useFilledWidthObserver(store, props);
      const events = [];
      const emit = (name, ...args) => events.push({ name, args });
      const { updateModelValue } = useModelValue(store, props, emit);
      const { clickHandler } = useDragHandler(store, props, emit, updateModelValue);
      clickHandler({ type: "mousedown", pageX: 50, pageY: 0, preventDefault() {} });
      target.emit("mousemove", { type: "mousemove", pageX: scenario.position, pageY: 0 });
      assert.strictEqual(store.formattedSliderValue.value, scenario.raw, "drag setup");
      Object.assign(props, scenario.bounds);
      await nextTick();
      assert(store.filledWidth.value >= 0 && store.filledWidth.value <= 100, "rendered fill stays on track");
      assert(props.modelValue >= props.min && props.modelValue <= props.max, "controlled prop stays valid");
      target.emit("mouseup", { type: "mouseup" });
      const end = events.filter(event => event.name === "drag-end").pop();
      assert.strictEqual(end.args[0], scenario.expected);
      console.log(`PASS ${scenario.name}`);
    } catch (error) {
      failures++;
      console.error(`FAIL ${scenario.name}: ${error.message}`);
    } finally {
      delete global.window;
      delete global.document;
      delete global.ResizeObserver;
    }
  }
  console.log(`${cases.length - failures} passed, ${failures} failed`);
  if (failures) process.exitCode = 1;
}
run().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => {
  for (const [, output] of files) fs.unlinkSync(path.join(fixture, output));
  fs.rmdirSync(fixture);
});
