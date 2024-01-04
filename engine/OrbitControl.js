import * as THREE from '../node_modules/three/src/Three.js'
import { Maths } from './helpers/maths.js'

/**
 * Responsible for making an object orbit around a point
 */
export class OrbitControl
{
    /**
     * @param {THREE.Object3D} object3D threejs object that is supposed to orbit around a point
     */
    constructor(object3D)
    {
        this.object3D = object3D
        this.center = new THREE.Vector3()
        this.restriction = p=>{return [true, p]}
        this.isOrbit = false
    }
    
    /**
     * @param {THREE.Vector3} center the point around which the object is supposed to revolve
     */
    setCenter(center) { this.center = center }

    /**
     * Adds a restriction to the orbit movement
     * @param {Function} restriction callback function that decides if the object position should be updated
     */
    addRestriction(restriction) { this.restriction = restriction }

    /**
     * Delegates call to OrbitControlCore's orbit if its isOrbit flag is true.
     * @param {THREE.Vector3} axis the axis around which the object will orbit
     * @param {Number} angle the angle by which the object will orbit
     */
    orbit(axis, angle)
    {
        if (!this.isOrbit)
            this._orbit(axis, angle)
    }

    /**
     * Delegates call to OrbitControlCore's auto if its isOrbit flag is true.
     * @param {THREE.Vector3} axis the axis around which the object will orbit
     * @param {Number} angle the angle by which the object will orbit
     */
    start(axis, angle)
    {
        if (!this.isOrbit)
        {
            this.isOrbit = true
            this._auto(axis, angle)
        }
    }

    /**
     * Stops the auto orbit by setting OrbitControlCore's isOrbit flag to false
     */
    stop() { this.isOrbit = false }

    /**
     * Moves the object around the orbit. Call this if the object needs to be moved automatically.
     * @param {THREE.Vector3} axis the axis around which the object will orbit
     * @param {Number} angle the angle by which the object will orbit
     */
    _auto(axis, angle)
    {
        if (this.isOrbit)
        {
            this._orbit(axis, 1)
            setTimeout(()=>this._auto(axis, angle), 1000/angle)
        }
    }

    /**
     * Moves the object around the orbit.
     * @param {THREE.Vector3} axis the axis around which the object will orbit
     * @param {Number} angle the angle by which the object will orbit
     */
    _orbit(axis, angle)
    {
        let vLookAt2Src = Maths.subtractVectors(this.object3D.position, this.center)
        let vLookAt2Dest = new THREE.Vector3(vLookAt2Src.x, vLookAt2Src.y, vLookAt2Src.z)
        vLookAt2Dest.applyAxisAngle(axis, Maths.toRadians(angle))
        let offset = Maths.subtractVectors(vLookAt2Dest, vLookAt2Src)
        let destination = Maths.addVectors(this.object3D.position, offset)
        let [shouldMove, newDestination] = this.restriction(destination, this.object3D.position)
        if (shouldMove)
        {
            this.object3D.position.set(newDestination.x, newDestination.y, newDestination.z)
            this.object3D.lookAt(this.center)
        }
    }
}