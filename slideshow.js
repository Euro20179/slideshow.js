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

setURI("./" + currentSlide + suffix)

/**
 * whether or not the browser runs <object>.onerror
 */
var runsOnError = false
var testing = false

doRunsErrorTest()

function setURI(uri, forEl) {
    if (forEl == undefined) {
        forEl = slideDisplay
    }

    if (forEl.tagName == "IFRAME") {
        forEl.src = uri
    } else forEl.data = uri
}

function getURI(fromEl) {
    if (fromEl == undefined) {
        fromEl = slideDisplay
    }
    if (fromEl.tagName == "IFRAME") {
        return fromEl.src
    }
    return fromEl.data
}

/**
 * @description Tests if the browser supports <object>.onerror
 *
 * If the browser does not suppor this we fall back to a shitty timeout method
 */
function doRunsErrorTest() {
    testing = true

    if(navigator.appName == "Microsoft Internet Explorer") {
        var parent = slideDisplay.parentElement
        var ifr = document.createElement("iframe")
        ifr.src = slideDisplay.data
        ifr.style = slideDisplay.style
        ifr.width = slideDisplay.width
        ifr.height = slideDisplay.height
        parent.replaceChild(ifr, slideDisplay)
        slideDisplay = ifr
    }

    var orig = getURI()

    if (!window.loadingtext) {
        setURI("data:text/html,<p>loading...</p>")
    } else {
        setURI("data:text/html," + loadingtext)
    }

    var o = document.createElement(slideDisplay.tagName)

    function reset() {
        testing = false
        o.parentElement.removeChild(o)
        setURI(orig)
        clearTimeout(to)
    }

    setURI("http://fake-uri.invalid", o)
    o.onerror = function err() {
        runsOnError = true
        reset()
    }
    document.body.appendChild(o)

    var to = setTimeout(function() {
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

    setURI("./" + no + suffix)

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
        //chrome does weird shit where object stops rendering at all after an invalid slide
        //create a new <object> and replace the old one with it
        var o = document.createElement(slideDisplay.tagName)
        o.id = slideDisplay.id
        setURI(getURI(), o)
        slideDisplay.parentElement.replaceChild(o, slideDisplay)
        slideDisplay = o
    }
}, 20)

function handleKeyPress(event) {
    var e = /**@type {KeyboardEvent}*/(event)
    //80 == 'p', 37 == 'arrowright
    if (e.key == 'ArrowLeft' || e.keyCode == 80 || e.keyCode == 37) {
        previousSlide()
    //110 == 'n', 39 == 'arrowright
    } else if (e.key == 'ArrowRight' || e.keyCode == 110 || e.keyCode == 39) {
        nextSlide()
    }
}

if("onkeydown" in window) {
    document.onkeydown = function() { handleKeyPress(event) }
} else {
    document.onkeypress = function() { handleKeyPress(event) }
}
