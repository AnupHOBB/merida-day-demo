import { GLTFExporter } from '../../node_modules/three/examples/jsm/exporters/GLTFExporter.js'

/**
 * Generates a sharable url for the model. Can be used to send threejs object to model viewer
 * @param {THREE.Object3D} model any threejs object 
 * @param {Function} onGenerate callback that gets invoked once a sharable url for the model is generated 
 */
export const ModelHelpers =
{
    generateUrlForModel : function(model, onGenerate)
    {
        if (model != undefined && model.isObject3D != undefined && model.isObject3D)
        {
            let exporter = new GLTFExporter()
            exporter.parse(model, gltfJson => {
                let gltfJsonString = JSON.stringify(gltfJson)
                let aTag = document.createElement('a')
                aTag.style.display = 'none'
                document.body.appendChild(aTag)
                aTag.href = URL.createObjectURL(new Blob([gltfJsonString], { type: "application/json"}), 'model.glb')
                if (onGenerate != undefined)
                    onGenerate(aTag.href)
            })
        }
    }
} 

