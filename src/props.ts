import validateLength from "./utils/validateLength";

export type Props = Readonly<{
  width: string;
  height: number;
  handleScale: number;
  alwaysShowHandle: boolean;
  color: string;
  trackColor: string;
  max: number;
  min: number;
  limit?: number;
  step: number;
  tooltip: boolean;
  tooltipText: string;
  tooltipColor: string;
  tooltipTextColor: string;
  alwaysShowTooltip: boolean;
  flipTooltip: boolean;
  orientation: string;
  modelValue: number;
  repeat: boolean;
  sticky: boolean;
  flip: boolean;
  circleOffset: number;
  circleGap: number;
  disabled: boolean;
  customSliderSteps?: number[];
}>;

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
  handleScale: {
    type: Number,
    default: 1.35,
  },
  alwaysShowHandle: {
    type: Boolean,
    default: false,
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
  },
  min: {
    type: Number,
    default: 0,
  },
  step: {
    type: Number,
    default: 1,
    validator(val: number) {
      if (val !== 0) {
        return true;
      } else {
        console.error("[Vue3Slider] Error: Step cannot be 0");
        return false;
      }
    },
  },
  limit: {
    type: Number,
    default: undefined,
    validator(val: any) {
      return val === undefined || typeof val === "number";
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
  alwaysShowTooltip: {
    type: Boolean,
    default: false,
  },
  flipTooltip: {
    type: Boolean,
    default: false,
  },
  orientation: {
    type: String,
    default: "horizontal",
    validator(val: string) {
      return val === "horizontal" || val === "vertical" || val === "circular";
    },
  },
  modelValue: {
    type: Number,
    default: 0,
    required: true,
  },
  repeat: {
    type: Boolean,
    default: false,
  },
  sticky: {
    type: Boolean,
    default: false,
  },
  flip: {
    type: Boolean,
    default: false,
  },
  circleOffset: {
    type: Number,
    default: 0,
    validator(val: number) {
      return val >= 0 && val <= 360;
    },
  },
  circleGap: {
    type: Number,
    default: 0,
    validator(val: number) {
      return val >= 0 && val <= 360;
    },
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  customSliderSteps: {
    type: Array as () => number[] | undefined,
    default: undefined,
  },
};
