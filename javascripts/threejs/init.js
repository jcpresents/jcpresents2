import * as THREE from './javascripts/threejs/three.module.js';
import * as dat from './javascripts/threejs/modules/dat.gui.module.js'
import { OrbitControls } from './javascripts/threejs/modules/OrbitControls.js';
import { GLTFLoader } from './javascripts/threejs/modules/GLTFLoader.js';
import { RoughnessMipmapper } from './javascripts/threejs/modules/RoughnessMipmapper.js';
import { Fire } from  "./javascripts/threejs/modules/Fire.js";

// Toggle Elements //
const loadAxis		= false;
const loadOrbCntrl	= false;
const loadTextures	= false;
const loadCube		= false;
const loadHallway	= true;
const loadHallAni	= false;
const loadLights	= true;
const loadFire		= true;
const loadGUI		= false;
const loadLogs		= true;

// Misc Globals //
const obj = { Meshes: {}, Lights: {} }; // Object Map //
const sceneFPS = 30;

init();
function init() {
	// Toggle Elements //
	var loadAxis = false;
	var loadGUI = false;
	var loadLogs = true;
	var loadOrbitControls = false;

	// Load View-port //
	const canvas = document.querySelector('#viewport');
	obj.Renderer = new THREE.WebGLRenderer({canvas, antialias: true});
	obj.Renderer.physicallyCorrectLights = true;
	obj.Renderer.setPixelRatio(window.devicePixelRatio);
	obj.Renderer.setSize( window.innerWidth, window.innerHeight );
	obj.Renderer.setClearColor("#000000"); // Background-Color
	obj.Scene = new THREE.Scene();
	obj.Clock = new THREE.Clock();
	


	// Load Entities //
	if(loadTextures) load_Textures();// Textures
	if(loadCube)	 load_Cube();	 // Test Cube
	if(loadHallway)	 load_Hallway(); // Meshes
	if(loadLights)	 load_Lights();	 // Lights
	if(loadFire)	 load_Fire();	 // Torch Flames
	if(loadGUI)		 load_GUI();	 // Settings GUI
	
	// Load Camera //
	var camera = obj.Camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 500 ); // Parameters: (fov, aspect, near, far)
	camera.position.set( 0.0, 1.5, 8.3 ); // (x,y,z)
	window.addEventListener( 'resize', onWindowResize ); // Run onWindowResize function when window size changes
	window.setTimeout( onWindowResize, 2000 ); // Initial camera sizing
	
	if(loadOrbCntrl) {
		let controls = new OrbitControls( camera, obj.Renderer.domElement ); // Set Camera Orbit Controls
		controls.update();
	}
	camera.rotation.set( 0.0, 0.0, 0.0 ); // (x,y,z) Reset camera rotation
	
	// Load 3D Axis //
	if(loadAxis) {
		obj.AxisHelper = new THREE.AxesHelper(5);
		obj.AxisHelper.position.set( 0.0, 0.1, 0.0 );
		obj.AxisHelper.visible = true;
		obj.Scene.add(obj.AxisHelper);
	}
	
	render();						 // Render Scene

	// Misc //
	if(loadLogs) window.setTimeout( load_Logs, 2000 );	// Wait 1 second then dump object map to log
	window.addEventListener( 'resize', onWindowResize );// Run onWindowResize function when window size changes
}

function load_Hallway() {

	const gltfLoader = new GLTFLoader();
	gltfLoader.load('models/hallway7.glb', function (gltf) {

		var model = obj.Meshes.Hallway = gltf.scene;
		model.scale.set( 0.5, 0.5, 0.5 );
		model.position.set( 0.0, 0.0, 0.0 );
		obj.Scene.add(model);
		obj.Meshes.Hallway.children[0].visible = true;
		obj.Meshes.Hallway.children[1].visible = true;
		obj.Meshes.Hallway.children[2].visible = true;

		if (loadHallAni) {
			obj.Mixer = new THREE.AnimationMixer( gltf.scene );
			gltf.animations.forEach( (clip) => {
				obj.Mixer.clipAction(clip).play();
			});

			obj.Animations = gltf.animations;
		}
	});	
}

/* Defunct; we're not using textures but this all works fine //////
// Load Textures ///////////////////////////////////////////////////////////////////////
function load_Textures() {
	
 	const txtLoader = obj.Loader = new THREE.TextureLoader();
	
 	obj.Loader.load('./mdls/textures/marble3.png', function(tex) {
 		obj.Marble = new THREE.MeshStandardMaterial( { map: tex, side:THREE.DoubleSide, color: 0xffffff } );
 		}
 	  );

 	obj.Loader.load('./mdls/textures/grout_diff.png', function(tex) {
 		obj.GroutDiff = new THREE.MeshStandardMaterial( { map: tex, side:THREE.DoubleSide, color: 0xffffff } );
 		}
 	  );  

 	obj.Loader.load('./mdls/textures/floor1.png', function(tex) {
 		obj.Floor = new THREE.MeshStandardMaterial( { map: tex, side:THREE.DoubleSide, color: 0xffffff } );
 		}
 	  );  
	  

}
*/

// Generates Cube ///////////////////////////////////////////////////////////////////
function load_Cube() {
	// Load Textures //
	const map = new THREE.TextureLoader().load( './mdls/textures/test_diff.png' );
	const normalMap = new THREE.TextureLoader().load( './mdls/textures/test_nrml.png' );
	const diffuse = new THREE.MeshStandardMaterial( { map: map } );
	const normal = new THREE.MeshNormalMaterial( { normalMap } );
	diffuse.normalMap = normalMap;
	diffuse.wrapS = THREE.RepeatWrapping;
	diffuse.wrapT = THREE.RepeatWrapping;
	map.repeat.set( 0.5, 0.5 );
	normalMap.normalScale =( 100, 100 );

	const geometry = new THREE.BoxGeometry( 0.7, 0.7, 0.7, 32, 32, 32 ); // Parameters: (boxWidth, boxHeight, boxDepth)
	load_morphProperties(geometry);

	var cube = obj.Meshes.Cube = new THREE.Mesh(geometry, diffuse);
	cube.position.set( 0.0, 2.0, 0.0 );
	// cube.visible = false;
	obj.Scene.add(cube);
}

// I don't understand any of this, and thus I fear it //////
// Generates Morph Properties ///////////////////////////////////////////////////////
function load_morphProperties(geometry) {
	// create an empty array to  hold targets for the attribute we want to morph
	// morphing positions and normals is supported
	geometry.morphAttributes.position = [];

	// the original positions of the cube's vertices
	const positionAttribute = geometry.attributes.position;

	// for the first morph target we'll move the cube's vertices onto the surface of a sphere
	const spherePositions = [];

	// for the second morph target, we'll twist the cubes vertices
	const twistPositions = [];
	const direction = new THREE.Vector3( 1, 0, 0 );
	const vertex = new THREE.Vector3();

	for ( let i = 0; i < positionAttribute.count; i ++ ) {

		const x = positionAttribute.getX(i);
		const y = positionAttribute.getY(i);
		const z = positionAttribute.getZ(i);

		spherePositions.push(
			x * Math.sqrt( 1 - ( y * y / 2 ) - ( z * z / 2 ) + ( y * y * z * z / 3 ) ),
			y * Math.sqrt( 1 - ( z * z / 2 ) - ( x * x / 2 ) + ( z * z * x * x / 3 ) ),
			z * Math.sqrt( 1 - ( x * x / 2 ) - ( y * y / 2 ) + ( x * x * y * y / 3 ) )
		);

		vertex.set( x * 2, y, z ); // stretch along the x-axis so we can see the twist better
		vertex.applyAxisAngle( direction, Math.PI * x / 2 ).toArray( twistPositions, twistPositions.length );
	}

	geometry.morphAttributes.position[ 0 ] = new THREE.Float32BufferAttribute( spherePositions, 3 );	// add the spherical positions as the first morph target
	geometry.morphAttributes.position[ 1 ] = new THREE.Float32BufferAttribute( twistPositions, 3 );		// add the twisted positions as the second morph target
}

// Generate Lights //////////////////////////////////////////////////////////////////
function load_Lights() {
	
	var point = obj.Lights.PointL1 = new THREE.PointLight( 0xff0000, 8.83, 2.88, .23 ); // (colorInteger,intensityFloat,distance,decayFloat)
		point.position.set( -.97, 2.1, 6.2 ); // Parameters: (x,y,z)
		var pointLightHelper = obj.Meshes.PointLightHelper = new THREE.PointLightHelper( point, 0.5 ) // (pointLight,sphereSizeFloat,colorHex)
			pointLightHelper.visible = false;
			obj.Scene.add( point, pointLightHelper );
			
	var point = obj.Lights.PointR1 = new THREE.PointLight( 0xff0000, 8.83, 2.88, .23 ); // (colorInteger,intensityFloat,distance,decayFloat)
		point.position.set( .97, 2.1, 6.2 ); // Parameters: (x,y,z)
		var pointLightHelper = obj.Meshes.PointLightHelper = new THREE.PointLightHelper( point, 0.5 ) // (pointLight,sphereSizeFloat,colorHex)
			pointLightHelper.visible = false;
			obj.Scene.add( point, pointLightHelper );

	var point = obj.Lights.PointL2 = new THREE.PointLight( 0x170f02, .4, .89, 4.9 ); // (colorInteger,intensityFloat,distance,decayFloat)
		point.position.set( -.82, 2, 6.2 ); // Parameters: (x,y,z)
		var pointLightHelper = obj.Meshes.PointLightHelper = new THREE.PointLightHelper( point, 0.5 ) // (pointLight,sphereSizeFloat,colorHex)
			pointLightHelper.visible = false;
			obj.Scene.add( point, pointLightHelper );
			
	var point = obj.Lights.PointR2 = new THREE.PointLight( 0x170f02, .4, .89, 4.9 ); // (colorInteger,intensityFloat,distance,decayFloat)
		point.position.set( .82, 2, 6.2 ); // Parameters: (x,y,z)
		var pointLightHelper = obj.Meshes.PointLightHelper = new THREE.PointLightHelper( point, 0.5 ) // (pointLight,sphereSizeFloat,colorHex)
			pointLightHelper.visible = false;
			obj.Scene.add( point, pointLightHelper );
			
	/*
	var world = obj.Lights.World = new THREE.HemisphereLight( 0x808080, 0x080820, 0 ); // (skyColorInteger,groundColorInteger,intensityFloat)
		world.position.set( 0.0, 0.0, 0.0 ); // Parameters: (x,y,z)
		//obj.Scene.add( world );
}

function load_Fire() {

	obj.FireA = new Fire();
	obj.Scene.add( obj.FireA );
	obj.FireA.scale.set( 0.14, 0.29, 0.15 );
	obj.FireA.position.set( -0.89, 1.88, 6.17 );

	obj.FireB = new Fire();
	obj.Scene.add( obj.FireB );
	obj.FireB.scale.set( 0.14, 0.29, 0.15 );
	obj.FireB.position.set( 0.89, 1.88, 6.17 );
}

// Overlays GUI for settings tweaks /////////////////////////////////////////////////
function load_GUI() {

	const gui = new dat.GUI();
	const cameraHelper = gui.addFolder("Camera Controls");
	var camera = obj.Camera;
		cameraHelper.addFolder("Position");
			cameraHelper.add( camera.position, "x" ).min(-20).max(20).step(0.01);
			cameraHelper.add( camera.position, "y" ).min(-20).max(20).step(0.01);
			cameraHelper.add( camera.position, "z" ).min(-20).max(20).step(0.01);
		cameraHelper.addFolder("Rotation");
			cameraHelper.add( camera.rotation, "x" ).min(-1.5).max(1.5).step(0.01);
			cameraHelper.add( camera.rotation, "y" ).min(-1.5).max(1.5).step(0.01);
			cameraHelper.add( camera.rotation, "z" ).min(-1.5).max(1.5).step(0.01);
		cameraHelper.addFolder("FOV");
			cameraHelper.add( camera, "near").min(-5).max(5);
			cameraHelper.add( camera, "far" ).min(-5).max(5);
			cameraHelper.add( camera, "fov" ).min(-5).max(55);

	const lightHelper = gui.addFolder("Lighting");
		var point = obj.Lights.PointL2;
		lightHelper.addFolder("Point Light");
			lightHelper.add( point.position, "x" ).min(-20).max(20).step(0.01);
			lightHelper.add( point.position, "y" ).min(-20).max(20).step(0.01);
			lightHelper.add( point.position, "z" ).min(-20).max(20).step(0.01);
			lightHelper.add( point, "intensity" ).min(0).max(15).step(0.01);
			lightHelper.add( point, "distance" ).min(0).max(15).step(0.01);
			lightHelper.add( point, "decay" ).min(0).max(15).step(0.01);
			// lightHelper.addColor( point, 'color' );
		var point2 = obj.Lights.PointL1;
		lightHelper.addFolder("Point Light2");
			lightHelper.add( point2.position, "x" ).min(-20).max(20).step(0.01);
			lightHelper.add( point2.position, "y" ).min(-20).max(20).step(0.01);
			lightHelper.add( point2.position, "z" ).min(-20).max(20).step(0.01);
			lightHelper.add( point2, "intensity" ).min(0).max(15).step(0.01);
			lightHelper.add( point2, "distance" ).min(0).max(15).step(0.01);
			lightHelper.add( point2, "decay" ).min(0).max(15).step(0.01);
		/*var world = obj.Lights.World;
			lightHelper.add( world, "intensity" ).min(0).max(10).step(0.001);
			lightHelper.addColor( world, 'color' );
		*/
		
	const objectHelper = gui.addFolder("Objects");
		objectHelper.addFolder("Cube");
			const params = {
				Spherify: 0,
				Twist: 0,
			};
			objectHelper.add( params, 'Spherify', 0, 1 ).step(0.01).onChange( function ( value ) {
				obj.Meshes.Cube.morphTargetInfluences[ 0 ] = value;
			} );
			objectHelper.add( params, 'Twist', 0, 1 ).step(0.01).onChange( function ( value ) {
				obj.Meshes.Cube.morphTargetInfluences[ 1 ] = value;
			} );
			objectHelper.add( obj.Meshes.Cube, "visible" );
		objectHelper.addFolder("3D Axis");
			objectHelper.add( obj.AxisHelper, "visible" );
		objectHelper.addFolder("PointLight Helper");
			objectHelper.add( obj.Meshes.PointLightHelper, "visible" );
		objectHelper.addFolder("Fire 1");
			objectHelper.add( obj.FireA, "visible" );
			objectHelper.add( obj.FireA.position, "x" ).min(-20).max(20).step(0.01);
			objectHelper.add( obj.FireA.position, "y" ).min(-20).max(20).step(0.01);
			objectHelper.add( obj.FireA.position, "z" ).min(-20).max(20).step(0.01);
}

// Initiates Rendering of Objects ///////////////////////////////////////////////////
function render(time) {

	requestAnimationFrame(render);
	var delta = obj.Clock.getDelta();
	if ( loadHallAni && obj.Mixer ) obj.Mixer.update(delta);
	if (loadFire) {
		obj.FireA.FireUpdate(performance.now() / 1000);
		obj.FireB.FireUpdate(performance.now() / 1000);
	}
	obj.Renderer.render( obj.Scene, obj.Camera );
}

// Resize viewport when size changes ////////////////////////////////////////////////
function onWindowResize() {
	// Use percentage calculation to get "FOV" and "Zoom" based on "Aspect Ratio"
	let aspectRatio = obj.Camera.aspect = window.innerWidth / window.innerHeight;
	let fov = ( ( window.innerWidth / window.innerHeight ) * 35 ) / 1.96;
	//("Current Aspect Ratio" * "Base FOV") / "Base AR"

	if( aspectRatio >= 1 )
		var zoom = ( ( window.innerWidth / window.innerHeight ) * 1 ) / 1.96;
	else if ( aspectRatio < 1 ) {
		var zoom = ( ( window.innerWidth / window.innerHeight ) * 0.35 ) / 1.96;
	}

	obj.Camera.fov = fov;
	obj.Camera.zoom = zoom;

	obj.Camera.updateProjectionMatrix();
	obj.Renderer.setSize( window.innerWidth, window.innerHeight );
}

// Prepares GLTF Object Tree ////////////////////////////////////////////////////////
function dumpObject(obj, lines = [], isLast = true, prefix = '') {

	const localPrefix = isLast ? '└─' : '├─';
	lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
	const newPrefix = prefix + (isLast ? '  ' : '│ ');
	const lastNdx = obj.children.length - 1;
	obj.children.forEach((child, ndx) => {
		const isLast = ndx === lastNdx;
		dumpObject( child, lines, isLast, newPrefix );
	});
	return lines;
}

// Logs Object Trees /////////////////////////////////////////////////////////////////
function load_Logs() {

	console.log(dumpObject(obj.Meshes.Hallway).join('\n'));
	console.log( 'Hallway Map', obj.Meshes.Hallway.children );
	console.log( 'Object Map', obj );
}
