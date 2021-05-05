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
import CorrectFile from './assets/sfx/correct.wav';
import WrongFile from './assets/sfx/wrong.wav';
import StartFile from './assets/sfx/start.wav';
import PauseFile from './assets/sfx/pause.wav';
import ErrorFile from './assets/sfx/error.wav';

// Variables
let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;
let score = 0;
let lives = 3;
let level = 1;
let curr_order;
let step_size = 3;

// for playing status
const NOT_STARTED = 0;
const PAUSED = 1;
const PLAYING = 2;
let playing = NOT_STARTED;

// for overlay
const START = 0;
const INSTR = 1;
const NONE = 2;

// mapping to cake combo files
const FILE_MAP = {
    "plate": "p",
    "chocolate_cake": "cc",
    "yellow_cake": "yc",
    "chocolate_frosting": "cf",
    "matcha_frosting": "mf",
    "strawberry_frosting": "sf",
    "candles": "c",
    "sprinkles": "sp",
    "strawberry": "st"
};

// Sounds
const blip = new Audio(BlipFile);
const start = new Audio(StartFile);
const pause = new Audio(PauseFile);
const error = new Audio(ErrorFile);
const correct = new Audio(CorrectFile);
const wrong = new Audio(WrongFile);

// Initialize core ThreeJS components
const scene = new KitchenScene(WIDTH, HEIGHT);
const renderer = new WebGLRenderer({ antialias: true });

// on start screen so make scene opaque
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
    // let plate_pos = scene.state.updateList[0].children[0].position;
    let plate_pos = scene.state.updateList[scene.state.updateList.length - 1].children[0].position;
    let obj_pos = event.object.position;
    // console.log(event.object.parent.type);
    if (obj_pos.x >= plate_pos.x - 60 && obj_pos.x <= plate_pos.x + 60 && obj_pos.y >= plate_pos.y - 30 && obj_pos.y <= plate_pos.y + 30) {
        console.log(scene.state.updateList[0]);
        // if (scene.state.updateList.length == 1 && event.object.parent.type == 'base' || scene.state.updateList.length == 2 && event.object.parent.type == 'frosting' || scene.state.updateList.length == 3 && event.object.parent.type == 'topping') {
        // uncomment below line for topping on toppings
        // if (scene.state.updateList[0].type == 'plate' && event.object.parent.type == 'base' || scene.state.updateList[0].type == 'base' && event.object.parent.type == 'frosting' || scene.state.updateList[0].type == 'frosting' && event.object.parent.type == 'topping' || scene.state.updateList[0].type == 'topping' && event.object.parent.type == 'topping') {
        if (scene.state.updateList[0].type == 'plate' && event.object.parent.type == 'base' || scene.state.updateList[0].type == 'base' && event.object.parent.type == 'frosting' || scene.state.updateList[0].type == 'frosting' && event.object.parent.type == 'topping') {
            const new_type = event.object.parent.type;
            const new_name = event.object.parent.name;
            // scene.state.updateList.push(event.object.parent);
            // remove the new obj which has correctly been added
            scene.remove(event.object.parent);
            console.log(scene.state.order);
            scene.state.order.push(new_name);
            let file_path = "";
            for (let i = 0; i < scene.state.order.length; i++) {
                console.log(scene.state.order[i]);
                file_path += FILE_MAP[scene.state.order[i]] + "_";
            }
            file_path = 'src/assets/ingredients/cake_combos/' + file_path.substring(0, file_path.length - 1) + ".png"
            console.log(file_path);
            const map = new THREE.TextureLoader().load(file_path);
            // let map;  
            // if (event.object.parent.name == "chocolate_cake") {
            //     map = new THREE.TextureLoader().load( 'src/assets/ingredients/plate_cake/p_cc.png' ); 
            // }
            // else if (event.object.parent.name == "vanilla_cake") {
            //     map = new THREE.TextureLoader().load( 'src/assets/ingredients/plate_cake/p_yc.png' );  
            // }

            let material = new THREE.SpriteMaterial({ map: map });
            scene.state.updateList[0].children[0].material = material;
            scene.state.updateList[0].children[0].material.needsUpdate = true;
            scene.state.updateList[0].children[0].scale.set(WIDTH * 0.1, HEIGHT * 0.1, 1);
            scene.state.updateList[0].children[0].scale.needsUpdate = true;
            scene.state.updateList[0].children[0].position.y += 10;
            // update the type
            scene.state.updateList[0].type = new_type;
            
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
        if (scene.update(timeStamp, step_size, WIDTH, HEIGHT) == 0) {
            // console.log('resetting step size');
            step_size = 2;
        }
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
    // starting/pausing/restarting the game
    if (event.key == ' ') {
        if (playing == NOT_STARTED) {
            startGame();
        }
        else if (playing == PAUSED) {
            restartGame();
        }
        else {
            pauseGame();
        }
    }

    // bringing up instructions
    if (event.key == 'i') {
        if (playing == NOT_STARTED) {
            scene.toggleOverlay(WIDTH, HEIGHT, INSTR);
        }
        else {
            // do nothing if already in play or paused? 
        }
    }

    // bring up original start screen (home)
    if (event.key == 'h') {
        if (playing == NOT_STARTED) {
            scene.toggleOverlay(WIDTH, HEIGHT, START);
        }
        else {
            // do nothing if already in play or paused? 
        }
    }

    // submit cake
    if (event.key == 's') {
        if (playing == PLAYING) {
            submitOrder();
        }
    }

    // clear
    if (event.key == 'c') {
        if (playing == PLAYING) {
            scene.clearOrder(WIDTH, HEIGHT);
        }
    }
});

// start the game
function startGame() {
    playing = PLAYING;
    start.play();
    controls.activate();

    scene.addIngredients(WIDTH, HEIGHT);
    scene.addOrder(WIDTH, HEIGHT);
    setSceneOpacity(1);
    scene.toggleOverlay(WIDTH, HEIGHT, NONE);
    randOrder();
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
        else if (obj.type == "overlay") {
            // pass
        }
        else {
            obj.children[0].material.opacity = value;
        }
    }
}

// generate a new random order
function randOrder() {
    const BASES = ['yellow_cake', 'chocolate_cake'];
    const FROSTINGS = ['chocolate_frosting', 'matcha_frosting', 'strawberry_frosting'];
    const TOPPINGS = ['strawberry', 'candles', 'sprinkles'];
    let order = [];
    order.push(BASES[Math.floor(Math.random() * 2)]);
    if (level >= 2) {
        order.push(FROSTINGS[Math.floor(Math.random() * 3)]);
    }
    if (level >= 3) {
        order.push(TOPPINGS[Math.floor(Math.random() * 3)]);
    }
    curr_order = order;
    console.log("CURR ORDER: " + order);

    let file_path = 'src/assets/ingredients/cake_combos/p_'; 
    for (let i = 0; i < order.length; i++) {
        file_path += FILE_MAP[order[i]]; 
        if (i != order.length -1) {
            file_path += "_"; 
        }
    }
    file_path += ".png"; 
    console.log(file_path)

    const map = new THREE.TextureLoader().load(file_path);
    let material = new THREE.SpriteMaterial({ map: map });
    scene.state.menu[0].material = material;
    scene.state.menu[0].material.needsUpdate = true;

}

// check if order is correct and update score/lives
function submitOrder() {
    const attempted_order = [...scene.state.order];
    attempted_order.splice(0, 1);
    const len = curr_order.length;
    for (let i = 0; i < len; i++) {
        console.log(curr_order[i]);
        console.log(attempted_order[i]);
        if (curr_order[i] != attempted_order[i]) {
            lives -= 1;
            wrong.play();
            randOrder();
            step_size = 30;
            console.log("you lost a life");
            return;
        }
    }
    score += level * 100;
    correct.play();
    step_size = 30;
    console.log("CURR SCORE: " + score);
    randOrder();
}

let scoreDiv = document.createElement('div');
scoreDiv.id = 'scoreboard';
scoreDiv.innerHTML = 'SDKJFSDJJSDKFHSDKFJSH';
document.body.appendChild(scoreDiv);