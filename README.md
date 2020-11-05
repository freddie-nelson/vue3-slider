# 🔥 Vue 3 Slider 🔥

## Table of Contents 📰

* [Demo](#demo)
* [Installation](#installation)
* [Getting Started](#getting-started)
  * [Import Component](#import-component)
  * [How to use](#how-to-use)
* [License](#license)
* [Contact](#contact)

## Demo

![Demo](https://raw.githubusercontent.com/freddie-nelson/vue3-slider/main/demo.gif)

## Installation 
```js
// with npm
npm install vue3-slider
```

```js
// with yarn 
yarn add vue3-slider
```

## Getting Started 👍

### Import component
```js
import slider from "vue3-slider"
import "vue3-slider/dist/vue3-slider.min.css"

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
<vue3-slider
  v-model="myNumber"
  color="#FB278D"
  track-color="#FEFEFE"
>
```

### Props
| Name   	      | Type  	  | Required   	| Default  	| Rules   	|
|---	          |---	      |---	        |---	      |---	      |
| width  	      | String  	|   	        | 100%  	  | must be valid css length |
| height  	    | Number  	|   	        | 6  	      |   	      |
| color  	      | String  	|   	        | #FB2727  	| must be a valid hex, rgb, rgba or html color value         |
| trackColor  	| String  	|   	        | #F1F6F8  	| ^^^  	      |
| max  	        | Number   	| ✔️   	      | 100   	  | cannot be less than min   	      |
| min  	        | Number  	| ✔️   	      | 0   	    | cannot be greater than max  	      |
| step  	      | Number  	| ✔️  	      | 1  	      |   	      |
| v-model  	| Number  	| ✔️  	      |   	      |   	      |


## License

[MIT](https://opensource.org/licenses/MIT)

Copyright © 2020 - Present, Freddie Nelson

## Contact

* [Send me an email 📧](mailto:freddie0208@hotmail.com)
* [DM me through twitter](https://twitter.com/freddie_dev)
* [Contact me through my website](https://freddienelson.co.uk)