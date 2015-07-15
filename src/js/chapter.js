require('es6-promise').polyfill();
var access = require('safe-access');
var TWEEN = require('tween.js');

function buildTweens(chapter, app, tweenSpeed) {
	return Object.keys(chapter).map(function( key ) {
		var tween = new TWEEN.Tween( access(app, key) );
		tween.to(chapter[key], tweenSpeed)
		tween.easing( TWEEN.Easing.Quintic.InOut );
		return tween;
	});
}

function Chapter(data, app, tweenSpeed) {
	this._chapterData = data;
	this._tweens = buildTweens(this._chapterData, app, tweenSpeed);
	this.tweenSpeed = tweenSpeed || 4000;
}

Chapter.prototype.stop = function(callback) {
	this._tweens.forEach(function(tween) {
		tween.stop();
	})
	if (callback) { callback(); }
}

Chapter.prototype.start = function(callback) {
	var anims = this._tweens.map(function(tween) {
		return new Promise(function(resolve, reject) {
			tween.onComplete(resolve);
			tween.start();
		});
	});

	Promise.all(anims).then(function() {
		if (callback) { callback(); }
	});
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
