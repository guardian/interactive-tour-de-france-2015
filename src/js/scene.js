var Hammer = require('hammerjs');
var TWEEN = require('tween.js');
var access = require('safe-access');
var Chapter = require('./chapter.js');
var Pagination = require('./pagination.js');

var Scene = function(el, modalEl, animChapters, app) {
	this.el = el;
	this.modalEl = modalEl;
	this.currentChapter = 0;
	this.pagination = new Pagination(animChapters.length);
	this.el.appendChild(this.pagination.el);

	this.chapterTweens = animChapters.map(function(item) {
		return new Chapter(item, app);
	});


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
	this.chapterTweens[chapterNumber].jumpToEnd();
	this.currentChapter = chapterNumber;
}

Scene.prototype.nextChapter = function() {
	if ( this.currentChapter + 1 >= this.chapterTweens.length ) {
		return;
	}

	// Fade modal
	var modalEl = this.modalEl;
	var tween = new TWEEN.Tween({ x:  1});
	tween.to({ x: 0 }, 500)
	.easing( TWEEN.Easing.Quartic.Out )
	.onUpdate(function() { modalEl.style.opacity = this.x; })
	.start();

	this.chapterTweens[this.currentChapter].stop();
	this.currentChapter += 1;
	this.chapterTweens[this.currentChapter].start(this.showModal.bind(this));
	this.pagination.goTo(this.currentChapter);
}

Scene.prototype.previousChapter = function() {
	if ( this.currentChapter - 1 < 0 ) {
		return;
	}

	var modalEl = this.modalEl;
	var tween = new TWEEN.Tween({ x:  1})
	tween.to({ x: 0 }, 200)
	.easing( TWEEN.Easing.Quartic.In )
	.onUpdate(function() { modalEl.style.opacity = this.x; })
	.start();

	this.chapterTweens[this.currentChapter].stop();
	this.currentChapter -= 1;
	this.chapterTweens[this.currentChapter].start(this.showModal.bind(this));
	this.pagination.goTo(this.currentChapter);
}

Scene.prototype.showModal = function() {
	var modalEl = this.modalEl;
	var tween = new TWEEN.Tween({ x:  0})
	tween.to({ x: 1 }, 200)
	.easing( TWEEN.Easing.Quartic.In )
	.onUpdate(function() { modalEl.style.opacity = this.x; })
	.start();
}

Scene.prototype.start = function() {
	this.animate();
	this.chapterTweens[this.currentChapter].start(this.showModal.bind(this));
	this.pagination.goTo(0);

}

Scene.prototype.stop = function() {
	this.chapterTweens[this.currentChapter].stop();
}


Scene.prototype.animate = function() {
    TWEEN.update();
    requestAnimationFrame(this.animate.bind(this));
}


module.exports = Scene;
