<template>
  <div 
    id="slider" 
    @resize="filledWidth" 
    ref="slider"
  >
    <div class="track" />
    <div 
      class="track-filled" 
      :style="{ width: filledWidth + 'px' }"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import props from "./props";

export default defineComponent({
  name: "Slider",
  props,
  setup(props, { emit }) {
    const slider = ref();

    // CHANGING FILLED WIDTH -----
    const filledWidth = ref(0);

    const getNewFilledWidth = (): number => {
        if (!slider.value) return 0;

        const pixelsPerStep = slider.value.clientWidth / props.max;
        return props.modelValue * pixelsPerStep;
    }

    const initObserver = () => {
      const observer = new ResizeObserver(() => {
        filledWidth.value = getNewFilledWidth();
      });

      observer.observe(slider.value)
    }

    const updateModelValue = (val: number): void => {
      emit("update:modelValue", val);
    }

    onMounted(() => {
      console.log("< Slider Mounted >")
      initObserver()
    })

    return {
      updateModelValue,
      filledWidth,
      slider
    }
  }
});
</script>

<style lang="scss" scoped vars="{ width, height, color, 'track-color': trackColor }">
#slider {
  box-sizing: border-box;
  width: var(--width);
  height: var(--height);
  position: relative;

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
}
</style>