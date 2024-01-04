import * as THREE from '../../../node_modules/three/src/Three.js'
import { ShaderPass } from '../../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js'

/**
 * Render logic used for merging the rgb values of two textures by multiplication
 */
const PixelMergerShader =
{
    vertexShader: `
        varying vec2 vUv;
        void main()
        {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform sampler2D texture1, texture2;
        uniform bool merge;
        uniform bool showAO;
        varying vec2 vUv;

        void main() 
        {
            if (merge)        
            {    
                vec4 aoColor = texture2D(texture2, vUv);
                vec4 finalColor = texture2D(texture1, vUv) * aoColor;
                if (showAO)
                    gl_FragColor = aoColor;
                else
                    gl_FragColor = texture2D(texture1, vUv) * aoColor;
            }
            else
                gl_FragColor = texture2D(texture1, vUv);
        }
    `
}

/**
 * Render pass which consists of pixel merging logic
 */
export class PixelMergerPass extends ShaderPass
{
    /**
     * @param {THREE.Texture} texture1 texture that is to be merged with texture2
     * @param {THREE.Texture} texture2 texture that is to be merged with texture1
     */
    constructor(texture1, texture2)
    {
        super(new THREE.ShaderMaterial({
            uniforms: 
            {
                texture1: { value: texture1 },
                texture2: { value: texture2 },
                merge: { value: false },
                showAO: { value: false }
            },
            vertexShader : PixelMergerShader.vertexShader,
            fragmentShader : PixelMergerShader.fragmentShader,
        }), (texture1 != null) ? undefined : 'texture1')
    }

    /**
     * Enables or disables the merging of textures
     * @param {Boolean} enable if tru then merges the textures else displays texture1 only
     */
    enableMerge(enable) { this.material.uniforms.merge.value = enable }

    /**
     * Enables or disables the merging of textures
     * @param {Boolean} show if true then merges the textures else displays texture2 only
     */
    showAOMap(show) { this.material.uniforms.showAO.value = show }
}