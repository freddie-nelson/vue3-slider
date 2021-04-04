import { SetupContext } from "@vue/runtime-core";

import { Store } from "@/store";
import calcSliderValue from "@/utils/calcSliderValue";

export default function(
  store: Store,
  e: MouseEvent | TouchEvent,
  emit: SetupContext["emit"],
  orientation: string,
  repeat: boolean,
  updateModelValue: (val: number) => void
) {
  // check what event has been triggered
  let tap;
  if (e.type === "mousemove") {
    e = <MouseEvent>e;

    tap = e;
  } else {
    e = <TouchEvent>e;
    if (e.touches.length > 1) return;

    tap = e.touches[0];
  }

  if (store.holding.value) {
    const rect = store.slider.value.getBoundingClientRect();
    const tapPosInsideSlider =
      orientation === "vertical" ? rect.y + rect.height - tap.pageY : tap.pageX - rect.x;

    if (
      orientation === "circular" ||
      (tapPosInsideSlider >= 0 && tapPosInsideSlider <= store.sliderWidth.value)
    ) {
      const value = calcSliderValue(store, orientation, repeat, tap.pageX, tap.pageY, true);
      updateModelValue(value);
    }

    emit("dragging", store.formattedSliderValue.value, tap);
  }
}
