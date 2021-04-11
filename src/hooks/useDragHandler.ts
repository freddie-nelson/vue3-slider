import { Props } from "@/props";
import { Store } from "@/store";
import { SetupContext } from "vue";

export default function(
  store: Store,
  props: Props,
  emit: SetupContext["emit"],
  updateModelValue: (val: number) => void
) {
  let previousSliderValue = store.formattedSliderValue.value;
  const calcSliderValue = (mouseX: number, mouseY: number, dragging: boolean): number => {
    const rect = store.slider.value.getBoundingClientRect();
    let value = 0;

    if (props.orientation === "horizontal") {
      value = (mouseX - rect.x) / store.pixelsPerStep.value;
      if (props.flip) {
        value = store.sliderRange.value - value;
      }
    } else if (props.orientation === "vertical") {
      value = (rect.y + rect.height - mouseY) / store.pixelsPerStep.value;
      if (props.flip) {
        value = store.sliderRange.value - value;
      }
    } else {
      const sliderX = mouseX - rect.x;
      const sliderY = mouseY - rect.y;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const gradient = (sliderY - centerY) / (sliderX - centerX);
      let angle = (Math.atan(gradient) * 180) / Math.PI;

      // correct angle in circle quadrants
      // right
      if (sliderX >= centerX) {
        // top
        if (sliderY < centerY) {
          if (Math.ceil(angle) === 180) {
            angle = 0;
          } else {
            angle = 90 - Math.abs(angle);
          }
        } else {
          // bottom
          angle += 90;
        }

        // left
      } else {
        // top
        if (sliderY < centerY) {
          angle = 270 + angle;
        } else {
          // bottom
          angle = 270 + angle;
        }
      }

      const valPerDeg = store.sliderRange.value / 360;
      value = angle * valPerDeg - props.circleOffset * valPerDeg;
      if (value < 0) {
        value += store.sliderRange.value;
      }

      // stop value from going to 0 when at max
      if (!props.repeat && dragging) {
        const diff = Math.abs(value - previousSliderValue);
        if (diff > store.sliderRange.value / 10) {
          value = previousSliderValue;
        }
      }
    }

    previousSliderValue = value;

    return value;
  };

  // dragging handlers
  // ------------------------------------------------------------------------
  const draggingHandler = (e: MouseEvent | TouchEvent) => {
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
        updateModelValue(calcSliderValue(tap.pageX, tap.pageY, true));
      }

      emit("dragging", store.formattedSliderValue.value, tap);
    }
  };

  const releaseDragHandler = (e: MouseEvent | TouchEvent) => {
    if (store.holding.value) store.holding.value = false;

    if (e.type === "mouseup") {
      window.onmouseup = null;
      window.onmousemove = null;
    } else {
      window.ontouchend = null;
      window.ontouchmove = null;
    }

    emit("drag-end", store.formattedSliderValue.value, e);
  };
  // ------------------------------------------------------------------------

  const clickHandler = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();

    store.holding.value = true;
    emit("drag-start", store.formattedSliderValue.value, e);

    if (e.type === "touchstart") {
      e = <TouchEvent>e;
      if (e.touches.length > 1) return;
      const t = e.touches[0];

      // do initial slider calculation
      updateModelValue(calcSliderValue(t.pageX, t.pageY, false));

      // add event listeners
      window.addEventListener("touchend", releaseDragHandler);

      window.addEventListener("touchmove", draggingHandler);
    } else {
      e = <MouseEvent>e;

      // do initial slider calculation
      updateModelValue(calcSliderValue(e.pageX, e.pageY, false));

      // add event listeners
      window.addEventListener("mouseup", releaseDragHandler);

      window.addEventListener("mousemove", draggingHandler);
    }
  };

  return {
    clickHandler,
  };
}
