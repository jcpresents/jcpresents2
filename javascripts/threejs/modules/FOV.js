function init() {
	camera.old = {};
	camera.old.viewportWidth = window.innerWidth;
	camera.old.viewportHeight = window.innerHeight;
	camera.old.aspectRatio = window.innerWidth / window.innerHeight;
	camera.old.vertFOV = 35;
	camera.old.horizFOV = calculateHorizFOV( camera.old );
}

function calculateHorizFOV( obj ) {
	let radVertFOV = obj.vertFOV * Math.Pi/180;
	let radHorizFOV = 2 * Math.atan( Math.tan(radVertFOV/2) * obj.aspectRatio);
	let horizFOV = radHorizFOV * 180/Math.Pi;
	return horizFOV;
} 

function onWindowResize() {

	let camera = obj.Camera;
	let oldHeight = camera.old.viewportHeight;
	let oldWidth = camera.old.viewportWidth;
	let newHeight = window.innerHeight;
	let newWidth = window.innerWidth;

	camera.old.viewportHeight = newHeight;
	camera.old.viewportWidth = newWidth;
	camera.old.aspectRatio = newWidth / newHeight;

	let oldRadFOV = camera.old.vertFOV * Math.Pi/180;
	let newRadVertFOV = 2*Math.atan( Math.tan(oldRadFOV/2) * newHeight/oldHeight);
	camera.old.vertFOV = newRadVertFOV * 180/Math.Pi;
	
	let radVertFOV = camera.old.vertFOV * Math.Pi/180;
	let radHorizFOV = 2 * Math.atan( Math.tan(radVertFOV/2) * newHeight/oldHeight);
	camera.old.horizFOV = radHorizFOV * 180/Math.Pi;
	
	if ( camera.old.aspectRatio < 1 )
	{
		camera.aspect = 1;
		camera.zoom = 0.65;
	}
	else {
		camera.aspect = 1.78;
		camera.zoom = 1;
	}
	camera.updateProjectionMatrix();
	obj.Renderer.setSize( window.innerWidth, window.innerHeight );
}