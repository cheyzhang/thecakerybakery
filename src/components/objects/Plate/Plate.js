import * as THREE from 'three';
import { Group, Mesh, BoxBufferGeometry, MeshLambertMaterial, TextureLoader, Sprite, SpriteMaterial, Vector3 } from 'three';

class Plate extends Group {
    constructor(x, y, width, height) {
        // Call parent Group() constructor
        super();

        this.name = 'plate';

        const map = new THREE.TextureLoader().load( 'src/assets/plate_cropped.png' );
        const material = new THREE.SpriteMaterial( { map: map } );
        material.emissive = 0xaaaaaa;
        const sprite = new THREE.Sprite( material );
        sprite.scale.set( width * 0.08, height * 0.08, 1 );
        sprite.position.z = 0; 
        sprite.position.x = x; 
        sprite.position.y = y;
        this.add( sprite );

        // const main = new THREE.Mesh(
        //     new THREE.BoxBufferGeometry(1, 1, 1),
        //     new THREE.MeshLambertMaterial({color: 0xFFFFFF})
        // );
        // main.position.z = z;
        // main.position.y = y;
        // main.position.x = x;
        // main.castShadow = true;
        // main.receiveShadow = true;
        // this.add(main);
        return this;
    }

    update(timeStamp, stepSize, width) {
        if (this.children[0].position.x >= width / 3) {
            this.children[0].position.set(-width / 3, this.children[0].position.y, this.children[0].position.z);
        }
        else {
            this.children[0].position.set(this.children[0].position.x + stepSize, this.children[0].position.y, this.children[0].position.z);
        }
    }
}

export default Plate;
