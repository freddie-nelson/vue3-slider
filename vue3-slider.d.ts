import { DefineComponent, Plugin } from 'vue';

declare const Vue3Slider: DefineComponent & { install: Exclude<Plugin['install'], undefined> };
export default Vue3Slider;
