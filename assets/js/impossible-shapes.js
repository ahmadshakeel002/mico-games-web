import * as THREE from 'three';
import { GLTFLoader } from './three.js/examples/jsm/loaders/GLTFLoader.js';
import TWEEN from './three.js/examples/jsm/libs/tween.module.js';

console.log("Loaded");

const scene = new THREE.Scene();
scene.background = new THREE.Color("#010a17");
const loader = new GLTFLoader();
const renderer = new THREE.WebGLRenderer({antialias: true});
//renderer.setSize($('#impossible-shapes-container').innerWidth(), $('#impossible-shapes-container').innerHeight());
//console.log("r-size",$('#impossible-shapes-container').innerWidth(), $('#impossible-shapes-container').innerHeight());
//$('#impossible-shapes-container').append(renderer.domElement);

var camera;
var corepart;
var stage=1;
var move=0;

// Load a glTF resource
export function load_stage(stage_no){
	
	renderer.setSize($('#impossible-shapes-container').innerWidth(), $('#impossible-shapes-container').innerHeight());
	console.log("r-size",$('#impossible-shapes-container').innerWidth(), $('#impossible-shapes-container').innerHeight());
	$('#impossible-shapes-container').append(renderer.domElement);
	console.log('here...');
	loader.load(
		'assets/glb/stage'+stage_no.toString()+'.glb',
		function (gltf) {
			console.log("loading scene...");
			scene.add(gltf.scene);
			console.log(gltf);

			camera = gltf.cameras[0];
			console.log(camera.position);
			
			corepart = gltf.scene.getObjectByName('corePart'); // Get the object by name
			console.log(corepart.position);
			animate();
		},
		function (xhr) {
			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
		function (error) {
			console.log('An error happened');
			console.log(error);
		}
	);
}

function clearScene() {
    // Traverse the scene and remove all objects
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            // Dispose of geometries and materials to free up memory
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                // Check if material is an array
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }
    });

    // Remove all children from the scene
    while (scene.children.length) {
        scene.remove(scene.children[0]);
    }
}

function checkCollision(obj1, obj2) {
    const box1 = new THREE.Box3().setFromObject(obj1);
    const box2 = new THREE.Box3().setFromObject(obj2);
    return box1.intersectsBox(box2);
}


function animate() {
	requestAnimationFrame(animate);

	TWEEN.update();

	renderer.render(scene, camera);
}
var count = 0;
var points = [[{ x:5, y:-9, z:4 },{ x:-9, y:-9, z:4 }],
				[{ x:-10, y:-12, z:10 },{ x:-10, y:-12, z:4 },{ x:2, y:-12, z:4 },{ x:2, y:-3, z:4 }],
				[{ x:2, y:-4, z:3 },{ x:2, y:-4, z:-5 },{ x:2, y:-10, z:-5 },{ x:2, y:-10, z:0 },{ x:7, y:-10, z:0 },{ x:7, y:-4, z:0 }]];
				
// Function to move the corepart object
export function moveCorepart() {
  console.log("clicked");
    console.log("backward");
	
	if (corepart) {
	    console.log("animating");
		move++;
		// Create a new TWEEN object
		console.log(corepart.position);
		const redBaits = [];
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.name.startsWith('redBait_')) {
                redBaits.push(child);
            }
        });
		new TWEEN.Tween(corepart.position)
			.to(points[stage-1][move], 1000) // Move along the y-axis to -4 over 2000ms (2 seconds)
			.easing(TWEEN.Easing.Quadratic.Out) // Easing function for smooth animation
			.onUpdate(() => {
                // Check for collisions with redBait_ objects
                redBaits.forEach((bait) => {
                    if (checkCollision(corepart, bait)) {
                        bait.visible = false;  // Hide the object if collision detected
                    }
                });
            })
			.onComplete(() => {
				// Action to take when the tween ends
				console.log('Tween has completed');
				if(move>=points[stage-1].length-1)
				{
					stage++;
					move=0;
					clearScene();
					load_stage(stage);
					console.log("boom");
				}
			})
			.start();
	}
}

//document.addEventListener('click', moveCorepart);

function resize_canvas(){
	camera.aspect = $('#impossible-shapes-container').innerWidth() / $('#impossible-shapes-container').innerHeight();
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}