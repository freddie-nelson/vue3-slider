import { Store } from "@/store";

export default function(
  store: Store,
  orientation: string,
  repeat: boolean,
  mouseX: number,
  mouseY: number,
  dragging: boolean
): number {
  const rect = store.slider.value.getBoundingClientRect();
  let value = 0;

  if (orientation === "horizontal") {
    value = (mouseX - rect.x) / store.pixelsPerStep.value;
  } else if (orientation === "vertical") {
    value = (rect.y + rect.height - mouseY) / store.pixelsPerStep.value;
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

    value = angle * (store.sliderRange.value / 360);

    // stop value from going to 0 when at max
    if (!repeat && dragging) {
      const diff = Math.abs(angle - store.sliderValueDegrees.value);
      if (diff > 30) {
        return store.modelValueUnrounded.value;
      }
    }
  }

  return value;
}
