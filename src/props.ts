import validateLength from "./utils/validateLength";

export default {
  width: {
    type: String,
    default: "100%",
    validator: validateLength,
  },
  height: {
    type: Number,
    default: 6,
  },
  color: {
    type: String,
    default: "#FB2727",
  },
  trackColor: {
    type: String,
    default: "#f1f6f828",
  },
  max: {
    type: Number,
    default: 100,
    required: true,
  },
  min: {
    type: Number,
    default: 0,
    required: true,
  },
  step: {
    type: Number,
    default: 1,
    required: true,
    validator(val: number) {
      if (val !== 0) {
        return true;
      } else {
        console.error("[Vue3Slider] Error: Step cannot be 0");
        return false;
      }
    },
  },
  tooltip: {
    type: Boolean,
    default: false,
  },
  tooltipText: {
    type: String,
    default: "%v",
    validator(val: string) {
      if (!val.includes("%v")) {
        console.error("[Vue3Slider] Error: tooltip text must contain %v");
        return false;
      }

      return true;
    },
  },
  tooltipColor: {
    type: String,
    default: "#FFFFFF",
  },
  tooltipTextColor: {
    type: String,
    default: "#000000",
  },
  formatTooltip: {
    validator(val: any) {
      if (typeof val !== "function") {
        console.error("[Vue3Slider] Error: formatTooltip must be a function");
        return false;
      } else if (typeof val(0) !== "string") {
        console.error("[Vue3Slider] Error: formatTooltip must return a string");
        return false;
      }

      return true;
    },
  },
  modelValue: {
    type: Number,
    default: 0,
    required: true,
  },
};
