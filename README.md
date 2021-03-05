# 🔥 Vue 3 Slider 🔥

**Now with full support for touch screens!**

## Table of Contents 📰

- [Demo](#demo)
- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Import Component](#import-component)
  - [How to use](#how-to-use)
- [License](#license)
- [Contact](#contact)

## Demo

[Open Live Demo](https://freddie-nelson.github.io/vue3-slider/)  
![Demo](https://raw.githubusercontent.com/freddie-nelson/vue3-slider/main/demo.gif)

## Installation

```bash
# with npm
npm install vue3-slider
```

```bash
# with yarn
yarn add vue3-slider
```

## Getting Started 👍

### Import component

```js
import slider from "vue3-slider"

export default {
  ...
  components: {
    "vue3-slider": slider
  }
  ...
}
```

### How to use

```html
<vue3-slider v-model="myNumber" color="#FB278D" track-color="#FEFEFE" />
```

### Props

| Name             | Type     | Required | Default    | Rules                                                         |
| ---------------- | -------- | -------- | ---------- | ------------------------------------------------------------- |
| v-model          | Number   | ✔️       |            |                                                               |
| width            | String   |          | 100%       | must be valid css length                                      |
| height           | Number   |          | 6          |                                                               |
| color            | String   |          | #FB2727    | must be a valid hex, rgb, rgba or html color value            |
| trackColor       | String   |          | #F1F6F8    | ^^^                                                           |
| max              | Number   |          | 100        | cannot be less than min                                       |
| min              | Number   |          | 0          | cannot be greater than max                                    |
| step             | Number   |          | 1          |                                                               |
| tooltip          | Boolean  |          | False      |                                                               |
| tooltipText      | String   |          | "%v"       | must contain %v (%v is replaced with slider's value)          |
| tooltipColor     | String   |          | #FFFFFF    | must be a valid hex, rgb, rgba or html color value            |
| tooltipTextColor | String   |          | #000000    | ^^^                                                           |
| formatTooltip    | Function |          | null       | function must take one parameter (number) and return a string |
| orientation      | String   |          | horizontal | restricted choice (horizontal, vertical, circular)            |

**NOTE: When using the circular slider width is the diameter of the circle and height is the stroke width**
**NOTE: When using the circular slider it is advised to use absolute units for width to avoid issues**

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright © 2020 - Present, Freddie Nelson

## Contact

- [Send me an email 📧](mailto:freddie0208@hotmail.com)
- [DM me through twitter](https://twitter.com/freddie_dev)
- [Contact me through my website](https://freddienelson.co.uk)
