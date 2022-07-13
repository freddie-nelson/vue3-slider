import { Props } from "@/props";
import { Store } from "@/store";

export default function(store: Store, props: Props, updateModelValue: (val: number) => void) {
  const calculateValueFromDiff = (diff: number) => {
    let newVal = store.modelValueUnrounded.value + diff;

    // clamp between 0 and sliderRange (raw max value)
    newVal = Math.min(store.sliderRange.value, Math.max(0, newVal));

    // apply limit
    if (props.limit !== undefined) newVal = Math.min(newVal, props.limit + Math.abs(props.min));

    updateModelValue(newVal);
  };

  const handleKeydown = (e: KeyboardEvent) => {
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
  };

  return {
    handleKeydown,
  };
}
