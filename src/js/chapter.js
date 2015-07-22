var access = require('safe-access');
var TWEEN = require('tween.js');

function buildTweens(anim, app, imgEl) {
	var tweens = [];

	if (app.webGLEnabled) {
		tweens = Object.keys(anim.targets).map(function( key ) {
			var tween = new TWEEN.Tween( access(app, key) );
			tween.to(anim.targets[key], anim.duration)
			tween.easing( TWEEN.Easing.Quintic.InOut );
			return tween;
		});
	} else {
		var tween = new TWEEN.Tween(imgEl.style);
		tween.to({ opacity: 1}, anim.duration);
		tween.easing( TWEEN.Easing.Quintic.InOut );
		tweens.push(tween);
	}

	return tweens;
}

function Chapter(data, app) {
	this._app = app;
	this._chapterData = data;
	this.html = this._chapterData.html;
	this.imgSrc = this._chapterData.image;
	this.imgEl = this._chapterData.imgEl;

	if (!this._app.webGLEnabled) {
		this.imgEl.classList.add('gv-fallback-image');
		this.imgEl.classList.add('gv-fallback-image-' + this._chapterData.id);
	}

	// Animation duration with overrides
	this.duration = 2000;
	if (this._chapterData.hasOwnProperty('duration')) {
		this.duration = this._chapterData.duration;
	} else if (this._chapterData.hasOwnProperty('anim')) {
		this.duration = this._chapterData.anim.duration;
	}

	this._tweens = buildTweens(this._chapterData.anim, app, this.imgEl);
}

Chapter.prototype.fadeIn = function(duration) {
	if (this.tween) { this.tween.stop(); }
	this.tween = new TWEEN.Tween(this.imgEl.style);
	this.tween.to({ opacity: 1 },  2000);
	this.tween.easing( TWEEN.Easing.Quintic.InOut );
	this.tween.start();
}

Chapter.prototype.fadeOut = function(duration) {
	if (this.tween) { this.tween.stop(); }
	this.tween = new TWEEN.Tween(this.imgEl.style);
	this.tween.to({ opacity: 0 }, 3000);
	this.tween.easing( TWEEN.Easing.Quintic.InOut );
	this.tween.start();
}

Chapter.prototype.stop = function(callback) {
	if (this._app.webGLEnabled) {
		this._tweens.forEach(function(tween) {
			tween.stop();
		})
		if (callback) { callback(); }
	} else {
		this.fadeOut();
	}
}

Chapter.prototype.start = function(duration) {
	if (this._app.webGLEnabled) {
		this._tweens.forEach(function(tween) {
				tween.start();
		});
	} else {
		this.fadeIn();
	}
}

Chapter.prototype.jumpToEnd = function() {
	if (this._app.webGLEnabled) {
		Object.keys(this._chapterData.anim.targets).map(function( key ) {
			var target = access(this._app, key);
			Object.keys(this._chapterData.anim.targets[key]).forEach(function(propKey) {
				target[propKey] = this._chapterData.anim.targets[key][propKey];
			}.bind(this));
		}.bind(this));
	} else {
		this.imgEl.style.opacity = 1;
	}
};

module.exports = Chapter;
