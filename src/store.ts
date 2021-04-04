import { ref, computed, Ref, ComputedRef } from "vue";

export interface Store {
  slider: Ref<HTMLDivElement>;
  modelValueUnrounded: Ref<number>;
  formattedSliderValue: Ref<number>;
  filledWidth: Ref<number>;
  pixelsPerStep: Ref<number>;
  sliderRange: ComputedRef<number>;
  sliderValueDegrees: ComputedRef<number>;
  sliderWidth: Ref<number>;
  holding: Ref<boolean>;
}

export function useStore(props: any): Store {
  // slider dom ref
  const slider = ref(document.createElement("div"));

  // unrounded raw slider value
  const modelValueUnrounded = ref(props.modelValue as number);
  if (props.min !== 0) modelValueUnrounded.value -= props.min;

  const formattedSliderValue = ref(0);

  const sliderWidth = ref(0);
  const filledWidth = ref(0);
  const pixelsPerStep = ref(1);

  let sliderRange = computed(() => {
    let range = 0;

    if (props.min < 0) {
      range = props.max + Math.abs(props.min);
    } else {
      range = props.max - props.min;
    }

    return range;
  });

  const sliderValueDegrees = computed(() => {
    return modelValueUnrounded.value / (sliderRange.value / 360);
  });

  const holding = ref(false);

  const store: Store = {
    slider,

    modelValueUnrounded,
    formattedSliderValue,

    filledWidth,
    pixelsPerStep,

    sliderRange,

    sliderValueDegrees,

    sliderWidth,

    holding,
  };

  return store;
}
