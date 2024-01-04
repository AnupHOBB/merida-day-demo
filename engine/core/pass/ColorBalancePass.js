import * as THREE from '../../../node_modules/three/src/Three.js'
import { ShaderPass } from '../../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js'

/**
 * Render logic used for modifying the rgb values of the scene
 */
const ColorBalanceShader =
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
        uniform vec3 shadows;
        uniform vec3 highlights;
        uniform vec3 midtones;
        float shadowThreshold = 1.0;
        float highlightThreshold = 2.0;

        void main()
        {
            vec4 finalColor = texture2D(baseTexture, vUv);
            float sum = finalColor.x + finalColor.y + finalColor.z;
            vec3 finalColorXYZ = finalColor.xyz;
            if (sum < shadowThreshold)    
                finalColorXYZ *= shadows;
            else if (sum > highlightThreshold)
                finalColorXYZ *= highlights;
            else
                finalColorXYZ *= midtones;
            finalColor.xyz += finalColorXYZ;
            gl_FragColor = finalColor;
        }
    `
}

/**
 * Render pass which consists of color balance logic
 */
export class ColorBalancePass extends ShaderPass
{
    /**
     * @param {THREE.Vector3} shadowRgb rgb value that affects the darkest set of rgbs in the scene as uniform in the fragment shader
     * @param {THREE.Vector3} midtoneRgb rgb value that affects the mid level set of rgbs in the scene as uniform in the fragment shader
     * @param {THREE.Vector3} highlightRgb rgb value that affects the brightest set of rgbs in the scene as uniform in the fragment shader
     */
    constructor(shadowRgb, midtoneRgb, highlightRgb)
    {
        super(new THREE.ShaderMaterial({
            uniforms: 
            { 
                baseTexture: { value: null },
                shadows: { value: shadowRgb },
                midtones: { value: midtoneRgb },
                highlights: { value: highlightRgb },
            },
            vertexShader: ColorBalanceShader.vertexShader,
            fragmentShader: ColorBalanceShader.fragmentShader
        }), 'baseTexture')
    }

    /**
     * Sets the rgb values that affects the darkest set of rgbs in the scene as uniform in the fragment shader
     * @param {THREE.Vector3} shadowRgb rgb value that affects the darkest set of rgbs in the scene
     */
    setShadows(shadowRgb) { this.material.uniforms.shadows.value = shadowRgb }

    /**
     * Sets the rgb values that affects the mid set of rgbs i.e. neither too dark nor too bright rgbs in the scene as uniform in the fragment shader
     * @param {THREE.Vector3} midtoneRgb rgb value that affects the mid level set of rgbs in the scene 
     */
    setMidtones(midtoneRgb) { this.material.uniforms.midtones.value = midtoneRgb }

    /**
     * Sets the rgb values that affects the brightest set of rgbs in the scene
     * @param {THREE.Vector3} highlightRgb rgb value that affects the brightest set of rgbs in the scene as uniform in the fragment shader
     */
    setHighlights(highlightRgb) { this.material.uniforms.highlights.value = highlightRgb }
}