/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import * as THREE from 'three';
import { WebGLRenderer, OrthographicCamera, Vector3, Group, Raycaster, FontLoader, TextGeometry, DataTexture3D } from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { KitchenScene } from 'scenes';
import BlipFile from './assets/sfx/blip.wav';
import CorrectFile from './assets/sfx/correct.wav';
import WrongFile from './assets/sfx/wrong.wav';
import StartFile from './assets/sfx/start.wav';
import PauseFile from './assets/sfx/pause.wav';
import ErrorFile from './assets/sfx/error.wav';
import GameOverFile from './assets/sfx/game_over.wav';
import LevelUpFile from './assets/sfx/level_up.wav';

// Variables
let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;
console.log(WIDTH);
console.log(HEIGHT);
let score = 0;
let lives = 3;
let level = 2;
let curr_order;
let DEFAULT_STEP_SIZE = 0.002 * WIDTH;
let SUBMITTED_STEP_SIZE = 0.03 * WIDTH;
let step_size = DEFAULT_STEP_SIZE;
let muted = false;
const MUTED_NOTIF_FILE = 'src/assets/notifications/muted.png';
const UNMUTED_NOTIF_FILE = 'src/assets/notifications/unmuted.png';
const LEVEL_UP_FILE = 'src/assets/notifications/level_up2.png'; 
// let total_num_orders = 0;

// for playing status
const NOT_STARTED = 0;
const PAUSED = 1;
const PLAYING = 2;
const GAME_OVER = 3;
let playing = NOT_STARTED;

// for overlay
const START = 0;
const INSTR = 1;
const CONTROLS = 2;
const PAUSED_TITLE = 3;
const GAME_OVER_TITLE = 4;
const NONE = 5;
// const START_BLINK = 6;
// const INSTR_BLINK = 7;
// const CONTROLS_BLINK = 8;
// const PAUSED_BLINK = 9;
// const GAME_OVER_BLINK = 10;
// const NEW_NONE = 11;
let overlay = START;
// const BLINK_MAP = new Map();
// BLINK_MAP.set(START, START_BLINK);
// BLINK_MAP.set(INSTR, INSTR_BLINK);
// BLINK_MAP.set(CONTROLS, CONTROLS_BLINK);
// BLINK_MAP.set(PAUSED_TITLE, PAUSED_BLINK);
// BLINK_MAP.set(GAME_OVER_TITLE, GAME_OVER_BLINK);
// BLINK_MAP.set(START_BLINK, START);
// BLINK_MAP.set(INSTR_BLINK, INSTR);
// BLINK_MAP.set(CONTROLS_BLINK, CONTROLS);
// BLINK_MAP.set(PAUSED_BLINK, PAUSED_TITLE);
// BLINK_MAP.set(GAME_OVER_BLINK, GAME_OVER_TITLE);

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
const game_over_audio = new Audio(GameOverFile);
const level_up = new Audio(LevelUpFile);

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
canvas.id = "canvas";
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// load font for text 
var link = document.createElement('link');
link.setAttribute('rel', 'stylesheet');
link.setAttribute('type', 'text/css');
link.setAttribute('href', 'https://fonts.googleapis.com/css2?family=VT323&display=swap');
document.head.appendChild(link);

// Set up controls
const controls = new DragControls(scene.state.draggable, camera, renderer.domElement);

// on drag start
let orig_pos;
controls.addEventListener('dragstart', function (event) {
    orig_pos = event.object.position.clone();
    // console.log(orig_pos);
    event.object.material.opacity = 0.6;
    playAudio(blip);
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
    let y_thresh = 0; 
    if (scene.state.updateList[0].type == 'base') {
        y_thresh = 10; 
    }
    else if (scene.state.updateList[0].type == 'frosting') {
        y_thresh = 30; 
    }
    if (obj_pos.x >= plate_pos.x - 60 && obj_pos.x <= plate_pos.x + 60 && obj_pos.y >= plate_pos.y - 30 && obj_pos.y <= plate_pos.y + 40 + y_thresh) {
        // console.log(scene.state.updateList[0]);
        // if (scene.state.updateList.length == 1 && event.object.parent.type == 'base' || scene.state.updateList.length == 2 && event.object.parent.type == 'frosting' || scene.state.updateList.length == 3 && event.object.parent.type == 'topping') {
        // uncomment below line for topping on toppings
        // if (scene.state.updateList[0].type == 'plate' && event.object.parent.type == 'base' || scene.state.updateList[0].type == 'base' && event.object.parent.type == 'frosting' || scene.state.updateList[0].type == 'frosting' && event.object.parent.type == 'topping' || scene.state.updateList[0].type == 'topping' && event.object.parent.type == 'topping') {
        if (scene.state.updateList[0].type == 'plate' && event.object.parent.type == 'base' || scene.state.updateList[0].type == 'base' && event.object.parent.type == 'frosting' || scene.state.updateList[0].type == 'frosting' && event.object.parent.type == 'topping') {
            const new_type = event.object.parent.type;
            const new_name = event.object.parent.name;
            // scene.state.updateList.push(event.object.parent);
            // remove the new obj which has correctly been added
            scene.remove(event.object.parent);
            // console.log(scene.state.order);
            scene.state.order.push(new_name);
            let file_path = "";
            for (let i = 0; i < scene.state.order.length; i++) {
                // console.log(scene.state.order[i]);
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
            console.log(scene.state.updateList[0].type);
            console.log(event.object.parent.name);
            scene.state.updateList[0].children[0].scale.set(WIDTH * 0.1, HEIGHT * 0.1, 1);

            if (event.object.parent.name == "candles" || event.object.parent.name == "strawberry") {
                scene.state.updateList[0].children[0].scale.set(WIDTH*0.1, HEIGHT*0.1 + HEIGHT*0.018, 1);
                scene.state.updateList[0].children[0].scale.needsUpdate = true;
            }
            // scale the images properly
            // switch (scene.state.updateList[0].type) {
            //     case "plate":
            //         scene.state.updateList[0].children[0].scale.set(WIDTH * 0.1, HEIGHT * 0.1, 1);
            //         console.log("new: base");
            //         break;
            //     case "base":
            //         scene.state.updateList[0].children[0].scale.set(WIDTH * 0.1, HEIGHT * 0.1, 1);
            //         console.log("new: frosting");
            //         break;
            //     case "frosting":
            //         switch (event.object.parent.name) {
            //             case "candles":
            //                 console.log(scene.state.updateList[0].children[0]);
            //                 scene.state.updateList[0].children[0].scale.set(WIDTH * 0.2, HEIGHT * 0.8, 1);
            //                 scene.state.updateList[0].children[0].scale.needsUpdate = true;
            //                 console.log("new: candles");
            //                 console.log(scene.state.updateList[0].children[0].scale);
            //                 break;
            //             case "sprinkles":
            //                 scene.state.updateList[0].children[0].scale.set(WIDTH * 0.1, HEIGHT * 0.1, 1);
            //                 console.log("new: sprinkles");
            //                 break;
            //             case "strawberry":
            //                 scene.state.updateList[0].children[0].scale.set(WIDTH * 0.12, HEIGHT * 0.12, 1);
            //                 console.log("new: strawberry");
            //                 break;
            //             default:
            //                 scene.state.updateList[0].children[0].scale.set(WIDTH * 0.1, HEIGHT * 0.1, 1);
            //                 break;
            //         }
            //     default:
            //         scene.state.updateList[0].children[0].scale.set(WIDTH * 0.1, HEIGHT * 0.1, 1);
            //         break;
            // }
            // console.log(scene.state.updateList[0].children[0].scale);
            // scene.state.updateList[0].children[0].scale.set(WIDTH * 0.1, HEIGHT * 0.1, 1);
            scene.state.updateList[0].children[0].scale.needsUpdate = true;
            if (scene.state.updateList[0].type == "plate") {
                scene.state.updateList[0].children[0].position.y += 17;
            }
            
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
            playAudio(error);
            event.object.position.set(orig_pos.x, orig_pos.y, orig_pos.z);
        }
    }

    else {
        playAudio(error);
        event.object.position.set(orig_pos.x, orig_pos.y, orig_pos.z);
    }
});

controls.deactivate();

// make titles blink
let blinking = setInterval(function () {
    if (overlay != NONE) {
        if (control_text.style.display == 'none') {
            control_text.style.display = 'flex';
        }
        else {
            control_text.style.display = 'none';
        }
    }
    
    // if (overlay == NEW_NONE) {
    //     scene.toggleOverlay(WIDTH, HEIGHT, NONE);
    //     overlay = NONE;
    // }
    // else if (overlay != NONE) {
    //     scene.toggleOverlay(WIDTH, HEIGHT, BLINK_MAP.get(overlay));
    //     overlay = BLINK_MAP.get(overlay);
    // }
}, 500);


var control_text = document.createElement('div');
control_text.style.position = 'absolute';
control_text.style.width = 100;
control_text.style.height = 100;
control_text.innerHTML = "PRESS I FOR INSTRUCTIONS <br /> PRESS SPACE TO START";
control_text.style.top = 0.57 * HEIGHT + 'px';
control_text.style.left = 0.425 * WIDTH + 'px';
control_text.style.fontFamily = 'VT323';
control_text.style.fontSize = 0.016 * WIDTH + 'px';
control_text.style.color = "#C9956F";
control_text.style.textAlign = "center";
control_text.id = "control_text"
control_text.style.display = "none";
document.body.appendChild(control_text);

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    if (timeStamp % 50 < 20) {
        scene.update(timeStamp, step_size, WIDTH, HEIGHT, playing);
        if (scene.state.atEnd) {
            if (scene.state.submitted) {
                scene.state.submitted = false;
                step_size = DEFAULT_STEP_SIZE;
            }
            else {
                submitOrder(DEFAULT_STEP_SIZE);
                scene.state.submitted = false;
            }
            randOrder();
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
    DEFAULT_STEP_SIZE = 0.002 * WIDTH;
    SUBMITTED_STEP_SIZE = 0.03 * WIDTH;
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
        else if (playing == GAME_OVER) {
            window.location.reload();
        }
        else {
            pauseGame();
        }
    }

    // mute
    if (event.key == 'm') {
        if (muted) {
            console.log('unmuting');
            scene.showNotification(UNMUTED_NOTIF_FILE, 0, 0, WIDTH, HEIGHT);
        }
        else {
            console.log('muting');
            scene.showNotification(MUTED_NOTIF_FILE, 0, 0, WIDTH, HEIGHT);
        }
        muted = !muted;
    }

    // bringing up instructions
    if (event.key == 'i') {
        if (playing == NOT_STARTED) {
            overlay = INSTR;
            scene.toggleOverlay(WIDTH, HEIGHT, INSTR);
            control_text.innerHTML = "PRESS C FOR CONTROLS";
            control_text.style.top = 0.6 * HEIGHT + 'px';
            control_text.style.left = 0.44 * WIDTH + 'px';
            control_text.style.color = "#905B28";
        }
        else {
            // do nothing if already in play or paused? 
        }
    }

    // bring up home screen (welcome page)
    if (event.key == 'h') {
        if (playing == NOT_STARTED) {
            overlay = START;
            control_text.innerHTML = "PRESS I FOR INSTRUCTIONS <br /> PRESS SPACE TO START";
            scene.toggleOverlay(WIDTH, HEIGHT, START);
            control_text.style.color = "#C9956F";
            control_text.style.top = 0.57 * HEIGHT + 'px';
            control_text.style.left = 0.415 * WIDTH + 'px';
        }
        else {
            // do nothing if already in play or paused? 
        }
    }

    // bring up controls and clear
    if (event.key == 'c') {
        if (playing == NOT_STARTED || playing == PAUSED) {
            overlay = CONTROLS;
            scene.toggleOverlay(WIDTH, HEIGHT, CONTROLS);
            control_text.innerHTML = "PRESS I FOR INSTRUCTIONS <br /> PRESS SPACE TO START";
            control_text.style.color = "#905B28";
            control_text.style.top = 0.61 * HEIGHT + 'px';
            control_text.style.left = 0.425 * WIDTH + 'px';
        }
        else if (playing == PLAYING && !scene.state.submitted) {
            const attempted_order = [...scene.state.order];
            attempted_order.splice(0, 1);
            scene.replenishIngredients(WIDTH, HEIGHT, attempted_order);
            scene.clearOrder(WIDTH, HEIGHT);
        }
    }

    // submit cake
    if (event.key == 's') {
        if (playing == PLAYING) {
            if (!scene.state.submitted) {
                submitOrder(SUBMITTED_STEP_SIZE);
            }
        }
    }
});

// **** HELPER FUNCTIONS BELOW ****

// play audio
function playAudio(to_play) {
    if (!muted) {
        to_play.play();
    }
}

// start the game
function startGame() {
    playing = PLAYING;
    playAudio(start);
    controls.activate();

    scene.addIngredients(WIDTH, HEIGHT);
    scene.addOrder(WIDTH, HEIGHT);
    setSceneOpacity(1);
    overlay = NONE;
    scene.toggleOverlay(WIDTH, HEIGHT, NONE);
    control_text.innerHTML = "";
    randOrder();

    var score_text = document.createElement('div');
    score_text.style.position = 'absolute';
    score_text.style.width = 100;
    score_text.style.height = 100;
    score_text.innerHTML = "Score: " + score;
    score_text.style.top = 0.09 * HEIGHT + 'px';
    score_text.style.left = 0.83 * WIDTH + 'px';
    score_text.style.fontFamily = 'VT323';
    score_text.style.fontSize = 0.021 * WIDTH + 'px';
    score_text.style.color = "#E9967A";
    score_text.id = "score_text"
    document.body.appendChild(score_text);

    var level_text = document.createElement('div');
    level_text.style.position = 'absolute';
    level_text.style.width = 100;
    level_text.style.height = 100;
    level_text.innerHTML = "Level: " + level;
    level_text.style.top = 0.12 * HEIGHT + 'px';
    level_text.style.left = 0.83 * WIDTH + 'px';
    level_text.style.fontFamily = 'VT323';
    level_text.style.fontSize = 0.021 * WIDTH + 'px';
    level_text.style.color = "#E9967A";
    level_text.id = "level_text"
    document.body.appendChild(level_text);

    var live_text = document.createElement('div');
    live_text.style.position = 'absolute';
    live_text.style.width = 100;
    live_text.style.height = 100;
    live_text.innerHTML = "Lives: " + lives;
    live_text.style.top = 0.15 * HEIGHT + 'px';
    live_text.style.left = 0.83 * WIDTH + 'px';
    live_text.style.fontFamily = 'VT323';
    live_text.style.fontSize = 0.021 * WIDTH + 'px';
    live_text.style.color = "#E9967A";
    live_text.id = "live_text"
    document.body.appendChild(live_text);
}

// pause the game
function pauseGame() {
    playing = PAUSED;
    playAudio(pause);
    setSceneOpacity(0.5);
    overlay = PAUSED_TITLE;
    scene.toggleOverlay(WIDTH, HEIGHT, PAUSED_TITLE);
    control_text.innerHTML = "PRESS SPACE TO RESUME";
    control_text.style.top = 0.55 * HEIGHT + 'px';
    control_text.style.left = 0.435 * WIDTH + 'px';
    control_text.style.color = "#C9956F";
    controls.deactivate();
}

// restart the game (after a pause)
function restartGame() {
    playing = PLAYING;
    playAudio(start);
    setSceneOpacity(1);
    overlay = NONE;
    scene.toggleOverlay(WIDTH, HEIGHT, NONE);
    control_text.innerHTML = "";
    controls.activate();
}

function endGame() {
    playing = GAME_OVER;
    const map = new THREE.TextureLoader().load('src/assets/results/wrong.png');
    let material = new THREE.SpriteMaterial({ map: map });
    scene.state.menu[0].material = material;
    scene.state.menu[0].material.needsUpdate = true;
    scene.state.menu[0].scale.set(WIDTH * 0.12, WIDTH * 0.12, 1);
    scene.state.menu[0].scale.needsUpdate = true;
    setSceneOpacity(0.5);
    overlay = GAME_OVER_TITLE;
    scene.toggleOverlay(WIDTH, HEIGHT, GAME_OVER_TITLE);
    control_text.innerHTML = "PRESS SPACE TO PLAY AGAIN";
    control_text.style.top = 0.55 * HEIGHT + 'px';
    control_text.style.left = 0.425 * WIDTH + 'px';
    control_text.style.color = "#C9956F";
    controls.deactivate();
    playAudio(game_over_audio);
}

// set the opacity of all objects in scene
function setSceneOpacity(value) {
    for (const obj of scene.children) {
        // background?
        if (obj.type == "Sprite") {
            obj.material.opacity = value;
        }
        // overlay
        else if (obj.type == "overlay") {
            // pass
        }
        // ingredients
        else {
            // there should be 2 of each ingredient at all times
            if (value != 1) {
                obj.children[0].material.opacity = value / 2;
            }
            else {
                obj.children[0].material.opacity = value;
            }
        }
    }
    for (const menu of scene.state.menu) {
        menu.material.opacity = value;
    }
}

// generate a new random order
function randOrder() {
    const BASES = ['chocolate_cake', 'yellow_cake'];
    const FROSTINGS = ['chocolate_frosting', 'matcha_frosting', 'strawberry_frosting'];
    const TOPPINGS = ['candles', 'sprinkles', 'strawberry'];
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
        if (i != order.length - 1) {
            file_path += "_";
        }
    }
    file_path += ".png";
    // console.log(file_path)

    const map = new THREE.TextureLoader().load(file_path);
    let material = new THREE.SpriteMaterial({ map: map });
    scene.state.menu[0].material = material;
    scene.state.menu[0].material.needsUpdate = true;
    scene.state.menu[0].scale.set(WIDTH * 0.06, HEIGHT * 0.06, 1);
    scene.state.menu[0].scale.needsUpdate = true;
}

// check if order is correct and update score/lives
function submitOrder(newStepSize) {
    scene.state.submitted = true;
    // total_num_orders += 1;
    const attempted_order = [...scene.state.order];
    attempted_order.splice(0, 1);
    scene.replenishIngredients(WIDTH, HEIGHT, attempted_order);
    const len = curr_order.length;
    for (let i = 0; i < len; i++) {
        // console.log(curr_order[i]);
        // console.log(attempted_order[i])
        if (curr_order[i] != attempted_order[i]) {
            incorrectOrder(newStepSize);
            scene.clearOrder(WIDTH, HEIGHT);
            return;
        }
    }
    // CORRECT ORDER
    correctOrder(newStepSize);
    scene.clearOrder(WIDTH, HEIGHT);
}

function correctOrder(newStepSize) {
    score += 100;
    if (level == 1 && score >= 400) {
        level = 2;
        playAudio(level_up);
        console.log(scene.state.updateList);
        scene.showNotification(LEVEL_UP_FILE , 0, 0, WIDTH*2, HEIGHT);
        console.log(scene.state.updateList);
    }
    else if (level == 2) {
        if (score >= 1000) {
            level = 3;
            DEFAULT_STEP_SIZE = 5.5;
            playAudio(level_up);
            scene.showNotification(LEVEL_UP_FILE , 0, 0, WIDTH*0.5, HEIGHT);
        }
        else {
            DEFAULT_STEP_SIZE += 0.8;
        }
    }
    else if (level == 3) {
        DEFAULT_STEP_SIZE += Math.floor((score - 1000) / 500) * 0.8;
        console.log(DEFAULT_STEP_SIZE);
    }
    // add level 4 for multiple toppings?
    playAudio(correct);
    step_size = newStepSize;

    const map = new THREE.TextureLoader().load('src/assets/results/correct.png');
    let material = new THREE.SpriteMaterial({ map: map });
    scene.state.menu[0].material = material;
    scene.state.menu[0].material.needsUpdate = true;
    scene.state.menu[0].scale.set(WIDTH * 0.12, WIDTH * 0.12, 1);
    scene.state.menu[0].scale.needsUpdate = true;

    document.getElementById('level_text').innerHTML = 'Level: ' + level;
    document.getElementById('score_text').innerHTML = 'Score: ' + score;
}

function incorrectOrder(newStepSize) {
    // INCORRECT ORDER
    lives -= 1;
    document.getElementById('live_text').innerHTML = 'Lives: ' + lives;
    playAudio(wrong);
    const map = new THREE.TextureLoader().load('src/assets/results/wrong.png');
    let material = new THREE.SpriteMaterial({ map: map });
    scene.state.menu[0].material = material;
    scene.state.menu[0].material.needsUpdate = true;
    scene.state.menu[0].scale.set(WIDTH * 0.12, WIDTH * 0.12, 1);
    scene.state.menu[0].scale.needsUpdate = true;
    step_size = newStepSize;
    if (lives == 0) {
        endGame();
    }
}