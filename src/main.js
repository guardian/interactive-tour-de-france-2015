var url = require('./js/utils/url.js');
var html = require('./html/base.html');
var Timeline = require('./js/libs/timeline.js');
var Q3D = require('./js/libs/Qgis2threejs.js');
var project = require('./data/qgis3d-data');
var Stats = require('./js/libs/stats.js');
var THREE = require('three');

var isDebug = url.getParameterByName('debug');


/**
 * Boot the app.
 * @param {object:dom} el - <figure> element on the page.
 */
function boot(el) {
	el.innerHTML = html;

	var container = document.getElementById('webgl');
	container.style.height = '100vh';
	container.style.width = '100%';
	Q3D.Options.bgcolor = '#ffffff';
	var app = Q3D.application;
	app.init(container);

	// load the project
	app.loadProject(project);
	app.addEventListeners();
	app.start();

	// Fix sizing
	setTimeout(app.eventListener.resize.bind(app), 0);
	window.app = app;


	var meshMount = app.scene.children[3].children[0];
	var gpsLines = app.scene.children[4].children[0];
	var contourLines = app.scene.children[5].children[0];

	gpsLines.material.opacity = 0;
	gpsLines.material.transparent = true;
	gpsLines.material.linewidth = 3;

	app.scene.rotation.z = (Math.PI/180) * 90;
	// app.scene.scale.z = 0.01;
	meshMount.material.opacity = 1;
	meshMount.material.transparent = true;


	// Extend clip
	app.camera.far = 2000;

	if (url.hasParameter('debug')) {

		// Animation time
		var anim = Timeline.anim;

		anim("app.scene.position",app.scene.position).to({"x":0},0).to({"x": 10}, 2, Timeline.Easing.Cubic.EaseInOut);

		anim("app.camera.position",app.camera.position).to({"x":0.1},0).to({"x":0.1},1.6342105263157896).to({"x":74},2.92078947368421, Timeline.Easing.Cubic.EaseInOut).to({"x":74},3.4450000000000003, Timeline.Easing.Cubic.EaseInOut).to({"x":30},3.26, Timeline.Easing.Cubic.EaseInOut);
		anim("app.camera.position",app.camera.position).to({"y":0},0).to({"y":0},2.515609756097561).to({"y":-47},2.0543902439024393, Timeline.Easing.Cubic.EaseInOut).to({"y":-47},3.469999999999999).to({"y":50},3.214736842105264);
		anim("app.camera.position",app.camera.position).to({"z":160},0).to({"z":160},1.59).to({"z":27},3.05, Timeline.Easing.Cubic.EaseInOut).to({"z":27},3.32829268292683).to({"z":60},3.29170731707317);
		anim("meshMount.material",meshMount.material).to({"opacity":1},0).to({"opacity":0},1.1752941176470588).to({"opacity":0},6.448991596638654, Timeline.Easing.Cubic.EaseOut).to({"opacity":1},1.8128571428571423, Timeline.Easing.Cubic.EaseOut).to({"opacity":1},0.2352100840336142, Timeline.Easing.Cubic.EaseOut);
		anim("contourLines.material",contourLines.material).to({"opacity":0},0).to({"opacity":0},0.77).to({"opacity":1},0.9550000000000001, Timeline.Easing.Cubic.EaseOut).to({"opacity":1},6.169285714285714).to({"opacity":0.2},1.4399999999999995);
		anim("app.scene.scale",app.scene.scale).to({"z":0.1},0).to({"z":0.1},5.066470588235294).to({"z":1},2.302941176470588, Timeline.Easing.Quadratic.EaseInOut).to({"z":1},0.3834453781512597);
		anim("gpsLines.material",gpsLines.material).to({"opacity":0},0).to({"opacity":0},1.71).to({"opacity":1},4.23, Timeline.Easing.Cubic.EaseOut);
		Timeline.getGlobalInstance().loop(-1); //loop forever

	}


	if (url.hasParameter('anim')) {
		// Tween
		var TWEEN = require('tween.js');
		var tween = new TWEEN.Tween(app.scene.position).to({"x": 10}, 2000);
		var tween2 = new TWEEN.Tween(app.scene.position).to({"y": 10}, 2000).delay(1000);


		var ch1Anim = [
			{
				'target': app.scene.position,
				'values': { 'x': 0 },
				'delay': 0,
				'duration': 2000
			},
			{
				'target': app.scene.position,
				'values': { 'y': 0 },
				'delay': 1200,
				'duration': 2000
			}
		];


		var ch2Anim = [
			{
				'target': app.scene.position,
				'values': { 'x': -20 },
				'delay': 0,
				'duration': 2000
			},
			{
				'target': app.scene.position,
				'values': { 'y': -10 },
				'delay': 300,
				'duration': 2000
			}
		];

		var ch3Anim = [
			{
				'target': app.scene.position,
				'values': { 'x': -60 },
				'delay': 0,
				'duration': 2000
			},
			{
				'target': app.scene.position,
				'values': { 'y': -70 },
				'delay': 300,
				'duration': 2000
			}
		];

		function buildTweens(chapter) {
			return chapter.map(function(animData) {
				var tween = new TWEEN.Tween(animData.target);
				tween.to(animData.values, animData.duration);
				tween.easing( TWEEN.Easing.Quintic.InOut );
				if (animData.delay) { tween.delay(animData.delay); }
				return tween;
			});
		}


		function ChapterTweens(chapterData) {
			this._chapterData = chapterData;
			this._tweens = buildTweens(this._chapterData);
		}
		ChapterTweens.prototype.stop = function() {
			this._tweens.forEach(function(tween) {
				tween.stop();
			})
		}
		ChapterTweens.prototype.start = function() {
			this._tweens.forEach(function(tween) {
				tween.start();
			})
		}

		ChapterTweens.prototype.jumpToEnd = function() {
			this._chapterData.forEach(function(item) {
				Object.keys(item.values).forEach(function(key) {
					item.target[key] = item.values[key];
				});
			});
		}


		function Scene() {
			this._chapterTweens = [];
			this._currentChapter = 0;
		}

		Scene.prototype.jumpToChapter = function(chapterNumber) {
			this._chapterTweens[chapterNumber].jumpToEnd();
			this._currentChapte = chapterNumber;
		}

		Scene.prototype.nextChapter = function() {
			if ( this._currentChapter + 1 >= this._chapterTweens.length ) {
				return;
			}

			this._chapterTweens[this._currentChapter].stop();
			this._currentChapter += 1;
			this._chapterTweens[this._currentChapter].start();
		}

		Scene.prototype.prevChapter = function() {
			console.log('here',  this._currentChapter);
			if ( this._currentChapter - 1 < 0 ) {
				return;
			}

			this._chapterTweens[this._currentChapter].stop();
			this._currentChapter -= 1;
			this._chapterTweens[this._currentChapter].start();

			console.log(this._chapterTweens[this._currentChapter]);
		}

		Scene.prototype.start = function() {
			this._chapterTweens[this._currentChapter].start();
		}

		Scene.prototype.stop = function() {
			this._chapterTweens[this._currentChapter].stop();
		}

		Scene.prototype.addChapterTweens = function(tweens) {
			this._chapterTweens.push(tweens);
		}

		var scene = new Scene();
		scene.addChapterTweens( new ChapterTweens(ch1Anim) );
		scene.addChapterTweens( new ChapterTweens(ch2Anim) );
		scene.addChapterTweens( new ChapterTweens(ch3Anim) );
		scene.jumpToChapter(0);
		scene.nextChapter();


		window.scene = scene;

		setTimeout(function() {
			scene.stop();
		}, 900);


		setTimeout(function() {
			scene.prevChapter();
		}, 1300);

		setTimeout(function() {
			scene.nextChapter();
		}, 1600);

		setTimeout(function() {
			scene.nextChapter();
		}, 1800);

		animate();

		function animate() {
		    requestAnimationFrame(animate);
		    TWEEN.update();
		}

	}


}

module.exports = { boot: boot };
