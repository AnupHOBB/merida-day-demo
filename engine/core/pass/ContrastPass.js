import * as THREE from '../../../node_modules/three/src/Three.js'
import { ShaderPass } from '../../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js'

/**
 * Render logic used for modifying scene contrast
 */
const ContrastShader =
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
        uniform sampler2D baseTexture;
        uniform float contrast;
        varying vec2 vUv;

        void main() 
        {
            vec4 final_color = texture2D(baseTexture, vUv);
            final_color.xyz *= 1.0 + contrast;
            final_color.xyz -= contrast;
            gl_FragColor = final_color;
        }
    `
}

/**
 * Render pass which consists of contrast logic
 */
export class ContrastPass extends ShaderPass
{
    /**
     * @param {Number} contrast contrast amount
     */
    constructor(contrast)
    {
        super(new THREE.ShaderMaterial({
            uniforms: 
            { 
                baseTexture: { value: null },
                contrast: { value: contrast }
            },
            vertexShader : ContrastShader.vertexShader,
            fragmentShader : ContrastShader.fragmentShader,
        }), 'baseTexture')
    }

    /**
     * Sets the provided contrast value to the contrast uniform in fragment shader
     * @param {Number} contrast brightness amount 
     */
    setContrast(contrast) { this.material.uniforms.contrast.value = contrast }
}