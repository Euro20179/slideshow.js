# Slideshow.js

Create slideshows using a directory of html files, that *theoretically* works in any browser since y2k.

It *works* in IE, however slideshow.js is currently unable to detect the end of the slides.

It is untested in netscape.


## Goal

Have a js file that sets keybinds to go to the next and previous slides,
and that can detect the end of the slideshow.

## Usage

Make a directory structure like this

```
/
|   slideshow.js
|   index.html
|   1/
|    |  index.html
|   2/
|    |  index.html
|   3/
|    |  ...
|   ...
```

the root index.html file must have the following
```html
<object id="slide-output"></object>
<script src="./slideshow.js"></script>
```
You can add anything else you'd like.

### Options
`slidecount`: set the slidecount, instead of slideshow.js having to figure it out
`suffix`: instead of `<slideno>/index.html`, use `<slideno>suffix` (/ must be added if you want it)
`suffix` may also be a function that takes the current slide number as input, and returns a string as the file which is a suffix for the slide

To use the options, create a script tag above the slideshow.js one and set them using `var`
eg:
```html
<script>
var slidecount = 5
var suffix = "/main.txt"
</script>
```
