import * as THREE from 'three';
import { Group, Mesh, BoxBufferGeometry, MeshLambertMaterial } from 'three';

class Strawberry extends Group {
    constructor(x, y, z, width, height) {
        // Call parent Group() constructor
        super();

        this.name = 'strawberry';

        const map = new THREE.TextureLoader().load( 'https://lh6.googleusercontent.com/JOSi4KLhXjb1cCWRJDTaubvhtpyUD-OKdBYSoIqCrQphSfkIQ-JTY2T7QGS-qKIFbr4U8e-D05jdrEgsGxHVov9Lz-SGm-TPk2d1kmY' );
        const material = new THREE.SpriteMaterial( { map: map } );
        material.emissive = 0xaaaaaa;
        const sprite = new THREE.Sprite( material );
        sprite.scale.set( width * 0.06, height * 0.11, 1 );
        sprite.position.z = 0; 
        sprite.position.x = x; 
        sprite.position.y = y;
        // console.log(sprite.geometry.boundingBox);
        // sprite.geometry.computeBoundingBox();
        this.add( sprite );
        return this;
    }
}

export default Strawberry;
