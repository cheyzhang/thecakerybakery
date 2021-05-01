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
import BlipFile from './assets/sfx/blip.wav';
// import PointFile from './assets/point.wav';
import StartFile from './assets/sfx/start.wav';
import PauseFile from './assets/sfx/pause.wav';
import ErrorFile from './assets/sfx/error.wav';



// Variables
let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;
const NOT_STARTED = 0;
const PAUSED = 1;
const PLAYING = 2;
let playing = NOT_STARTED;

// Sounds
const blip = new Audio(BlipFile);
const start = new Audio(StartFile);
const pause = new Audio(PauseFile);
const error = new Audio(ErrorFile);

// Initialize core ThreeJS components
const scene = new KitchenScene(WIDTH, HEIGHT);
const renderer = new WebGLRenderer({ antialias: true });

setSceneOpacity(0.5);

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

// Set up controls
const controls = new DragControls(scene.state.draggable, camera, renderer.domElement);

// on drag start
let orig_pos;
controls.addEventListener('dragstart', function (event) {
    orig_pos = event.object.position.clone();
    // console.log(orig_pos);
    event.object.material.opacity = 0.6;
    blip.play();
});

// on drag end
controls.addEventListener('dragend', function (event) {
    event.object.material.opacity = 1;
    // console.log(event.object.position.x);
    // console.log(event.object.position.y);
    let plate_pos = scene.state.updateList[0].children[0].position;
    let obj_pos = event.object.position;
    if (obj_pos.x >= plate_pos.x - 60 && obj_pos.x <= plate_pos.x + 60 && obj_pos.y >= plate_pos.y - 30 && obj_pos.y <= plate_pos.y + 30) {
        if (scene.state.updateList.length == 1 && event.object.parent.type == 'base' || scene.state.updateList.length == 2 && event.object.parent.type == 'frosting' || scene.state.updateList.length == 3 && event.object.parent.type == 'topping') {
            scene.state.updateList.push(event.object.parent);
            // console.log(event.object.parent);
            for (let i = 0; i < scene.state.draggable.length; i++) {
                const obj = scene.state.draggable[i];
                if (obj.uuid == event.object.parent.uuid) {
                    scene.state.draggable.splice(i, 1);
                    break;
                }
            }
        }
        else {
            error.play();
            event.object.position.set(orig_pos.x, orig_pos.y, orig_pos.z);
        }
    }
    else {
        error.play();
        event.object.position.set(orig_pos.x, orig_pos.y, orig_pos.z);
    }
});

controls.deactivate();

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    if (timeStamp % 50 < 20 && playing == PLAYING) {
        scene.update(timeStamp, 2, WIDTH);
    }
    renderer.render(scene, camera);
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
    if (event.key == ' ') {
        if (playing == NOT_STARTED) {
            startGame();
        }
        else if(playing == PAUSED) {
            restartGame();
        }
        else {
            pauseGame();
        }
    }

});

// start the game
function startGame() {
    playing = PLAYING;
    start.play();
    controls.activate();

    scene.addIngredients(WIDTH, HEIGHT);
    setSceneOpacity(1);
    for (const obj of scene.children) {
        if (obj.type == "start") {
            scene.remove(obj);
            break;
        }
    }
    
}

// pause the game
function pauseGame() {
    playing = PAUSED;
    pause.play();
    setSceneOpacity(0.5);
    controls.deactivate();
}

// restart the game (after a pause)
function restartGame() {
    playing = PLAYING;
    start.play();
    setSceneOpacity(1);
    controls.activate();
}

// set the opacity of all objects in scene
function setSceneOpacity(value) {
    for (const obj of scene.children) {
        if (obj.type == "Sprite") {
            obj.material.opacity = value;
        }
        else if (obj.type == "start") {
            // pass
        }
        else {
            obj.children[0].material.opacity = value;
        }
    }
}
