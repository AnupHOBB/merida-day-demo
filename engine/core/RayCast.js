import * as THREE from '../../node_modules/three/src/Three.js'

/**
 * Responsible for raycasting. Ray casting is done here in world space.
 */
export class RayCast
{
    constructor()
    {
        this.raycaster = new THREE.Raycaster()
        this.raycastNameMap = new Map()
        this.raycastObjects = []
    }

    /**
     * Adds scene objects for ray casting
     * @param {String} name name of the scene object
     * @param {THREE.Object3D} raycastObject the object itself
     */
    add(name, raycastObject) 
    { 
        let entry = this.raycastNameMap.get(name)
        if (entry == undefined)
        {
            this.raycastNameMap.set(name, raycastObject)
            this.raycastObjects.push(raycastObject)
        }
    }

    /**
     * Adds scene objects for ray casting
     * @param {String} name name of the scene object
     */
    remove(name) 
    { 
        let raycastObject = this.raycastNameMap.get(name)
        if (raycastObject != undefined)
        {
            let index = this.raycastObjects.indexOf(raycastObject)
            this.raycastObjects.splice(index, 1)
            this.raycastNameMap.delete(name)
        }
    }

    /**
     * Raycasts among objects and returns the hit point.
     * @param {THREE.Vector2} ndcCoord normalized device coordinate that is used as the ray cast origin point
     * @param {BaseCameraManager} cameraManager BaseCameraManager object
     * @returns {Array} array of hit point data
     */
    raycast(ndcCoord, cameraManager)
    {
        this.raycaster.setFromCamera(ndcCoord, cameraManager.getCamera())
        return this.raycaster.intersectObjects(this.raycastObjects)
    }
}