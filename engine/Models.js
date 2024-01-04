import * as THREE from '../node_modules/three/src/Three.js'
import { SceneObject } from './core/SceneManager.js'
import { Misc } from './helpers/misc.js'

/**
 * Represents any simple shaped model with single mesh. Eg. : box mesh, sphere mesh etc.
 */
export class StaticModel extends SceneObject
{
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {THREE.BoxGeometry} geometry threejs geometry class that holds the vertex data 
     * @param {THREE.MeshLambertMaterial} material threejs material class that holds the shader
     * @param {Boolean} supportShadow used to set receiveShadow varible of the mesh
     */
    constructor(name, geometry, material, supportShadow, isRayCastable)
    {
        super(name)
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.receiveShadow = supportShadow
        this.isRayCastable = isRayCastable
    }

    /**
     * Applies texture on the object.
     * @param {THREE.Texture} texture threejs texture object
     */
    applyTexture(texture) { this.mesh.material.map = texture }

    /**
     * Applies color on the object.
     * @param {THREE.Color} color threejs color object 
     */
    applyColor(color) { this.mesh.material.color = color }

    /**
     * Sets the position of the object in world space
     * @param {Number} x x-coordinate in world space
     * @param {Number} y y-coordinate in world space
     * @param {Number} z z-coordinate in world space 
     */
    setPosition(x, y, z) { this.mesh.position.set(x, y, z) }

    /**
     * Sets the rotation of the mesh in world space using euler values
     * @param {Number} x x-coordinate in world space
     * @param {Number} y y-coordinate in world space
     * @param {Number} z z-coordinate in world space 
     */
    setRotation(x, y, z) { this.mesh.rotation.set(x, y, z) }

    /**
     * Adds delta rotation into existing rotation values of the mesh in world space
     * @param {Number} dx x-coordinate in world space
     * @param {Number} dy y-coordinate in world space
     * @param {Number} dz z-coordinate in world space 
     */
    addRotation(dx, dy, dz) 
    { 
        this.mesh.rotation.x += dx 
        this.mesh.rotation.y += dy
        this.mesh.rotation.z += dz 
    }

    /**
     * Returns the list of drawable threejs meshes
     * @returns {Array} array of threejs mesh objects
     */
    getDrawables() { return [{object: this.mesh, isRayCastable: this.isRayCastable}] }

    /**
     * Used for notifying the SceneManager if this object should be included in raycasting.
     * @returns {Boolean} drawable status of object
     */
    isDrawable() { return true }

    /**
     * Called by SceneManager as soon as the object gets unregistered in SceneManager.
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onSceneEnd(sceneManager) 
    { 
        this.mesh.geometry.dispose()
        this.mesh.material.dispose()
    }
}

/**
 * Represents any model with multiple meshes arranged in a tree structure
 */
export class MeshModel extends SceneObject
{
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {any} model model data extracted from a 3D file
     * @param {Boolean} cullBackFace culls the back face of triangles if set to true
     */
    constructor(name, model, cullBackFace)
    {
        super(name)
        this.scene = model.scene.clone()
        this.meshMap = new Map()
        Misc.postOrderTraversal(this.scene, mesh => {
            this.meshMap.set(mesh.name, mesh)
            if (mesh.material != undefined)
            {
                if (cullBackFace != undefined && cullBackFace != null && cullBackFace)
                    mesh.material.side = THREE.FrontSide
                if (mesh.material.opacity == 1 && mesh.material._alphaTest == 0)
                {
                    mesh.material.shadowSide = THREE.BackSide
                    mesh.receiveShadow = true
                    mesh.castShadow = true
                }
                mesh.material.transparent = true
            }
        })
        const clip = model.animations[0]
        this.mixer = null
        if (clip != null && clip != undefined)
        {
            this.mixer = new THREE.AnimationMixer(this.scene)
            this.mixer.clipAction(clip).play()
        }
        this.drawables = [{object: this.scene, isRayCastable: false}]
    }

    enableRayCastingOnTriMesh(enable) { this.drawables[0].isRayCastable = enable }

    /**
     * Adds extra threejs object for rendering as part of this scene object
     * @param {THREE.Object3D} drawableObject threejs object to be displayed
     * @param {Boolean} isRayCastable boolean value indicating whether the mesh should participate in ray casting
     */
    addDrawable(drawableObject, isRayCastable) { this.drawables.push({object: drawableObject, isRayCastable: isRayCastable}) }

    /**
     * Renders new animation frame
     * @param {Number} deltaSeconds the time difference of the target animation frame from the current animation frame  
     */
    updateAnimationFrame(deltaSeconds) 
    {        
        if (this.mixer != null)
            this.mixer.update(deltaSeconds)
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
     * @param {Number} x x-coordinate in world space
     * @param {Number} y y-coordinate in world space
     * @param {Number} z z-coordinate in world space 
     */
    setRotation(x, y, z) { this.scene.rotation.set(x, y, z) }

    /**
     * Sets the rotation of the mesh in world space using axis and angle
     * @param {Vector3} axis axis of rotation
     * @param {Number} angle angle of rotation in radians
     */
    setRotationFromAxisAngle(axis, angle) { this.scene.setRotationFromAxisAngle(axis, angle) }

    setRotationFromAxisAngleFor(axis, angleInRadians, names)
    {
        Misc.postOrderTraversal(this.scene, mesh => {
            if (mesh.material != undefined)
            {    
                for (let name of names)
                {
                    if (name == mesh.name)
                    {        
                        mesh.setRotationFromAxisAngle(axis, angleInRadians)
                        break
                    }
                }  
            }
        }) 
    }

    /**
     * Sets the rotation order for the model. Values should be one of the following in string :-
     * XYZ, ZXY, YZX, XZY, YXZ, ZYX
     * @param {String} order the rotation order in string
     */
    setRotationOrder(order) { this.scene.rotation.order = order }

    /**
     * Adds delta rotation into existing rotation values of the mesh in world space
     * @param {Number} dx x-coordinate in world space
     * @param {Number} dy y-coordinate in world space
     * @param {Number} dz z-coordinate in world space 
     */
    addRotation(dx, dy, dz) 
    { 
        this.scene.rotation.x += dx 
        this.scene.rotation.y += dy
        this.scene.rotation.z += dz 
    }

    /**
     * Adds delta rotation into existing rotation values of the env map of the mesh in world space
     * @param {Number} delta delta rotation which will be added in the existing rotation of env map
     */
    addRotationInEnvMap(delta) 
    {
        Misc.postOrderTraversal(this.scene, mesh => {
            if (mesh.material != undefined)
            {
                let map = mesh.material.envMap
                if (map != undefined && map != null)
                {
                    map.offset.x += delta 
                    mesh.material.needsUpdate = true
                }
            }
        }) 

    }

    /**
    * Returns world space position of the mesh
    * @returns {THREE.Vector3} world space position of mesh 
    */
    getPosition() { return this.scene.position }

    getRotation() { return this.scene.rotation }

    getMesh(meshName) { return this.meshMap.get(meshName) }

    /**
     * 
     * @type {THREE.ShaderMaterial} material
     */
    applyMaterial(material)
    {
        Misc.postOrderTraversal(this.scene, mesh => {
            if (mesh.material != undefined)
                mesh.material = material
        }) 
    }

    /**
     * 
     * @type {THREE.ShaderMaterial} material
     */
    applyMaterialOn(material, names)
    {
        Misc.postOrderTraversal(this.scene, mesh => {
            if (mesh.material != undefined)
            {    
                for (let name of names)
                {
                    if (name == mesh.name)
                    {        
                        mesh.material = material
                        break
                    }
                }  
            }
        }) 
    }

    applyMap(materialName, mapType, map) 
    { 
        Misc.postOrderTraversal(this.scene, mesh => {
            if (mesh.material != undefined && mesh.material.name == materialName && mesh.material[mapType] != undefined)
                mesh.material[mapType] = map
        }) 
    }

    /**
    * Applies texture on the model.
    * @param {THREE.Texture} texture threejs texture object
    */
    applyTexture(texture) 
    { 
        Misc.postOrderTraversal(this.scene, mesh => {
            if (mesh.material != undefined)
                mesh.material.map = texture 
        }) 
    }

    /**
    * Applies texture on only those meshes whose names are given.
    * @param {THREE.Texture} texture threejs texture object
    * @param {Array} names names of meshes on which the texture should be applied
    */
    applyTextureOn(texture, names) 
    { 
        if (names.length > 0)
        {
            Misc.postOrderTraversal(this.scene, mesh => {
                if (mesh.material != undefined)
                {
                    for (let name of names)
                    {
                        if (name == mesh.name)
                        {        
                            if (mesh.material.setDiffuseTexture != undefined)
                                mesh.material.setDiffuseTexture(texture)
                            else
                                mesh.material.map = texture
                            break
                        }
                    }    
                }
            }) 
        }
    }

    /**
    * Applies color on the model.
    * @param {THREE.Color} color threejs color object 
    */
    applyColor(color) 
    { 
        Misc.postOrderTraversal(this.scene, mesh => {
            if (mesh.material != undefined)
                mesh.material.color = color 
        }) 
    }

    /**
    * Applies environment map on the model.
    * @param {THREE.Color} envmap environment map of scene
    */
    applyEnvmap(envmap)
    {
        Misc.postOrderTraversal(this.scene, mesh => {
            if (mesh.material != undefined && mesh.material.isMeshStandardMaterial != undefined && mesh.material.isMeshStandardMaterial)
            {    
                mesh.material.envMap = envmap
                mesh.material.needsUpdate = true
            }
        }) 
    }

    /**
    * Applies normal map on the model.
    * @param {THREE.Texture} normalMap normal map of scene
    */
    applyNormalmap(normalMap)
    {
        Misc.postOrderTraversal(this.scene, mesh => {
            if (mesh.material != undefined && mesh.material.isMeshStandardMaterial != undefined && mesh.material.isMeshStandardMaterial)
            {    
                mesh.material.normalMap = normalMap
                mesh.material.needsUpdate = true
            }
        }) 
    }

    applyNormalmapOn(normalMap, names)
    {
        Misc.postOrderTraversal(this.scene, mesh => {
            if (mesh.material != undefined && mesh.material.isMeshStandardMaterial != undefined && mesh.material.isMeshStandardMaterial)
            {    
                for (let name of names)
                {
                    if (name == mesh.name)
                    {        
                        mesh.material.normalMap = normalMap
                        mesh.material.needsUpdate = true
                        break
                    }
                }  
            }
        }) 
    }

    rotateNormalMapOf(angleInRadians, names)
    {
        Misc.postOrderTraversal(this.scene, mesh => {
            if (mesh.material != undefined && mesh.material.isMeshStandardMaterial != undefined && mesh.material.isMeshStandardMaterial)
            {    
                for (let name of names)
                {
                    if (name == mesh.name)
                    {        
                        mesh.material.normalMap.rotation = angleInRadians
                        mesh.material.normalMap.needsUpdate = true
                        mesh.material.needsUpdate = true
                        break
                    }
                }  
            }
        }) 
    }

    setTextureAnisotropy(value)
    {
        Misc.postOrderTraversal(this.scene, mesh => {
            if (mesh.material != undefined)
                mesh.material.map.anisotropy = value
        })
    }

    setRoughness(roughness)
    {
        Misc.postOrderTraversal(this.scene, mesh => {
            if (mesh.material != undefined)
                mesh.material.roughness = roughness
        })
    }

    setRoughnessOn(roughness, names) 
    { 
        if (names.length > 0)
        {
            Misc.postOrderTraversal(this.scene, mesh => {
                if (mesh.material != undefined)
                {
                    for (let name of names)
                    {
                        if (name == mesh.name)
                        {        
                            if (mesh.material != undefined)
                                mesh.material.roughness = roughness
                            break
                        }
                    }    
                }
            }) 
        }
    }

    setMetalness(metalness)
    {
        Misc.postOrderTraversal(this.scene, mesh => {
            if (mesh.material != undefined)
                mesh.material.metalness = metalness
        })
    }

    setMetalnessOn(metalness, names) 
    { 
        if (names.length > 0)
        {
            Misc.postOrderTraversal(this.scene, mesh => {
                if (mesh.material != undefined)
                {
                    for (let name of names)
                    {
                        if (name == mesh.name)
                        {        
                            if (mesh.material != undefined)
                                mesh.material.metalness = metalness
                            break
                        }
                    }    
                }
            }) 
        }
    }

    setSheen(sheen)
    {
        Misc.postOrderTraversal(this.scene, mesh => {
            if (mesh.material != undefined)
                mesh.material.sheen = sheen
        })
    }

    setVisibility(visible)
    {
        Misc.postOrderTraversal(this.scene, mesh => {
            if (mesh.material != undefined)
                mesh.material.visible = visible
        })
    }

    setOpacity(materialName, opacity) 
    { 
        Misc.postOrderTraversal(this.scene, mesh => {
            if (mesh.material != undefined && mesh.material.name == materialName && mesh.material['opacity'] != undefined)
            {    
                mesh.material.opacity = opacity
                mesh.material.transparent = true
            }
        }) 
    }

    /**
    * Used for notifying the SceneManager if this object is ready to be included in scene.
    * @returns {Boolean} ready status of object
    */
    isReady() { return true }

    /**
    * Returns the list of drawable threejs meshes
    * @returns {Array} array of threejs mesh objects
    */
    getDrawables() { return this.drawables }

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
        for (let drawable of this.drawables)
        {    
            Misc.postOrderTraversal(drawable.object, mesh => {
                if (mesh.isMesh != undefined)
                {
                    mesh.geometry.dispose()
                    mesh.material.dispose()
                }
            })
        }
        let keys = this.meshMap.keys()
        for (let key of keys)
            this.meshMap.delete(key)
    }
}

/**
 * Represents those model that require instancing support
 */
export class InstancedModel extends MeshModel
{
        /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {any} model model data extracted from a 3D file
     * @param {Number} instanceCount number of instances to be produced
     * @param {Boolean} cullBackFace culls the back face of triangles if set to true
     */
    constructor(name, model, instanceCount, cullBackFace)
    {
        super(name, model, cullBackFace)
        this._instanceMeshMap = new Map()
        this._modelMatrixMap = new Map()
        this._positions = new Array(instanceCount).fill(new THREE.Vector3(), 0, instanceCount)
        this._rotations = new Array(instanceCount).fill(new THREE.Quaternion(), 0, instanceCount)
        this._scales = new Array(instanceCount).fill(new THREE.Vector3(1, 1, 1), 0, instanceCount)
        this._traverseMeshTree(this.scene, (mesh, modelMatrix) => 
        {
            if (mesh.isMesh != undefined && mesh.isMesh)
            {
                let index = mesh.parent.children.indexOf(mesh)
                if (index >= 0)
                {
                    let instancedMesh = new THREE.InstancedMesh(mesh.geometry, mesh.material, instanceCount)
                    for (let i=0; i<instanceCount; i++)   
                    {    
                        let instanceMatrix = new THREE.Matrix4().compose(new THREE.Vector3(), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1))
                        instancedMesh.setMatrixAt(i, instanceMatrix.multiply(modelMatrix))
                        instancedMesh.instanceMatrix.needsUpdate = true
                    }
                    if (instancedMesh.material.opacity == 1)
                    {
                        instancedMesh.material.shadowSide = THREE.BackSide
                        instancedMesh.receiveShadow = true
                        instancedMesh.castShadow = true
                        instancedMesh.material.envMapIntensity = 0
                    }
                    else
                    {    
                        instancedMesh.material.transparent = true
                        instancedMesh.material.envMapIntensity = 3
                    }
                    for (let child of mesh.children)
                        instancedMesh.children.push(child)
                    this._instanceMeshMap.set(instancedMesh.uuid, instancedMesh)
                    this._modelMatrixMap.set(instancedMesh.uuid, modelMatrix)
                    mesh.parent.children[index] = instancedMesh
                }
            }
        })
    }

    /**
     * Stores the new position of the instance whose index is given and updates it
     * @param {Number} index index of the instance 
     * @param {THREE.Vector3} position new position of the instance
     */
    setInstancePositionAt(index, position)
    {
        if (index < this._positions.length)
        {
            this._positions.splice(index, 1, position)
            this._updateInstance(index)
        }
    }

    /**
     * Stores the rotation of the instance whose index is given and updates it
     * @param {Number} index index of the instance 
     * @param {THREE.Euler} rotation new rotation of the instance
     */
    setInstanceEulerRotationAt(index, rotation)
    {
        if (index < this._rotations.length)
        {
            let quaternion = new THREE.Quaternion()
            quaternion.setFromEuler(rotation)
            this._rotations.splice(index, 1, quaternion)
            this._updateInstance(index)
        }
    }

    /**
     * Stores the rotation of the instance whose index is given and updates it
     * @param {Number} index index of the instance 
     * @param {THREE.Quaternion} rotation new rotation of the instance
     */
    setInstanceQuatRotationAt(index, rotation)
    {
        if (index < this._rotations.length)
        {
            this._rotations.splice(index, 1, rotation)
            this._updateInstance(index)
        }
    }

    /**
     * Stores the scale of the instance whose index is given and updates it
     * @param {Number} index index of the instance 
     * @param {THREE.Vector3} scale new scale of the instance
     */
    setInstanceScaleAt(index, scale)
    {
        if (index < this._scales)
        {
            this._scales.splice(index, 1, scale)
            this._updateInstance(index)
        }
    }

    /**
     * Traverses the mesh tree of the model in post order
     * @param {THREE.Mesh} mesh any mesh that is part of the mesh tree 
     * @param {Function} onNode callback function function that is invoked when a mesh in the mesh tree is reached
     * @param {THREE.Matrix4} parentMatrix matrix that is the product of all the matrices from the parent to the parent of the current mesh node
     */
    _traverseMeshTree(mesh, onNode, parentMatrix)
    {
        if (mesh.children.length > 0)
        {    
            let selfMatrix = new THREE.Matrix4().compose(mesh.position, mesh.quaternion, mesh.scale)
            let productMatrix 
            if (parentMatrix != undefined)
            {
                let parentMatrixClone = parentMatrix.clone()
                productMatrix = parentMatrixClone.multiply(selfMatrix)
            }
            else
                productMatrix = selfMatrix.clone()
            mesh.children.forEach(mesh => this._traverseMeshTree(mesh, onNode, productMatrix))
        }
        if (parentMatrix != null && parentMatrix != undefined)
        {
            let meshMatrix = new THREE.Matrix4().compose(mesh.position, mesh.quaternion, mesh.scale)
            let parentMatrixClone = parentMatrix.clone()
            let finalMatrix = parentMatrixClone.multiply(meshMatrix)
            onNode(mesh, finalMatrix)
        }
    }

    /**
     * Updates the position, rotation and scale of the instance at the given index
     * @param {Number} index index of the instance
     */
    _updateInstance(index)
    {
        let uuids = this._instanceMeshMap.keys()
        for (let uuid of uuids)
        {
            let instancedMesh = this._instanceMeshMap.get(uuid)
            let modelMatrix = this._modelMatrixMap.get(uuid)
            let instanceMatrix = new THREE.Matrix4().compose(this._positions[index], this._rotations[index], this._scales[index])
            instancedMesh.setMatrixAt(index, instanceMatrix.multiply(modelMatrix))
            instancedMesh.instanceMatrix.needsUpdate = true
        }
    }
}