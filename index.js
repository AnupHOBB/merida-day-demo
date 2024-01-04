import * as THREE from './node_modules/three/src/Three.js'
import * as ENGINE from './engine/Engine.js'
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from './node_modules/three/examples/jsm/loaders/DRACOLoader.js'
import { BLACK, WHITE } from './data.js'

const MODELS = new Map()

window.onload = () => 
{
    let loader = new ENGINE.AssetLoader()
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
        let sceneManager = new ENGINE.SceneManager(canvas, true)
        let cameraManager = new ENGINE.StaticCameraManager('Camera', 45)
        cameraManager.setPosition(2, 1, 2)
        cameraManager.setLookAt(0, 0.25, 0)
        sceneManager.register(cameraManager)
        sceneManager.setActiveCamera('Camera')
        sceneManager.setBackground(new THREE.Color(0.79,0.81,0.814))
        let ambientLight = new ENGINE.AmbientLight('AmbientLight', new THREE.Color(1, 1, 1), 1)
        sceneManager.register(ambientLight)
        let input = new ENGINE.InputManager('Input')
        sceneManager.register(input)
        cameraManager.registerInput(input)
        for (let modelType in WHITE)
        {
            let model = new ENGINE.MeshModel(WHITE[modelType], assetMap.get(WHITE[modelType]), true)
            sceneManager.register(model)
            MODELS.set(WHITE[modelType], model)
        }
        for (let modelType in BLACK)
        {
            let model = new ENGINE.MeshModel(BLACK[modelType], assetMap.get(BLACK[modelType]), true)
            model.setVisibility(false)
            sceneManager.register(model)
            MODELS.set(BLACK[modelType], model)
        }
        populateMenu(document.getElementById('menu-wood'), ['handle'])
        populateMenu(document.getElementById('menu-fabric'), ['bed', 'pillow'])
        populateMenu(document.getElementById('menu-metal'), ['frame'])
    })
}

function populateMenu(/** @type {HTMLDivElement}*/colorMenu, types)
{
    let whiteItem = document.createElement('div')
    whiteItem.className = 'color-item'
    whiteItem.style.backgroundColor = '#FFFFFF'
    whiteItem.addEventListener('click', e => {
        for (let type of types)
        {
            let blackModel = MODELS.get(BLACK[type])
            blackModel.setVisibility(false)
            let whiteModel = MODELS.get(WHITE[type])
            whiteModel.setVisibility(true)
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
            let whiteModel = MODELS.get(WHITE[type])
            whiteModel.setVisibility(false)
            let blackModel = MODELS.get(BLACK[type])
            blackModel.setVisibility(true)
        }
        whiteItem.style.borderColor = 'rgb(0, 0, 0)'
        blackItem.style.borderColor = 'rgb(0, 163, 255)'
    })
    colorMenu.appendChild(blackItem)
}
