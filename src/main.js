var url = require('./js/utils/url.js');
var html = require('./html/base.html');
var modalHTML = require('./html/modal.html');
//var Timeline = require('./js/libs/timeline.js');
var Q3D = require('./js/libs/Qgis2threejs.js');
var project = require('./data/qgis3d-data');
var datView = require('./js/datView.js')
var _ = require('underscore');


function boot(el) {
	'use strict';

	el.innerHTML = html;
	var modalEl = el.querySelector('.gv-modal');
	modalEl.innerHTML = modalHTML;

	var container = document.getElementById('webgl');
	container.style.height = '100vh';
	container.style.width = '100%';
	Q3D.Options.bgcolor = '#ffffff';

	var app = Q3D.application;
	app.init(container);
	app.loadProject(project);
	app.addEventListeners();
	app.start();


	// Fix sizing
	setTimeout(app.eventListener.resize.bind(app), 1000);

	window.app = app;

	app.ref = {};
	app.ref['meshMount'] = app.scene.children[3].children[0];
	app.ref['bends'] =  app.scene.children[4].children[0]; // turns
	app.ref['contourLines'] =  app.scene.children[6].children[0]; // Contour
	app.ref['gpsLines'] = app.scene.children[5].children[0]; // route

	app.ref.gpsLines.material.opacity = 0;
	app.ref.gpsLines.material.linewidth = 3;
	app.scene.rotation.z = (Math.PI/180) * 90;
	app.scene.scale.z = 0.01;
	app.ref.meshMount.material.opacity = 1;
	app.ref.meshMount.material.transparent = true;
	app.ref.bends.material.transparent = true;
	app.camera.far = 2000;


	// var anim = Timeline.anim;
	// anim("app.camera.position",app.camera.position).to({"x":10},0).to({"x":10},1.6342105263157896).to({"x":74},2.92078947368421).to({"x":74},3.4450000000000003, Timeline.Easing.Cubic.EaseInOut).to({"x":-33},3.26, Timeline.Easing.Cubic.EaseInOut);
	// anim("app.camera.position",app.camera.position).to({"y":0},0).to({"y":0},1.57).to({"y":-47},3, Timeline.Easing.Cubic.EaseInOut).to({"y":-47},3.469999999999999).to({"y":37},3.214736842105264);
	// anim("app.camera.position",app.camera.position).to({"z":90},0).to({"z":90},1.59).to({"z":27},3.05, Timeline.Easing.Cubic.EaseInOut).to({"z":27},0.802631578947369).to({"z":27},2.5373684210526317).to({"z":43},3.2799999999999994);
	// anim("app.ref.meshMount.material",app.ref.meshMount.material).to({"opacity":0},0).to({"opacity":0},1.1752941176470588).to({"opacity":0},6.448991596638654, Timeline.Easing.Cubic.EaseOut).to({"opacity":1},1.8128571428571423, Timeline.Easing.Cubic.EaseOut).to({"opacity":1},0.2352100840336142, Timeline.Easing.Cubic.EaseOut);
	// anim("app.ref.contourLines.material",app.ref.contourLines.material).to({"opacity":0},0).to({"opacity":0},0.77).to({"opacity":1},0.9550000000000001, Timeline.Easing.Cubic.EaseOut).to({"opacity":1},6.169285714285714).to({"opacity":0.2},1.4399999999999995);
	// anim("app.scene.scale",app.scene.scale).to({"z":0.1},0).to({"z":0.1},5.066470588235294).to({"z":1},2.302941176470588, Timeline.Easing.Quadratic.EaseInOut).to({"z":1},0.3834453781512597);
	// anim("app.ref.gpsLines.material",app.ref.gpsLines.material).to({"opacity":0},0).to({"opacity":0},1.71).to({"opacity":1},4.23, Timeline.Easing.Cubic.EaseOut);
	// Timeline.getGlobalInstance().loop(-1); //loop forever


	var chapters = require('./data/chapterData.js');
	var Scene = require('./js/scene.js');
	var scene = new Scene(el, modalEl, chapters, app);
	console.log(scene);
	scene.start();


	// DAT GUI
	if (url.hasParameter('debug')) {
		datView.init(app, chapterAnimJSON);
	}

}

module.exports = { boot: boot };
