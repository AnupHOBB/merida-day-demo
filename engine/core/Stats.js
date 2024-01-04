/**
 * Responsible for displaying stats about the rendered 3D scene
 */
export class Stats
{
    /**
     * @param {THREE.WebGLRenderer} renderer webgl renderer used by threejs
     * @param {HTMLPreElement} preElement html pre element where the stats will be displayed
     */
    constructor(renderer, preElement)
    {
        this.renderer = renderer
        this.renderer.info.autoReset = false
        this.preElement = preElement
        this.lastDate = new Date()
        this.updateDurationInMs = 1000
        this.fpsCounter = 0
    }

    /**
     * Changes the updateDurationInMs which is the duration after which the stats will be updated
     * @param {Number} updateDurationInMs the duration after which the stats will be updated
     */
    setUpdateDurationInMs(updateDurationInMs) { this.updateDurationInMs = updateDurationInMs }

    /**
     * Updates the stats
     */
    update()
    {
        this.fpsCounter++
        let currentDate = new Date()
        if (currentDate - this.lastDate >= this.updateDurationInMs)
        {
            let stats = 'Frame rate: '+this.fpsCounter+'\n'
            stats += 'Draw calls per frame: '+this.renderer.info.render.calls+'\n'
            stats += 'Triangles per frame: '+this.renderer.info.render.triangles+'\n'
            stats += 'Geometries: '+this.renderer.info.memory.geometries+'\n'
            stats += 'Textures: '+this.renderer.info.memory.textures
            this.preElement.innerHTML = stats
            this.fpsCounter = 0
            this.lastDate = currentDate
        }
        this.renderer.info.reset() 
    }
}