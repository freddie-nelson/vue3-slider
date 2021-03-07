<script lang="ts">
import { defineComponent, ref, watchEffect, computed, onMounted } from "vue";
import props from "./props";

export default defineComponent({
  name: "vue3-slider",
  props,
  setup(props, { emit }) {
    const slider = ref();
    const modelValueUnrounded = ref(props.modelValue);
    const formattedSliderValue = ref(0);

    // correct value for ranges with a min that are < 0 or > 0
    if (props.min !== 0) modelValueUnrounded.value -= props.min;

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

      // if negative min return fixed value
      if (props.min < 0) {
        return roundedVal + props.min;
      } else if (props.min > 0) {
        return roundedVal + props.min;
      } else {
        return roundedVal;
      }
    };

    const updateModelValue = (val: number): void => {
      modelValueUnrounded.value = val;
      formattedSliderValue.value = formatModelValue(val);

      emit("update:modelValue", formattedSliderValue.value);
    };

    // Change filled width
    const filledWidth = ref(0);
    const pixelsPerStep = ref(1);

    // calculate slider range
    const sliderRange = computed(() => {
      let range = 0;

      if (props.min < 0) {
        range = props.max + props.min * -1;
      } else {
        range = props.max - props.min;
      }

      return range;
    });

    const getNewFilledWidth = (): number => {
      if (!slider.value) return 0;

      const sliderWidth =
        props.orientation === "vertical"
          ? slider.value.clientHeight
          : slider.value.clientWidth;
      pixelsPerStep.value = sliderWidth / sliderRange.value;

      // clamp value between 0 and the maximum width of the slider
      const clamped = Math.max(
        Math.min(modelValueUnrounded.value * pixelsPerStep.value, sliderWidth),
        0
      );

      // snap to limits
      // if (clamped < pixelsPerStep.value /) {
      //   return 0;
      // } else if (sliderWidth - clamped < pixelsPerStep.value / 2) {
      //   return sliderWidth;
      // } else {
      //   return clamped;
      // }

      return clamped;
    };

    watchEffect(() => {
      filledWidth.value = getNewFilledWidth();
    });

    // start resize observer so that filled width is responsive
    const sliderWidth = ref(0);

    const initObserver = () => {
      const observer = new ResizeObserver((entries: any) => {
        filledWidth.value = getNewFilledWidth();
        sliderWidth.value = slider.value
          ? props.orientation === "vertical"
            ? slider.value.clientHeight
            : slider.value.clientWidth
          : 0;

        if (slider?.value !== entries[0].target) {
          observer.unobserve(entries[0].target);
          observer.observe(slider.value);
        }
      });

      observer.observe(slider.value);
    };

    // Handle dragging slider
    const holding = ref(false);

    // calculate slider value from mouse position
    const calcSliderValue = (
      globalMouseX: number,
      globalMouseY: number,
      dragging: boolean
    ): number => {
      const rect = slider.value.getBoundingClientRect();
      let value = 0;

      if (props.orientation === "horizontal") {
        value = (globalMouseX - rect.x) / pixelsPerStep.value;
      } else if (props.orientation === "vertical") {
        value = (rect.y + rect.height - globalMouseY) / pixelsPerStep.value;
      } else {
        const mouseX = globalMouseX - rect.x;
        const mouseY = globalMouseY - rect.y;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const gradient = (mouseY - centerY) / (mouseX - centerX);
        let angle = (Math.atan(gradient) * 180) / Math.PI;

        // correct angle in circle quadrants
        // right
        if (mouseX >= centerX) {
          // top
          if (mouseY < centerY) {
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
          if (mouseY < centerY) {
            angle = 270 + angle;
          } else {
            // bottom
            angle = 270 + angle;
          }
        }

        value = angle * (sliderRange.value / 360);

        // stop value from going to 0 when at max
        if (!props.repeat && dragging) {
          const diff = Math.abs(angle - sliderValueDegrees.value);
          if (diff > 30) {
            return modelValueUnrounded.value;
          }
        }
      }

      return value;
    };

    const startSlide = (e: MouseEvent | TouchEvent) => {
      holding.value = true;
      e.preventDefault();

      if (e.type === "touchstart") {
        const touchEvent = <TouchEvent>e;

        if (touchEvent.touches.length > 1) return;
        const touch = touchEvent.touches[0];

        const value = calcSliderValue(touch.pageX, touch.pageY, false);
        updateModelValue(value);

        window.addEventListener("touchend", () => {
          if (holding.value) holding.value = false;

          window.ontouchend = null;
          window.ontouchmove = null;
        });

        window.addEventListener("touchmove", (e: TouchEvent) => {
          if (holding.value) {
            if (e.touches.length > 1) return;
            const touch = e.touches[0];

            const rect = slider.value.getBoundingClientRect();
            const touchPosInsideSlider =
              props.orientation === "vertical"
                ? rect.y + rect.height - touch.pageY
                : touch.pageX - rect.x;

            if (
              props.orientation !== "circular" ||
              (touchPosInsideSlider >= 0 &&
                touchPosInsideSlider <= sliderWidth.value)
            ) {
              const value = calcSliderValue(touch.pageX, touch.pageY, true);
              updateModelValue(value);
            }
          }
        });
      } else {
        const mouse = <MouseEvent>e;
        const value = calcSliderValue(mouse.pageX, mouse.pageY, false);
        updateModelValue(value);

        window.addEventListener("mouseup", () => {
          if (holding.value) holding.value = false;

          window.onmouseup = null;
          window.onmousemove = null;
        });

        window.addEventListener("mousemove", (mouse: MouseEvent) => {
          if (holding.value) {
            const rect = slider.value.getBoundingClientRect();
            const mousePosInsideSlider =
              props.orientation === "vertical"
                ? rect.y + rect.height - mouse.pageY
                : mouse.pageX - rect.x;

            if (
              props.orientation === "circular" ||
              (mousePosInsideSlider >= 0 &&
                mousePosInsideSlider <= sliderWidth.value)
            ) {
              const value = calcSliderValue(mouse.pageX, mouse.pageY, true);
              updateModelValue(value);
            }
          }
        });
      }
    };

    // Apply hover styles to handle
    const hovering = ref(false);

    const applyHandleHoverClass = computed((): boolean => {
      if (holding.value) {
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
          formattedSliderValue.value ||
            formatModelValue(modelValueUnrounded.value)
        );
      } else {
        stringValue = (
          formattedSliderValue.value ||
          formatModelValue(modelValueUnrounded.value)
        ).toString();
      }

      return props.tooltipText.replace("%v", stringValue);
    });

    // calculate tooltip offset
    const tooltipOffset = computed(() => {
      let width = tooltip.value?.clientWidth;

      // estimate width if it cant be found
      if (!width) {
        width = 14 + modelValueUnrounded.value.toString().length * 9;
      }

      return filledWidth.value - width / 2;
    });

    // calculate stroke offset for circular slider
    const circumference = computed(() => {
      if (!slider.value) return 1;

      return 2 * Math.PI * (sliderWidth.value / 2);
    });

    const strokeOffset = computed(() => {
      return (
        ((sliderRange.value - modelValueUnrounded.value) / sliderRange.value) *
        circumference.value
      );
    });

    const sliderValueDegrees = computed(() => {
      return modelValueUnrounded.value / (sliderRange.value / 360);
    });

    onMounted(() => {
      // start resize observer on slider when component loads
      initObserver();
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
      filledWidth,
      slider,
      holding,
      startSlide,
      applyHandleHoverClass,
      hovering,
      showTooltip: computed(() => props.tooltip),
      tooltip,
      tooltipText,
      tooltipOffset,
      vars,
      circumference,
      strokeOffset,
      sliderValueDegrees,
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
    ref="slider"
    @touchstart="startSlide"
    @mousedown="startSlide"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <transition name="fade">
      <div
        class="tooltip"
        ref="tooltip"
        v-show="showTooltip && (hovering || holding)"
        :style="{ transform: `translate(${tooltipOffset}px)` }"
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
    ref="slider"
    @touchstart="startSlide"
    @mousedown="startSlide"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <transition name="fade">
      <div
        class="tooltip"
        ref="tooltip"
        v-show="showTooltip && (hovering || holding)"
        :style="{ transform: `translateY(${-tooltipOffset}px)` }"
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
    ref="slider"
    :style="{ ...vars }"
    @touchstart="startSlide"
    @mousedown="startSlide"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
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
          :style="{ transform: `rotate(${-sliderValueDegrees}deg)` }"
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
      left: auto;
      right: -50px;
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
        left: unset;
        margin: calc(var(--height, 6px) * -1);
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
    top: -44px;
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