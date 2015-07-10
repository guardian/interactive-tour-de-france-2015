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

	var container = document.getElementById("webgl");
	container.style.height = '80vh';
	Q3D.Options.bgcolor = '#ffffff';
	var app = Q3D.application;
	app.init(container);

	// load the project
	app.loadProject(project);
	app.addEventListeners();
	app.start();

	window.app = app;

	var meshMount = app.scene.children[3].children[0];
	var gpsLines = app.scene.children[4].children[0];
	var contourLines = app.scene.children[5].children[0];

	gpsLines.material.opacity = 0;
	gpsLines.material.transparent = true;
	gpsLines.material.linewidth = 3;

	app.scene.rotation.z = (Math.PI/180) * 90;
	app.scene.scale.z = 0.01;
	meshMount.material.opacity = 1;
	meshMount.material.transparent = true;
	// Extend clip
	app.camera.far = 2000;

	var anim = Timeline.anim;

	anim("app.camera.position",app.camera.position).to({"x":10},0).to({"x":10},1.575).to({"x":74},2.9799999999999995).to({"x":74},3.4450000000000003, Timeline.Easing.Cubic.EaseInOut).to({"x":-33},3.26, Timeline.Easing.Cubic.EaseInOut);
	anim("app.camera.position",app.camera.position).to({"y":0},0).to({"y":0},1.57).to({"y":-47},3, Timeline.Easing.Cubic.EaseInOut).to({"y":-47},3.469999999999999).to({"y":37},3.280000000000001);
	anim("app.camera.position",app.camera.position).to({"z":160},0).to({"z":160},1.59).to({"z":27},3.05, Timeline.Easing.Cubic.EaseInOut).to({"z":27},3.3400000000000007).to({"z":43},3.2799999999999994);
	anim("meshMount.material",meshMount.material).to({"opacity":1},0).to({"opacity":0},1.1752941176470588).to({"opacity":0},6.448991596638654, Timeline.Easing.Cubic.EaseOut).to({"opacity":1},1.8128571428571423, Timeline.Easing.Cubic.EaseOut).to({"opacity":1},0.2352100840336142, Timeline.Easing.Cubic.EaseOut);
	anim("contourLines.material",contourLines.material).to({"opacity":0},0).to({"opacity":0},0.77).to({"opacity":1},0.9550000000000001, Timeline.Easing.Cubic.EaseOut).to({"opacity":1},6.169285714285714).to({"opacity":0.2},1.4399999999999995);
	anim("app.scene.scale",app.scene.scale).to({"z":0.1},0).to({"z":0.1},5.066470588235294).to({"z":1},2.302941176470588, Timeline.Easing.Quadratic.EaseInOut).to({"z":1},0.3834453781512597);
	anim("gpsLines.material",gpsLines.material).to({"opacity":0},0).to({"opacity":0},1.71).to({"opacity":1},4.23, Timeline.Easing.Cubic.EaseOut);

	Timeline.getGlobalInstance().loop(-1); //loop forever

}

module.exports = { boot: boot };
