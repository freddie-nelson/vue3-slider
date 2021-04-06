import { Props } from "@/props";
import { Store } from "@/store";

export default function(store: Store, props: Props, updateModelValue: (val: number) => void) {
  const calculateValueFromDiff = (diff: number) => {
    const newVal = store.modelValueUnrounded.value + diff;

    if (newVal <= 0) {
      updateModelValue(0);
    } else if (newVal >= store.sliderRange.value) {
      updateModelValue(store.sliderRange.value);
    } else {
      updateModelValue(newVal);
    }
  };

  let isFocusHandlerAdded = false;
  const handleFocus = () => {
    if (isFocusHandlerAdded) {
      return;
    }

    isFocusHandlerAdded = true;

    store.slider.value.addEventListener("keydown", (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          calculateValueFromDiff(props.step);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          calculateValueFromDiff(-props.step);
          break;
        default:
          break;
      }
    });
  };

  return {
    handleFocus,
  };
}
