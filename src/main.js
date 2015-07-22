var url = require('./js/utils/url.js');
var html = require('./html/base.html');
var animsJSON = require('./data/chapterAnims.json');
var Q3D = require('./js/libs/Qgis2threejs.js');
var project = require('./data/qgis3d-data');
var datView = require('./js/datView.js')
var _ = require('underscore');
var msgpack = require('msgpack-js-browser');
var detect = require('./js/utils/detect.js');
var THREE = require('three');
var JSONLoader = require('./js/libs/JSONLoader.js')(THREE);

var debug = url.hasParameter('debug');
var viewportDimensions = detect.getViewport();

var webGLEnabled = (function () {
	try {
		var canvas = document.createElement( 'canvas' );
		return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) ); }
		catch ( e ) { return false; }
	})();

 console.log('webGL support', webGLEnabled);

var loaderEl;
var countEl;
var totalEl;


 if (url.hasParameter('fallback')) {
 	webGLEnabled = false;
 }

var mountainMesh;

function buildScene(el, mountainMesh) {
	el.classList.remove('loading');
	el.classList.add('loaded');
	var modalEl = el.querySelector('.gv-modal');

	var container = document.getElementById('webgl');
	container.style.height = viewportDimensions.height + 'px';
	container.style.width = '100%';
	Q3D.Options.bgcolor = '#ffffff';

	var wrapperEl = el.querySelector('.gv-wrapper');
	wrapperEl.style.height = viewportDimensions.height + 'px';

	var app = Q3D.application;
	app.webGLEnabled = webGLEnabled;
	app.init(container);
	app.loadProject(project);
	app.addEventListeners();

	// FIXME: Expose for debugging
	window.app = app;

	// Add custom mountain mesh
	app.scene.add(mountainMesh);

	// Labels
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
		el.innerHTML = '<p class="gv-label-title">' + label[0] + '<span class="gv-label-elv">'  + label[3] + 'm</span></p>';
		app.labelsEl.appendChild(el);
		return el;
	});


	// Fix transparency
	app.renderer.sortObjects = false

	// Store references
	app.ref = {};
	app.ref['meshMount'] = mountainMesh;
	app.ref['bendGroup'] =  app.scene.children[3]; // turns
	app.ref['bends'] =  app.scene.children[3].children[0]; // turns
	app.ref['contourLines'] =  app.scene.children[5].children[0]; // Contour
	app.ref['gpsLines'] = app.scene.children[4].children[0]; // route
	app.ref['gpsLinesGroup'] = app.scene.children[4]; // route
	app.ref['labels'] = app.labelsEl; // Bend labels

	// app.ref.gpsLinesGroup.position.z = 0.1;
	app.ref.gpsLines.material.depthTest = false;


	// Add POI
	var geometry = new THREE.SphereGeometry( 5, 32, 32 );
	var material = new THREE.MeshBasicMaterial( {color: '#00aeff', transparent: true, opacity: 0 } );
	app.ref.poi1 = new THREE.Mesh( geometry, material );
	app.ref.poi1.scale.set(1.8,1.8, 1 );
	app.ref.poi1.position.set(-14, -22, 1);
	app.scene.add( app.ref.poi1 );


	app.ref.poi2 = new THREE.Mesh( geometry, material );
	app.ref.poi2.scale.set(1.8,1.8, 1 );
	app.ref.poi2.position.set(-2, -6, 9);
	app.scene.add( app.ref.poi2 );


	app.ref.poi3 = new THREE.Mesh( geometry, material );
	app.ref.poi3.scale.set(0.4, 0.4, 0.3 );
	app.ref.poi3.position.set(8.9, 9.3, 14.3);
	app.scene.add( app.ref.poi3 );

	app.ref.poi4 = new THREE.Mesh( geometry, material );
	app.ref.poi4.scale.set(2, 0.4, 0.3 );
	app.ref.poi4.position.set(14, 24, 19.6);
	app.ref.poi4.rotation.z = -0.1;
	app.scene.add( app.ref.poi4 );


	app.ref.poi5 = new THREE.Mesh( geometry, material );
	app.ref.poi5.scale.set(0.4, 0.4, 0.3 );
	app.ref.poi5.position.set(28, 31.8, 21);
	app.ref.poi5.rotation.z = -0.1;
	app.scene.add( app.ref.poi5 );




	app.ref.gpsLines.material.opacity = 0;
	app.ref.gpsLines.material.linewidth = 3;
	app.scene.rotation.z = (Math.PI/180) * 90;
	app.scene.scale.z = 0.01;




	// app.ref.meshMount.material.transparent = true;
	app.ref.bends.material.transparent = true;
	app.camera.far = 2000;

	app.ref.contourLines.material.transparent = true;
	// app.ref.contourLines.material.color = { r: 100, g: 100, b: 100 };
	// app.ref.contourLines.material.transparent = true;
	app.ref.contourLines.material.opacity = 0.1;

	app.ref.gpsLines.material.transparent = true;
	app.ref.gpsLines.material.color = { r: 255, g: 0, b: 255 };

	// app.ref.bends.material.color = { r: 255, g: 230, b: 0 };
	app.ref.bends.material.visible = false;


	var chapters = require('./data/chapterData.js');
	var Scene = require('./js/scene.js');
	var scene = new Scene(el, modalEl, chapters, app);
	scene.start();

	app.start();

	// DAT GUI
	if (debug) {
		datView.init(app, animsJSON);
	}
}


function boot(el) {
	el.classList.add('loading');
	el.innerHTML = html;
	loaderEl = el.querySelector('.gv-loader');
	countEl = el.querySelector('.gv-progress-count');
	totalEl = el.querySelector('.gv-progress-total');


	if (viewportDimensions.width <= 480) {
		el.classList.add('gv-mobile');
	}

	if (webGLEnabled) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/data/mesh.pack', true);
		xhr.responseType = 'arraybuffer';

		countEl.innerHTML = '0';
		totalEl.innerHTML = '2';

		xhr.onload = function( e ) {
			console.log('Mesh pack loaded');
			countEl.innerHTML = '1';
			totalEl.innerHTML = '2';

			loaderEl.setAttribute('style', '');

			var decoded = msgpack.decode( this.response );
			var loader = new JSONLoader();
			var parsedMountain = loader.parse(decoded);

			var imageSrc = '/imgs/defuse_mid.jpg';
			if (viewportDimensions.width > 480 ) {
				imageSrc = '/imgs/defuse_mid.jpg';
				console.log('Upgrading to mid texture');
			}
			if (viewportDimensions.width > 1020 ) {
				imageSrc = '/imgs/defuse_large.jpg';
				console.log('Upgrading to large texture', viewportDimensions.width);
			}

			// Enable CORs for images
			THREE.ImageUtils.crossOrigin = '';

			var imageTexture = THREE.ImageUtils.loadTexture(imageSrc, {}, function() {
				console.log('Texture image loaded');
				countEl.innerHTML = '2';
				totalEl.innerHTML = '2';
				buildScene(el, mountainMesh);
			});

			var material = new THREE.MeshPhongMaterial( { map: imageTexture });
			var mountainMesh = new THREE.Mesh( parsedMountain.geometry, material );

			mountainMesh.rotation.x = (Math.PI / 180) * 90;
			mountainMesh.rotation.y = (Math.PI / 180) * 90 * -1;
			mountainMesh.position.z = 13
			mountainMesh.position.x = 13
		};

		xhr.send();
	} else {

		var modalEl = el.querySelector('.gv-modal');

		var chapters = require('./data/chapterData.js');
		var PXloader = require('./js/libs/pxloader.js');
		var loader = new PXloader();

		chapters.forEach(function(chapter) {
			if (viewportDimensions.width <= 480) {
				var index = chapter.image.lastIndexOf('.');
				chapter.image = chapter.image.substr(0,index) + '_mobile' + chapter.image.substr(index);
				chapter.image = chapter.image
			}

			chapter.imgEl = loader.addImage(chapter.image);
		})

		var Scene = require('./js/scene.js');
		var app = {};
		app.webGLEnabled = webGLEnabled;

		loader.addProgressListener(function(e) {
			countEl.innerHTML = e.completedCount;
			totalEl.innerHTML = e.totalCount;
		});

		loader.addCompletionListener(function() {
			loaderEl.setAttribute('style', '');
			console.log('all images downloaded');
			loaderEl.style.opacity = 0;
			el.classList.remove('loading');
			el.classList.add('loaded');
			var scene = new Scene(el, modalEl, chapters, app);
			scene.start();
		}.bind(this));

		loader.start();



	}

}

module.exports = { boot: boot };
