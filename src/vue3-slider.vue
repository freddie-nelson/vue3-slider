<script lang="ts">
import { defineComponent, ref, watchEffect, computed, onMounted } from "vue";
import props from "./props";

export default defineComponent({
  name: "vue3-slider",
  props,
  setup(props, { emit }) {
    const slider = ref();
    const modelValueUnrounded = ref(props.modelValue);

    if (
      modelValueUnrounded.value < props.min ||
      modelValueUnrounded.value > props.max
    ) {
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
      } else if (val < 0) {
        roundedVal = Math.round(val / step) * step;
      } else {
        roundedVal = 0;
      }

      // if negative min return fixed value
      if (props.min < 0) {
        return roundedVal + props.min;
      } else {
        return roundedVal;
      }
    };

    const updateModelValue = (val: number): void => {
      modelValueUnrounded.value = val;
      const formattedVal = formatModelValue(val);

      emit("update:modelValue", formattedVal);
    };

    // Change filled width
    const filledWidth = ref(0);
    const pixelsPerStep = ref(1);

    // fix max incase negative range
    const maxFixed = computed(() => {
      let newMax = props.max;

      if (props.min < 0) {
        newMax = props.max + props.min * -1;
      }

      if (props.modelValue > newMax) {
        updateModelValue(newMax);
      }

      return newMax;
    });

    const getNewFilledWidth = (): number => {
      if (!slider.value) return 0;

      pixelsPerStep.value = slider.value.clientWidth / maxFixed.value;
      return modelValueUnrounded.value * pixelsPerStep.value;
    };

    watchEffect(() => {
      filledWidth.value = getNewFilledWidth();
    });

    // start resize observer so that filled width is responsive
    const initObserver = () => {
      const observer = new ResizeObserver(() => {
        filledWidth.value = getNewFilledWidth();
      });

      observer.observe(slider.value);
    };

    // Handle dragging slider
    const holding = ref(false);

    const startSlide = (e: MouseEvent | TouchEvent) => {
      holding.value = true;
      e.preventDefault();

      const rect = slider.value.getBoundingClientRect();

      if (e.type === "touchstart") {
        const touchEvent = <TouchEvent>e;

        if (touchEvent.touches.length > 1) return;
        const touch = touchEvent.touches[0];

        updateModelValue((touch.pageX - rect.x) / pixelsPerStep.value);

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
            const touchPosInsideSlider = touch.pageX - rect.x;

            if (
              touchPosInsideSlider > 0 &&
              touchPosInsideSlider <= slider.value.clientWidth
            ) {
              updateModelValue(touchPosInsideSlider / pixelsPerStep.value);
            }
          }
        });
      } else {
        const mouseEvent = <MouseEvent>e;

        updateModelValue((mouseEvent.pageX - rect.x) / pixelsPerStep.value);

        window.addEventListener("mouseup", () => {
          if (holding.value) holding.value = false;

          window.onmouseup = null;
          window.onmousemove = null;
        });

        window.addEventListener("mousemove", (e: MouseEvent) => {
          if (holding.value) {
            const rect = slider.value.getBoundingClientRect();
            const mousePosInsideSlider = e.pageX - rect.x;

            if (
              mousePosInsideSlider > 0 &&
              mousePosInsideSlider <= slider.value.clientWidth
            ) {
              updateModelValue(mousePosInsideSlider / pixelsPerStep.value);
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

    onMounted(() => {
      initObserver();
    });

    const vars = {
      "--width": props.width,
      "--height": props.height + "px",
      "--color": props.color,
      "--track-color": props.trackColor,
      "--handle-size": props.height + 6 + "px",
    };

    return {
      updateModelValue,
      filledWidth,
      slider,
      holding,
      startSlide,
      applyHandleHoverClass,
      hovering,
      vars,
    };
  },
});
</script>

<template>
  <div
    :style="{ ...vars }"
    class="vue3-slider"
    @resize="filledWidth"
    ref="slider"
    @touchstart="startSlide"
    @mousedown="startSlide"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <div class="track" />
    <div class="track-filled" :style="{ width: filledWidth + 'px' }" />
    <div
      class="handle"
      :style="{ left: filledWidth - (height + 6) / 2 + 'px' }"
      :class="{ hover: applyHandleHoverClass }"
    />
  </div>
</template>

<style lang="scss">
.vue3-slider {
  box-sizing: border-box;
  width: var(--width, 100%);
  height: var(--height, 6px);
  position: relative;
  margin: 3px 0;
  cursor: pointer;

  & * {
    -webkit-user-drag: none;
    -webkit-app-region: no-drag;
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
    top: -3px;
    width: var(--handle-size, 12px);
    height: var(--handle-size, 12px);
    border-radius: calc(var(--handle-size, 12px) / 2);
    background-color: var(--color, #fb2727);
    transform: scale(0);
    transition: transform 0.2s ease;
    user-select: none;

    &.hover {
      transform: scale(1);
    }
  }
}
</style>