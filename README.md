> ✨ Support me: [wallet address](https://elatel.ir).

# Alpine Portal

Real-time relocation of an element to a different position in various sizes

![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/nabeghe/alpine-portal?label=version&style=for-the-badge)
![Build size Brotli](https://img.badgesize.io/nabeghe/alpine-portal/master/dist/alpine-portal.js.svg?compression=gzip&style=for-the-badge&color=green)
## About

This plugin adds a new directive called x-portal to Alpine. x-portal is similar to x-teleport within 
Alpine itself, but it has some differences.
x-portal is used to teleport an element to another location, with the ability to specify the screen size at which the teleportation should occur.
For example, if the screen size becomes larger or smaller than 1024, the teleportation takes place.  
Therefore, it is a screen-size-based teleportation.
Additionally, if the screen size changes continuously, the conditions are re-evaluated. For example, if the teleportation has already occurred but the conditions are not met after a screen size change (window resize), the element returns to its initial position.

x-portal can be considered as a two-way portal that creates a pathway from one world (screen) to another 
world (screen) in order to move elements between them. 😅

## Installation

### CDN

Include the following `<script>` tag in the `<head>` of your document, just before Alpine.

```html
<script src="https://cdn.jsdelivr.net/gh/nabeghe/alpine-portal@v0.1.0/dist/alpine-portal.js" defer></script>
```

### NPM

```bash
npm i alpine-portal
```

Add the `x-portal` directive to your project by importing the package **before** Alpine.js.

```js
import Alpine from 'alpinejs';
import Portal from 'alpine-portal';

Alpine.plugin(Portal);

window.Alpine = Alpine;
window.Alpine.start();
```

## Usage

The x-portal directive must be added to the desired element.  The value of the x-portal must be a selector 
(target) where the element will be teleported to.
Then, you can use the following options to set additional values:

- `x-portal:screen`: Specifies the screen breakpoint (a number, e.g. 1024).
- `x-portal:is`: Determines whether the comparison should be greater than or less than (a boolean, true 
or false; default: true, meaning greater than).
- `x-portal:target`: Instead of specifying the target within the x-portal directive, you can write it as 
an expression here.

### Example:

```html
<div x-data id="div1" style="background: #E91E63; padding: 5px;">
    <h2>Div 1</h2>
    <div x-portal="#div2" x-portal:screen="640" x-portal:is="true">
        lorem ipsum dolor sit amet, consectetur adipisicing elit
    </div>
</div>

<div x-data id="div2"  style="background: #8BC34A; padding: 5px;">
    <h2>Div 2</h2>
</div>
```

## License

Copyright (c) 2023 Hadi Akbarzadeh

Licensed under the MIT license, see [LICENSE.md](LICENSE.md) for details.