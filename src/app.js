/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import * as THREE from 'three';
import { WebGLRenderer, OrthographicCamera, Vector3, Group, Raycaster } from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { KitchenScene } from 'scenes';
import BlipFile from './assets/blip.wav';
import PointFile from './assets/point.wav';

// State
let playing = false;

// Constants
let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

// Sounds
const blip = new Audio(BlipFile);

// Initialize core ThreeJS components
const scene = new KitchenScene(WIDTH, HEIGHT);
const renderer = new WebGLRenderer({ antialias: true });

changeOpacity(0.5);

// Set up camera
const aspectRatio = WIDTH / HEIGHT;
const cameraWidth = 960;
const cameraHeight = cameraWidth / aspectRatio;
const camera = new OrthographicCamera(
    cameraWidth / -2, // left
    cameraWidth / 2, // right
    cameraHeight / 2, // top
    cameraHeight / -2, // bottom
    0, // near plane
    150 // far plane
);
camera.position.set(0, 0, 0.5);
camera.lookAt(new Vector3(0, 0, 0));

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.enablePan = false;
// controls.minZoom = 4;
// controls.maxZoom = 100;
// controls.update();

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    if (timeStamp % 50 < 20 && playing) {
        scene.update(timeStamp, 2, WIDTH);
    }
    // controls.update();
    renderer.render(scene, camera);
    // scene.update && scene.update(timeStamp);
    // scene.update(timeStamp, 0.00000000001, WIDTH);
    window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);

window.addEventListener('keydown', function (event) {
    if (event.key == ' ' && !playing) {
        startGame();
    }
});

function startGame() {
    // console.log("starting");
    playing = true;

    // console.log(scene);
    scene.addIngredients(WIDTH, HEIGHT);
    changeOpacity(1);
    for (const obj of scene.children) {
        if (obj.type == "start") {
            scene.remove(obj);
        }
    }
    // Set up controls
    const controls = new DragControls(scene.state.draggable, camera, renderer.domElement);
    // on drag start
    let orig_pos;
    controls.addEventListener('dragstart', function (event) {
        orig_pos = event.object.position.clone();
        console.log(orig_pos);
        event.object.material.opacity = 0.6;
        blip.play();
    });

    // const mouse = new THREE.Vector2();

    // function onMouseMove( event ) {
    // 	// calculate mouse position in normalized device coordinates
    // 	// (-1 to +1) for both components
    // 	mouse.x = ( event.clientX / WIDTH ) * 2 - 1;
    // 	mouse.y = - ( event.clientY / HEIGHT ) * 2 + 1;
    // }

    // window.addEventListener( 'mousemove', onMouseMove, false ); 

    // on drag end
    controls.addEventListener('dragend', function (event) {
        event.object.material.opacity = 1;
        // console.log(event.object.position.x);
        // console.log(event.object.position.y);
        // console.log(event.object);
        // console.log(event.object.parent.name);
        // console.log(scene.state.updateList[0].children[0].position)
        // console.log(event.object.position)
        let plate_pos = scene.state.updateList[0].children[0].position;
        let obj_pos = event.object.position;
        console.log(event.object);
        if (obj_pos.x >= plate_pos.x - 60 && obj_pos.x <= plate_pos.x + 60 && obj_pos.y >= plate_pos.y - 30 && obj_pos.y <= plate_pos.y + 30) {
            console.log("in range")
            if (scene.state.updateList.length == 1 && event.object.parent.type == 'base' || scene.state.updateList.length == 2 && event.object.parent.type == 'frosting' || scene.state.updateList.length == 3 && event.object.parent.type == 'topping') {
                scene.state.updateList.push(event.object.parent);
            }
            else {
                event.object.position.set(orig_pos.x, orig_pos.y, orig_pos.z);
                // scene.remove(event.object.parent);
            }
        }
        else {
            event.object.position.set(orig_pos.x, orig_pos.y, orig_pos.z);
        }
    });
}

function changeOpacity(value) {
    for (const obj of scene.children) {
        console.log(obj);
        console.log(obj.type);
        if (obj.type == "Sprite") {
            obj.material.opacity = value;
        }
        else if (obj.type == "start") {

        }
        else {
            obj.children[0].material.opacity = value;
        }
    }
}
