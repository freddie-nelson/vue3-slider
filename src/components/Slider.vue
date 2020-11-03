<template>
  <div id="slider">
    <div class="track"></div>
    <div class="track-filled"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import props from "./props";

export default defineComponent({
  name: "Slider",
  props,
  methods: {
    updateModelValue(val: number): void {
      this.$emit("update:modelValue", val);
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