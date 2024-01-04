import * as THREE from '../node_modules/three/src/Three.js'
import { SceneObject } from './core/SceneManager.js'
import { Lensflare } from '../node_modules/three/examples/jsm/objects/Lensflare.js'
import { LensflareElement } from '../node_modules/three/examples/jsm/objects/Lensflare.js'

/**
 * Wraps the threejs ambient light object
 */
export class AmbientLight extends SceneObject
{
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {THREE.Color} color color of the light
     * @param {Number} intensity intensity of the light
     */
    constructor(name, color, intensity) 
    {
        super(name)
        this.light = new THREE.AmbientLight(color, intensity)
    }

    /**
     * Sets the light intensity
     * @param {Number} intensity the intensity to be applied 
     */
    setIntensity(intensity) { this.light.intensity = intensity }

    /**
     * Returns the list of lights attached with this object
     * @returns {Array} array of threejs lights
     */
    getLights() { return [{object: this.light, isRayCastable: false}] }

    /**
     * Used for notifying the SceneManager if this object is drawable in screen.
     * @returns {Boolean} drawable status of camera
     */
    isDrawable() { return true }

    /**
     * Called by SceneManager as soon as the object gets unregistered in SceneManager.
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onSceneEnd(sceneManager) { this.light.dispose() }
}

/**
 * Wraps the threejs direct light object
 */
export class DirectLight extends SceneObject
{
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {THREE.Color} color color of the light
     * @param {Number} intensity intensity of light
     */
    constructor(name, color, intensity) 
    { 
        super(name)
        this.light = new THREE.DirectionalLight(color, intensity)
        this.target = new THREE.Object3D()
        this.light.target = this.target
        this.drawables = []
        this.lensFlare = new Lensflare()
        this.drawables.push({object: this.target, isRayCastable: false})
    }

    /**
     * Enables shadows
     * @param {Boolean} enable enables shadow if true
     * @param {Boolean} shouldUpdateEveryFrame if true then shadow map will be updated every frame
     */
    enableShadows(enable, shouldUpdateEveryFrame)
    {
        this.light.castShadow = enable
        if (enable)
        {
            this.light.shadow.mapSize.width = 8192
            this.light.shadow.mapSize.height = 4096
            this.light.shadow.camera.near = 0.1
            this.light.shadow.camera.far = 200
            this.light.shadow.camera.left = -20
            this.light.shadow.camera.right = 20
            this.light.shadow.camera.bottom = -20
            this.light.shadow.camera.top = 20
            this.light.shadow.bias = -0.0005
            this.light.shadow.autoUpdate = shouldUpdateEveryFrame
            this.light.shadow.needsUpdate = true
        }
    }

    /**
     * Adds the camera helper threejs object in drawables array to have it rendered on screen
     */
    enableCameraHelper() { this.drawables.push({object: new THREE.CameraHelper(this.light.shadow.camera), isRayCastable: false}) }

    /**
     * Adds extra threejs object for rendering as part of this scene object
     * @param {THREE.Object3D} drawableObject threejs object to be displayed
     * @param {Boolean} isRayCastable boolean value indicating whether the mesh should participate in ray casting
     */
    addDrawable(drawableObject, isRayCastable) { this.drawables.push({object: drawableObject, isRayCastable: isRayCastable}) }

    /**
     * Adds the lens flare threejs object in threejs light object to have it rendered on screen
     * @param {THREE.Texture} texture lens flare texture object
     */
    addLensFlare(texture)
    {
        this.lensFlare.addElement(new LensflareElement(texture, 512, 0.4))
        this.light.add(this.lensFlare)
    }

    /**
     * Sets the position of the light in world space
     * @param {Number} x x-coordinate in world space
     * @param {Number} y y-coordinate in world space
     * @param {Number} z z-coordinate in world space 
     */
    setPosition(x, y, z) { this.light.position.set(x, y, z) }

    getPosition() { return this.light.position }

    setRotation(x, y, z) { this.light.setRotationFromEuler(new THREE.Euler(x, y, z)) }

    getRotation() { return this.light.rotation }

    /**
     * Sets the position where the light is supposed to look at
     * @param {Number} x x-coordinate in world space
     * @param {Number} y y-coordinate in world space
     * @param {Number} z z-coordinate in world space 
     */
    setLookAt(x, y, z) { this.light.target.position.set(x, y, z) }

    getLookAt(x, y, z) { return this.light.target.position }

    /**
     * Sets the light intensity
     * @param {Number} intensity the intensity to be applied 
     */
    setIntensity(intensity) { this.light.intensity = intensity }

    /**
     * Returns the list of drawable threejs meshes
     * @returns {Array} array of threejs mesh objects
     */
    getDrawables() { return this.drawables }

    /**
     * Returns the list of lights attached with this object
     * @returns {Array} array of threejs lights
     */
    getLights() { return [{object: this.light, isRayCastable: false}, ] }

    /**
     * Used for notifying the SceneManager if this object is drawable in screen.
     * @returns {Boolean} drawable status of object 
     */
    isDrawable() { return true }

    /**
     * Called by SceneManager as soon as the object gets unregistered in SceneManager.
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onSceneEnd(sceneManager) 
    { 
        this.light.dispose()
        if (this.lensFlare != null)
            this.lensFlare.dispose()
    }
}

/**
 * Wraps the threejs point light object
 */
export class PointLight extends SceneObject
{
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {THREE.Color} color color of the light
     * @param {Number} intensity intensity of the light
     * @param {Number} distance maximum range of the light
     */
    constructor(name, color, intensity, distance)
    {
        super(name)
        this.light = new THREE.PointLight(color, intensity, distance)
        this.drawables = []
    }

    /**
     * Enables shadows
     * @param {Boolean} enable enables shadow if true
     * @param {Boolean} shouldUpdateEveryFrame if true then shadow map will be updated every frame
     */
    enableShadows(enable, shouldUpdateEveryFrame)
    {
        this.light.castShadow = enable
        if (enable)
        {
            this.light.shadow.mapSize.width = 1024
            this.light.shadow.mapSize.height = 1024
            this.light.shadow.camera.near = 0.1
            this.light.shadow.camera.far = 100
            this.light.shadow.camera.left = -5
            this.light.shadow.camera.right = 5
            this.light.shadow.camera.bottom = -5
            this.light.shadow.camera.top = 5
            this.light.shadow.bias = -0.0005
            this.light.shadow.autoUpdate = shouldUpdateEveryFrame
            this.light.shadow.needsUpdate = true
        }
    }

    /**
     * Adds extra threejs object for rendering as part of this scene object
     * @param {THREE.Object3D} drawableObject threejs object to be displayed
     * @param {Boolean} isRayCastable boolean value indicating whether the mesh should participate in ray casting
     */
    addDrawable(drawableObject, isRayCastable) { this.drawables.push({object: drawableObject, isRayCastable: isRayCastable}) }

    /**
     * Sets the position of the light in world space
     * @param {Number} x x-coordinate in world space
     * @param {Number} y y-coordinate in world space
     * @param {Number} z z-coordinate in world space 
     */
    setPosition(x, y, z) { this.light.position.set(x, y, z) }

    /**
     * Sets the light intensity
     * @param {Number} intensity the intensity to be applied 
     */
    setIntensity(intensity) { this.light.intensity = intensity }

    /**
     * Returns the list of drawable threejs meshes
     * @returns {Array} array of threejs mesh objects
     */
    getDrawables() { return this.drawables }

    /**
     * Returns the list of lights attached with this object
     * @returns {Array} array of threejs lights
     */
    getLights() { return [{object: this.light, isRayCastable: false}] }

    /**
     * Used for notifying the SceneManager if this object is drawable in screen.
     * @returns {Boolean} drawable status of camera
     */
    isDrawable() { return true }
    
    /**
     * Called by SceneManager as soon as the object gets unregistered in SceneManager.
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onSceneEnd(sceneManager) { this.light.dispose() }
}

/**
 * Wraps the threejs point light object
 */
export class SpotLight extends SceneObject
{
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {THREE.Color} color color of the light
     * @param {Number} intensity intensity of the light
     * @param {Number} distance maximum range of the light
     * @param {Number} angle angle of the light dispersion
     * @param {Number} penumbra amount of darkness that should appear at the edges of the circular region illuminated by the spot light
     */
    constructor(name, color, intensity, distance, angle, penumbra)
    {
        super(name)
        this.light = new THREE.SpotLight(color, intensity, distance, angle, penumbra)
        this.target = new THREE.Object3D()
        this.light.target = this.target
        this.drawables = []
        this.drawables.push({object: this.target, isRayCastable: false})
    }

    /**
     * Enables shadows
     * @param {Boolean} enable enables shadow if true
     * @param {Boolean} shouldUpdateEveryFrame if true then shadow map will be updated every frame
     */
    enableShadows(enable, shouldUpdateEveryFrame)
    {
        this.light.castShadow = enable
        if (enable)
        {
            this.light.shadow.mapSize.width = 1024
            this.light.shadow.mapSize.height = 1024
            this.light.shadow.camera.near = 0.1
            this.light.shadow.camera.far = 100
            this.light.shadow.camera.left = -5
            this.light.shadow.camera.right = 5
            this.light.shadow.camera.bottom = -5
            this.light.shadow.camera.top = 5
            this.light.shadow.bias = -0.0005
            this.light.shadow.autoUpdate = shouldUpdateEveryFrame
            this.light.shadow.needsUpdate = true
        }
    }

    /**
     * Adds extra threejs object for rendering as part of this scene object
     * @param {THREE.Object3D} drawableObject threejs object to be displayed
     * @param {Boolean} isRayCastable boolean value indicating whether the mesh should participate in ray casting
     */
    addDrawable(drawableObject, isRayCastable) { this.drawables.push({object: drawableObject, isRayCastable: isRayCastable}) }

    /**
     * Sets the position of the light in world space
     * @param {Number} x x-coordinate in world space
     * @param {Number} y y-coordinate in world space
     * @param {Number} z z-coordinate in world space 
     */
    setPosition(x, y, z) { this.light.position.set(x, y, z) }

    /**
     * Sets the position where the light is supposed to look at
     * @param {Number} x x-coordinate in world space
     * @param {Number} y y-coordinate in world space
     * @param {Number} z z-coordinate in world space 
     */
    setLookAt(x, y, z) { this.light.target.position.set(x, y, z) }

    /**
     * Sets the light intensity
     * @param {Number} intensity the intensity to be applied 
     */
    setIntensity(intensity) { this.light.intensity = intensity }

    /**
     * Returns the list of drawable threejs meshes
     * @returns {Array} array of threejs mesh objects
     */
    getDrawables() { return this.drawables }

    /**
     * Returns the list of lights attached with this object
     * @returns {Array} array of threejs lights
     */
    getLights() { return [{object: this.light, isRayCastable: false}] }

    /**
     * Used for notifying the SceneManager if this object is drawable in screen.
     * @returns {Boolean} drawable status of camera
     */
    isDrawable() { return true }
    
    /**
     * Called by SceneManager as soon as the object gets unregistered in SceneManager.
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onSceneEnd(sceneManager) { this.light.dispose() }
}