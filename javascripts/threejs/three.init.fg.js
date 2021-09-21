import * as THREE from './three.module.js';
import * as dat from './modules/dat.gui.module.js'
import { OrbitControls } from './modules/OrbitControls.js';
import { GLTFLoader } from './modules/GLTFLoader.js';
import { RoughnessMipmapper } from './modules/RoughnessMipmapper.js';
import { Fire } from  "./modules/Fire.js";

// Constants //
const sceneFPS		= 30;		// FPS Cap
const loadAxis		= false;	// Enable Axis Helper
const loadOrbCntrl	= false;	// Enable Orbit Controls
const loadTextures	= false;	// Enable Textures
const loadCube		= false;	// Enable Test Cube
const loadHallway	= true;		// Enable Hallway
const loadHallAni	= false;	// Enable Hallway Animations
const loadLights	= true;		// Enable Lights
const loadFire		= true;		// Enable Fire
const loadGUI		= false;		// Enable GUI
const loadLogs		= true;		// Enable Log

const obj = { Meshes: {}, Lights: {} }; // Object Map //


init();
function init() {

	// Load View-port //
	const canvas = document.querySelector('#viewportA');
	obj.Renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
	obj.Renderer.physicallyCorrectLights = true;
	obj.Renderer.setPixelRatio( window.devicePixelRatio );
	obj.Renderer.setSize( window.innerWidth, window.innerHeight );
	obj.Renderer.setClearColor( 0x000000, 0 );
	obj.Scene = new THREE.Scene();
	obj.Scene.background = null;
	obj.Clock = new THREE.Clock();

	// Load Camera //
	var camera = obj.Camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 500 ); // Parameters: (fov, aspect, near, far)
	camera.position.set( 0.0, 1.5, 8.38 ); // (x,y,z)
	window.addEventListener( 'resize', onWindowResize ); // Run onWindowResize function when window size changes
	window.setTimeout( onWindowResize, 2000 ); // Initial camera sizing

	// Load Entities //
//	if(loadTextures) load_Textures();
//	if(loadCube)	 load_Cube();
	if(loadHallway)	 load_Hallway();
	if(loadLights)	 load_Lights();
	if(loadGUI)		 load_GUI();

	if(loadOrbCntrl) {
		let controls = new OrbitControls( camera, obj.Renderer.domElement ); // Set Camera Orbit Controls
		controls.update();
		controls.addEventListener( 'change', render );
	}
	camera.rotation.set( 0.0, 0.0, 0.0 ); // (x,y,z) Reset camera rotation
	
	// Load 3D Axis //
	if(loadAxis) {
		obj.AxisHelper = new THREE.AxesHelper(5);
		obj.AxisHelper.position.set( 0.0, 0.1, 0.0 );
		obj.AxisHelper.visible = true;
		obj.Scene.add(obj.AxisHelper);
	}
	
	render(); // Render Scene

	// Misc //
	if(loadLogs) window.setTimeout( load_Logs, 2000 );	// Wait 1 second then dump object map to log
}

function load_Hallway() {

	const gltfLoader = new GLTFLoader();
	gltfLoader.load('models/hallway7x.glb', function (gltf) {

		var model = obj.Meshes.Hallway = gltf.scene;
			// model.children[0].visible = false;
			// model.children[1].visible = false;
			// model.children[2].visible = false;
			// model.children[3].visible = false;
			// model.children[4].visible = false;

		model.scale.set( 0.5, 0.5, 0.5 );
		model.position.set( 0.0, 0.0, 0.0 );
		obj.Scene.add(model);

		if (loadHallAni) {
			obj.Mixer = new THREE.AnimationMixer( gltf.scene );
			gltf.animations.forEach( (clip) => {
				obj.Mixer.clipAction(clip).play();
			});

			obj.Animations = gltf.animations;
		}
		render();
	});	
}



// Generate Lights //////////////////////////////////////////////////////////////////
function load_Lights() {
	
	var point = obj.Lights.PointL1 = new THREE.SpotLight( 0xff0000, 7.8, 1.93, 3.6, 5, 1 ); // (colorInteger,intensityFloat,distance,decayFloat)
		point.position.set( .67, 1.73, 6.21 ); // Parameters: (x,y,z)
		var pointLightHelper = obj.Meshes.PointLightHelper = new THREE.PointLightHelper( point, 0.5 ) // (pointLight,sphereSizeFloat,colorHex)
			pointLightHelper.visible = false;
            obj.Lights.PointL1.visible = true;
			obj.Scene.add( point, pointLightHelper );
			
	var point = obj.Lights.PointR1 = new THREE.SpotLight( 0xff0000, 7.8, 1.93, 3.6, 5, 1 ); // (colorInteger,intensityFloat,distance,decayFloat)
		point.position.set( -.67, 1.73, 6.21 ); // Parameters: (x,y,z)
		var pointLightHelper = obj.Meshes.PointLightHelper = new THREE.PointLightHelper( point, 0.5 ) // (pointLight,sphereSizeFloat,colorHex)
			pointLightHelper.visible = false;
			obj.Scene.add( point, pointLightHelper );

	var point = obj.Lights.PointL2 = new THREE.PointLight( 0x170f02, 3.01, 0.89, 2.35 ); // (colorInteger,intensityFloat,distance,decayFloat)
		point.position.set( -.82, 1.85, 6.19 ); // Parameters: (x,y,z)
		var pointLightHelper = obj.Meshes.PointLightHelper = new THREE.PointLightHelper( point, 0.5 ) // (pointLight,sphereSizeFloat,colorHex)
			pointLightHelper.visible = false;
			obj.Scene.add( point, pointLightHelper );
			
	var point = obj.Lights.PointR2 = new THREE.PointLight( 0x170f02, 3.01, 0.89, 2.35 ); // (colorInteger,intensityFloat,distance,decayFloat)
		point.position.set( .82, 1.85, 6.19 ); // Parameters: (x,y,z)
		var pointLightHelper = obj.Meshes.PointLightHelper = new THREE.PointLightHelper( point, 0.5 ) // (pointLight,sphereSizeFloat,colorHex)
			pointLightHelper.visible = false;
			obj.Scene.add( point, pointLightHelper );
	/*
	var world = obj.Lights.World = new THREE.HemisphereLight( 0x808080, 0x080820, 0 ); // (skyColorInteger,groundColorInteger,intensityFloat)
		world.position.set( 0.0, 0.0, 0.0 ); // Parameters: (x,y,z)
		obj.Scene.add( world );
	*/
    obj.Scene.add( obj.Lights.PointL1.target );
    obj.Lights.PointL1.target.position.set( 0.97, 1.85, 5.90 );
    obj.Scene.add( obj.Lights.PointR1.target );
    obj.Lights.PointR1.target.position.set( -0.97, 1.85, 5.90 );
}

function load_Fire() {

	obj.FireA = new Fire();
	obj.Scene.add( obj.FireA );
	obj.FireA.scale.set( 0.13, 0.28, 0.15 );
	obj.FireA.position.set( -0.89, 1.88, 6.17 );

	obj.FireB = new Fire();
	obj.Scene.add( obj.FireB );
	obj.FireB.scale.set( 0.13, 0.28, 0.15 );
	obj.FireB.position.set( 0.89, 1.88, 6.17 );
}

// Overlays GUI for settings tweaks /////////////////////////////////////////////////
function load_GUI() {

	const gui = new dat.GUI();
	var camera = obj.Camera; {

		const cameraHelper = gui.addFolder("Camera Controls");
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
	}

	if(loadLights) {
		var world = obj.Lights.World;		
		var point1 = obj.Lights.PointL1;
		var point2 = obj.Lights.PointL2;
		const lightHelper = gui.addFolder("Lighting");	
			lightHelper.addFolder("PointLight Helper");
				lightHelper.add( obj.Meshes.PointLightHelper, "visible" );
			lightHelper.addFolder("Point Light 1");
				lightHelper.add( point1.position, "x" ).min(-20).max(20).step(0.01);
				lightHelper.add( point1.position, "y" ).min(-20).max(20).step(0.01);
				lightHelper.add( point1.position, "z" ).min(-20).max(20).step(0.01);
				lightHelper.add( point1, "intensity" ).min(0).max(15).step(0.01);
				lightHelper.add( point1, "distance" ).min(0).max(15).step(0.01);
				lightHelper.add( point1, "decay" ).min(0).max(15).step(0.01);
                lightHelper.add( point1, "angle" ).min(0).max(15).step(0.01);
				lightHelper.addColor( point1, 'color' );
			lightHelper.addFolder("Point Light 2");
				lightHelper.add( point2.position, "x" ).min(-20).max(20).step(0.01);
				lightHelper.add( point2.position, "y" ).min(-20).max(20).step(0.01);
				lightHelper.add( point2.position, "z" ).min(-20).max(20).step(0.01);
				lightHelper.add( point2, "intensity" ).min(0).max(15).step(0.01);
				lightHelper.add( point2, "distance" ).min(0).max(15).step(0.01);
				lightHelper.add( point2, "decay" ).min(0).max(15).step(0.01);
				lightHelper.addColor( point2, 'color' );
			/*
			lightHelper.addFolder("World Light");
				lightHelper.add( world, "intensity" ).min(0).max(10).step(0.001);
				lightHelper.addColor( world, 'color' );
			*/
	}

	const objectHelper = gui.addFolder("Objects");

	if(loadCube) {
		const params = { Spherify: 0, Twist: 0 };
		objectHelper.addFolder("Cube");
			objectHelper.add( params, 'Spherify', 0, 1 ).step(0.01).onChange( function ( value ) {
				obj.Meshes.Cube.morphTargetInfluences[ 0 ] = value;
			} );
			objectHelper.add( params, 'Twist', 0, 1 ).step(0.01).onChange( function ( value ) {
				obj.Meshes.Cube.morphTargetInfluences[ 1 ] = value;
			} );
			objectHelper.add( obj.Meshes.Cube, "visible" );
	}

	if(loadAxis) {
		objectHelper.addFolder("3D Axis");
			objectHelper.add( obj.AxisHelper, "visible" );
	}
}

// Logs Object Trees /////////////////////////////////////////////////////////////////
function load_Logs() {

	// Prepares GLTF Object Tree //
	function dumpObject(obj, lines = [], isLast = true, prefix = '') {

		const localPrefix = isLast ? '└─' : '├─';
		lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
		const newPrefix = prefix + (isLast ? '  ' : '│ ');
		const lastNdx = obj.children.length - 1;
		obj.children.forEach((child, ndx) => {
			const isLast = ndx === lastNdx;
			dumpObject( child, lines, isLast, newPrefix );
		});
		return lines.join('\n');
	}

	console.log( dumpObject( obj.Meshes.Hallway ) );
	console.log( 'Hallway Map', obj.Meshes.Hallway.children );
	console.log( 'Object Map', obj );
	console.log(obj.Renderer.info.render.calls);
}

// Initiates Rendering of Objects ///////////////////////////////////////////////////
function render() {

	obj.Renderer.render( obj.Scene, obj.Camera );

}

// Resize viewport when size changes ////////////////////////////////////////////////
function onWindowResize() {

	// Use percentage calculation to get "FOV" and "Zoom" based on "Aspect Ratio"
	let aspectRatio = obj.Camera.aspect = window.innerWidth / window.innerHeight;
	let fov = 35;
	let zoom = ( aspectRatio / 1.96 ) + ( aspectRatio * 0.1 );

	obj.Camera.fov = fov;
	obj.Camera.zoom = zoom;

	obj.Camera.updateProjectionMatrix();
	obj.Renderer.setSize( window.innerWidth, window.innerHeight );
}