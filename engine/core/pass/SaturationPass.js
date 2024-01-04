import * as THREE from '../../../node_modules/three/src/Three.js'
import { ShaderPass } from '../../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js'

/**
 * Render logic used for controlling saturation in the scene
 */
const SaturationShader =
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
        uniform float saturation;
        varying vec2 vUv;

        vec4 apply_saturation(vec4 color)
        {
            vec3 luminance = vec3(0.0, 1.0, 0.0);
            float oneMinusSat = 1.0 - saturation;
            return mat4((luminance.x * oneMinusSat) + saturation, luminance.x * oneMinusSat, luminance.x * oneMinusSat, 0,
                        luminance.y * oneMinusSat, (luminance.y * oneMinusSat) + saturation, luminance.y * oneMinusSat, 0,
                        luminance.z * oneMinusSat, luminance.z * oneMinusSat, (luminance.z * oneMinusSat) + saturation, 0,
                        0, 0, 0, 1) * color;
        }

        void main() 
        {
            gl_FragColor = apply_saturation(texture2D(baseTexture, vUv));
        }
    `
}

/**
 * Render pass which consists of saturation logic
 */
export class SaturationPass extends ShaderPass
{
    /**
     * @param {Number} saturation saturation intensity that is passed to the fragment shader as uniform
     */
    constructor(saturation)
    {
        super(new THREE.ShaderMaterial({
            uniforms: 
            { 
                baseTexture: { value: null },
                saturation: { value: saturation }
            },
            vertexShader : SaturationShader.vertexShader,
            fragmentShader : SaturationShader.fragmentShader,
        }), 'baseTexture')
    }

    /**
     * Sets the saturation value as uniform in the fragment shader
     * @param {Number} saturation saturation intensity that is passed to the fragment shader as uniform 
     */
    setSaturation(saturation) { this.material.uniforms.saturation.value = saturation }
}