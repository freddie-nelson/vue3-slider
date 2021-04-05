import { SetupContext } from "@vue/runtime-core";

import { Store } from "@/store";
import calcSliderValue from "@/utils/calcSliderValue";
import { Props } from "@/props";

export default function(
  store: Store,
  props: Props,
  e: MouseEvent | TouchEvent,
  emit: SetupContext["emit"],
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
      props.orientation === "vertical" ? rect.y + rect.height - tap.pageY : tap.pageX - rect.x;

    if (
      props.orientation === "circular" ||
      (tapPosInsideSlider >= 0 && tapPosInsideSlider <= store.sliderWidth.value)
    ) {
      updateModelValue(calcSliderValue(store, props, tap.pageX, tap.pageY, true));
    }

    emit("dragging", store.formattedSliderValue.value, tap);
  }
}
