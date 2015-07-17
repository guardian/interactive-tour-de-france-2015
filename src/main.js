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
	app.ref['bends'] =  app.scene.children[3].children[0]; // turns
	app.ref['contourLines'] =  app.scene.children[5].children[0]; // Contour
	app.ref['gpsLines'] = app.scene.children[4].children[0]; // route

	app.ref.gpsLines.material.opacity = 0;
	app.ref.gpsLines.material.linewidth = 3;
	app.scene.rotation.z = (Math.PI/180) * 90;
	app.scene.scale.z = 0.01;
	// app.ref.meshMount.material.opacity = 1;
	app.ref.meshMount.material.transparent = true;
	app.ref.bends.material.transparent = true;
	app.camera.far = 2000;

	// app.ref.contourLines.material.transparent = true;
	app.ref.contourLines.material.color = { r: 0, g: 0, b: 0 };
	app.ref.contourLines.material.opacity = 0.1;

	app.ref.gpsLines.material.transparent = true;

	var chapters = require('./data/chapterData.js');
	var Scene = require('./js/scene.js');
	var scene = new Scene(el, modalEl, chapters, app);

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
		var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('/imgs/defuse_mid.jpg') });
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
