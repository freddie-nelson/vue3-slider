import { Props } from "@/props";
import { Store } from "@/store";
import { ref, SetupContext, watch, watchEffect } from "vue";

export default function(store: Store, props: Props, emit: SetupContext["emit"]) {
  // watchers to update slider value if modelValue is changed from outside component
  const modelValueRef = ref(props.modelValue);
  watchEffect(() => (modelValueRef.value = props.modelValue));

  watch(modelValueRef, (val) => {
    if (store.formattedSliderValue.value !== val) {
      let newValue = 0;
      if (props.min < 0) {
        newValue = val + Math.abs(props.min);
      } else {
        newValue = val - props.min;
      }
      if (newValue > store.sliderRange.value) newValue = store.sliderRange.value;

      updateModelValue(newValue);
    }
  });

  // format model value to fit within min and max defined in props
  const formatModelValue = (val: number): number => {
    const step = props.step;

    let roundedVal = 0;

    // round number to the nearest multiple of step (round up or down)
    if (val > 0) {
      roundedVal = Math.round(val / step) * step;
    } else {
      roundedVal = 0;
    }

    return roundedVal + props.min;
  };

  // update model value and related refs
  const updateModelValue = (val: number): void => {
    store.formattedSliderValue.value = formatModelValue(val);

    // make slider stick to nearest multiple of step
    if (props.sticky) {
      store.modelValueUnrounded.value = store.formattedSliderValue.value - props.min;
    } else {
      store.modelValueUnrounded.value = val;
    }

    emit("update:modelValue", store.formattedSliderValue.value);
    emit("change", store.formattedSliderValue.value);
  };

  return {
    formatModelValue,
    updateModelValue,
    modelValueRef,
  };
}
