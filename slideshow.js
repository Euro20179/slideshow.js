/*
 * Welcome to slideshow.js
 * To use this, have an <object> in your html with id=slide-output, and a <script> with src="slideshow.js"
 * To create slides, create folders that describe that slide's position, eg:
 *     slide 1 is in folder `1`, slide 2 in folder `2` etc...
 * in each slide folder, create a file called index.html
 * the entry point for each slide can be changed by setting the suffix variable in the root document. (the one with <object>)
 *     the default suffix is `/index.html`
 *
 * slideshow.js will attempt to figure out when the last slide has been reached
 * however this can also be set by setting the slidecount variable in the root document
 *
 * also see the example folder
 *
 * using the arrow keys will cycle between slides
 * the functions nextSlide() and previousSlide() can also be used
 */

var currentSlide = 1

if(!window.suffix) {
    var suffix = "/index.html"
}

var loadingTO = null

function setSlide(no) {
    slideDisplay.data = no + suffix
}

function nextSlide() {
    if(currentSlide == window.slidecount) return
    currentSlide++
    setSlide(currentSlide)
}

function previousSlide() {
    if(currentSlide === 1) return
    currentSlide--
    setSlide(currentSlide)
}

/**
 * @type { HTMLObjectElement}
 */
var slideDisplay
if(document.getElementById) {
    slideDisplay = document.getElementById("slide-output")
} else if(document.all) {
    slideDisplay = document.all["slide-output"]
} else {
    throw new Error("Could not find the slide output")
}

slideDisplay.onerror = function() {
    previousSlide()
    //chrome does weird shit where object stops rendering at all after an invalid slide
    //create a new <object> and replace the old one with it
    slidecount = currentSlide
    var o = document.createElement("object")
    o.id = slideDisplay.id
    o.data = slideDisplay.data
    slideDisplay.replaceWith(o)
    slideDisplay = o
}

slideDisplay.data = currentSlide + suffix

addEventListener("keydown", function() {
    var e = /**@type {KeyboardEvent}*/(event)
    if(e.key == 'ArrowLeft') {
        previousSlide()
    } else if(e.key == 'ArrowRight') {
        nextSlide()
    }
})
