<script lang="ts">
import {
  defineComponent,
  ref,
  watchEffect,
  computed,
  onMounted,
  watch,
} from "vue";

import props from "./props";

import { useStore } from "@/store";

import useDragEnd from "./listeners/useDragEnd";
import useDragging from "./listeners/useDragging";

import calcSliderValue from "@/utils/calcSliderValue";

export default defineComponent({
  name: "vue3-slider",
  props,
  setup(props, { emit }) {
    // setup store values
    const store = useStore(props);

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
        if (newValue > store.sliderRange.value)
          newValue = store.sliderRange.value;

        updateModelValue(newValue);
      }
    });

    if (props.modelValue < props.min || props.modelValue > props.max) {
      console.error("[Vue3Slider] Error: value exceeds limits of slider");
    }

    // validate min and max
    if (props.max <= props.min) {
      console.error(
        "[Vue3Slider] Error: Max value cannot be less than or equal to the min value. This will cause unexpected errors to occur, please fix."
      );
    }

    // Update model value functions
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

    const updateModelValue = (val: number): void => {
      store.modelValueUnrounded.value = val;
      store.formattedSliderValue.value = formatModelValue(val);

      emit("update:modelValue", store.formattedSliderValue.value);
      emit("change", store.formattedSliderValue.value);
    };

    const getNewFilledWidth = (): number => {
      const slider = store.slider;
      if (!slider.value) return 0;

      const sliderWidth =
        props.orientation === "vertical"
          ? slider.value.clientHeight
          : slider.value.clientWidth;
      store.pixelsPerStep.value = sliderWidth / store.sliderRange.value;

      // clamp value between 0 and the maximum width of the slider
      const clamped = Math.max(
        Math.min(
          store.modelValueUnrounded.value * store.pixelsPerStep.value,
          sliderWidth
        ),
        0
      );

      return clamped;
    };

    // start resize observer so that filled width is responsive
    const initObserver = () => {
      const observer = new ResizeObserver((entries: any) => {
        store.filledWidth.value = getNewFilledWidth();
        store.sliderWidth.value = store.slider.value
          ? props.orientation === "vertical"
            ? store.slider.value.clientHeight
            : store.slider.value.clientWidth
          : 0;

        if (store.slider?.value !== entries[0].target) {
          observer.unobserve(entries[0].target);
          observer.observe(store.slider.value);
        }
      });

      observer.observe(store.slider.value);
    };

    watchEffect(() => {
      store.filledWidth.value = getNewFilledWidth();
    });

    // Handle dragging slider
    const startSlide = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      store.holding.value = true;
      emit("drag-start", store.formattedSliderValue.value, e);

      if (e.type === "touchstart") {
        // do initial slider calculation
        if ((e as TouchEvent).touches.length > 1) return;
        const touch = (e as TouchEvent).touches[0];

        const value = calcSliderValue(
          store,
          props.orientation,
          props.repeat,
          touch.pageX,
          touch.pageY,
          false
        );
        updateModelValue(value);

        // add event listeners
        window.addEventListener("touchend", (e: TouchEvent) =>
          useDragEnd(store, e, emit)
        );

        window.addEventListener("touchmove", (e: TouchEvent) =>
          useDragging(
            store,
            e,
            emit,
            props.orientation,
            props.repeat,
            updateModelValue
          )
        );
      } else {
        // do initial slider calculation
        const value = calcSliderValue(
          store,
          props.orientation,
          props.repeat,
          (e as MouseEvent).pageX,
          (e as MouseEvent).pageY,
          false
        );
        updateModelValue(value);

        // add event listeners
        window.addEventListener("mouseup", (e: MouseEvent) =>
          useDragEnd(store, e, emit)
        );

        window.addEventListener("mousemove", (e: MouseEvent) =>
          useDragging(
            store,
            e,
            emit,
            props.orientation,
            props.repeat,
            updateModelValue
          )
        );
      }
    };

    // handle keyboard controls
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

    const handleFocus = () => {
      const slider = store.slider;
      if (slider.value.onkeydown) {
        return;
      }

      slider.value.onkeydown = null;

      slider.value.addEventListener("keydown", (e: KeyboardEvent) => {
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

    // Apply hover styles to handle
    const hovering = ref(false);

    const applyHandleHoverClass = computed((): boolean => {
      if (store.holding.value) {
        return true;
      } else {
        return hovering.value;
      }
    });

    // tooltip setup
    const tooltip = ref<HTMLDivElement>();

    // replace %v with sliders value in tooltip text
    const tooltipText = computed(() => {
      let stringValue = "";

      // if format function is provided then use that
      // else just convert raw value to string
      if (
        props.formatTooltip !== null &&
        typeof props.formatTooltip === "function"
      ) {
        stringValue = props.formatTooltip(
          store.formattedSliderValue.value ||
            formatModelValue(store.modelValueUnrounded.value)
        );
      } else {
        stringValue = (
          store.formattedSliderValue.value ||
          formatModelValue(store.modelValueUnrounded.value)
        ).toString();
      }

      return props.tooltipText.replace("%v", stringValue);
    });

    // watch tooltip width
    const tooltipWidth = ref(0);

    const initTooltipObserver = () => {
      const observer = new ResizeObserver((entries: any) => {
        if (tooltip.value) {
          tooltipWidth.value = tooltip.value.clientWidth;

          if (tooltip.value !== entries[0].target) {
            observer.unobserve(entries[0].target);
            observer.observe(tooltip.value);
          }
        }
      });

      if (tooltip.value) observer.observe(tooltip.value);
    };

    // calculate tooltip offset
    const tooltipOffset = computed(() => {
      let width: number | undefined = tooltipWidth.value;

      // estimate width if it cant be found
      if (props.orientation !== "horizontal") {
        width = tooltip.value?.clientHeight;

        if (!width) {
          width = 20;
        }

        if (props.orientation !== "vertical") {
          return width;
        }
      } else {
        if (!width) {
          width = 14 + store.formattedSliderValue.value.toString().length * 9;
        } else {
          width += props.height / 3;
        }
      }

      return store.filledWidth.value - width / 2;
    });

    // calculate stroke offset for circular slider
    const circumference = computed(() => {
      if (!store.slider.value) return 1;

      return 2 * Math.PI * (store.sliderWidth.value / 2);
    });

    const strokeOffset = computed(() => {
      return (
        ((store.sliderRange.value - store.modelValueUnrounded.value) /
          store.sliderRange.value) *
        circumference.value
      );
    });

    onMounted(() => {
      // start resize observer when component loads
      initObserver();
      initTooltipObserver();
    });

    const vars = computed(() => {
      return {
        "--width": props.width,
        "--height": props.height + "px",
        "--color": props.color,
        "--track-color": props.trackColor,
        "--tooltip-color": props.tooltipColor,
        "--tooltip-text-color": props.tooltipTextColor,
      };
    });

    return {
      updateModelValue,
      filledWidth: store.filledWidth,
      slider: store.slider,
      holding: store.holding,
      startSlide,
      handleFocus,
      applyHandleHoverClass,
      hovering,
      showTooltip: computed(() => props.tooltip),
      tooltip,
      tooltipText,
      tooltipOffset,
      vars,
      circumference,
      strokeOffset,
      sliderValueDegrees: store.sliderValueDegrees,
    };
  },
});
</script>

<template>
  <div
    v-if="orientation == 'horizontal'"
    key="horizontal"
    :style="{ ...vars }"
    class="vue3-slider"
    tabindex="0"
    ref="slider"
    @touchstart="startSlide"
    @mousedown="startSlide"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
    @focus="handleFocus"
  >
    <transition name="fade">
      <div
        class="tooltip"
        ref="tooltip"
        v-show="showTooltip && (hovering || holding)"
        :style="{
          transform: `translate(${tooltipOffset}px)`,
          bottom: `max(calc(var(--height, 6px) + 12px), calc(var(--height, 6px) * 1.35))`,
        }"
      >
        {{ tooltipText }}
      </div>
    </transition>

    <div class="track" />
    <div class="track-filled" :style="{ width: filledWidth + 'px' }" />
    <div
      class="handle"
      :style="{ left: filledWidth - (height * 1.35) / 2 + 'px' }"
      :class="{ hover: applyHandleHoverClass }"
    />
  </div>

  <div
    v-else-if="orientation == 'vertical'"
    key="vertical"
    :style="{ ...vars }"
    class="vue3-slider vertical"
    tabindex="0"
    ref="slider"
    @touchstart="startSlide"
    @mousedown="startSlide"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
    @focus="handleFocus"
  >
    <transition name="fade">
      <div
        class="tooltip"
        ref="tooltip"
        v-show="showTooltip && (hovering || holding)"
        :style="{
          transform: `translateY(${-tooltipOffset}px)`,
          left: `max(calc(var(--height, 6px) + 14px), calc(var(--height, 6px) * 1.35))`,
        }"
      >
        {{ tooltipText }}
      </div>
    </transition>

    <div class="track" />
    <div class="track-filled" :style="{ height: filledWidth + 'px' }" />
    <div
      class="handle"
      :style="{ bottom: filledWidth - (height * 1.35) / 2 + 'px' }"
      :class="{ hover: applyHandleHoverClass }"
    />
  </div>

  <div
    v-else
    key="circular"
    class="vue3-slider circular"
    tabindex="0"
    ref="slider"
    :style="{ ...vars }"
    @touchstart="startSlide"
    @mousedown="startSlide"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
    @focus="handleFocus"
  >
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      style="overflow: visible"
    >
      <circle
        stroke="var(--track-color)"
        vector-effect="non-scaling-stroke"
        fill="none"
        stroke-width="var(--height)"
        r="50%"
        cx="50"
        cy="50"
      ></circle>

      <circle
        style="transform: rotate(-90deg); transform-origin: center"
        stroke="var(--color)"
        vector-effect="non-scaling-stroke"
        fill="none"
        stroke-width="var(--height)"
        r="50%"
        cx="50"
        cy="50"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeOffset"
      ></circle>
    </svg>

    <div class="handle round-end" />

    <div
      class="handle-container"
      :style="{ transform: `rotate(${sliderValueDegrees}deg)` }"
    >
      <div class="handle" :class="{ hover: applyHandleHoverClass }" />

      <transition name="fade">
        <div
          class="tooltip"
          ref="tooltip"
          v-show="showTooltip && (hovering || holding)"
          :style="{
            transform: `rotate(${-sliderValueDegrees}deg)`,
            top: `calc(max(calc(${tooltipOffset}px + 34px), calc(${tooltipOffset}px + var(--height) * 1.3)) * -1)`,
          }"
        >
          {{ tooltipText }}
        </div>
      </transition>
    </div>
  </div>
</template>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.vue3-slider {
  box-sizing: border-box;
  width: var(--width, 100%);
  height: var(--height, 6px);
  position: relative;
  margin: 3px 0;
  cursor: pointer;
  font-family: inherit;

  &.vertical {
    width: var(--height, 6px);
    height: var(--width, 100%);

    .track-filled {
      width: 100%;
      bottom: 0;
      top: auto;
    }

    .handle {
      top: unset;
      bottom: 0;
      left: 0;
    }

    .tooltip {
      bottom: 0;
      top: auto;
    }
  }

  &.circular {
    height: var(--width, 100%);
    margin: 0;

    .round-end {
      position: absolute;
      margin: 0 auto;
      width: var(--height, 6px);
      height: var(--height, 6px);
      transform: scale(1);
      left: 0;
      right: 0;
      top: calc(var(--height, 6px) * -0.5);
    }

    .handle-container {
      user-select: none;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      transform-origin: center;
      display: flex;
      justify-content: center;
      align-items: center;

      .handle {
        top: calc(var(--height, 6px) * -0.5);
        width: var(--height, 6px);
        height: var(--height, 6px);
        transform: scale(1);

        &.hover {
          transform: scale(1.5);
        }
      }

      .tooltip {
        position: absolute;
        bottom: auto;
        left: unset;
      }
    }
  }

  & * {
    -webkit-user-drag: none;
    -webkit-app-region: no-drag;
  }

  .tooltip {
    position: absolute;
    left: 0;
    height: 25px;
    background-color: var(--tooltip-color);
    color: var(--tooltip-text-color);
    font-family: inherit;
    padding: 3px 7px;
    border-radius: 4px;
    font-weight: bold;
  }

  .track {
    background-color: var(--track-color, #f1f6f828);
    width: 100%;
    height: 100%;
    border-radius: calc(var(--height, 6px) / 2);
  }

  .track-filled {
    @extend .track;

    position: absolute;
    left: 0;
    top: 0;
    width: auto;
    background-color: var(--color, #fb2727);
    opacity: 1;
  }

  .handle {
    position: absolute;
    top: 0;
    width: var(--height, 6px);
    height: var(--height, 6px);
    border-radius: calc(var(--height, 6px) / 2);
    background-color: var(--color, #fb2727);
    transform: scale(0);
    transition: transform 0.2s ease;
    user-select: none;

    &.hover {
      transform: scale(1.35);
    }
  }
}
</style>