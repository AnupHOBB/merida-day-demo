import * as THREE from '../../node_modules/three/src/Three.js'
import { CameraManager, PerspectiveCamera } from './CameraManager.js'
import { OrbitControl } from '../OrbitControl.js'
import { Maths } from '../helpers/maths.js'

/**
 * Wraps OrbitalCameraManagerCore object.
 */
export class OrbitalCameraManager extends CameraManager
{
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {Number} fov camera field of view
     * @param {THREE.Vector3} axis orbit axis
     */
    constructor(name, fov) 
    { 
        super(name)
        this.core = new OrbitalCameraManagerCore(fov) 
    }

    /**
     * Registers orbital camera manager inputs to the input manager
     * @param {ENGINE.InputManager} inputManager the input manager object
     */
    registerInput(inputManager)
    {
        if (inputManager != null)
        {
            inputManager.registerLMBMoveEvent((dx, dy) => this.core.orbit(dx, dy))
            inputManager.registerRMBMoveEvent((dx, dy) => this.core.pan(dx, dy))
            inputManager.registerMouseWheelEvent(s => this.core.zoom(s))
            inputManager.setCursorSensitivity(0.5)
        }
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
     * Sets the camera field of view
     * @param {Number} fov field of view
     */
    setFOV(fov) 
    {
        if (fov > 0) 
            this.core.camera.fov = fov 
    }

    /**
     * Sets the position where the camera should look
     * @param {THREE.Vector3} lookAt the position where the camera should look
     */
    setLookAt(lookAt) { this.core.setLookAt(lookAt) }

    /**
     * Sets the sensitivity of the camera pan movement
     * @param {Number} sensitivity the sensitivity value for camera pan
     */
    setPanSensitivity(sensitivity) { this.core.setPanSensitivity(sensitivity) }

    /**
     * Sets the sensitivity of the camera zoom
     * @param {Number} sensitivity the sensitivity value for camera zoom
     */
    setZoomSensitivity(sensitivity) { this.core.setZoomSensitivity(sensitivity) }

    /**
     * Sets the camera aspect ratio
     * @param {Number} aspect aspect ratio of camera 
     */
    setAspectRatio(aspect) { this.core.setAspectRatio(aspect) }
    
    /**
     * Returns world space position of the camera
     * @returns {THREE.Vector3} world space position of camera 
     */
    getPosition() { return this.core.getPosition() }

    /**
     * Delegates call to ENGINE.PerspectiveCamera's updateMatrices
     */
    updateMatrices() { this.core.updateMatrices() }
    
    /**
     * Delegates call to ENGINE.PerspectiveCamera's worldToRaster
     * @param {THREE.Vector3} worldPosition position of point in world whose raster coordinate is required
     * @returns {[THREE.Vector2, Boolean]} [raster coordinate of the point whose world coordinate was given, 
     * boolean value to indicate whether the raster coordinate is valid or not]
     */
    worldToRaster(worldPosition) { return this.core.worldToRaster(worldPosition) }

    /**
     * Delegates call to ENGINE.PerspectiveCamera's worldToView
     * @param {THREE.Vector3} worldPosition position of point in world whose view space coordinate is required
     * @returns {THREE.Vector3} position of point in view space whose world coordinate was given
     */
    worldToView(worldPosition) { return this.core.worldToView(worldPosition) }

    /**
     * Returns the threejs camera object stored within
     * @returns {THREE.PerspectiveCamera} threejs camera object
     */
    getCamera() { return this.core.camera }

    /**
     * Adds a restriction to the orbit movement in yaw direction
     * @param {Function} restriction callback function that decides if the object position should be updated
     */
    addYawRestriction(restriction) { this.core.addYawRestriction(restriction) }

    /**
     * Adds a restriction to the orbit movement in pitch direction
     * @param {Function} restriction callback function that decides if the object position should be updated
     */
    addPitchRestriction(restriction) { this.core.addPitchRestriction(restriction) }
}

/**
 * Extends the functionality of PerspectiveCameraManager to provide orbital camera feature
 */
class OrbitalCameraManagerCore extends PerspectiveCamera
{
    /**
     * @param {Number} fov camera field of view
     * @param {THREE.Vector3} axis orbit axis
     */
    constructor(fov)
    {
        super(fov)
        this.lookAt = new THREE.Vector3()
        this.cameraOrbiterYaw = new OrbitControl(this.camera)
        this.cameraOrbiterYaw.setCenter(this.lookAt)
        this.cameraOrbiterPitch = new OrbitControl(this.camera)
        this.cameraOrbiterPitch.setCenter(this.lookAt)
        this.cameraOrbiterPitch.addRestriction((d, p) => this.pitchRestriction(d))
        this.panSensitivity = 0.01
        this.zoomSensitivity = 0.01
    }

    /**
     * Sets the position where the camera should look
     * @param {THREE.Vector3} lookAt the position where the camera should look
     */
    setLookAt(lookAt) 
    { 
        this.lookAt = lookAt
        this.cameraOrbiterYaw.setCenter(this.lookAt)
        this.cameraOrbiterPitch.setCenter(this.lookAt)
        this.camera.lookAt(lookAt)
    }

    /**
     * Sets the sensitivity of the camera pan movement
     * @param {Number} sensitivity the sensitivity value for camera pan
     */
    setPanSensitivity(sensitivity) 
    { 
        if (sensitivity > 0)
            this.panSensitivity = sensitivity 
    }

    /**
     * Sets the sensitivity of the camera zoom
     * @param {Number} sensitivity the sensitivity value for camera zoom
     */
    setZoomSensitivity(sensitivity) 
    { 
        if (sensitivity > 0)
            this.zoomSensitivity = sensitivity 
    }

    /**
     * Adds a restriction to the orbit movement in yaw direction
     * @param {Function} restriction callback function that decides if the object position should be updated
     */
    addYawRestriction(restriction) { this.cameraOrbiterYaw.addRestriction(restriction) }

    /**
     * Adds a restriction to the orbit movement in pitch direction
     * @param {Function} restriction callback function that decides if the object position should be updated
     */
    addPitchRestriction(restriction) { this.cameraOrbiterPitch.addRestriction(restriction) }

    /**
     * Called by InputManager whenever it detects cursor movement. This function is only called when the user holds LMB and moves the mouse.
     * This function rotates the the camera around based on mouse movement.
     * @param {Number} deltaX displacement of cursor in x-direction
     * @param {Number} deltaY displacement of cursor in y-direction
     */
    orbit(deltaX, deltaY) 
    { 
        this.cameraOrbiterYaw.orbit(new THREE.Vector3(0, 1, 0), -deltaX) 
        this.cameraOrbiterPitch.orbit(this.right, -deltaY)
        this.updateMatrices()
    }

    /**
     * Called by InputManager whenever it detects mouse wheel movement.
     * This function zooms in and out the camera by changing its field of view.
     * @param {Number} scale this value will be 1 if wheel is moving forwar, -1 if backward and 0 if wheel is staionary
     */
    zoom(scale) 
    { 
        let position = Maths.addVectors(this.camera.position, Maths.scaleVector(this.front, -scale * this.zoomSensitivity))
        let lookAt2Position = Maths.subtractVectors(position, this.lookAt)
        let dot = Maths.dot(lookAt2Position, this.front)
        if (dot < 0)
            this.camera.position.set(position.x, position.y, position.z)
    }

    /**
     * Called by InputManager whenever it detects cursor movement. This function is only called when the user holds RMB and moves the mouse.
     * This function pans the camera
     * @param {Number} deltaX displacement of cursor in x-direction
     * @param {Number} deltaY displacement of cursor in y-direction
     */
    pan(deltaX, deltaY)
    {
        let position = Maths.addVectors(this.camera.position, Maths.scaleVector(this.right, deltaX * this.panSensitivity))
        position = Maths.addVectors(position, Maths.scaleVector(this.up, -deltaY * this.panSensitivity))
        this.camera.position.set(position.x, position.y, position.z)
        this.lookAt = Maths.addVectors(this.lookAt, Maths.scaleVector(this.right, deltaX * this.panSensitivity))
        this.lookAt = Maths.addVectors(this.lookAt, Maths.scaleVector(this.up, -deltaY * this.panSensitivity))
        this.cameraOrbiterYaw.setCenter(this.lookAt)
        this.cameraOrbiterPitch.setCenter(this.lookAt)
    }

    /**
     * Restricts camera pitc rotation in between -89 to 89 degrees
     */
    pitchRestriction(target)
    {
        let vLookAt2target = Maths.subtractVectors(target, this.lookAt)
        let dot = Maths.dot(vLookAt2target, Maths.scaleVector(new THREE.Vector3(this.front.x, 0, this.front.z), -1))
        return [dot > 0.017, target]
    }
}