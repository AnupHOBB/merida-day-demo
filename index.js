import { ImportManager } from './engine/ImportManager.js'
import { BLACK, WHITE, WOOD_TEXTURES, WOOD_ICONS, FABRIC_ICONS, METAL_ICONS } from './data.js'

let importMap = new Map()
importMap.set('THREE', '../node_modules/three/src/Three.js')
importMap.set('GLTF','../node_modules/three/examples/jsm/loaders/GLTFLoader.js')
importMap.set('DRACO','../node_modules/three/examples/jsm/loaders/DRACOLoader.js')
importMap.set('ENGINE','./Engine.js')

const ASSETS = new Map()

let ENGINE
let isReadyForAr
let isLoading = true
let rootModel
let yaw = 0
let pitch = 0
let woodenMeshes = []
let sceneManager
let selectedParts = new Map()
let selectedWoodTextureIndex = 0
let progress = 0
let progressDots = 1
let loadingText
let qrMenu
let aRDataArray = [0,0,0,0]

window.onload = () => 
{
    loadingText = document.getElementById('loading-text')
    updateProgress()
    ImportManager.execute(importMap, (name, module, progress) => 
    {
        progress = Math.round((progress * 10)/100)
        importMap.set(name, module)
    }, () => load())
}

function load()
{
    let THREE = importMap.get('THREE')
    ENGINE = importMap.get('ENGINE')
    let loader = new ENGINE.AssetLoader()
    for (let path of WOOD_TEXTURES)
        loader.addLoader(path, path, new THREE.TextureLoader())
    for (let path of WOOD_ICONS)    
        loader.addLoader(path, path, new THREE.TextureLoader())
    let GLTF = importMap.get('GLTF')
    let DRACO = importMap.get('DRACO')
    for (let path in WHITE)
    {
        let dracoLoader = new DRACO.DRACOLoader()
        dracoLoader.setDecoderPath(ENGINE.DRACO_DECODER_PATH)
        let gltfLoader = new GLTF.GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)
        loader.addLoader(WHITE[path], WHITE[path], gltfLoader)
    }
    for (let path in BLACK)
    {
        let dracoLoader = new DRACO.DRACOLoader()
        dracoLoader.setDecoderPath(ENGINE.DRACO_DECODER_PATH)
        let gltfLoader = new GLTF.GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)
        loader.addLoader(BLACK[path], BLACK[path], gltfLoader)
    }
    loader.execute(p=> 
    {
        let status = Math.round((p * 90)/100)
        status += 10 
        progress = (status <= 100)? status : 100
    }, assetMap => 
    {
        let canvas = document.querySelector('canvas')
        sceneManager = new ENGINE.SceneManager(canvas, true)
        let cameraManager = new ENGINE.StaticCameraManager('Camera', 45)
        cameraManager.setPosition(2, 1, 2)
        cameraManager.setLookAt(0, 0.25, 0)
        sceneManager.register(cameraManager)
        sceneManager.setActiveCamera('Camera')
        sceneManager.setBackground(new THREE.Color(1, 1, 1))
        sceneManager.enableSSAO(true)
        sceneManager.enableFXAA(true)
        let ambientLight = new ENGINE.AmbientLight('AmbientLight', new THREE.Color(1, 1, 1), 1)
        sceneManager.register(ambientLight)
        let input = new ENGINE.InputManager('Input')
        input.registerLMBMoveEvent(rotateModel)
        input.registerTouchMoveEvent(rotateModel)
        sceneManager.register(input)
        cameraManager.registerInput(input)
        rootModel = new ENGINE.SceneObject('Root')
        rootModel.setRotationOrder('YXZ')
        for (let modelType in WHITE)
        {
            let model = new ENGINE.MeshModel(WHITE[modelType], assetMap.get(WHITE[modelType]), true)
            ASSETS.set(WHITE[modelType], model)
            rootModel.attach(model)
            selectedParts.set(modelType, model)
            if (modelType == 'handle')    
                woodenMeshes.push(model.getMesh('merida-daybed-armrest-wood001'))
        }
        for (let modelType in BLACK)
        {
            let model = new ENGINE.MeshModel(BLACK[modelType], assetMap.get(BLACK[modelType]), true)
            ASSETS.set(BLACK[modelType], model)
            rootModel.attach(model)
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
        for (let path of WOOD_ICONS)
        {    
            let texture = assetMap.get(path)
            let img = texture.source.data
            Promise.all([createImageBitmap(img, 0, 0, img.width, img.height)]).then(sprites => texture.source.data = sprites[0])
            ASSETS.set(path, texture)
        }
        sceneManager.register(rootModel)
        setupRadioButtonAction()
        populateWoodTextureMenu()
        populateMenu(document.getElementById('menu-fabric'), ['bed', 'pillow'], FABRIC_ICONS, 0)
        populateMenu(document.getElementById('menu-metal'), ['handle', 'frame'], METAL_ICONS, 1)
        setupAR()
        resizeCanvas()
        initializeRoot()

        qrMenu = document.getElementById('qr-menu')
        let crossIcon = document.getElementById('qr-cross')
        crossIcon.addEventListener('click', () => 
        {
            let qrContainer = document.getElementById('qr-container')
            let children = qrContainer.children
            for (let child of children)     
                qrContainer.removeChild(child)
            document.body.removeChild(qrMenu)
        })
        document.body.removeChild(qrMenu)
        
        isLoading = false
        let loadingScreen = document.getElementById('loading-screen')
        document.body.removeChild(loadingScreen)
    })
}

window.onresize = () => resizeCanvas()

function initializeRoot()
{
    let attachedModels = rootModel.getAttachedModels()
    let children = []
    for (let model of attachedModels)
        children.push(model)
    let keys = selectedParts.keys()
    let selectedNames = []
    for (let key of keys)
        selectedNames.push(key)
    let isSelected
    for (let child of children)
    {
        isSelected = false
        for (let selectedName of selectedNames)
        {
            let selectedModel = selectedParts.get(selectedName)
            if (selectedModel.name === child.name)
            {
                isSelected = true
                break
            }
        }
        if (!isSelected)
            rootModel.detach(child)
    }
}

function resizeCanvas()
{
    if (sceneManager != undefined)
    {
        if (window.innerWidth/window.innerHeight <= 1)
        {    
            let sideBar = document.getElementById('side-bar')
            let sideBarRects = sideBar.getClientRects()
            let canvasHeight = window.innerHeight - sideBarRects[0].height
            let percentHeight = canvasHeight/window.innerHeight
            sceneManager.setSizeInPercent(1, percentHeight)
            let canvasContainer = document.getElementById('canvas-container')
            canvasContainer.style.width = '100%'
            canvasContainer.style.height = ''+(percentHeight * 100)+'%'
        }
        else
        {    
            sceneManager.setSizeInPercent(0.6, 0.8)
            let canvasContainer = document.getElementById('canvas-container')
            canvasContainer.style.width = '60%'
            canvasContainer.style.height = '80%'
        }
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
        img.src = WOOD_ICONS[i]
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
            selectedWoodTextureIndex = i
            aRDataArray[2] = i
        })
        menu.appendChild(img)
        if (i == 0)
        {    
            img.style.borderColor = 'rgb(0, 163, 255)'
            let texture = ASSETS.get(WOOD_TEXTURES[0])
            for (let wood of woodenMeshes)
                wood.material.map = texture
            selectedWoodTextureIndex = 0
            aRDataArray[2] = 0
        }
    }
}

function populateMenu(colorMenu, types, dataArray, arDataIndex)
{
    let whiteItem = document.createElement('img')
    whiteItem.className = 'color-item'
    whiteItem.style.backgroundColor = '#FFFFFF'
    whiteItem.src = dataArray[0]
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
        aRDataArray[arDataIndex] = 1
    })
    whiteItem.style.borderColor = 'rgb(0, 163, 255)'
    colorMenu.appendChild(whiteItem)
    let blackItem = document.createElement('img')
    blackItem.className = 'color-item'
    blackItem.style.backgroundColor = '#000000'
    blackItem.src = dataArray[1]
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
        aRDataArray[arDataIndex] = 0
    })
    aRDataArray[arDataIndex] = 1
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
    if (activate)
    {    
        let oldModel = selectedParts.get(type)
        rootModel.detach(oldModel)
        rootModel.attach(model)
        selectedParts.set(type, model)
    }
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
        whitePillow.setPosition(-0.3, 0, 0.225)

        let blackPillow = ASSETS.get(BLACK['pillow'])
        blackPillow.setRotation(ENGINE.Maths.toRadians(-180), ENGINE.Maths.toRadians(-90), ENGINE.Maths.toRadians(-180))
        blackPillow.setPosition(-0.3, 0, 0.225)

        aRDataArray[3] = 1
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

        aRDataArray[3] = 0
    }
}

function rotateModel(dx, dy)
{
    if (rootModel != undefined)
    {
        yaw += dx * 0.5
        pitch -= dy * 0.5
        if (pitch < -5)
            pitch = -5
        if (pitch > 5)
            pitch = 5
        rootModel.setRotation(0, ENGINE.Maths.toRadians(yaw), ENGINE.Maths.toRadians(pitch))
    }
}

function setupAR()
{
    let arButton = document.getElementById('ar-container')
    arButton.addEventListener('click', async (e) => {
        if (ENGINE.Misc.isHandHeldDevice())
        {
            let arMessage = document.getElementById('ar-message')
            let message = 'Exporting model'
            arMessage.innerText = message
            isReadyForAr = false
            updateARStatus(message, 0)
            setTimeout(openInAR, 500)
        }
        else
        {
            let data = 0
            let lasti = aRDataArray.length - 1
            for (let i=lasti; i>=0; i--)
                data += aRDataArray[i] * Math.pow(10, lasti - i)


            document.body.appendChild(qrMenu)
            let qr = document.createElement('div')
            qr.id = 'qr'
            let qrContainer = document.getElementById('qr-container')
            qrContainer.appendChild(qr)
            new QRCode(qr, window.location.origin + '/ar.html?d='+data)
        }
    })
}

function updateARStatus(message, dots)
{
    let arMessage = document.getElementById('ar-message')
    let displayMessage = message
    for(let i=0; i<dots; i++)
        displayMessage += '.'
    arMessage.innerText = displayMessage
    dots++
    if (dots > 2)
        dots = 0
    if (!isReadyForAr)
        setTimeout(e => updateARStatus(message, dots), 100)
    else
        arMessage.innerText = ''
}

function openInAR()
{
    rootModel.setRotation(0, 0, 0)
    yaw = 0
    let model = rootModel.scene.clone()

    let texture = ASSETS.get(WOOD_ICONS[selectedWoodTextureIndex])
    for (let wood of woodenMeshes)
        wood.material.map = texture

    ENGINE.ModelHelpers.generateUrlForModel(model, url => {
        isReadyForAr = true
        let modelViewer = document.querySelector('model-viewer')
        modelViewer.src = url
        modelViewer.activateAR()

        let texture = ASSETS.get(WOOD_TEXTURES[selectedWoodTextureIndex])
        for (let wood of woodenMeshes)
            wood.material.map = texture
    })
}

function updateProgress()
{
    let message = 'LOADING'
    for (let i=0; i<progressDots; i++)
        message += '.'
    let spaces = 3 - progressDots
    for (let i=0; i<spaces; i++)
        message += '&nbsp'
    progressDots++
    if (progressDots > 3)
        progressDots = 1
    if (progress < 10)
        message += '&nbsp&nbsp&nbsp&nbsp&nbsp'+progress+'%'
    else if (progress >= 9 && progress < 100)
        message += '&nbsp&nbsp&nbsp'+progress+'%'
    else
        message += '&nbsp'+progress+'%'
    loadingText.innerHTML = message
    if (isLoading)
        setTimeout(updateProgress, 100)
}