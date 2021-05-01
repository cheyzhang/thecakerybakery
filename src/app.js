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
// import { Plate, Strawberry } from 'objects';

// Constants
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
// console.log(WIDTH);
// console.log(HEIGHT);

// Initialize core ThreeJS components
const scene = new KitchenScene(WIDTH, HEIGHT);
const renderer = new WebGLRenderer({ antialias: true });

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
// *** group together to make draggable
let group = new Group();
scene.add( group );
const controls = new DragControls(scene.state.draggable, camera, renderer.domElement);
// on drag start
controls.addEventListener( 'dragstart', function ( event ) {
    event.object.material.opacity = 0.6;
} );

const mouse = new THREE.Vector2();

function onMouseMove( event ) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = ( event.clientX / WIDTH ) * 2 - 1;
	mouse.y = - ( event.clientY / HEIGHT ) * 2 + 1;
}

window.addEventListener( 'mousemove', onMouseMove, false ); 

// on drag end
controls.addEventListener( 'dragend', function ( event ) {
    event.object.material.opacity = 1;
    console.log(event.object.position.x);
    console.log(event.object.position.y);
    console.log(event.object);
    console.log(event.object.parent.name);

} );

// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.enablePan = false;
// controls.minZoom = 4;
// controls.maxZoom = 100;
// controls.update();

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    if (timeStamp % 50 < 20) {
        scene.update(timeStamp, 3, WIDTH);
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
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);
