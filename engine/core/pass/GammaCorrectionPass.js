import * as THREE from '../../../node_modules/three/src/Three.js'
import { ShaderPass } from '../../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js'

/**
 * Render logic used for modifying gamma value
 */
const GammaCorrectionShader =
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
        uniform float gamma;
        varying vec2 vUv;
        void main() 
        {
            vec4 fragColor = texture2D(baseTexture, vUv);
            fragColor.xyz = pow(fragColor.xyz, vec3(1.0/gamma));
            gl_FragColor = fragColor;
        }
    `
}

/**
 * Render pass which consists of gamma modification logic
 */
export class GammaCorrectionPass extends ShaderPass
{
    /**
     * @param {Number} gamma gamma value to be applied into the scene that is passed to the fragment shader as uniform
     */
    constructor(gamma)
    {
        super(new THREE.ShaderMaterial({
            uniforms: 
            { 
                baseTexture: { value: null },
                gamma: { value: gamma }
            },
            vertexShader : GammaCorrectionShader.vertexShader,
            fragmentShader : GammaCorrectionShader.fragmentShader,
        }), 'baseTexture')
    }

    /**
     * @param {Number} gamma gamma value to be applied into the scene that is passed to the fragment shader as uniform
     */
    setGamma(gamma) { this.material.uniforms.gamma.value = gamma }
}