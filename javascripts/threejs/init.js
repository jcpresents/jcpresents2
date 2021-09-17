import * as THREE from '/javascripts/threejs/three.module.js';
import * as dat from '/javascripts/threejs/modules/dat.gui.module.js'
import { OrbitControls } from '/javascripts/threejs/modules/OrbitControls.js';
import { GLTFLoader } from '/javascripts/threejs/modules/GLTFLoader.js';
import { RoughnessMipmapper } from '/javascripts/threejs/modules/RoughnessMipmapper.js';
//import "/javascripts/threejs/jsm/objects/Fire.js";

// Object Map ///////////////////////////////////////////////////////////////////////
const obj = { Meshes: {}, Lights: {} };
const FireShader = {

    defines: {
        "ITERATIONS"    : "20",
        "OCTIVES"       : "3"
    },

    uniforms: {
        "fireTex"       : { type : "t",     value : null },
        "color"         : { type : "c",     value : null },
        "time"          : { type : "f",     value : 0.0 },
        "seed"          : { type : "f",     value : 0.0 },
        "invModelMatrix": { type : "m4",    value : null },
        "scale"         : { type : "v3",    value : null },

        "noiseScale"    : { type : "v4",    value : new THREE.Vector4(1, 2, 1, 0.3) },
        "magnitude"     : { type : "f",     value : 1.3 },
        "lacunarity"    : { type : "f",     value : 2.0 },
        "gain"          : { type : "f",     value : 0.5 }
    },

    vertexShader: [
        "varying vec3 vWorldPos;",
        "void main() {",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
            "vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;",
        "}"
    ].join("\n"),

    fragmentShader: [
        "uniform vec3 color;",
        "uniform float time;",
        "uniform float seed;",
        "uniform mat4 invModelMatrix;",
        "uniform vec3 scale;",

        "uniform vec4 noiseScale;",
        "uniform float magnitude;",
        "uniform float lacunarity;",
        "uniform float gain;",

        "uniform sampler2D fireTex;",

        "varying vec3 vWorldPos;",

        // GLSL simplex noise function by ashima / https://github.com/ashima/webgl-noise/blob/master/src/noise3D.glsl
        // -------- simplex noise
        "vec3 mod289(vec3 x) {",
            "return x - floor(x * (1.0 / 289.0)) * 289.0;",
        "}",

        "vec4 mod289(vec4 x) {",
            "return x - floor(x * (1.0 / 289.0)) * 289.0;",
        "}",

        "vec4 permute(vec4 x) {",
            "return mod289(((x * 34.0) + 1.0) * x);",
        "}",

        "vec4 taylorInvSqrt(vec4 r) {",
            "return 1.79284291400159 - 0.85373472095314 * r;",
        "}",

        "float snoise(vec3 v) {",
            "const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);",
            "const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);",

            // First corner
            "vec3 i  = floor(v + dot(v, C.yyy));",
            "vec3 x0 = v - i + dot(i, C.xxx);",

            // Other corners
            "vec3 g = step(x0.yzx, x0.xyz);",
            "vec3 l = 1.0 - g;",
            "vec3 i1 = min(g.xyz, l.zxy);",
            "vec3 i2 = max(g.xyz, l.zxy);",

            //   x0 = x0 - 0.0 + 0.0 * C.xxx;
            //   x1 = x0 - i1  + 1.0 * C.xxx;
            //   x2 = x0 - i2  + 2.0 * C.xxx;
            //   x3 = x0 - 1.0 + 3.0 * C.xxx;
            "vec3 x1 = x0 - i1 + C.xxx;",
            "vec3 x2 = x0 - i2 + C.yyy;", // 2.0*C.x = 1/3 = C.y
            "vec3 x3 = x0 - D.yyy;",      // -1.0+3.0*C.x = -0.5 = -D.y

            // Permutations
            "i = mod289(i); ",
            "vec4 p = permute(permute(permute( ",
                    "i.z + vec4(0.0, i1.z, i2.z, 1.0))",
                    "+ i.y + vec4(0.0, i1.y, i2.y, 1.0)) ",
                    "+ i.x + vec4(0.0, i1.x, i2.x, 1.0));",

            // Gradients: 7x7 points over a square, mapped onto an octahedron.
            // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
            "float n_ = 0.142857142857;", // 1.0/7.0
            "vec3  ns = n_ * D.wyz - D.xzx;",

            "vec4 j = p - 49.0 * floor(p * ns.z * ns.z);", //  mod(p,7*7)

            "vec4 x_ = floor(j * ns.z);",
            "vec4 y_ = floor(j - 7.0 * x_);", // mod(j,N)

            "vec4 x = x_ * ns.x + ns.yyyy;",
            "vec4 y = y_ * ns.x + ns.yyyy;",
            "vec4 h = 1.0 - abs(x) - abs(y);",

            "vec4 b0 = vec4(x.xy, y.xy);",
            "vec4 b1 = vec4(x.zw, y.zw);",

            //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
            //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
            "vec4 s0 = floor(b0) * 2.0 + 1.0;",
            "vec4 s1 = floor(b1) * 2.0 + 1.0;",
            "vec4 sh = -step(h, vec4(0.0));",

            "vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;",
            "vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;",

            "vec3 p0 = vec3(a0.xy, h.x);",
            "vec3 p1 = vec3(a0.zw, h.y);",
            "vec3 p2 = vec3(a1.xy, h.z);",
            "vec3 p3 = vec3(a1.zw, h.w);",

            //Normalise gradients
            "vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));",
            "p0 *= norm.x;",
            "p1 *= norm.y;",
            "p2 *= norm.z;",
            "p3 *= norm.w;",

            // Mix final noise value
            "vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);",
            "m = m * m;",
            "return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));",
        "}",
        // simplex noise --------

        "float turbulence(vec3 p) {",
            "float sum = 0.0;",
            "float freq = 1.0;",
            "float amp = 1.0;",
            
            "for(int i = 0; i < OCTIVES; i++) {",
                "sum += abs(snoise(p * freq)) * amp;",
                "freq *= lacunarity;",
                "amp *= gain;",
            "}",

            "return sum;",
        "}",

        "vec4 samplerFire (vec3 p, vec4 scale) {",
            "vec2 st = vec2(sqrt(dot(p.xz, p.xz)), p.y);",

            "if(st.x <= 0.0 || st.x >= 1.0 || st.y <= 0.0 || st.y >= 1.0) return vec4(0.0);",

            "p.y -= (seed + time) * scale.w;",
            "p *= scale.xyz;",

            "st.y += sqrt(st.y) * magnitude * turbulence(p);",

            "if(st.y <= 0.0 || st.y >= 1.0) return vec4(0.0);",
           
            "return texture2D(fireTex, st);",
        "}",

        "vec3 localize(vec3 p) {",
            "return (invModelMatrix * vec4(p, 1.0)).xyz;",
        "}",

        "void main() {",
            "vec3 rayPos = vWorldPos;",
            "vec3 rayDir = normalize(rayPos - cameraPosition);",
            "float rayLen = 0.0288 * length(scale.xyz);",

            "vec4 col = vec4(0.0);",

            "for(int i = 0; i < ITERATIONS; i++) {",
                "rayPos += rayDir * rayLen;",

                "vec3 lp = localize(rayPos);",

                "lp.y += 0.5;",
                "lp.xz *= 2.0;",
                "col += samplerFire(lp, noiseScale);",
            "}",

            "col.a = col.r;",

            "gl_FragColor = col;",
        "}",

	].join("\n")

};

class Fire {
	constructor() {
		var color = "";
		var fireTex = new THREE.TextureLoader().load("javascripts/threejs/modules/Fire.png");
		var fireMaterial = new THREE.ShaderMaterial( {
			defines         : FireShader.defines,
			uniforms        : THREE.UniformsUtils.clone( FireShader.uniforms ),
			vertexShader    : FireShader.vertexShader,
			fragmentShader  : FireShader.fragmentShader,
			transparent     : true,
			depthWrite      : true,
			depthTest       : true
		} );

		// initialize uniforms 

		fireTex.magFilter = fireTex.minFilter = THREE.LinearFilter;
		fireTex.wrapS = fireTex.wrapT = THREE.ClampToEdgeWrapping;
		
		fireMaterial.uniforms.fireTex.value = fireTex;
		fireMaterial.uniforms.color.value = color || new THREE.Color( 0xeeeeee );
		fireMaterial.uniforms.invModelMatrix.value = new THREE.Matrix4();
		fireMaterial.uniforms.scale.value = new THREE.Vector3( 1, 1, 1 );
		fireMaterial.uniforms.seed.value = Math.random() * 19.19;

		this.Mesh = new THREE.Mesh( new THREE.BoxGeometry( 1.0, 1.0, 1.0 ), fireMaterial );
		return this
	}
	update(time) {

		var Mesh = this.Mesh
		var invModelMatrix = Mesh.material.uniforms.invModelMatrix.value;

		Mesh.updateMatrixWorld();
		invModelMatrix.copy( Mesh.matrixWorld ).invert();

		if( time !== undefined ) {
			Mesh.material.uniforms.time.value = time;
		}

		Mesh.material.uniforms.invModelMatrix.value = invModelMatrix;
		Mesh.material.uniforms.scale.value = Mesh.scale;
	}
}

function load_Fire() {

	obj.FireA = new Fire();
	obj.Scene.add( obj.FireA.Mesh );
	obj.FireA.Mesh.scale.set( 0.13, 0.3, 0.13 );
	obj.FireA.Mesh.position.set( -0.9, 1.87, 6.14 );

	obj.FireB = new Fire();
	obj.Scene.add( obj.FireB.Mesh );
	obj.FireB.Mesh.scale.set( 0.13, 0.3, 0.13 );
	obj.FireB.Mesh.position.set( 0.9, 1.87, 6.14 );

	/*
	Fire.prototype = Object.create( THREE.Mesh.prototype );
	Fire.prototype.constructor = Fire;
	*/
}

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
	
	// Load Camera //
	var camera = obj.Camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 500 ); // Parameters: (fov, aspect, near, far)
	camera.position.set( 0.0, 1.6, 8.3 ); // (x,y,z)
	if(loadOrbitControls) {
		const controls = new OrbitControls( camera, obj.Renderer.domElement ); // Set Camera Orbit Controls
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

	// Load Entities //
	// load_Textures();		// Textures
	// load_Cube();			// Test Cube
	load_Hallway();			// Meshes
	load_Lights();			// Lights
	load_Fire();			// Torch Flames
	if(loadGUI) load_GUI();	// Settings GUI
	render();				// Render Scene

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
			obj.Hallway		= model.children[0];
			obj.Flooring	= model.children[1];
			obj.Cone		= model.children[2];
			obj.Walls		= model.children[3];
			obj.SconceL		= model.children[4];
			obj.SconceR		= model.children[5];
			obj.OuterFlameL = model.children[7];
			obj.OuterFlameR = model.children[8];
			obj.InnerFlameR = model.children[9];
			obj.InnerFlameL = model.children[10];
			//NOTE: major changes to the model shuffle all these children

		obj.Mixer = new THREE.AnimationMixer( gltf.scene );
		gltf.animations.forEach( (clip) => {
			obj.Mixer.clipAction(clip).play();
		});

		obj.Animations = gltf.animations;
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
		obj.Scene.add( world );
	*/
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
	if (obj.Mixer) obj.Mixer.update(delta);
	obj.FireA.update(performance.now() / 1000);
	obj.FireB.update(performance.now() / 1000);
	obj.Renderer.render( obj.Scene, obj.Camera );
}

// Resize viewport when size changes ////////////////////////////////////////////////
function onWindowResize() {

	var camera = obj.Camera;
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
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
