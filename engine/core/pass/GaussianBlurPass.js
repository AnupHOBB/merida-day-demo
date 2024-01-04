import * as THREE from '../../../node_modules/three/src/Three.js'
import { ShaderPass } from '../../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js'

/**
 * Render logic used for applying gaussian blur in the scene
 */
const GaussianBlurShader =
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
        const int FILTER_WIDTH = 3;
        const int FILTER_HEIGHT = 3;
        
        float filterMatrix[FILTER_WIDTH * FILTER_HEIGHT] = float[](
            0.0625, 0.125, 0.0625,
            0.125,  0.25, 0.125,
            0.0625, 0.125, 0.0625
        );   

        void main()
        {
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
 * Render pass which consists of gaussian blur logic
 */
export class GaussianBlurPass extends ShaderPass
{
    constructor()
    {
        super(new THREE.ShaderMaterial({
            uniforms: 
            {
                baseTexture: { value: null },
                imageWidth: { value: window.innerWidth },
                imageHeight: { value: window.innerHeight }
            },
            vertexShader : GaussianBlurShader.vertexShader,
            fragmentShader : GaussianBlurShader.fragmentShader,
        }), 'baseTexture')
    }
}