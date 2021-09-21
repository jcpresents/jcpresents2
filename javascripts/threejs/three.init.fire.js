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
const loadFire		= true;		// Enable Fire
const loadLogs		= true;		// Enable Log

const obj = { Meshes: {}, Lights: {} }; // Object Map //


init();
function init() {

	// Load View-port //
	const canvas = document.querySelector('#viewportB');
	obj.Renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
	obj.Renderer.physicallyCorrectLights = true;
	obj.Renderer.setPixelRatio( window.devicePixelRatio );
	obj.Renderer.setClearColor( 0x000000, 0 );
	obj.Renderer.setSize( window.innerWidth, window.innerHeight );
	obj.Scene = new THREE.Scene();
	obj.Scene.background = null;
	obj.Clock = new THREE.Clock();

	// Load Camera //
	var camera = obj.Camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 500 ); // Parameters: (fov, aspect, near, far)
	camera.position.set( 0.0, 1.5, 8.38 ); // (x,y,z)
	window.addEventListener( 'resize', onWindowResize ); // Run onWindowResize function when window size changes
	window.setTimeout( onWindowResize, 2000 ); // Initial camera sizing

	// Load Entities //
	if(loadFire)	 load_Fire();

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
	
	render(); // Render Scene
}


// Generate Lights //////////////////////////////////////////////////////////////////


function load_Fire() {

	obj.FireA = new Fire();
	obj.Scene.add( obj.FireA );
	obj.FireA.scale.set( 0.13, 0.28, 0.09 );
	obj.FireA.position.set( -0.885, 1.87, 6.17 );

	obj.FireB = new Fire();
	obj.Scene.add( obj.FireB );
	obj.FireB.scale.set( 0.13, 0.28, 0.09 );
	obj.FireB.position.set( 0.885, 1.87, 6.17 );
}

// Initiates Rendering of Objects ///////////////////////////////////////////////////
function render(time) {

	 setTimeout( function() {

        requestAnimationFrame( render );

    }, 1000 / sceneFPS );
	var delta = obj.Clock.getDelta();
	if (loadFire) {
		obj.FireA.FireUpdate(performance.now() / 1000);
		obj.FireB.FireUpdate(performance.now() / 1000);
	}
	obj.Renderer.render( obj.Scene, obj.Camera );
	console.log(obj.Renderer.info.render.calls);
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

