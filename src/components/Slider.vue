<template>
  <div id="slider" ref="slider">
    <div class="track"></div>
    <div class="track-filled"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import props from "./props";

export default defineComponent({
  name: "Slider",
  props,
  setup(props, { emit }) {
    const slider = ref<HTMLDivElement>();

    const filledWidth = computed(() => {
      if (!slider.value) return;

      const pixelsPerStep = slider.value.clientWidth / props.max;
      
      return props.modelValue * pixelsPerStep;
    })

    const updateModelValue = (val: number): void => {
      emit("update:modelValue", val);
    }

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
  }
}
</style>