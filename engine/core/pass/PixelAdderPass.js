import * as THREE from '../../../node_modules/three/src/Three.js'
import { ShaderPass } from '../../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js'

/**
 * Shader that adds the pixel values between two textures
 */
const PixelAdderShader = 
{
    vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() 
        {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: /* glsl */`
        uniform sampler2D texture1, texture2;
        uniform float scalar1, scalar2;
        varying vec2 vUv;
        void main() 
        {
            gl_FragColor = texture2D(texture1, vUv) * scalar1 + texture2D(texture2, vUv) * scalar2;
        }
    `
}

/**
 * Pass that encapsulates the PixelAdderShader
 */
export class PixelAdderPass extends ShaderPass
{
    /**
     * @param {THREE.Texture} targetTexture texture whose pixel value is to be added with the texture of this pass
     */
    constructor(texture1, texture2, scalar1, scalar2)
    {
        super(new THREE.ShaderMaterial({
            uniforms: 
            {
                texture1: { value: texture1 },
                texture2: { value: texture2 },
                scalar1: { value: scalar1 },
                scalar2: { value: scalar2 }
            },
            vertexShader : PixelAdderShader.vertexShader,
            fragmentShader : PixelAdderShader.fragmentShader,
        }), (texture1 != null) ? undefined : 'texture1')
    }
}