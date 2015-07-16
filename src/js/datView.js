var DAT = require('dat-gui');

function init(app, chapterAnimJSON) {
	var gui = new DAT.GUI({ load: chapterAnimJSON });
	var duration = {duration: 0};
	gui.remember(duration);
	gui.add(duration, 'duration').min(0).max(60000);

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

	return gui;
}

module.exports = {
	init: init
};
