var access = require('safe-access');
var TWEEN = require('tween.js');

function buildTweens(anim, app, imgEl) {

	return Object.keys(anim.targets).map(function( key ) {
		return new TWEEN.Tween( access(app, key) )
			.to(anim.targets[key], anim.duration)
			.onUpdate(function() {
				app.isAnimating = true;
			})
			.onComplete(function() {
				app.isAnimating = false;
			})
			.easing( TWEEN.Easing.Quintic.InOut );
	});
}

function Chapter(data, app) {
	this._app = app;
	this._chapterData = data;
	this.html = this._chapterData.html;
	this.imgSrc = this._chapterData.image;
	this.imgEl = this._chapterData.imgEl;


	if (this._app.webGLEnabled) {
		this.tweens = buildTweens(this._chapterData.anim, app, this.imgEl);
	} else {
		this.imgEl.classList.add('gv-fallback-image');
	}

	// Animation duration with overrides
	this.duration = 2000;
	if (this._chapterData.hasOwnProperty('duration')) {
		this.duration = this._chapterData.duration;
	} else if (this._chapterData.hasOwnProperty('anim')) {
		this.duration = this._chapterData.anim.duration;
	}

}

Chapter.prototype.stop = function(callback) {
	if (!this._app.webGLEnabled) {
		this.imgEl.classList.remove('active');
		this.imgEl.classList.add('hide');
	}
}

Chapter.prototype.start = function(duration) {
	if (this._app.webGLEnabled) {
		this.tweens.forEach(TWEEN.add);
		TWEEN.getAll().forEach(function(t) { t.start(); });
	} else {
		this.imgEl.classList.add('active');
		this.imgEl.classList.remove('hide');
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
		this.imgEl.classList.add('active');
	}
};

module.exports = Chapter;
