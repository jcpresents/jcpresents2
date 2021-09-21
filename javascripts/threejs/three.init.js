import * as THREE from './three.module.js';
import * as dat from './modules/dat.gui.module.js'
import { OrbitControls } from './modules/OrbitControls.js';
import { GLTFLoader } from './modules/GLTFLoader.js';
import { RoughnessMipmapper } from './modules/RoughnessMipmapper.js';
import { Fire } from  "./modules/Fire.js";

// Constants //
const sceneFPS		= 30;    	// FPS Cap
const loadAxis		= false; 	// Enable Axis Helper
const loadOrbCntrl	= false; 	// Enable Orbit Controls
const loadCube		= false; 	// Enable Test Cube
const loadHallway	= true; 	// Enable Hallway
const loadHallAni	= false; 	// Enable Hallway Animations
const loadLights	= true; 	// Enable Lights
const loadLghtHlprs	= false; 	// Enable Light Helpers
const loadFire		= true; 	// Enable Fire
const loadGUI		= false; 	// Enable GUI
const loadLogs		= false; 	// Enable Log

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
		if( loadOrbCntrl ) new OrbitControls( camera, obj.Renderer.domElement ).update(); // Set Camera Orbit Controls
		camera.position.set( 0.00, 1.50, 8.38 ); // ( x, y, z )
		camera.rotation.set( 0.03, 0.00, 0.00 ); // ( x, y, z ) // Also Resets camera rotation after Orbit controls update
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
	if ( loadAxis )		load_Axis();
	if ( loadCube )		load_Cube();
	if ( loadHallway )	load_Hallway();
	if ( loadLights )	load_Lights();
	if ( loadFire )		load_Fire();
	if ( loadGUI )		load_GUI();

	render(); // Render Scene
	if( loadLogs ) window.setTimeout( load_Logs, 2000 ); // Wait 2 second then dump object map to log
}

// Generates Morph Properties //////////////////////////////////////////////////////
function add_morphProperties( geometry ) {

	// morphing positions and normals are supported
	geometry.morphAttributes.position = []; // create an empty array to hold targets for the attribute we want to morph

	const positionAttribute = geometry.attributes.position; // the original positions of the cube's vertices
	const spherePositions = []; // for the first morph target we'll move the cube's vertices onto the surface of a sphere
	const twistPositions = []; // for the second morph target, we'll twist the cubes vertices
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

	geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute( spherePositions, 3 );	// add the spherical positions as the first morph target
	geometry.morphAttributes.position[1] = new THREE.Float32BufferAttribute( twistPositions, 3 );	// add the twisted positions as the second morph target
}

// Generate Axis Helper ////////////////////////////////////////////////////////////
function load_Axis() {

	const axisHelper = obj.AxisHelper = new THREE.AxesHelper( 5 );
		  axisHelper.position.set( 0.00, 0.10, 0.00 );
		  obj.Scene.add( axisHelper );
}

// Generate Cube ///////////////////////////////////////////////////////////////////
function load_Cube() {

	// Load Textures //
	const normalMap = new THREE.TextureLoader().load( "./models/textures/test_nrml.png" );
	const normalMat = new THREE.MeshNormalMaterial( { normalMap } );
		  normalMap.normalScale =( 100, 100 );

	const diffuseMap = new THREE.TextureLoader().load( "./models/textures/test_diff.png" );
	const diffuseMat = new THREE.MeshStandardMaterial( { map: diffuseMap } );
		  diffuseMat.normalMap = normalMat;
		  diffuseMat.wrapS = THREE.RepeatWrapping;
		  diffuseMat.wrapT = THREE.RepeatWrapping;
		  diffuseMap.repeat.set( 0.5, 0.5 );

	const geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5, 32, 32, 32 ); // ( boxWidth, boxHeight, boxDepth )
		  add_morphProperties( geometry );

	const i = obj.Meshes.length;
	const cube = obj.Meshes[i] = new THREE.Mesh( geometry, diffuseMat );
		  cube.position.set( 0.00, 1.50, 6.00 );
		  cube.name = "Cube";
		  obj.Scene.add( cube );
}

// Generate Hallway ////////////////////////////////////////////////////////////////
function load_Hallway() {

	const gltfLoader = new GLTFLoader();
	gltfLoader.load('models/hallway7.glb', function (gltf) {

		const model = gltf.scene;
			  model.scale.set( 0.5, 0.5, 0.5 );
			  model.position.set( 0.0, 0.0, 0.0 );
			  obj.Scene.add( model );

		obj.Meshes[model.name] = model;
		for ( let i = 0; i < model.children.length; i++ ) {

			const j = obj.Meshes.length;
			obj.Meshes[j] = model.children[i];
		}

		if ( loadHallAni ) {

			obj.Mixer = new THREE.AnimationMixer( gltf.scene );
			gltf.animations.forEach( (clip) => { obj.Mixer.clipAction(clip).play(); });
			obj.Animations = gltf.animations;
		}
	});
}

// Generate Lights /////////////////////////////////////////////////////////////////
function load_Lights() {

	let LightSrc, i = 0;

	/* LightSrc = obj.Lights[i] = new THREE.HemisphereLight( 0x808080, 0x080820, 0 ); // (skyColorInteger,groundColorInteger,intensityFloat)
		LightSrc.position.set( 0.0, 0.0, 0.0 ); // Parameters: (x,y,z)
		LightSrc.name = "World";
		obj.Scene.add( LightSrc );
	i++; */

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

	LightSrc = obj.Lights[i] = new THREE.PointLight( 0x170f02, 0.4, 0.89, 4.9 ); // ( colorInteger, intensity, distance, decay )
		LightSrc.position.set( -0.82, 1.85, 5.90 );
		LightSrc.name = "LeftPoint2";
		obj.Scene.add( LightSrc );
	i++;

	LightSrc = obj.Lights[i] = new THREE.PointLight( 0x170f02, 0.4, 0.89, 4.9 );
		LightSrc.position.set( 0.82, 1.85, 5.90 );
		LightSrc.name = "RightPoint2";
		obj.Scene.add( LightSrc );
	i++;

	if ( loadLghtHlprs ) for ( let j = 0; j < i; j++ ) {

		let lightHlpr;

		switch ( obj.Lights[j].type ) {
			case "HemisphereLight":
				lightHlpr = THREE.HemisphereLightHelper( obj.Lights[j], 5.00,  0xffffff ); // ( hemisphereLight, sphereSize, colorHex )
				break;
			case "PointLight":
				lightHlpr = new THREE.PointLightHelper( obj.Lights[j], 0.25,  0xffffff ); // ( pointLight, sphereSize, colorHex )
				break;
			case "SpotLight":
				lightHlpr = new THREE.SpotLightHelper( obj.Lights[j], 0xffffff ); // ( spotLight, colorHex )
				break;
		}

		obj.Scene.add( lightHlpr );
	}
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

// Overlays GUI for settings tweaks ////////////////////////////////////////////////
function load_GUI() {

	const gui = new dat.GUI();
	const cameraFolder = gui.addFolder("Camera"); {

		const camera = obj.Camera;
		cameraFolder.addFolder("Position");
			cameraFolder.add( camera.position, "x" ).min(-20).max(20).step(0.01);
			cameraFolder.add( camera.position, "y" ).min(-20).max(20).step(0.01);
			cameraFolder.add( camera.position, "z" ).min(-20).max(20).step(0.01);
		cameraFolder.addFolder("Rotation");
			cameraFolder.add( camera.rotation, "x" ).min(-1.5).max(1.5).step(0.01);
			cameraFolder.add( camera.rotation, "y" ).min(-1.5).max(1.5).step(0.01);
			cameraFolder.add( camera.rotation, "z" ).min(-1.5).max(1.5).step(0.01);
		cameraFolder.addFolder("FOV");
			cameraFolder.add( camera, "near").min(-5).max(5);
			cameraFolder.add( camera, "far" ).min(-5).max(5);
			cameraFolder.add( camera, "fov" ).min(-5).max(55);
	}

	if( loadLights ) {

		const lightsFolder = gui.addFolder("Lights");
		for ( let i = 0; i < obj.Lights.length; i++ ) {

			let light = obj.Lights[i];
			let lightFolder = lightsFolder.addFolder( light.name );
				lightFolder.add( light.position, "x" ).min(-20).max(20).step(0.01);
				lightFolder.add( light.position, "y" ).min(-20).max(20).step(0.01);
				lightFolder.add( light.position, "z" ).min(-20).max(20).step(0.01);
				lightFolder.add( light, "intensity" ).min(0).max(15).step(0.01);
				lightFolder.add( light, "distance" ).min(0).max(15).step(0.01);
				lightFolder.add( light, "decay" ).min(0).max(15).step(0.01);
				lightFolder.addColor( light, 'color' );
		}
	}

	const objectFolder = gui.addFolder("Objects"); {

		if ( loadCube ) {

			const params = { Spherify: 0, Twist: 0 };
			const cubeFolder = objectFolder.addFolder("Cube");
				  cubeFolder.add( params, 'Spherify', 0, 50 ).step(0.01).onChange( function ( value ) { obj.Meshes[0].morphTargetInfluences[ 0 ] = value; } );
				  cubeFolder.add( params, 'Twist', 0, 10 ).step(0.01).onChange( function ( value ) { obj.Meshes[0].morphTargetInfluences[ 1 ] = value; } );
				  cubeFolder.add( obj.Meshes[0], "visible" );
		}

		if ( loadAxis ) {

			const axisFolder = objectFolder.addFolder("3D Axis");
				  axisFolder.add( obj.AxisHelper, "visible" );
		}

		if ( loadFire ) {

			for ( let i = 0; i < obj.Fires.length; i++ ) {

				let fire = obj.Fires[i];
				let fireFolder = objectFolder.addFolder( fire.name );
					fireFolder.add( fire.position, "x" ).min(-20).max(20).step(0.01);
					fireFolder.add( fire.position, "y" ).min(-20).max(20).step(0.01);
					fireFolder.add( fire.position, "z" ).min(-20).max(20).step(0.01);
					fireFolder.add( fire, "visible" );
			}
		}
	}
}

// Logs Object Trees ///////////////////////////////////////////////////////////////
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

	console.log( dumpObject( obj.Meshes.Scene ) );
	console.log( 'Entity Map', obj );
}

// Initiates Rendering of Objects //////////////////////////////////////////////////
function render( time ) {

	setTimeout( function() { requestAnimationFrame( render ); }, 1000 / sceneFPS );

	var delta = obj.Clock.getDelta();
	if ( loadHallAni && obj.Mixer )
		obj.Mixer.update(delta);

	if (loadFire) for ( let i = 0; i < obj.Fires.length; i++ )
		obj.Fires[i].update( performance.now() / 1000 );

	obj.Renderer.render( obj.Scene, obj.Camera );
}