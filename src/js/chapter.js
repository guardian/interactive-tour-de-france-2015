require('es6-promise').polyfill();
var access = require('safe-access');
var TWEEN = require('tween.js');

function buildTweens(anim, app) {
	return Object.keys(anim.targets).map(function( key ) {
		var tween = new TWEEN.Tween( access(app, key) );
		tween.to(anim.targets[key], anim.duration)
		tween.easing( TWEEN.Easing.Quintic.InOut );
		return tween;
	});
}

function Chapter(data, app) {
	this._chapterData = data;
	this.html = this._chapterData.html;

	// Animation duration with overrides
	this.duration = 2000;
	if (this._chapterData.hasOwnProperty('duration')) {
		this.duration = this._chapterData.duration;
	} else if (this._chapterData.hasOwnProperty('anim')) {
		this.duration = this._chapterData.anim.duration;
	}

	this._tweens = buildTweens(this._chapterData.anim, app);
}

Chapter.prototype.stop = function(callback) {
	this._tweens.forEach(function(tween) {
		tween.stop();
	})
	if (callback) { callback(); }
}

Chapter.prototype.start = function(duration) {
	var anims = this._tweens.map(function(tween) {
		return new Promise(function(resolve, reject) {
			tween.onComplete(resolve);
			tween.start();
		});
	});

	// Promise.all(anims).then(function() {
	// 	if (callback) { callback(); }
	// });
}

Chapter.prototype.jumpToEnd = function() {
	Object.keys(this._chapterData).forEach(function( key ) {
		Object.keys( this._chapterData[key] ).forEach(function( prop ) {
			var p = access(this._app, key);
			p[prop] = this._chapterData[key][prop];
		}.bind(this));
	}.bind(this));
};

module.exports = Chapter;
