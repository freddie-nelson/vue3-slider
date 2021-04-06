<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";

import props from "./props";

import { useStore } from "@/store";

import { useFilledWidthObserver, useTooltipObserver } from "@/hooks/observers";
import useKeyBoardControls from "@/hooks/useKeyboardControls";
import useModelValue from "@/hooks/useModelValue";
import useDragHandler from "@/hooks/useDragHandler";

export default defineComponent({
  name: "vue3-slider",
  props,
  setup(props, { emit }) {
    // error checking
    if (props.modelValue < props.min || props.modelValue > props.max) {
      console.error("[Vue3Slider] Error: value exceeds limits of slider");
    }

    // validate min and max
    if (props.max <= props.min) {
      console.error(
        "[Vue3Slider] Error: Max value cannot be less than or equal to the min value. This will cause unexpected errors to occur, please fix."
      );
    }

    // setup store values
    const store = useStore(props);

    // setup hooks
    const { updateModelValue, formatModelValue } = useModelValue(
      store,
      props,
      emit
    );
    const { handleFocus } = useKeyBoardControls(store, props, updateModelValue);
    const { clickHandler } = useDragHandler(
      store,
      props,
      emit,
      updateModelValue
    );

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

    // start observers when component loads
    onMounted(() => {
      useFilledWidthObserver(store, props);
      useTooltipObserver(tooltip, tooltipWidth);
    });

    return {
      filledWidth: store.filledWidth,
      slider: store.slider,
      holding: store.holding,
      clickHandler,
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
    @touchstart="clickHandler"
    @mousedown="clickHandler"
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
    @touchstart="clickHandler"
    @mousedown="clickHandler"
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
    @touchstart="clickHandler"
    @mousedown="clickHandler"
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