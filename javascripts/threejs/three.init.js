import * as THREE from './three.module.js';
import { GLTFLoader } from './modules/GLTFLoader.js';
import { Fire } from  "./modules/Fire.js";

// Constants //
const sceneFPS		= 30;    	// FPS Cap
const loadHallway	= true; 	// Enable Hallway
const loadHallAni	= true; 	// Enable Hallway Animations
const loadLights	= true; 	// Enable Lights
const loadFire		= true; 	// Enable Fire
const obj = { Fires: [], Lights: [], Meshes: [] }; // Object Map //

init();
function init() {

	// Load View-port //
	const canvas = document.querySelector('#viewport');
		obj.Renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
		obj.Renderer.physicallyCorrectLights = true;
		obj.Renderer.setPixelRatio( window.devicePixelRatio );
		obj.Renderer.setSize( window.innerWidth, window.innerHeight );
		obj.Renderer.setClearColor( "#000000", 0 ); // Background-Color
		obj.Scene = new THREE.Scene();
		obj.Clock = new THREE.Clock();

	// Load Camera //
	const camera = obj.Camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 500 ); // Parameters: (fov, aspect, near, far)
		camera.position.set( 0.00, 1.50, 8.38 ); // ( x, y, z )
		camera.rotation.set( 0.03, 0.00, 0.00 ); // ( x, y, z )
		camera.fov = 35;

	// Adjust camera on window resize //
	window.addEventListener( 'resize', function () {

		// Use percentage calculation to get "FOV" and "Zoom" based on "Aspect Ratio"
		const aspectRatio = obj.Camera.aspect = window.innerWidth / window.innerHeight;
		obj.Camera.zoom = ( aspectRatio / 1.96 ) + ( aspectRatio * 0.1 );
		obj.Camera.updateProjectionMatrix();
		obj.Renderer.setSize( window.innerWidth, window.innerHeight );
	} );
	window.dispatchEvent( new Event('resize') ); // Initial camera sizing

	// Load Entities //
	if ( loadHallway )	load_Hallway();
	if ( loadLights )	load_Lights();
	if ( loadFire )		load_Fire();

	render(); // Render Scene
}

// Generate Hallway ////////////////////////////////////////////////////////////////
function load_Hallway() {

	const gltfLoader = new GLTFLoader();
	gltfLoader.load('models/hallway.glb', function (gltf) {

		const model = gltf.scene;
			  obj.Meshes[model.name] = model;

		for ( let i = 0; i < 3; i++ ) model.remove( model.children[0] );
		for ( let i = 0; i < model.children.length; i++ ) {

			const j = obj.Meshes.length;
			obj.Meshes[j] = model.children[i];
		}

		if ( loadHallAni ) {

			obj.Mixer = new THREE.AnimationMixer( gltf.scene );
			gltf.animations.forEach( (clip) => { obj.Mixer.clipAction(clip).play(); });
			obj.Animations = gltf.animations;
		}

		model.scale.set( 0.5, 0.5, 0.5 );
		model.position.set( 0.0, 0.0, 0.0 );
		obj.Scene.add( model );
	});
}

// Generate Lights /////////////////////////////////////////////////////////////////
function load_Lights() {

	let LightSrc, i = 0;

	LightSrc = obj.Lights[i] = new THREE.SpotLight( 0xff0000, 7.8, 1.93, 3.6, 5, 1 ); // ( colorInteger, intensity, distance, angle, penumbra, decay )
		LightSrc.position.set( -0.67, 1.73, 6.21 ); // Parameters: (x,y,z)
		LightSrc.target.position.set( -0.97, 1.85, 5.90 );
		LightSrc.name = "LeftSpot1";
		obj.Scene.add( LightSrc );
	i++;

	LightSrc = obj.Lights[i] = new THREE.SpotLight( 0xff0000, 7.8, 1.93, 3.6, 5, 1 );
		LightSrc.position.set( 0.67, 1.73, 6.21 );
		LightSrc.target.position.set( 0.97, 1.85, 5.90 );
		LightSrc.name = "RightSpot1";
		obj.Scene.add( LightSrc );
	i++;

	LightSrc = obj.Lights[i] = new THREE.PointLight( 0x170f02, 33, 0.89, 0.9 ); // ( colorInteger, intensity, distance, decay )
		LightSrc.position.set( -0.82, 1.85, 6.2 );
		LightSrc.name = "LeftPoint2";
		obj.Scene.add( LightSrc );
	i++;

	LightSrc = obj.Lights[i] = new THREE.PointLight( 0x170f02, 33, 0.89, 0.9 );
		LightSrc.position.set( 0.82, 1.85, 6.2 );
		LightSrc.name = "RightPoint2";
		obj.Scene.add( LightSrc );
	i++;
}

// Generate Fires //////////////////////////////////////////////////////////////////
function load_Fire() {

	let fire, i = 0;

	fire = obj.Fires[i] = new Fire();
		fire.scale.set( 0.13, 0.28, 0.15 );
		fire.position.set( -0.89, 1.88, 6.17 );
		fire.name = "LeftFire";
		obj.Scene.add( fire );
	i++;

	fire = obj.Fires[i] = new Fire();
		fire.scale.set( 0.13, 0.28, 0.15 );
		fire.position.set( 0.89, 1.88, 6.17 );
		fire.name = "RightFire";
		obj.Scene.add( fire );
	i++;
}

// Initiates Rendering of Objects //////////////////////////////////////////////////
function render( time ) {

	setTimeout( function() { requestAnimationFrame( render ); }, 1000 / sceneFPS );

	if ( loadHallAni && obj.Mixer ) {
		let delta = obj.Clock.getDelta();
		obj.Mixer.update(delta);
	}

	if (loadFire) for ( let i = 0; i < obj.Fires.length; i++ )
		obj.Fires[i].update( performance.now() / 1000 );

	obj.Renderer.render( obj.Scene, obj.Camera );
}