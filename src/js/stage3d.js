var url = require('./utils/url.js');
var animsJSON = require('../data/chapterAnims.json');
var Q3D = require('./libs/Qgis2threejs.js');
var project = require('../data/qgis3d-data');
var THREE = require('three');
var msgpack = require('msgpack-js-browser');
var JSONLoader = require('./libs/JSONLoader.js')(THREE);
var datView = require('./datView.js')
var app;
var mountainMesh;

function onImageLoad() {
    console.log('Texture image loaded');
    app.countEl.innerHTML = '2';
    app.totalEl.innerHTML = '2';
	app.el.classList.remove('loading');
	app.el.classList.add('loaded');
	app.modalEl = app.el.querySelector('.gv-modal');

	var container = app.el.querySelector('.webgl');
	container.style.height = app.viewportDimensions.height + 'px';
	container.style.width = '100%';
	Q3D.Options.bgcolor = '#ffffff';

	var Q3Dapp = Q3D.application;
	Q3Dapp.webGLEnabled = app.webGLEnabled;
	Q3Dapp.init(container);
	Q3Dapp.loadProject(project);
	Q3Dapp.addEventListeners();

	// Add custom mountain mesh
	Q3Dapp.scene.add(mountainMesh);

	// Labels
	Q3Dapp.labelsEl = document.querySelector('.gv-labels');
	Q3Dapp.labels = [
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
	Q3Dapp.labelEls = Q3Dapp.labels.map(function(label) {
		var el = document.createElement('div');
		el.classList.add('gv-label');
		el.innerHTML = '<p class="gv-label-title"><span class="gv-label-number">' + label[0] + '</span><span class="gv-label-elv">'  + label[3] + 'm</span></p>';
		Q3Dapp.labelsEl.appendChild(el);
		return el;
	});

	// Fix transparency
	Q3Dapp.renderer.sortObjects = false

	// Store references
	Q3Dapp.ref = {};
	Q3Dapp.ref['meshMount'] = mountainMesh;
	Q3Dapp.ref['bendGroup'] =  Q3Dapp.scene.children[0]; // turns
	Q3Dapp.ref['bends'] =  Q3Dapp.scene.children[0].children[0]; // turns
	Q3Dapp.ref['contourLines'] =  Q3Dapp.scene.children[2].children[0]; // Contour
	Q3Dapp.ref['gpsLines'] = Q3Dapp.scene.children[1].children[0]; // route
	Q3Dapp.ref['gpsLinesGroup'] = Q3Dapp.scene.children[1]; // route
	Q3Dapp.ref['labels'] = Q3Dapp.labelsEl; // Bend labels

	// app.ref.gpsLinesGroup.position.z = 0.1;
	Q3Dapp.ref.gpsLines.material.depthTest = false;

	// Add POI
	var geometry = new THREE.SphereGeometry( 5, 32, 32 );
	var material = new THREE.MeshBasicMaterial( {color: '#00aeff', transparent: true, opacity: 0 } );
	Q3Dapp.ref.poi1 = new THREE.Mesh( geometry, material );
	Q3Dapp.ref.poi1.scale.set(1.8,1.8, 1 );
	Q3Dapp.ref.poi1.position.set(-14, -22, 1);
	Q3Dapp.scene.add( Q3Dapp.ref.poi1 );

	Q3Dapp.ref.poi2 = new THREE.Mesh( geometry, material );
	Q3Dapp.ref.poi2.scale.set(1.8,1.8, 1 );
	Q3Dapp.ref.poi2.position.set(-2, -6, 9);
	Q3Dapp.scene.add( Q3Dapp.ref.poi2 );

	Q3Dapp.ref.poi3 = new THREE.Mesh( geometry, material );
	Q3Dapp.ref.poi3.scale.set(0.4, 0.4, 0.3 );
	Q3Dapp.ref.poi3.position.set(8.9, 9.3, 14.3);
	Q3Dapp.scene.add( Q3Dapp.ref.poi3 );

	Q3Dapp.ref.poi4 = new THREE.Mesh( geometry, material );
	Q3Dapp.ref.poi4.scale.set(2, 0.4, 0.3 );
	Q3Dapp.ref.poi4.position.set(14, 24, 19.6);
	Q3Dapp.ref.poi4.rotation.z = -0.1;
	Q3Dapp.scene.add( Q3Dapp.ref.poi4 );

	Q3Dapp.ref.poi5 = new THREE.Mesh( geometry, material );
	Q3Dapp.ref.poi5.scale.set(0.4, 0.4, 0.3 );
	Q3Dapp.ref.poi5.position.set(28, 31.8, 21);
	Q3Dapp.ref.poi5.rotation.z = -0.1;
	Q3Dapp.scene.add( Q3Dapp.ref.poi5 );

	Q3Dapp.ref.gpsLines.material.opacity = 0;
	Q3Dapp.ref.gpsLines.material.linewidth = 3;
	Q3Dapp.scene.rotation.z = (Math.PI/180) * 90;
	Q3Dapp.scene.scale.z = 0.01;


	Q3Dapp.ref.bends.material.transparent = true;
	Q3Dapp.camera.far = 2000;
	Q3Dapp.ref.contourLines.material.transparent = true;
	Q3Dapp.ref.contourLines.material.opacity = 0.1;
	Q3Dapp.ref.contourLines.material.color.setHex(0xCCCCCC );
	Q3Dapp.ref.gpsLines.material.transparent = true;
	Q3Dapp.ref.gpsLines.material.color.setHex(0xFF00FF );
	Q3Dapp.ref.bends.material.visible = false;


	if ( url.hasParameter('debug') ) {
		Q3Dapp.isAnimating = true;
		app.wrapperEl.style.display = 'none';
		container.style.position = 'relative';
		datView.init(Q3Dapp, animsJSON);
		Q3Dapp.start();
	} else {
		var chapters = require('../data/chapterData.js');
		var Scene = require('./scene.js');
		var scene = new Scene(app.el, app.modalEl, chapters, Q3Dapp);
		scene.start();
	}
}


function onLoaded(event) {
    app.countEl.innerHTML = '1';
    app.totalEl.innerHTML = '2';
    app.loaderEl.setAttribute('style', '');

    var decoded = msgpack.decode( event.target.response );
    var loader = new JSONLoader();
    var parsedMountain = loader.parse(decoded);

    var imageSrc = '/imgs/defuse_mid.jpg';
    if (app.viewportDimensions.width > 480 ) {
        imageSrc = '/imgs/defuse_mid.jpg';
        console.log('Upgrading to mid texture');
    }
    if (app.viewportDimensions.width > 1020 ) {
        imageSrc = '/imgs/defuse_large.jpg';
        console.log('Upgrading to large texture', app.viewportDimensions.width);
    }

    // Enable CORs for images
    THREE.ImageUtils.crossOrigin = '';
    var imageTexture = THREE.ImageUtils.loadTexture(imageSrc, {}, onImageLoad);
    var material = new THREE.MeshBasicMaterial( { map: imageTexture });
    mountainMesh = new THREE.Mesh( parsedMountain.geometry, material );
    mountainMesh.rotation.x = (Math.PI / 180) * 90;
    mountainMesh.rotation.y = (Math.PI / 180) * 90 * -1;
    mountainMesh.position.z = 13
    mountainMesh.position.x = 13
}

function init(mainapp) {
    app = mainapp;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/data/alpe-dhuez.pack', true);
    xhr.responseType = 'arraybuffer';
    app.countEl.innerHTML = '0';
    app.totalEl.innerHTML = '2';
    xhr.onload = onLoaded.bind(this);
    xhr.send();
}

module.exports = {
    init: init
};
