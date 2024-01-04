import * as THREE from '../../node_modules/three/src/Three.js'
import { EffectComposer } from '../../node_modules/three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '../../node_modules/three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from '../../node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { PixelAdderPass } from './pass/PixelAdderPass.js'
import { PixelMergerPass } from './pass/PixelMergerPass.js'
import { SaturationPass } from './pass/SaturationPass.js'
import { BrightnessPass } from './pass/BrightnessPass.js'
import { ContrastPass } from './pass/ContrastPass.js'
import { GammaCorrectionPass } from './pass/GammaCorrectionPass.js'
import { SharpnessPass } from './pass/SharpnessPass.js'
import { ColorBalancePass } from './pass/ColorBalancePass.js'
import { ShaderPass } from '../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js'
import { SSAOPass } from '../../node_modules/three/examples/jsm/postprocessing/SSAOPass.js'
import { SSAARenderPass } from '../../node_modules/three/examples/jsm/postprocessing/SSAARenderPass.js'
import { FXAAShader } from '../../node_modules/three/examples/jsm/shaders/FXAAShader.js'
import { OutlinePass } from '../../node_modules/three/examples/jsm/postprocessing/OutlinePass.js'
import { Misc } from '../helpers/misc.js'
import { Stats } from './Stats.js'

/**
 * Responsible for rendering the overall scene
 */
export class SceneRenderer
{
    /**
     * @param {HTMLCanvasElement} canvas HTML canvas element
     * @param {Number} width width of canvas
     * @param {Number} height height of canvas
     */
    constructor(canvas, width, height)
    {
        this.width = width
        this.height = height
        this.shouldRender = false
        this.scene = new THREE.Scene()
        this.renderer = new THREE.WebGLRenderer({canvas, alpha: true})
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 1
        this.renderer.setPixelRatio(window.innerWidth/window.innerHeight)
        this.bloomObjects = []
        this.mainSceneObjects = []
        this.dataMap = new Map()
        this.bloomComposer = new EffectComposer(this.renderer)
        this.bloomComposer.renderToScreen = false
        this.ssaoComposer = new EffectComposer(this.renderer)
        this.ssaoComposer.renderToScreen = false
        this.sceneRenderComposer = new EffectComposer(this.renderer)
        this.sceneRenderComposer.renderToScreen = false
        this.finalComposer = new EffectComposer(this.renderer)
        this.bloomIntensity = 0
        this.bloomPercent = 1
        this.sceneBloomPass = new UnrealBloomPass(new THREE.Vector2(this.width, this.height), this.bloomIntensity, 0, 0)
        this.renderPass = null
        this.ssaoPass = null
        this.ssaaPass = null
        this.outlinePass = null
        this.pixelMergerPass = new PixelMergerPass(this.sceneRenderComposer.readBuffer.texture, this.ssaoComposer.readBuffer.texture)
        this.saturationPass = new SaturationPass(1)
        this.contrastPass = new ContrastPass(0)
        this.brightnessPass = new BrightnessPass(0)
        this.sharpnessPass = new SharpnessPass(0.2)
        this.fxaaPass = new ShaderPass(new THREE.ShaderMaterial(FXAAShader))
        this.colorBalancePass = new ColorBalancePass(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3())
        this.gammaPass = new GammaCorrectionPass(2.2)
        this.bloomComposer.addPass(new UnrealBloomPass(new THREE.Vector2(this.width, this.height), 3, 1, 0))
        this.sceneRenderComposer.addPass(this.sceneBloomPass)
        this.finalComposer.addPass(this.pixelMergerPass)
        this.finalComposer.addPass(new PixelAdderPass(null, this.bloomComposer.readBuffer.texture, 1, 3))
        this.finalComposer.addPass(this.saturationPass)
        this.finalComposer.addPass(this.contrastPass)
        this.finalComposer.addPass(this.brightnessPass)
        this.finalComposer.addPass(this.sharpnessPass)
        this.finalComposer.addPass(this.fxaaPass)
        this.finalComposer.addPass(this.colorBalancePass)
        this.finalComposer.addPass(this.gammaPass)
        this.groundReflector = null
        this.background = new THREE.Color(1, 1, 1)
        this.fxaaEnabled = true
        this.ssaaEnabled = false
        this.ssaoEnabled = false
        this.outliningEnabled = false
        this.blackMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color(0, 0, 0)})
        this.threeJsCamera = null
        this.stats = null
    }

    /**
     * Sets the width and height of canvas
     * @param {Number} width width of canvas
     * @param {Number} height height of canvas
     */
    setSize(width, height)
    {
        this.width = width
        this.height = height
    }

    /**
     * Sets the background to the scene. Valid values should either of type color, texture or cubetexture
     * @param {THREE.Texture, THREE.Color, THREE.CubeTexture} background environment map to be applied on the scene 
     */
    setBackground(background)
    {
        if (background.isTexture)
            background.mapping = THREE.EquirectangularReflectionMapping
        this.background = background
    }

    /**
     * Reduces the overall bloom intensity by the given percentage
     * @param {Number} percent percent value between 0 to 1 
     */
    setBloomPercentage(percent) 
    {
        this.bloomPercent = percent
        this.sceneBloomPass.strength = this.bloomIntensity * this.bloomPercent 
    }

    /**
     * Sets the intensity for overall bloom
     * @param {Number} intensity bloom intensity value 
     */
    setBloomIntensity(intensity) 
    {
        this.bloomIntensity = intensity 
        this.sceneBloomPass.strength = this.bloomIntensity * this.bloomPercent  
    }

    /**
     * Sets the minimum rgb value that the pixel should have before it can be affected by bloom
     * @param {Number} threshold threshold value for overall bloom 
     */
    setBloomThreshold(threshold) { this.sceneBloomPass.threshold = threshold }

    /**
     * Sets the radius upto which bloom will be spread out in every pixel. Higher radius means bloom will be more spread out.
     * @param {Number} radius radius value for overall bloom 
     */
    setBloomRadius(radius) { this.sceneBloomPass.radius = radius }

    /**
     * Enables or disables ssao
     * @param {Boolean} enable if true then ssao is enabled 
     */
    enableSSAO(enable) 
    { 
        this.ssaoEnabled = enable
        this.pixelMergerPass.enableMerge(enable) 
    }

    /**
     * Sets the radius upto which ssao will be spread out in every pixel. Higher radius means ssao will be more spread out.
     * @param {Number} radius radius value for ssao
     */
    setSSAORadius(radius) { this.ssaoPass.kernelRadius = radius }

    /**
     * Sets the minimum depth for pixel to eligible for ssao 
     * @param {Number} minDist minimum depth for pixel
     */
    setSSAOMinDistance(minDist) { this.ssaoPass.minDistance = minDist }

    /**
     * Sets the maximum depth for pixel to eligible for ssao 
     * @param {Number} maxDist maximum depth for pixel
     */
    setSSAOMaxDistance(maxDist) { this.ssaoPass.maxDistance = maxDist }

    /**
     * Enables or disables the ambient occlusion map of scene
     * @param {Boolean} show if true then the ambient occlusion map of entire scene will be visible 
     */
    setSSAOShowAOMap(show) 
    {
        if (this.ssaoPass.output != SSAOPass.OUTPUT.Blur)
            this.ssaoPass.output = SSAOPass.OUTPUT.Blur
        this.pixelMergerPass.showAOMap(show) 
    }

    /**
     * Enables or disables the normal map of scene
     * @param {Boolean} show if true then the normal map of entire scene will be visible 
     */
    setSSAOShowNormalMap(show) 
    { 
        this.ssaoPass.output = (show) ? SSAOPass.OUTPUT.Normal : SSAOPass.OUTPUT.Blur
        this.pixelMergerPass.showAOMap(show) 
    }

    /**
     * Sets the sharpness amount to be applied to the scene
     * @param {Number} sharpness sharpness amount to be applied on the scene
     */
    setSharpness(sharpness) { this.sharpnessPass.setSharpness(sharpness) }

    /**
     * Sets the gamma value to be applied to the scene
     * @param {Number} gamma gamma value to be applied on the scene
     */
    setGamma(gamma) { this.gammaPass.setGamma(gamma) }

    /**
     * Enables or disables fxaa
     * @param {Boolean} enable if true then fxaa is enabled 
     */
    enableFXAA(enable)
    {
        if (enable && !this.fxaaEnabled)
        {
            let fxaaIndex = this.finalComposer.passes.length - 2
            this.finalComposer.insertPass(this.fxaaPass, fxaaIndex)
            this.fxaaEnabled = true
        }
        else if (!enable && this.fxaaEnabled)
        {    
            this.finalComposer.removePass(this.fxaaPass)
            this.fxaaEnabled = false
        }
    }

    /**
     * Enables or disables ssaa
     * @param {Boolean} enable if true then ssaa is enabled 
     */
    enableSSAA(enable)
    {
        if (enable && !this.ssaaEnabled)
        {
            this.sceneRenderComposer.removePass(this.renderPass)
            this.sceneRenderComposer.insertPass(this.ssaaPass, 0)
            this.ssaaEnabled = true
        }
        else if (!enable && this.ssaaEnabled)
        {
            this.sceneRenderComposer.removePass(this.ssaaPass)
            this.sceneRenderComposer.insertPass(this.renderPass, 0)
            this.ssaaEnabled = false
        }
        this.finalComposer.removePass(this.pixelMergerPass)
        this.pixelMergerPass = new PixelMergerPass(this.sceneRenderComposer.readBuffer.texture, this.ssaoComposer.readBuffer.texture)
        this.finalComposer.insertPass(this.pixelMergerPass, 0)
    }

    /**
     * Sets the amount of samples to be used. Value should be in power of 2. Higher the sample level, better the quality of ssaa
     * @param {Number} samplelevel the amount of sample to be used 
     */
    setSSAASampleLevel(samplelevel) { this.ssaaPass.sampleLevel = samplelevel }

    /**
     * Sets the rgb values that affects the darkest set of rgbs in the scene as uniform in the fragment shader
     * @param {THREE.Vector3} shadowRgb rgb value that affects the darkest set of rgbs in the scene
     */
    setShadowsColorBalance(shadowsRgb) { this.colorBalancePass.setShadows(shadowsRgb) }

    /**
     * Sets the rgb values that affects the mid set of rgbs i.e. neither too dark nor too bright rgbs in the scene as uniform in the fragment shader
     * @param {THREE.Vector3} midtoneRgb rgb value that affects the mid level set of rgbs in the scene 
     */
    setMidtonesColorBalance(midtonesRgb) { this.colorBalancePass.setMidtones(midtonesRgb) }

    /**
     * Sets the rgb values that affects the brightest set of rgbs in the scene
     * @param {THREE.Vector3} highlightRgb rgb value that affects the brightest set of rgbs in the scene as uniform in the fragment shader
     */
    setHighlightsColorBalance(highlightsRgb) { this.colorBalancePass.setHighlights(highlightsRgb) }

    /**
     * Sets tone mapping value for the scene.
     * @param {Number} toneMapping the tone mapping to be applied in the scene. The value should be one of the following :
     * NoToneMapping, LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping, CustomToneMapping
     */
    setToneMapping(toneMapping) { this.renderer.toneMapping = toneMapping }

    /**
     * Sets the camera exposure for the scene.
     * @param {Number} exposure exposure value for the scene 
     */
    setExposure(exposure) { this.renderer.toneMappingExposure = exposure }

    /**
     * Sets the saturation value as uniform in the fragment shader
     * @param {Number} saturation saturation intensity that is passed to the fragment shader as uniform 
     */
    setSaturation(saturation) { this.saturationPass.setSaturation(saturation) }

    /**
     * Sets the provided contrast value to the contrast uniform in fragment shader
     * @param {Number} contrast brightness amount 
     */
    setContrast(contrast) { this.contrastPass.setContrast(contrast) }
    
    /**
     * Sets the provided brightness value to the brightness uniform in fragment shader
     * @param {Number} brightness brightness amount 
     */
    setBrightness(brightness) { this.brightnessPass.setBrightness(brightness) }

    /**
     * Returns the maximum anisotropy value supported by the hardware
     * @returns {Number} the maximum anisotropy value supported by the hardware
     */
    getMaxAnistropy() { this.renderer.capabilities.getMaxAnisotropy() }

    /**
     * Shows the stats for the scene
     * @param {HTMLPreElement} preElement html pre element where the stats will be displayed
     */
    showStats(htmlElement) { this.stats = new Stats(this.renderer, htmlElement) }

    enableOutlining(enable)
    {
        this.outliningEnabled = enable
        if (this.outliningEnabled && this.threeJsCamera != null)
        {
            this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth/window.innerHeight), this.scene, this.threeJsCamera)
            this.sceneRenderComposer.insertPass(this.outlinePass, 1)
        }
        else
            this._deletePassInComposer(this.outlinePass, this.sceneRenderComposer)
    }

    addObjectsToOutline(threeJsObjects)
    {
        if (this.outliningEnabled && this.outlinePass != null)
            this.outlinePass.selectedObjects = threeJsObjects
    }

    changeOutlineColor(visibleEdgeColor, hiddenEdgeColor)
    {
        if (this.outliningEnabled)
        {
            if (visibleEdgeColor != undefined && visibleEdgeColor.isColor != undefined && visibleEdgeColor.isColor)
                this.outlinePass.visibleEdgeColor = visibleEdgeColor 
            if (hiddenEdgeColor != undefined && hiddenEdgeColor.isColor != undefined && hiddenEdgeColor.isColor)
                this.outlinePass.hiddenEdgeColor = hiddenEdgeColor
        }
    }

    changeOutlineThickness(thickness) 
    { 
        if (this.outliningEnabled)
        {
            if (thickness != undefined)
                this.outlinePass.edgeThickness = thickness 
        }
    }

    changeOutlineGlow(glow) 
    { 
        if (this.outliningEnabled)
        {
            if (glow != undefined)
                this.outlinePass.edgeGlow = glow
        }
    }

    changeOutlineStrength(strength) 
    { 
        if (this.outliningEnabled)
        {
            if (strength != undefined)  
                this.outlinePass.edgeStrength = strength
        }
    }

    /**
     * This function adds the threejs object based on its properties. If the threejs object is light, then it will be
     * included in the threejs scene directly. If the threejs object is a luminant mesh, then the threejs object will 
     * be stored in bloomObjects array for rendering later. And if threejs object is a non-luminant mesh, then the 
     * threejs object will be directly added to the scene and also will be stored in mainSceneObjects array for later use.
     * @param {String} name name of the sceneObject that is registered in the scene manager.
     * @param {THREE.Object3D} threeJsObject the threejsobject to be rendered or included in the threejs scene
     * @param {Boolean} isLuminant if true then the objet3D will be rendered with bloom effect
     */
    add(threeJsObject, isLuminant)
    {
        if (threeJsObject.isLight != undefined)  
            this._addToScene(threeJsObject)
        else
        {
            if (isLuminant)
                this.bloomObjects.push(threeJsObject)
            else
            {    
                Misc.postOrderTraversal(threeJsObject, obj=>{
                    if (obj.material != undefined)
                        this.dataMap.set(obj.uuid, { material: obj.material, visibility: obj.visible }) 
                })
                this.mainSceneObjects.push(threeJsObject)
                this._addToScene(threeJsObject)
            }
        }
    }

    /**
     * Removes the threejs object from the scene and the array in which it is stored.
     * @param {String} name name of the sceneObject that is registered in the scene manager.
     */
    remove(threeJsObject)
    {
        if (threeJsObject.isLight)
            this._removeFromScene(threeJsObject)
        else
        {
            let index = this.bloomObjects.indexOf(threeJsObject)
            if (index < 0)
            {    
                index = this.mainSceneObjects.indexOf(threeJsObject)
                if (index >= 0)
                {
                    Misc.postOrderTraversal(threeJsObject, obj => this.dataMap.delete(obj.uuid))    
                    this._removeFromScene(threeJsObject)
                    this.mainSceneObjects.splice(index, 1)
                }
            }
            this._removeFromScene(threeJsObject)
            this.bloomObjects.splice(index, 1)
        }
    }

    /**
     * Creates the render subpass and adds it in the effect composer for rendering
     * @param {THREE.Camera} threeJsCamera threejs camera object
     */
    setup(threeJsCamera) 
    { 
        this.shouldRender = false
        this._deletePassInComposer(this.renderPass, this.bloomComposer)
        this._deletePassInComposer(this.ssaoPass, this.ssaoComposer)
        this._deletePassInComposer((this.ssaaEnabled) ? this.ssaaPass : this.renderPass, this.sceneRenderComposer)
        this.renderPass = new RenderPass(this.scene, threeJsCamera)
        this.bloomComposer.insertPass(this.renderPass, 0)
        this.ssaoPass = new SSAOPass(this.scene, threeJsCamera, this.width, this.height)
        this.ssaoPass.kernelRadius = 0.115
        this.ssaoPass.output = SSAOPass.OUTPUT.Blur
        this.ssaoPass.minDistance = 0.00004
        this.ssaoPass.maxDistance = 0.1
        this.ssaoComposer.insertPass(this.ssaoPass, 0)
        this.ssaaPass = new SSAARenderPass(this.scene, threeJsCamera, 0xffffff, 1)
        this.ssaaPass.sampleLevel = 1
        this.ssaaPass.unbiased = true
        this.sceneRenderComposer.insertPass((this.ssaaEnabled) ? this.ssaaPass : this.renderPass, 0)
        this.shouldRender = true
        this.threeJsCamera = threeJsCamera
        if (this.outliningEnabled)
        {
            this._deletePassInComposer(this.outlinePass, this.sceneRenderComposer)
            this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth/window.innerHeight), this.scene, threeJsCamera)
            this.sceneRenderComposer.insertPass(this.outlinePass, 1)
        }
    }

    /**
     * Renders the scene. This function should be called on every iteration of the render loop.
     * In case of this project, the render loop has been setup in SceneManagerCore class
     */
    render()
    {
        if (this.shouldRender)
        {
            this.renderer.setSize(this.width, this.height)
            this._prepareForSpecialEffects()
            this.bloomComposer.setSize(this.width, this.height)
            this.bloomComposer.render()
            if (this.ssaoEnabled)
            {
                this.ssaoComposer.setSize(this.width, this.height)
                this.ssaoComposer.render()
            }
            this._prepareForFinalPass()
            this.sceneRenderComposer.setSize(this.width, this.height)
            this.sceneRenderComposer.render()
            if (this.fxaaEnabled)
            {
                this.fxaaPass.material.uniforms['resolution'].value.x = 1/(this.width * this.renderer.getPixelRatio())
                this.fxaaPass.material.uniforms['resolution'].value.y = 1/(this.height * this.renderer.getPixelRatio())
            }
            this.finalComposer.setSize(this.width, this.height)
            this.finalComposer.render()
            if (this.stats != null)
                this.stats.update()
        }
    }

    /**
     * Prepares the scene for various kinds of special effects pass like bloom, ssao, ssaa etc.
     */
    _prepareForSpecialEffects()
    {
        for (let mainSceneObject of this.mainSceneObjects)
        {    
            Misc.postOrderTraversal(mainSceneObject, obj=>{
                if (obj.material != undefined)
                {
                    if (obj.material.transparent || obj.material.opacity < 1 || obj.material._alphaTest > 0)
                        obj.visible = false
                    else if (obj.isLight == undefined || !obj.isLight)
                        obj.material = this.blackMaterial
                }
            })
        }
        for (let bloomSceneObject of this.bloomObjects)
            Misc.postOrderTraversal(bloomSceneObject, obj=>this._addToScene(obj))
        this.scene.background = null
    }

    /**
     * Prepares the scene for the final subpass
     */
    _prepareForFinalPass()
    {
        for (let mainSceneObject of this.mainSceneObjects)
        {    
            Misc.postOrderTraversal(mainSceneObject, obj=>{
                let data = this.dataMap.get(obj.uuid)
                if (data != undefined)
                {
                    obj.visible = data.visibility
                    obj.material = data.material
                }
            })
        }
        for (let bloomSceneObject of this.bloomObjects)
            Misc.postOrderTraversal(bloomSceneObject, obj=>this._removeFromScene(obj))
        this.scene.background = this.background
    }

    /**
     * Adds the threejs object into the threejs scene
     * @param {THREE.Object3D} threeJsObject the threejs object that needs to be added into the threejs scene
     */
    _addToScene(threeJsObject) { this.scene.add(threeJsObject) }

    /**
     * Removes the threejs object from the threejs scene
     * @param {THREE.Object3D} threeJsObject the threejs object that needs to be removed from the threejs scene
     */
    _removeFromScene(threeJsObject) { this.scene.remove(threeJsObject) }

    /**
     * Deletes the given pass if present from the given composer
     * @param {THREE.Pass} pass 
     * @param {THREE.EffectComposer} composer 
     */
    _deletePassInComposer(pass, composer)
    {
        if (pass != null)
        {    
            composer.removePass(pass)
            pass.dispose()
        }
    }
}