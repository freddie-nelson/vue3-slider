import { watchEffect, Ref } from "vue";

import { Props } from "@/props";
import { Store } from "@/store";

// filled width (observers slider element)
export function useFilledWidthObserver(store: Store, props: Props) {
  watchEffect(() => {
    store.filledWidth.value = getNewFilledWidth(store, props);
  });

  const observer = new ResizeObserver((entries: any) => {
    store.filledWidth.value = getNewFilledWidth(store, props);
    store.sliderWidth.value = store.slider.value
      ? props.orientation === "vertical"
        ? store.slider.value.clientHeight
        : store.slider.value.clientWidth
      : 0;

    if (store.slider.value !== entries[0].target && store.slider.value instanceof Element) {
      observer.unobserve(entries[0].target);
      observer.observe(store.slider.value);
    }
  });

  if (store.slider.value) observer.observe(store.slider.value);
}

function getNewFilledWidth(store: Store, props: Props): number {
  const slider = store.slider;
  if (!slider.value) return 0;

  const sliderWidth = props.orientation === "vertical" ? slider.value.clientHeight : slider.value.clientWidth;
  store.pixelsPerStep.value = sliderWidth / store.sliderRange.value;

  // clamp value between 0 and the maximum width of the slider
  const clamped = Math.max(
    Math.min(store.modelValueUnrounded.value * store.pixelsPerStep.value, sliderWidth),
    0
  );

  return clamped;
}

// tooltip
export function useTooltipObserver(tooltip: Ref<HTMLDivElement | undefined>, tooltipWidth: Ref<number>) {
  const observer = new ResizeObserver((entries: any) => {
    if (tooltip.value) {
      tooltipWidth.value = tooltip.value.clientWidth;

      if (tooltip.value !== entries[0].target) {
        observer.unobserve(entries[0].target);
        if (tooltip.value) observer.observe(tooltip.value);
      }
    }
  });

  if (tooltip.value) observer.observe(tooltip.value);
}
