var Hammer = require('hammerjs');
var TWEEN = require('tween.js');
var access = require('safe-access');
var Chapter = require('./chapter.js');
var Pagination = require('./pagination.js');

var Scene = function(el, modalEl, chapters, app) {
	this.el = el;
	this.modalEl = modalEl;
	this.currentChapter = 0;
	this.pagination = new Pagination(chapters.length);
	var wrapperEl = this.el.querySelector('.gv-wrapper');
	wrapperEl.appendChild(this.pagination.el);
	this.qgisApp = app;

	this.MODAL_FADE_TIME = 400;

	this.chapters = chapters.map(function(item) {
		return new Chapter(item, app);
	});

	this.qgisApp.isAnimating = false;

	// Add fallback images if webgl is not available
	if (!app.webGLEnabled) {
		var imageContainer = this.el.querySelector('.gv-fallback-container');
		this.chapters.forEach(function(chapter) {
			imageContainer.appendChild(chapter.imgEl);
		}.bind(this));
	}


	// Interactions - mouse
	var nextBtn = el.querySelector('.gv-arrow-next-real');
	nextBtn.addEventListener('click', this.nextChapter.bind(this), false);

	var beginBtn = el.querySelector('.gv-arrow-begin');
	beginBtn.addEventListener('click', this.nextChapter.bind(this), false);

	var previousBtn = el.querySelector('.gv-arrow-previous');
	previousBtn.addEventListener('click', this.previousChapter.bind(this), false);


	// Interactions - touch
	this.touch = new Hammer(el, {velocity: 0.1, threshold: 5 });
	this.touch.on('swipeleft', this.nextChapter.bind(this));
	this.touch.on('swiperight', this.previousChapter.bind(this));

	window.addEventListener('keydown', function(event) {
		if (event.keyCode === 39 || event.keyCode === 38) {
			this.nextChapter();
		}
		if (event.keyCode === 40 || event.keyCode === 37) {
			this.previousChapter();
		}
	}.bind(this));
}

Scene.prototype.jumpToChapter = function(chapterNumber) {
	this.chapters[chapterNumber].jumpToEnd();
	this.currentChapter = chapterNumber;
}

Scene.prototype.nextChapter = function() {
	if ( this.currentChapter + 1 >= this.chapters.length ) {
		return;
	}
	this.transitionChapter(1);
}

Scene.prototype.previousChapter = function() {
	if ( this.currentChapter - 1 < 0 ) {
		return;
	}
	this.transitionChapter(-1);
}

Scene.prototype.setModalHTML = function() {
	var chapter = this.chapters[this.currentChapter];
	this.el.setAttribute('id', chapter._chapterData.id);
	this.modalEl.innerHTML = chapter._chapterData.html
}


Scene.prototype.transitionChapter = function(val) {
	TWEEN.removeAll();
	this.chapters[this.currentChapter].stop();
	var oldChapterIndex = this.currentChapter;
	this.currentChapter += val;
	this.chapters[this.currentChapter].start();
	this.pagination.goTo(this.currentChapter);


	// Sync show to end of animation tweens
	var duration;
	if (val > 0) {
		duration = this.chapters[this.currentChapter].duration;
	} else {
		duration = this.chapters[oldChapterIndex].duration;
	}
	var delay = duration - this.MODAL_FADE_TIME * 2;
	delay = (delay < 400) ? 400 : delay;

	if (!this.qgisApp.webGLEnabled) {
		delay = 500;
		duration = 2000;
	}

	this.modalEl.classList.add('hidden');
	this.modalEl.classList.remove('active');
	clearTimeout(this.timeout);
	this.timeout = setTimeout(function() {
		this.setModalHTML();
		this.modalEl.classList.add('active');
		this.modalEl.classList.remove('hidden');
	}.bind(this), delay);


	this.chapters[this.currentChapter].start(duration);
}



Scene.prototype.start = function() {
	this.jumpToChapter(0)
	this.setModalHTML();
	this.pagination.goTo(0);

	// Render the first frame
	if (this.qgisApp.webGLEnabled) {
		this.qgisApp.isAnimating = true;
		this.qgisApp.render();
		this.qgisApp.isAnimating = false;
	}

	this.animate();
}

Scene.prototype.stop = function() {
	this.chapters[this.currentChapter].stop();
}


Scene.prototype.animate = function() {
    TWEEN.update();
	if (this.qgisApp.webGLEnabled) { this.qgisApp.render(); }
    requestAnimationFrame(this.animate.bind(this));
}


module.exports = Scene;
