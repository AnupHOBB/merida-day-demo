import * as THREE from '../../node_modules/three/src/Three.js'
import { CameraManager, PerspectiveCamera } from './CameraManager.js'

/**
 * Manages static camera
 */
export class StaticCameraManager extends CameraManager
{
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {Number} fov camera field of view
     */
    constructor(name, fov) 
    { 
        super(name)
        this.core = new PerspectiveCamera(fov) 
    }
    
    /**
     * Sets the position of the camera in world space
     * @param {Number} x x-coordinate in world space
     * @param {Number} y y-coordinate in world space
     * @param {Number} z z-coordinate in world space 
     */
    setPosition(x, y, z) { this.core.setPosition(x, y, z) }

    /**
     * Sets the rotation of the camera in world space
     * @param {Number} x x-coordinate in world space
     * @param {Number} y y-coordinate in world space
     * @param {Number} z z-coordinate in world space 
     */
    setRotation(x, y, z) { this.core.setRotation(x, y, z) }

    /**
     * Sets the position where the camera should look
     * @param {Number} x x-coordinate in world space
     * @param {Number} y y-coordinate in world space
     * @param {Number} z z-coordinate in world space 
     */
    setLookAt(x, y, z) { this.core.camera.lookAt(x, y, z) }
    
    /**
     * Returns world space position of the camera
     * @returns {THREE.Vector3} world space position of camera 
     */
    getPosition() { return this.core.getPosition() }

    /**
     * Sets the aspect ratio value in camera
     * @param {Number} ratio camera aspect ratio
     */
    setAspectRatio(ratio) { this.core.camera.aspect = ratio }

    /**
     * Sets the camera field of view
     * @param {Number} fov field of view
     */
    setFOV(fov) 
    {
        if (fov > 0) 
            this.core.camera.fov = fov 
    }
    
    /**
     * Gets the camera field of view
     * @returns {Number} fov field of view
     */
    getFOV() { return this.core.camera.fov }

    /**
     * Delegates call to OrbitalCameraManagerCore's updateMatrices
     */
    updateMatrices() { this.core.updateMatrices() }
    
    /**
     * Delegates call to OrbitalCameraManagerCore's worldToRaster
     * @param {THREE.Vector3} worldPosition position of point in world whose raster coordinate is required
     * @returns {[THREE.Vector2, Boolean]} [raster coordinate of the point whose world coordinate was given, 
     * boolean value to indicate whether the raster coordinate is valid or not]
     */
    worldToRaster(worldPosition) { return this.core.worldToRaster(worldPosition) }

    /**
     * Delegates call to OrbitalCameraManagerCore's worldToView
     * @param {THREE.Vector3} worldPosition position of point in world whose view space coordinate is required
     * @returns {THREE.Vector3} position of point in view space whose world coordinate was given
     */
    worldToView(worldPosition) { return this.core.worldToView(worldPosition) }

    /**
     * Returns the threejs camera object stored within
     * @returns {THREE.PerspectiveCamera} threejs camera object
     */
    getCamera() { return this.core.camera }
}