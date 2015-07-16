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
	this.el.appendChild(this.pagination.el);

	this.chapters = chapters.map(function(item) {
		return new Chapter(item, app);
	});


	// Animations
	this.MODAL_FADE_TIME = 400;
	this.modalFadeOut = new TWEEN.Tween(this.modalEl.style);
	this.modalFadeOut.to({ opacity: 0 }, this.MODAL_FADE_TIME)
	.easing( TWEEN.Easing.Quartic.Out )
	.onComplete(this.setModalHTML.bind(this));

	this.modalFadeIn = new TWEEN.Tween(this.modalEl.style);
	this.modalFadeIn.to({ opacity: 1 }, this.MODAL_FADE_TIME)
	.easing( TWEEN.Easing.Quartic.Out );

	this.modalFadeOut.chain(this.modalFadeIn);


	// Interactions
	this.touch = new Hammer(el, {});
	this.touch.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });
	this.touch.on('pan', function(ev) {
		var delta = Math.abs(ev.deltaX);
		var opacity = 1 - (Math.log(delta) / 20);
		var translateDist = Math.log(delta) * 10;
		if (ev.deltaX < 0) { translateDist *= -1 };
	   	this.modalEl.style.transform = 'translateX(' + translateDist  + 'px)';
		this.modalEl.style.opacity = opacity;
	}.bind(this));

	this.touch.on('panend', function(ev) {
		this.modalEl.style.transform = 'translateX(0)';
		this.modalEl.style.opacity = 1;
	}.bind(this))

	this.touch.on('swipeleft', this.nextChapter.bind(this));
	this.touch.on('swiperight', this.previousChapter.bind(this));

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
	this.modalEl.innerHTML = chapter.html
}


Scene.prototype.transitionChapter = function(val) {
	this.chapters[this.currentChapter].stop();
	this.currentChapter += val;
	this.chapters[this.currentChapter].start();
	this.pagination.goTo(this.currentChapter);

	this.modalFadeOut.stop();
	this.modalFadeIn.stop();

	// Sync show to end of animation tweens
	var duration = this.chapters[this.currentChapter].duration;
	var delay = duration - this.MODAL_FADE_TIME * 2;
	delay = (delay < 0) ? 0 : delay;

	this.modalFadeIn.delay(delay);
	this.modalFadeOut.start();
}



Scene.prototype.start = function() {
	this.animate();
	this.chapters[this.currentChapter].start();
	this.pagination.goTo(0);

}

Scene.prototype.stop = function() {
	this.chapters[this.currentChapter].stop();
}


Scene.prototype.animate = function() {
    TWEEN.update();
    requestAnimationFrame(this.animate.bind(this));
}


module.exports = Scene;
