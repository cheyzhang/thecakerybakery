import * as THREE from 'three';
import { Group, Mesh, BoxBufferGeometry, MeshLambertMaterial, TextureLoader, Sprite, SpriteMaterial } from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import MODEL from './land.gltf';

class Plate extends Group {
    constructor(x, y, z) {
        // Call parent Group() constructor
        super();

        // const loader = new GLTFLoader();

        this.name = 'plate';

        // loader.load(MODEL, (gltf) => {
        //     this.add(gltf.scene);
        // });

        const map = new THREE.TextureLoader().load( 'https://lh4.googleusercontent.com/wjNg8xx-jiOfgIxxcnmLV2lZbw5tkwbyRsZ7bIQ4cDQjlxBA0BtpEz6ZRs3Oz33eRQp-Pqc_Tvfypxw7dN3VRCVW_zJXpLKmR1THbOE' );
        const material = new THREE.SpriteMaterial( { map: map } );
        const sprite = new THREE.Sprite( material );
        sprite.scale.set( 30, 14, 1 );
        sprite.position.z = 0; 
        sprite.position.x = -5; 
        sprite.position.y = -28;
        this.add( sprite );

        // const plate = THREE.Group();

        // const main = new THREE.Mesh(
        //     new THREE.BoxBufferGeometry(1, 1, 1),
        //     new THREE.MeshLambertMaterial(0x7ec022)
        // );
        // main.position.z = 0;
        // main.position.y = -30;
        // main.position.x = -80;
        // main.castShadow = true;
        // main.receiveShadow = true;
        // this.add(main);
        return this;
    }
}

export default Plate;
