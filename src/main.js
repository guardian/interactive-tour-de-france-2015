var url = require('./js/utils/url.js');
var html = require('./html/base.html');
var modalHTML = require('./html/modal.html');
var animsJSON = require('./data/chapterAnims.json');
var Q3D = require('./js/libs/Qgis2threejs.js');
var project = require('./data/qgis3d-data');
var datView = require('./js/datView.js')
var _ = require('underscore');
var msgpack = require('msgpack-js-browser');

var THREE = require('three');
var JSONLoader = require('./js/libs/JSONLoader.js')(THREE);


var mountainMesh;


function buildScene(el, mountainMesh) {
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

	app.scene.add(mountainMesh);


	app.ref = {};
	app.ref['meshMount'] = mountainMesh;
	app.ref['bendGroup'] =  app.scene.children[3]; // turns
	app.ref['bends'] =  app.scene.children[3].children[0]; // turns
	app.ref['contourLines'] =  app.scene.children[5].children[0]; // Contour
	app.ref['gpsLines'] = app.scene.children[4].children[0]; // route

	app.ref.gpsLines.material.opacity = 0;
	app.ref.gpsLines.material.linewidth = 3;
	app.scene.rotation.z = (Math.PI/180) * 90;
	app.scene.scale.z = 0.01;

	// app.ref.meshMount.material.transparent = false;
	app.ref.bends.material.transparent = true;
	app.camera.far = 2000;

	// app.ref.contourLines.material.transparent = true;
	app.ref.contourLines.material.color = { r: 0, g: 0, b: 0 };
	// app.ref.contourLines.material.transparent = true;
	app.ref.contourLines.material.opacity = 0.1;

	app.ref.gpsLines.material.transparent = true;


	var chapters = require('./data/chapterData.js');
	var Scene = require('./js/scene.js');
	var scene = new Scene(el, modalEl, chapters, app);



	app.labelsEl = document.querySelector('.gv-labels');

	app.labels = [
		[21,45.071856,6.039285,806],
		[20,45.066445,6.042247,880],
		[19,45.067962,6.042078,900],
		[18,45.065939,6.043161,922],
		[17,45.068889,6.042865,965],
		[16,45.067178,6.043902,980],
		[15,45.071921,6.048143,1025],
		[14,45.070944,6.04427,1055],
		[13,45.072436,6.051228,1120],
		[12,45.074783,6.047631,1161],
		[11,45.073262,6.052122,1195],
		[10,45.076666,6.047363,1245],
		[9,45.07478,6.052444,1295],
		[8,45.077914,6.047792,1345],
		[7,45.077074,6.05331,1390],
		[6,45.082275,6.062314,1490],
		[5,45.083707,6.057593,1512],
		[4,45.083596,6.062638,1553],
		[3,45.088165,6.05584,1626],
		[2,45.088695,6.060451,1660],
		[1,45.091468,6.055367,1713],
	];

	app.labelEls = app.labels.map(function(label) {
		var el = document.createElement('div');
		el.classList.add('gv-label');
		el.innerHTML = '<p class="gv-label-title">' + label[0] + '<span class="gv-label-elv">Elevation '  + label[3] + '</span></p>';
		app.labelsEl.appendChild(el);
		return el;
	});

	scene.start();




	// DAT GUI
	if (url.hasParameter('debug')) {
		datView.init(app, animsJSON);
	}
}


function boot(el) {

	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/data/mesh.pack', true);
	xhr.responseType = 'arraybuffer';

	xhr.onload = function( e ) {
		var decoded = msgpack.decode( this.response );
		var loader = new JSONLoader();
		var parsedMountain = loader.parse(decoded);
		var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('/imgs/defuse_large.jpg') });
		//new THREE.MeshNormalMaterial()
		var mountainMesh = new THREE.Mesh( parsedMountain.geometry, material );

		mountainMesh.rotation.x = (Math.PI / 180) * 90;
		mountainMesh.rotation.y = (Math.PI / 180) * 90 * -1;
		mountainMesh.position.z = 13
		mountainMesh.position.x = 13

		buildScene(el, mountainMesh)

	};

	xhr.send();

}

module.exports = { boot: boot };
