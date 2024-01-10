import * as THREE from '../../node_modules/three/src/Three.js'
import { RayCast } from './RayCast.js'
import { SceneRenderer } from './SceneRenderer.js'

/**
 * Parent class for all actors, camera managers and any object that appears as part of the scene
 */
export class SceneObject
{
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {THREE.Object3D} scene threejs object3D instance
     */
    constructor(name, scene) 
    { 
        this.name = name
        this.scene = (scene != undefined && scene.isObject3D != undefined && scene.isObject3D) ? scene : new THREE.Group()
        this.children = []
    }

    /**
     * Sets the position of the mesh in world space
     * @param {Number} x x-coordinate in world space
     * @param {Number} y y-coordinate in world space
     * @param {Number} z z-coordinate in world space 
     */
    setPosition(x, y, z) { this.scene.position.set(x, y, z) }

    /**
     * Sets the rotation of the mesh in world space using euler values
     * @param {Number} x pitch in world space
     * @param {Number} y yaw in world space
     * @param {Number} z roll in world space 
     */
    setRotation(x, y, z) { this.scene.rotation.set(x, y, z) }
    
    /**
     * Sets the rotation of the mesh in world space using axis and angle
     * @param {Vector3} axis axis of rotation
     * @param {Number} angle angle of rotation in radians
     */
    setRotationFromAxisAngle(axis, angle) { this.scene.setRotationFromAxisAngle(axis, angle) }

    /**
     * Sets the rotation order for the model. Values should be one of the following in string :-
     * XYZ, ZXY, YZX, XZY, YXZ, ZYX
     * @param {String} order the rotation order in string
     */
    setRotationOrder(order) { this.scene.rotation.order = order }

    /**
     * Attaches another scene object oject to this one
     * @param {SceneObject} model 
     */
    attach(model)
    {
        if (model != undefined)
        {
            model.scene.parent = this.scene
            this.scene.children.push(model.scene)
            this.children.push(model)
        }
    }

    /**
     * Detaches model oject from this one
     * @param {SceneObject} model 
     */
    detach(model)
    {
        if (model != undefined)
        {
            let i = this.scene.children.indexOf(model.scene)
            if (i > -1)    
            {    
                this.scene.children.splice(i, 1)
                model.scene.parent = null
                let j = this.children.push(model)
                if (j > -1)
                    this.children.splice(j, 1)
            }
        }
    }

    /**
     * Returns an array of attached models
     * @returns {Array} array of attached children models
     */
    getAttachedModels() { return this.children }

    /**
     * Called by SceneManager when there is a message for this object posted by any other object registered in SceneManager.
     * @param {SceneManager} sceneManager the SceneManager object
     * @param {String} senderName name of the object who posted the message
     * @param {any} data any object sent as part of the message
     */
    onMessage(sceneManager, senderName, data) {}

    /**
     * Called by SceneManager as soon as the object gets registered in SceneManager.
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onSceneStart(sceneManager) {}

    /**
     * Called by SceneManager every frame.
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onSceneRender(sceneManager) {}

    /**
     * Called by SceneManager as soon as the object gets unregistered in SceneManager.
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onSceneEnd(sceneManager) {}

    /**
     * Used for notifying the SceneManager if this object is ready to be included in scene.
     * @returns {Boolean}
     */
    isReady() { return true }

    /**
     * Returns the list of drawable threejs meshes
     * @returns {Array} array of threejs mesh objects
     */
    getDrawables() { return [{object: this.scene, isRayCastable: this.isRayCastable}] }

    /**
     * Returns the list of lights attached with this object
     * @returns {Array} array of threejs lights
     */
    getLights() { return [] }

    /**
     * Used for notifying the SceneManager if this object should be included in raycasting.
     * @returns {Boolean}
     */
    isDrawable() { return false }
}

/**
 * Represents group of sceneobjects
 */
export class SceneObjectGroup extends SceneObject
{
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     */
    constructor(name) 
    { 
        super(name)
        this.sceneObjects = []
        this.drawables = []
        this.lights = []
    }

    /**
     * Adds the scene object as part of the group
     * @param {SceneObject} sceneObject sceneObject that needs to be added as part of the group
     */
    add(sceneObject) 
    { 
        this.sceneObjects.push(sceneObject)
        let sceneObjectDrawables = sceneObject.getDrawables()
        let sceneObjectLights = sceneObject.getLights()
        for (let sceneObjectDrawable of sceneObjectDrawables)
            this.drawables.push(sceneObjectDrawable)
        for (let sceneObjectLight of sceneObjectLights)
            this.lights.push(sceneObjectLight)
    }

    /**
     * Called by SceneManager when there is a message for this object posted by any other object registered in SceneManager.
     * @param {SceneManager} sceneManager the SceneManager object
     * @param {String} senderName name of the object who posted the message
     * @param {any} data any object sent as part of the message
     */
    onMessage(sceneManager, senderName, data) 
    {
        for (let sceneObject of this.sceneObjects)
            sceneObject.onMessage(sceneManager, senderName, data) 
    }

    /**
     * Called by SceneManager as soon as the object gets registered in SceneManager.
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onSceneStart(sceneManager) 
    {
        for (let sceneObject of this.sceneObjects)
            sceneObject.onSceneStart(sceneManager) 
    }

    /**
     * Called by SceneManager every frame.
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onSceneRender(sceneManager) 
    {
        for (let sceneObject of this.sceneObjects)
            sceneObject.onSceneRender(sceneManager) 
    }

    /**
     * Called by SceneManager as soon as the object gets unregistered in SceneManager.
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onSceneEnd(sceneManager) 
    {
        for (let sceneObject of this.sceneObjects)
            sceneObject.onSceneEnd(sceneManager) 
    }

    /**
     * Used for notifying the SceneManager if this object is ready to be included in scene.
     * @returns {Boolean}
     */
    isReady() 
    {
        let ready = true
        for (let sceneObject of this.sceneObjects)
            ready &&= sceneObject.isReady()
        return ready 
    }

    /**
     * Returns the list of drawable threejs meshes
     * @returns {Array} array of threejs mesh objects
     */
    getDrawables() { return this.drawables }

    /**
     * Returns the list of lights attached with this object
     * @returns {Array} array of threejs lights
     */
    getLights() { return this.lights }

    /**
     * Used for notifying the SceneManager if this object should be included in raycasting.
     * @returns {Boolean}
     */
    isDrawable() { return true }
}

/**
 * Manages the render loop, notifies the scene objects when they ae registered and on every frame and
 * facilitates messaging between scene objects.
 */
export class SceneManager
{
    /**
     * @param {HTMLCanvasElement} canvas HTML canvas element
     */
    constructor(canvas)
    {
        this.percentWidth = 1
        this.percentHeight = 1
        this.autoUpdateScreenSize = true
        this.width = window.innerWidth * this.percentWidth
        this.height = window.innerHeight *  this.percentHeight
        this.raycast = new RayCast()
        this.activeCameraManager = null
        this.sceneObjectMap = new Map()
        this.inactiveObjNameMap = new Map()
        this.messageMap = new Map()
        this.sceneRenderer = new SceneRenderer(canvas, this.width, this.height)
        this.canvas = canvas
        this.outlineMeshes = []
        this._renderLoop()
    }

    /**
     * Registers the SceneObject into SceneManager.
     * The object provided to this function will receive callbacks but it won't be visible into the threejs scene unless its ready.
     * @param {SceneObject} sceneObject sceneObject that needs to be registered in the scene manager.
     */
    register(sceneObject)
    {
        this.sceneObjectMap.set(sceneObject.name, sceneObject)
        if (sceneObject.isDrawable() && !sceneObject.isReady())
            this.inactiveObjNameMap.set(sceneObject.name, null)
        else if (sceneObject.isReady())
        {
            this._addToScene(sceneObject)     
            sceneObject.onSceneStart(this)
        }
        this._checkMessages(sceneObject)
    }

    /**
     * Unregisters the SceneObject into SceneManager.
     * @param {String} name name of the sceneObject that is registered in the scene manager.
     */
    unregister(name)
    {
        let sceneObject = this.sceneObjectMap.get(name)
        if (sceneObject != undefined)
        {
            this._removeFromScene(sceneObject)
            sceneObject.onSceneEnd(this)
            this.sceneObjectMap.delete(name)
        }
    }

    /**
     * Converts the world coordinate value of a point in raster coordinate and also returns a boolean to indicate
     * whether that raster coordinate is valid or not.
     * The raster value will only be returned if the world position given is the nearest and is not occluded by any other object 
     * in the scene. This is checked by performing a ray cast at that point. 
     * @param {THREE.Vector3} worldPosition position of point in world whose raster coordinate is required
     * @returns {[THREE.Vector2, Boolean]} [raster coordinate of the point whose world coordinate was given, 
     * boolean value to indicate whether the raster coordinate is valid or not]
     */
    getRasterCoordIfNearest(worldPosition)
    {
        let [rasterCoord, isValid] = this.activeCameraManager.worldToRaster(worldPosition)
        if (isValid)
        {        
            let hitPointData = this.raycast.raycast(rasterCoord, this.activeCameraManager)
            if (hitPointData != undefined && hitPointData.length > 0)
            {
                let hitPointWorld = hitPointData[0].point
                isValid &&= hitPointWorld != undefined
                if (isValid)
                {
                    let viewPosition = this.activeCameraManager.worldToView(worldPosition)
                    let hitPointView = this.activeCameraManager.worldToView(hitPointWorld)
                    isValid &&= viewPosition.z <= hitPointView.z
                    return [rasterCoord, isValid]
                }
            }      
        } 
        return [, false]
    }

    /**
     * Sets that camera as active whose name is given.
     * @param {String} name name of the camera to be activated. 
     */
    setActiveCamera(name) 
    {
        let cameraManager = this.sceneObjectMap.get(name)
        if (cameraManager != null && cameraManager != undefined)
        {
            this.activeCameraManager = cameraManager
            this.activeCameraManager.onActive(this)
            this.sceneRenderer.setup(this.activeCameraManager.getCamera())
        }
    }

    /**
     * Defines how much percentge of screen should the canvas cover in width and height directions
     * @param {Float} widthPercent percent of screen width that the canvas should cover
     * @param {Float} heightPercent percent of screen height that the canvas should cover
     */
    setSizeInPercent(widthPercent, heightPercent)
    {
        if (widthPercent > 0 && widthPercent <= 1)
            this.percentWidth = widthPercent
        if (heightPercent > 0 && heightPercent <= 1)
            this.percentHeight = heightPercent
    }

    /**
     * Allows scene objects to send message to a particular scene object.
     * @param {String} from name of the object that broadcasted the data
     * @param {String} to name of the object that should receive the data
     * @param {any} data data to be received by the receiver
     */
    broadcastTo(from, to, data)
    {
        let sceneObject = this.sceneObjectMap.get(to)
        if (sceneObject != undefined)
            sceneObject.onMessage(this, from, data)
        else 
        {    
            let messages = this.messageMap.get(to)
            if (messages == undefined)
                this.messageMap.set(to, [{ from: from, to: to, data: data }])
            else
                messages.push({ from: from, to: to, data: data })
        }
    }

    /**
     * Allows scene objects to send message to all scene objects.
     * @param {String} from name of the object that broadcasted the data
     * @param {any} data data to be received by all objects
     */
    broadcastToAll(from, data)
    {
        let sceneObjectKeys = this.sceneObjectMap.keys()
        for (let sceneObjectKey of sceneObjectKeys)
            if (sceneObjectKey != from)
                this.sceneObjectMap.get(sceneObjectKey).onMessage(this, from, data)     
    }

    setBackground(background) { this.sceneRenderer.setBackground(background) }

    setBloomPercentage(percent) { this.sceneRenderer.setBloomPercentage(percent) }

    setBloomIntensity(intensity) { this.sceneRenderer.setBloomIntensity(intensity) }

    setBloomThreshold(threshold) { this.sceneRenderer.setBloomThreshold(threshold) }

    setBloomRadius(radius) { this.sceneRenderer.setBloomRadius(radius) }

    enableSSAO(enable) { this.sceneRenderer.enableSSAO(enable) }

    setSSAORadius(radius) { this.sceneRenderer.setSSAORadius(radius) }

    setSSAOMinDistance(minDist) { this.sceneRenderer.setSSAOMinDistance(minDist) }

    setSSAOMaxDistance(maxDist) { this.sceneRenderer.setSSAOMaxDistance(maxDist) }

    setSSAOShowAOMap(show) { this.sceneRenderer.setSSAOShowAOMap(show) }

    setSSAOShowNormalMap(show) { this.sceneRenderer.setSSAOShowNormalMap(show) }

    setSharpness(sharpness) { this.sceneRenderer.setSharpness(sharpness) }

    enableFXAA(enable) { this.sceneRenderer.enableFXAA(enable) }

    enableSSAA(enable) { this.sceneRenderer.enableSSAA(enable) }

    setSSAASampleLevel(samplelevel) { this.sceneRenderer.setSSAASampleLevel(samplelevel) }

    setShadowsColorBalance(shadowsRgb) { this.sceneRenderer.setShadowsColorBalance(shadowsRgb) }

    setMidtonesColorBalance(midtonesRgb) { this.sceneRenderer.setMidtonesColorBalance(midtonesRgb) }

    setHighlightsColorBalance(highlightsRgb) { this.sceneRenderer.setHighlightsColorBalance(highlightsRgb) }

    setToneMapping(toneMapping) { this.sceneRenderer.setToneMapping(toneMapping) }

    setExposure(exposure) { this.sceneRenderer.setExposure(exposure) }

    setSaturation(saturation) { this.sceneRenderer.setSaturation(saturation) }

    setContrast(contrast) { this.sceneRenderer.setContrast(contrast) }
    
    setBrightness(brightness) { this.sceneRenderer.setBrightness(brightness) }

    setGamma(gamma) { this.sceneRenderer.setGamma(gamma) }

    showStats(htmlElement) { this.sceneRenderer.showStats(htmlElement) }

    enableOutlining(enable) { this.sceneRenderer.enableOutlining(enable) }

    changeOutlineColor(visibleEdgeColor, hiddenEdgeColor) { this.sceneRenderer.changeOutlineColor(visibleEdgeColor, hiddenEdgeColor) }

    changeOutlineThickness(thickness) { this.sceneRenderer.changeOutlineThickness(thickness) }

    changeOutlineGlow(glow) { this.sceneRenderer.changeOutlineGlow(glow) }

    changeOutlineStrength(strength) { this.sceneRenderer.changeOutlineStrength(strength) }

    outlineNearestObjectAt(rasterCoord, onOutline)
    {
        if (rasterCoord != undefined && rasterCoord.x >= 0 && rasterCoord.x < window.innerWidth && rasterCoord.y >= 0 && rasterCoord.y < window.innerHeight)
        {
            let bounds = this.canvas.getBoundingClientRect()
            let ndcX = (rasterCoord.x / bounds.width) *  2 - 1
            let ndcY = -(rasterCoord.y / bounds.height) *  2 + 1
            let hitPointDataArray = this.raycast.raycast({x: ndcX, y: ndcY}, this.activeCameraManager)
            let hitPointDataObject
            if (hitPointDataArray != undefined && hitPointDataArray.length > 0)    
            {    
                hitPointDataObject = hitPointDataArray[0]
                if (onOutline != undefined)
                {    
                    let finalOutlineMeshes = []
                    for (let outlineMesh of this.outlineMeshes)
                        finalOutlineMeshes.push(outlineMesh)
                    finalOutlineMeshes.push(hitPointDataArray[0].object)
                    this.sceneRenderer.addObjectsToOutline(finalOutlineMeshes)
                    onOutline(hitPointDataObject)
                }
            }
        }
    }

    outlineMeshOf(sceneObjectName, meshName)
    {
        let sceneObject = this.sceneObjectMap.get(sceneObjectName)
        if (sceneObject != undefined)
        {
            try
            {
                let mesh = sceneObject.getMesh(meshName)
                if (mesh != undefined && mesh != null)
                {    
                    this.outlineMeshes.push(mesh)
                    this.sceneRenderer.addObjectsToOutline(this.outlineMeshes)
                }
            }
            catch (e) {}
        }
    }

    /**
     * Returns the maximum anisotropy value supported by the hardware
     * @returns {Number} the maximum anisotropy value supported by the hardware
     */
    getMaxAnistropy() { this.sceneRenderer.getMaxAnistropy() }

    raycastAndGetNearest(rasterCoord)
    {
        let bounds = this.canvas.getBoundingClientRect()
        let ndcX = (rasterCoord.x / bounds.width) *  2 - 1
        let ndcY = -(rasterCoord.y / bounds.height) *  2 + 1
        let hitPointDataArray = this.raycast.raycast({x: ndcX, y: ndcY}, this.activeCameraManager)
        return hitPointDataArray[0]
    }

    /**
     * Checks any messages for the scene object in the notice board and sends that message to it if there is one.
     * @param {SceneObject} sceneObject sceneObject that needs to be notified if a message was posted for it.
     */
    _checkMessages(sceneObject)
    {
        let messages = this.messageMap.get(sceneObject.name)
        if (messages != undefined)
        {
            for (let message of messages)
                sceneObject.onMessage(this, message.from, message.data)
            this.messageMap.delete(sceneObject.name)
        }
    }

    /**
     * The loop that renders all drawable objects into the screen.
     * This functions resizes camera based on screen aspect ratio, checks if there are any new objects ready to be part of scene,
     * and notifies thos objects at the end of each iteration of render loop.
     */
    _renderLoop()
    {
        if (this.activeCameraManager != null && this.activeCameraManager != undefined)
        {
            this.activeCameraManager.updateMatrices()
            this._queryReadyObjects()
            this.sceneRenderer.render()
            if (this.autoUpdateScreenSize)
            {
                this.width = window.innerWidth * this.percentWidth
                this.height = window.innerHeight *  this.percentHeight
                this.activeCameraManager.setAspectRatio(this.width/this.height)
                this.sceneRenderer.setSize(this.width, this.height)
            }
            this._notifyObjects()
        }
        window.requestAnimationFrame(()=>this._renderLoop())
    }

    /**
     * Notifies scene object at the end of every iteration of the render loop.
     */
    _notifyObjects()
    {
        let sceneObjects = this.sceneObjectMap.values()
        for (let sceneObject of sceneObjects)
            sceneObject.onSceneRender(this)
    }

    /**
     * Checks if any inactive but registered scene objects are ready to be part of the scene
     */
    _queryReadyObjects()
    {
        if (this.inactiveObjNameMap.size > 0) 
        {
            let inactiveObjNames = this.inactiveObjNameMap.keys()
            for (let sceneObjectName of inactiveObjNames)
            {
                let sceneObject = this.sceneObjectMap.get(sceneObjectName)
                if (sceneObject.isReady())
                {   
                    this._addToScene(sceneObject)
                    sceneObject.onSceneStart(this)
                    this.inactiveObjNameMap.delete(sceneObjectName)
                } 
            }
        }
    }

    /**
     * Adds a threejs object into the threejs scene within SceneCore and registers that same object as ray castable if rayCastable value is true.
     * @param {SceneObject} sceneObject instance of SceneObject class
     */
    _addToScene(sceneObject) 
    { 
        let drawables = sceneObject.getDrawables()
        let lights = sceneObject.getLights()
        for (let drawable of drawables)
        {
            this.sceneRenderer.add(drawable.object, lights.length > 0)
            if (drawable.isRayCastable)
                this.raycast.add(sceneObject.name, drawable.object)
        }
        for (let light of lights)  
            this.sceneRenderer.add(light.object, false)

    }

    /**
     * Removes a threejs object from the threejs scene within SceneCore
     * @param {SceneObject} sceneObject instance of SceneObject class
     */
    _removeFromScene(sceneObject)
    {
        let drawables = sceneObject.getDrawables()
        let lights = sceneObject.getLights()
        for (let drawable of drawables)
        {
            this.sceneRenderer.remove(drawable.object)
            if (drawable.isRayCastable)
                this.raycast.remove(sceneObject.name)
        }
        for (let light of lights)
            this.sceneRenderer.remove(light.object)
    }
}