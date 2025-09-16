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

function getSlideURI(slideno) {
    if(typeof suffix == 'string') {
        return "./" + slideno + suffix
    }
    else if(typeof suffix == 'function') {
        return './' + slideno + suffix(slideno)
    }
    alert("Invalid suffix")
    throw new Error("Invalid suffix")
}

setURI(getSlideURI(currentSlide))

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

    if (navigator.appName == "Microsoft Internet Explorer") {
        var parent = slideDisplay.parentElement
        var ifr = document.createElement("iframe")
        ifr.src = slideDisplay.data
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
    slidecount = currentSlide
}

/**
 * @description tests if no exists, if it **might** exist, success is called, if it **guaranteed** does not exist, fail is called
 */
function testSlide(no, success, fail) {
    if (runsOnError) {
        var obj = document.createElement(slideDisplay.tagName)
        obj.onerror = function() {
            obj.parentElement.removeChild(obj)
            fail(no)
        }
        obj.onload = function() {
            obj.parentElement.removeChild(obj)
            success(no)
        }
        setURI(getSlideURI(no), obj)
        document.body.appendChild(obj)
        return
    }

    if (window.fetch) {
        fetch(getSlideURI(no), {
            mode: "no-cors"
        }).then(function(res) { res.status == 200 || res.status == 0 ? success(no) : fail(no) })
        .catch(function(err) { fail(no) })
        return
    }

    if (slideDisplay.tagName != "IFRAME") {
        currentSlideTO = setTimeout(function() {
            currentSlideTO = null
            if (slideDisplay.offsetWidth == 0) {
                fail(no)
            }
            success(no)
        }, 500)
        return
    }

    //who knows
    success(no)
}

function setSlide(no) {
    if (testing) return
    //dont let the user switch slides while the to is active, and the slidecount is unknown, because otherwise the user might just keep going
    if (!runsOnError && currentSlideTO && !window.slidecount) return

    testSlide(no, function() {
        currentSlide = no
        setURI(getSlideURI(no))
    }, function() {
        foundEnd()
    })
}

function nextSlide() {
    if (currentSlide == window.slidecount) return
    setSlide(currentSlide + 1)
}

function previousSlide() {
    if (currentSlide === 1) return
    setSlide(currentSlide - 1)
}

function handleKeyPress(event) {
    var e = /**@type {KeyboardEvent}*/(event)
    //112 == 'p', 37 == 'arrowright
    if (e.key == 'ArrowLeft' || e.keyCode == 112 || e.keyCode == 37) {
        previousSlide()
        //110 == 'n', 39 == 'arrowright
    } else if (e.key == 'ArrowRight' || e.keyCode == 110 || e.keyCode == 39) {
        nextSlide()
    }
}

if ("onkeydown" in window) {
    document.onkeydown = function(e) { handleKeyPress(e || window.event) }
} else {
    document.onkeypress = function(e) { handleKeyPress(e || window.event) }
}
