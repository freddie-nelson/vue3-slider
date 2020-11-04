<template>
  <div 
    id="slider" 
    @resize="filledWidth" 
    ref="slider"
    @mousedown="startSlide"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <div class="track" />
    <div 
      class="track-filled" 
      :style="{ width: filledWidth + 'px' }"
    />
    <div 
      class="handle"
      :style="{ left: filledWidth - (height + 7) / 2 + 'px' }"
      :class="{ hover: applyHandleHoverClass }"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect, computed, onMounted } from "vue";
import props from "./props";

export default defineComponent({
  name: "Slider",
  props,
  setup(props, { emit }) {
    const slider = ref();
    const modelValueUnrounded = ref(props.modelValue);
    
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
    }

    const updateModelValue = (val: number): void => {
      modelValueUnrounded.value = val;
      const formattedVal = formatModelValue(val);

      emit("update:modelValue", formattedVal);
    }

    // Change filled width
    const filledWidth = ref(0);
    const pixelsPerStep = ref(1);

    // fix max incase negative range
    const maxFixed = computed(() => {
      let newMax = props.max;

      if (props.min < 0) {
        newMax = props.max + props.min * - 1;
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
    }

    watchEffect(() => {
      filledWidth.value = getNewFilledWidth();
    })

    // start resize observer so that filled width is responsive
    const initObserver = () => {
      const observer = new ResizeObserver(() => {
        filledWidth.value = getNewFilledWidth();
      });

      observer.observe(slider.value)
    }

    // Handle dragging slider
    const holding = ref(false);

    const startSlide = (e: MouseEvent) => {
      holding.value = true;
      const rect = slider.value.getBoundingClientRect();
      updateModelValue((e.pageX - rect.x) / pixelsPerStep.value);

      window.addEventListener("mouseup", () => {
        if (holding.value) holding.value = false;

        window.onmouseup = null;
        window.onmousemove = null;
      })

      window.addEventListener("mousemove", (e: MouseEvent) => {
        if (holding.value) {
          const rect = slider.value.getBoundingClientRect();
          const mousePosInsideSlider = e.pageX - rect.x;

          if (mousePosInsideSlider > 0 && mousePosInsideSlider <= slider.value.clientWidth) {
            updateModelValue(mousePosInsideSlider / pixelsPerStep.value);
          }
        }
      })
    }

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
      initObserver()
    })

    return {
      updateModelValue,
      filledWidth,
      slider,
      holding,
      startSlide,
      applyHandleHoverClass,
      hovering
    }
  }
});
</script>

<style lang="scss" scoped vars="{ width, height: height + 'px', color, 'track-color': trackColor, 'handle-size': (height + 6) + 'px' }">
#slider {
  box-sizing: border-box;
  width: var(--width);
  height: var(--height);
  position: relative;
  margin: 3px 0;
  cursor: pointer;

  & * {
    -webkit-user-drag: none;
    -webkit-app-region: no-drag;
  }

  .track {
    background-color: var(--track-color);
    opacity: 0.1;
    width: 100%;
    height: 100%;
    border-radius: calc(var(--height) / 2);
  }

  .track-filled {
    @extend .track;

    position: absolute;
    left: 0;
    top: 0;
    width: auto;
    background-color: var(--color);
    opacity: 1;
  }

  .handle {
    position: absolute;
    top: -3px;
    width: var(--handle-size);
    height: var(--handle-size);
    border-radius: calc(var(--handle-size) / 2);
    background-color: var(--color);
    transform: scale(0);
    transition: transform .2s ease;
    user-select: none;

    &.hover {
      transform: scale(1);
    }
  }
}
</style>