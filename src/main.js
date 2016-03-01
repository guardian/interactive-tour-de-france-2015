var url = require('./js/utils/url.js');
var detect = require('./js/utils/detect.js');
var stage3d = require('./js/stage3d');
var html = require('./html/base.html');

var webGLEnabled = (function () {
try {
    var canvas = document.createElement( 'canvas' );
    return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) ); }
    catch ( e ) { return false; }
})();


var app = {
    el: null,
    loaderEl: null,
    countEl: null,
    totalEl: null,
    wrapperEl: null,
    viewportDimensions: detect.getViewport(),
    webGLEnabled: url.hasParameter('fallback') ? false : webGLEnabled
};

function startImageVersion() {
    var modalEl = app.el.querySelector('.gv-modal');
    var chapters = require('./data/chapterData.js');
    var PXloader = require('./js/libs/pxloader.js');
    var loader = new PXloader();
    chapters.forEach(function(chapter) {
        if (app.viewportDimensions.width <= 480) {
            chapter.imgEl = loader.addImage(chapter.imageMobile);
        } else {
            chapter.imgEl = loader.addImage(chapter.image);
        }
    })

    var Scene = require('./js/scene.js');

    loader.addProgressListener(function(e) {
        app.countEl.innerHTML = e.completedCount;
        app.totalEl.innerHTML = e.totalCount;
    });

    loader.addCompletionListener(function() {
        app.loaderEl.setAttribute('style', '');
        console.log('all images downloaded');
        app.loaderEl.style.opacity = 0;
        app.el.classList.remove('loading');
        app.el.classList.add('loaded');
        var scene = new Scene(app.el, modalEl, chapters, app);
        scene.start();
    }.bind(this));

    loader.start();
}

function boot(el) {
    app.el = el;
	app.el.classList.add('loading');
	app.el.classList.add('intro');
	app.el.innerHTML = html;
	app.loaderEl = app.el.querySelector('.gv-loader');
	app.countEl = app.el.querySelector('.gv-progress-count');
	app.totalEl = app.el.querySelector('.gv-progress-total');
	app.wrapperEl = app.el.querySelector('.gv-wrapper');
	app.wrapperEl.style.height = app.viewportDimensions.height + 'px';

	if (app.viewportDimensions.width <= 480) {
		app.el.classList.add('gv-mobile');
	}

	if (app.webGLEnabled) {
		stage3d.init(app);
	} else {
		startImageVersion();
	}
}

module.exports = { boot: boot };
