import * as THREE from './node_modules/three/src/Three.js'
import * as ENGINE from './engine/Engine.js'
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from './node_modules/three/examples/jsm/loaders/DRACOLoader.js'
import { BLACK, WHITE, WOOD_TEXTURES } from './data.js'

const ASSETS = new Map()

let rootModel
let xrot = 0
let woodenMeshes = []
let sceneManager

window.onload = () => 
{
    let loader = new ENGINE.AssetLoader()
    for (let path of WOOD_TEXTURES)
        loader.addLoader(path, path, new THREE.TextureLoader())
    for (let path in WHITE)
    {
        let dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath(ENGINE.DRACO_DECODER_PATH)
        let gltfLoader = new GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)
        loader.addLoader(WHITE[path], WHITE[path], gltfLoader)
    }
    for (let path in BLACK)
    {
        let dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath(ENGINE.DRACO_DECODER_PATH)
        let gltfLoader = new GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)
        loader.addLoader(BLACK[path], BLACK[path], gltfLoader)
    }
    loader.execute(p=>{}, assetMap => {
        let canvas = document.querySelector('canvas')
        sceneManager = new ENGINE.SceneManager(canvas, true)
        let cameraManager = new ENGINE.StaticCameraManager('Camera', 45)
        cameraManager.setPosition(2, 1, 2)
        cameraManager.setLookAt(0, 0.25, 0)
        sceneManager.register(cameraManager)
        sceneManager.setActiveCamera('Camera')
        sceneManager.setBackground(new THREE.Color(1, 1, 1))
        sceneManager.enableSSAO(true)
        resizeCanvas()
        let ambientLight = new ENGINE.AmbientLight('AmbientLight', new THREE.Color(1, 1, 1), 1)
        sceneManager.register(ambientLight)
        let input = new ENGINE.InputManager('Input')
        input.registerLMBMoveEvent(rotateModel)
        input.registerTouchMoveEvent(rotateModel)
        sceneManager.register(input)
        cameraManager.registerInput(input)
        
        rootModel = new ENGINE.SceneObject('Root')
        for (let modelType in WHITE)
        {
            let model = new ENGINE.MeshModel(WHITE[modelType], assetMap.get(WHITE[modelType]), true)
            ASSETS.set(WHITE[modelType], model)
            activateModel(model, modelType, true)
            rootModel.attachModel(model)
            if (modelType == 'handle')    
                woodenMeshes.push(model.getMesh('merida-daybed-armrest-wood001'))
        }
        for (let modelType in BLACK)
        {
            let model = new ENGINE.MeshModel(BLACK[modelType], assetMap.get(BLACK[modelType]), true)
            ASSETS.set(BLACK[modelType], model)
            activateModel(model, modelType, false)
            rootModel.attachModel(model)
            if (modelType == 'handle')
                woodenMeshes.push(model.getMesh('merida-daybed-armrest-wood001'))
        }
        for (let path of WOOD_TEXTURES)
        {    
            let texture = assetMap.get(path)
            let img = texture.source.data
            Promise.all([createImageBitmap(img, 0, 0, img.width, img.height)]).then(sprites => texture.source.data = sprites[0])
            ASSETS.set(path, texture)
        }
        sceneManager.register(rootModel)
        assembleBed(WHITE)
        assembleBed(BLACK)
        setupRadioButtonAction()
        populateWoodTextureMenu()
        populateMenu(document.getElementById('menu-fabric'), ['bed', 'pillow'])
        populateMenu(document.getElementById('menu-metal'), ['handle', 'frame'])      
    })
}

window.onresize = () => resizeCanvas()

function resizeCanvas()
{
    if (sceneManager != undefined)
    {
        if (window.innerWidth/window.innerHeight <= 1)
        {    
            let sideBar = document.getElementById('side-bar')
            let sideBarRects = sideBar.getClientRects()
            let canvasHeight = window.innerHeight - sideBarRects[0].height
            sceneManager.setSizeInPercent(1, canvasHeight/window.innerHeight)
        }
        else
            sceneManager.setSizeInPercent(0.6, 0.8)
    }
}

function assembleBed(modelData)
{
    if (rootModel != undefined)
    {
        let bed = ASSETS.get(modelData['bed'])
        let frame = ASSETS.get(modelData['frame'])
        let handle = ASSETS.get(modelData['handle'])
        let pillow = ASSETS.get(modelData['pillow'])
        rootModel.attachModel(bed)
        rootModel.attachModel(frame)
        rootModel.attachModel(handle)
        rootModel.attachModel(pillow)
    }
}

function setupRadioButtonAction()
{
    let radioLeft = document.getElementById('radio-left')
    radioLeft.addEventListener('change', e => {
        radioRight.checked = false
        radioLeft.checked = true
        moveHandleAndPillow(-1)
    })

    let radioRight = document.getElementById('radio-right')
    radioRight.addEventListener('change', e => {
        radioLeft.checked = false
        radioRight.checked = true
        moveHandleAndPillow(1)
    })
}

function populateWoodTextureMenu()
{
    let menu = document.getElementById('menu-wood')
    for (let i = 0; i < WOOD_TEXTURES.length; i++)
    {
        let img = document.createElement('img')
        img.id = 'wood-texture'+i
        img.className = 'color-item'
        img.src = WOOD_TEXTURES[i]
        img.addEventListener('click', e => {
            let texture = ASSETS.get(WOOD_TEXTURES[i])
            for (let wood of woodenMeshes)
                wood.material.map = texture
            let imgs = menu.childNodes
            for (let imgItem of imgs)
            {
                if (imgItem.id == img.id)
                    imgItem.style.borderColor = 'rgb(0, 163, 255)'
                else
                    imgItem.style.borderColor = 'rgb(0, 0, 0)'
            }
        })
        menu.appendChild(img)
        if (i == 0)
        {    
            img.style.borderColor = 'rgb(0, 163, 255)'
            let texture = ASSETS.get(WOOD_TEXTURES[0])
            for (let wood of woodenMeshes)
                wood.material.map = texture
        }
    }
}

function populateMenu(colorMenu, types)
{
    let whiteItem = document.createElement('div')
    whiteItem.className = 'color-item'
    whiteItem.style.backgroundColor = '#FFFFFF'
    whiteItem.addEventListener('click', e => {
        for (let type of types)
        {
            let blackModel = ASSETS.get(BLACK[type])
            activateModel(blackModel, type, false)
            let whiteModel = ASSETS.get(WHITE[type])
            activateModel(whiteModel, type, true)
        }
        whiteItem.style.borderColor = 'rgb(0, 163, 255)'
        blackItem.style.borderColor = 'rgb(0, 0, 0)'
    })
    whiteItem.style.borderColor = 'rgb(0, 163, 255)'
    colorMenu.appendChild(whiteItem)
    let blackItem = document.createElement('div')
    blackItem.className = 'color-item'
    blackItem.style.backgroundColor = '#000000'
    blackItem.addEventListener('click', e => {
        for (let type of types)
        {
            let whiteModel = ASSETS.get(WHITE[type])
            activateModel(whiteModel, type, false)
            let blackModel = ASSETS.get(BLACK[type])
            activateModel(blackModel, type, true)
        }
        whiteItem.style.borderColor = 'rgb(0, 0, 0)'
        blackItem.style.borderColor = 'rgb(0, 163, 255)'
    })
    colorMenu.appendChild(blackItem)
}

function activateModel(model, type, activate)
{
    if (activate)
    {
        if (type == 'pillow')
        {    
            let position = model.getPosition()
            let rotation = model.getRotation()
            model.setPosition(position.x, position.y, position.z)
            model.setRotation(rotation.x, rotation.y, rotation.z)
        }
        if (type == 'handle')
        {   
            let position = model.getPosition()
            model.setPosition(position.x, position.y, position.z)
        }
    }
    model.setVisibility(activate)
}

function moveHandleAndPillow(dx)
{
    if (dx > 0)
    {    
        let whiteHandle = ASSETS.get(WHITE['handle'])
        whiteHandle.setPosition(0, 0, -0.64)

        let blackHandle = ASSETS.get(BLACK['handle'])
        blackHandle.setPosition(0, 0, -0.64)

        let whitePillow = ASSETS.get(WHITE['pillow'])
        whitePillow.setRotation(ENGINE.Maths.toRadians(-180), ENGINE.Maths.toRadians(-90), ENGINE.Maths.toRadians(-180))
        whitePillow.setPosition(-0.3, 0, 0.3)

        let blackPillow = ASSETS.get(BLACK['pillow'])
        blackPillow.setRotation(ENGINE.Maths.toRadians(-180), ENGINE.Maths.toRadians(-90), ENGINE.Maths.toRadians(-180))
        blackPillow.setPosition(-0.3, 0, 0.3)
    }
    else if (dx < 0)
    {    
        let whiteHandle = ASSETS.get(WHITE['handle'])
        whiteHandle.setPosition(0, 0, 0)

        let whitePillow = ASSETS.get(WHITE['pillow'])
        whitePillow.setRotation(0, 0, 0)
        whitePillow.setPosition(0, 0, 0)

        let blackHandle = ASSETS.get(BLACK['handle'])
        blackHandle.setPosition(0, 0, 0)

        let blackPillow = ASSETS.get(BLACK['pillow'])
        blackPillow.setRotation(0, 0, 0)
        blackPillow.setPosition(0, 0, 0)
    }
}

function rotateModel(dx, dy)
{
    if (rootModel != undefined)
    {
        let rot = xrot
        rot += dx * 0.5
        xrot = rot
        rootModel.setRotation(0, ENGINE.Maths.toRadians(xrot), 0)
    }
}
