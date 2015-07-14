var url = require('./js/utils/url.js');
var html = require('./html/base.html');
var Timeline = require('./js/libs/timeline.js');
var Q3D = require('./js/libs/Qgis2threejs.js');
var project = require('./data/qgis3d-data');
var chapterAnimJSON = require('./data/chapterAnims.json');
var Stats = require('./js/libs/stats.js');
var TWEEN = require('tween.js');
var THREE = require('three');
var access = require('safe-access');
var DAT = require('dat-gui');
var _ = require('underscore');

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
	setTimeout(app.eventListener.resize.bind(app), 1000);
	window.app = app;

	app.ref = {};
	console.log(app.scene.children[6].children[0]);
	app.ref['meshMount'] = app.scene.children[3].children[0];
	app.ref['bends'] =  app.scene.children[4].children[0]; // turns
	app.ref['contourLines'] =  app.scene.children[6].children[0]; // Contour
	app.ref['gpsLines'] = app.scene.children[5].children[0]; // route

	app.ref.gpsLines.material.opacity = 0;
	// app.ref.gpsLines.material.transparent = true;
	// app.ref.contourLines.material.transparent = true;
	app.ref.gpsLines.material.linewidth = 3;

	app.scene.rotation.z = (Math.PI/180) * 90;
	app.scene.scale.z = 0.01;
	app.ref.meshMount.material.opacity = 1;
	app.ref.meshMount.material.transparent = true;
	app.ref.bends.material.transparent = true;


	if (url.hasParameter('debug')) {
		// var gui = new DAT.GUI();
		var gui = new DAT.GUI({ load: chapterAnimJSON });
		gui.remember(app.camera.position);
		gui.remember(app.camera.rotation);
		var gCamera = gui.addFolder('Camera');
		var gCameraPos = gCamera.addFolder('position')
		gCameraPos.add(app.camera.position, 'x').min(-100).max(100).listen();
		gCameraPos.add(app.camera.position, 'y').min(-100).max(100).listen();
		gCameraPos.add(app.camera.position, 'z').min(-100).max(100).listen();

		var gCameraRotation = gCamera.addFolder('rotation')
		gCameraRotation.add(app.camera.rotation, 'x').min(-3).max(3).listen();
		gCameraRotation.add(app.camera.rotation, 'y').min(-3).max(3).listen();
		gCameraRotation.add(app.camera.rotation, 'z').min(-3).max(3).listen();


		gui.remember(app.ref.meshMount.material);
		var gMesh = gui.addFolder('Mesh');
		gMesh.add(app.ref.meshMount.material, 'opacity').min(0).max(1).listen();

		gui.remember(app.ref.contourLines.material);
		var gContours = gui.addFolder('Contours');
		gContours.add(app.ref.contourLines.material, 'opacity').min(0).max(1).listen();

		gui.remember(app.ref.gpsLines.material);
		var gGPS= gui.addFolder('Route');
		gGPS.add(app.ref.gpsLines.material, 'opacity').min(0).max(1).listen();

		gui.remember(app.scene.scale);
		var gScene= gui.addFolder('Scene');
		gScene.add(app.scene.scale, 'z').min(0).max(1).listen();

		gui.remember(app.ref.bends.material);
		var gBends= gui.addFolder('Bends');
		gBends.add(app.ref.bends.material, 'opacity').min(0).max(1).listen();

	}



	// Extend clip
	app.camera.far = 2000;



// 		// Animation time
// 		var anim = Timeline.anim;

// anim("app.camera.position",app.camera.position).to({"x":10},0).to({"x":10},1.6342105263157896).to({"x":74},2.92078947368421).to({"x":74},3.4450000000000003, Timeline.Easing.Cubic.EaseInOut).to({"x":-33},3.26, Timeline.Easing.Cubic.EaseInOut);
// anim("app.camera.position",app.camera.position).to({"y":0},0).to({"y":0},1.57).to({"y":-47},3, Timeline.Easing.Cubic.EaseInOut).to({"y":-47},3.469999999999999).to({"y":37},3.214736842105264);
// anim("app.camera.position",app.camera.position).to({"z":90},0).to({"z":90},1.59).to({"z":27},3.05, Timeline.Easing.Cubic.EaseInOut).to({"z":27},0.802631578947369).to({"z":27},2.5373684210526317).to({"z":43},3.2799999999999994);
// anim("app.ref.meshMount.material",app.ref.meshMount.material).to({"opacity":0},0).to({"opacity":0},1.1752941176470588).to({"opacity":0},6.448991596638654, Timeline.Easing.Cubic.EaseOut).to({"opacity":1},1.8128571428571423, Timeline.Easing.Cubic.EaseOut).to({"opacity":1},0.2352100840336142, Timeline.Easing.Cubic.EaseOut);
// anim("app.ref.contourLines.material",app.ref.contourLines.material).to({"opacity":0},0).to({"opacity":0},0.77).to({"opacity":1},0.9550000000000001, Timeline.Easing.Cubic.EaseOut).to({"opacity":1},6.169285714285714).to({"opacity":0.2},1.4399999999999995);
// anim("app.scene.scale",app.scene.scale).to({"z":0.1},0).to({"z":0.1},5.066470588235294).to({"z":1},2.302941176470588, Timeline.Easing.Quadratic.EaseInOut).to({"z":1},0.3834453781512597);
// anim("app.ref.gpsLines.material",app.ref.gpsLines.material).to({"opacity":0},0).to({"opacity":0},1.71).to({"opacity":1},4.23, Timeline.Easing.Cubic.EaseOut);

// 		Timeline.getGlobalInstance().loop(-1); //loop forever

// 	}


	if (url.hasParameter('anim')) {

		var animChapters = _.map(chapterAnimJSON.remembered, function(item, key) {
			var params = {};
			params['camera.position'] = item[0];
			params['camera.rotation'] = item[1];
			params['ref.meshMount.material'] = item[2];
			params['ref.contourLines.material'] = item[3];
			params['ref.gpsLines.material'] = item[4];
			params['scene.scale'] = item[5];
			params['ref.bends.material'] = item[6];
			return params;
		});


		function buildTweens(chapter) {
			return Object.keys(chapter).map(function( key ) {
				var tween = new TWEEN.Tween( access(app, key) );
				tween.to(chapter[key], 4000)
				tween.easing( TWEEN.Easing.Quintic.InOut );
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
			Object.keys(this._chapterData).forEach(function( key ) {
				Object.keys(this._chapterData[key]).forEach(function( prop ) {
					var p = access(app, key);
					p[prop] = this._chapterData[key][prop];
				}.bind(this));
			}.bind(this));
		}


		function Scene() {
			this._chapterTweens = [];
			this._currentChapter = 0;
		}

		Scene.prototype.jumpToChapter = function(chapterNumber) {
			this._chapterTweens[chapterNumber].jumpToEnd();
			this._currentChapter = chapterNumber;
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
		animChapters.forEach(function(ch) {
			scene.addChapterTweens( new ChapterTweens( ch ) );
		});

		scene.jumpToChapter(0);
		scene.start();
		animate();

		// DEBUG
		window.scene = scene;

		function animate() {
		    requestAnimationFrame(animate);
		    TWEEN.update();
		}

	}


}

module.exports = { boot: boot };
