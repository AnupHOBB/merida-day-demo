import * as THREE from '../../../node_modules/three/src/Three.js'
import { ShaderPass } from '../../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js'

/**
 * Render logic used for controlling sharpness in the scene
 */
const SharpnessShader =
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
        varying vec2 vUv;
        uniform sampler2D baseTexture;
        uniform float imageWidth;
        uniform float imageHeight;
        uniform float sharpness;
        const int FILTER_WIDTH = 3;
        const int FILTER_HEIGHT = 3;

        void main()
        {
            float centerIntensity = (4.0 * sharpness) + 1.0;
            float filterMatrix[FILTER_WIDTH * FILTER_HEIGHT] = float[](
                0.0, -sharpness, 0.0,
                -sharpness, centerIntensity, -sharpness,
                0.0, -sharpness, 0.0
            );

            vec4 finalColor = vec4(0.0, 0.0, 0.0, 1.0);
            float filterWidthHalf = float(FILTER_WIDTH/2);
            float filterHeightHalf = float(FILTER_HEIGHT/2);
            float diffx = 1.0/imageWidth;
            float diffy = 1.0/imageHeight;
            for (int filterY = 0; filterY < FILTER_HEIGHT; filterY++)
            {
                for (int filterX = 0; filterX < FILTER_WIDTH; filterX++)
                {
                    vec2 sampleUV = vec2(0.0, 0.0);
                    sampleUV.x = vUv.x - (filterWidthHalf * diffx) + (float(filterX) * diffx);
                    sampleUV.y = vUv.y - (filterHeightHalf * diffy) + (float(filterY) * diffy);
                    vec4 sampleColor = texture2D(baseTexture, sampleUV);
                    finalColor.xyz += sampleColor.xyz * filterMatrix[filterY * FILTER_WIDTH + filterX];
                }
            }
            gl_FragColor = finalColor;
        }
    `
}

/**
 * Render pass which consists of sharpness logic
 */
export class SharpnessPass extends ShaderPass
{
    /**
     * @param {Number} sharpness sharpness intensity that is passed to the fragment shader as uniform
     */
    constructor(sharpness)
    {
        super(new THREE.ShaderMaterial({
            uniforms: 
            {
                baseTexture: { value: null },
                imageWidth: { value: window.innerWidth },
                imageHeight: { value: window.innerHeight },
                sharpness: { value: sharpness }
            },
            vertexShader : SharpnessShader.vertexShader,
            fragmentShader : SharpnessShader.fragmentShader,
        }), 'baseTexture')
    }

    /**
     * Sets the sharpness value as uniform in the fragment shader
     * @param {Number} sharpness sharpness intensity that is passed to the fragment shader as uniform 
     */
    setSharpness(sharpness) { this.material.uniforms.sharpness.value = sharpness }
}