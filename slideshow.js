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

var currentSlideTO = null

if (!window.suffix) {
    var suffix = "/index.html"
}

/**
 * @type { HTMLObjectElement}
 */
var slideDisplay
if (document.getElementById) {
    slideDisplay = document.getElementById("slide-output")
} else if (document.all) {
    slideDisplay = document.all["slide-output"]
} else {
    throw new Error("Could not find the slide output")
}

slideDisplay.data = currentSlide + suffix

/**
 * whether or not the browser runs <object>.onerror
 */
var runsOnError = false
var testing = false

doRunsErrorTest()

/**
 * @description Tests if the browser supports <object>.onerror
 *
 * If the browser does not suppor this we fall back to a shitty timeout method
 */
function doRunsErrorTest() {
    testing = true

    var orig = slideDisplay.data

    if (!window.loadingtext) {
        slideDisplay.data = "data:text/html,<p>loading...</p>"
    } else {
        slideDisplay.data = "data:text/html," + loadingtext
    }

    var o = document.createElement("object")

    function reset() {
        testing = false
        o.parentNode.removeChild(o)
        slideDisplay.data = orig
    }

    o.data = "http://fake-uri.invalid"
    o.onerror = function err() {
        runsOnError = true
        reset()
        slideDisplay.removeEventListener("error", err)
    }
    document.body.appendChild(o)

    setTimeout(function() {
        reset()
    }, 1000)
}


function foundEnd() {
    previousSlide()
    slidecount = currentSlide
}

function setSlide(no) {
    if (testing) return
    //dont let the user switch slides while the to is active, and the slidecount is unknown, because otherwise the user might just keep going
    if (!runsOnError && currentSlideTO && !window.slidecount) return

    currentSlide = no

    slideDisplay.data = no + suffix

    //some browsers (COUGH, WEBKIT) do not run object.onerror, so just set a 500ms timeout
    if (!runsOnError) {
        currentSlideTO = setTimeout(function() {
            currentSlideTO = null
            if (slideDisplay.offsetWidth == 0) {
                foundEnd()
            }
        }, 500)
    }
}

function nextSlide() {
    if (currentSlide == window.slidecount) return
    setSlide(currentSlide + 1)
}

function previousSlide() {
    if (currentSlide === 1) return
    setSlide(currentSlide - 1)
}

var int = setInterval(function() {
    if (testing) return
    clearInterval(int)

    //this should only be set once testing is complete
    //otherwise the browser may run this onerror function
    slideDisplay.onerror = function() {
        foundEnd()
        if (slideDisplay.replaceWith) {
            //chrome does weird shit where object stops rendering at all after an invalid slide
            //create a new <object> and replace the old one with it
            var o = document.createElement("object")
            o.id = slideDisplay.id
            o.data = slideDisplay.data
            slideDisplay.replaceWith(o)
            slideDisplay = o
        }
    }
}, 20)

addEventListener("keydown", function() {
    var e = /**@type {KeyboardEvent}*/(event)
    if (e.key == 'ArrowLeft') {
        previousSlide()
    } else if (e.key == 'ArrowRight') {
        nextSlide()
    }
})
