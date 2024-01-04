/**
 * Wraps AssetLoaderCore
 */
export class AssetLoader
{
    constructor() { this.core = new AssetLoaderCore() }

    /**
     * Delegates call to AssetLoaderCore addLoader
     * @param {String} name used as key within the asset map
     * @param {String} url asset url
     * @param {THREE.Loader} loader loader through which the asset is to be loaded
     */
    addLoader(name, url, loader) { this.core.addLoader(name, url, loader) }

    /**
     * Delegates call to AssetLoaderCore load
     * @param {Function} onProgress callback that is called while the assets are loading
     * @param {Function} onComplete callback that is called after all assets are loaded
     */
    execute(onProgress, onComplete) { this.core.load(0, onProgress, onComplete) }
}

/**
 * Responsible for downloading assets
 */
class AssetLoaderCore
{
    constructor()
    {
        this.loaderMap = new Map()
        this.urls = []
        this.assetMap = new Map()
    }
    
    /**
     * Adds the url and the loader for the asset
     * @param {String} name used as key within the asset map
     * @param {String} url asset url
     * @param {THREE.Loader} loader loader through which the asset is to be loaded
     */
    addLoader(name, url, loader)
    {
        this.loaderMap.set(url, loader)
        this.urls.push({ name: name, url: url })
    }

    /**
     * Starts loading assets.
     * @param {Number} index index of asset url in urls array.
     * @param {Function} onProgress callback that is called while the assets are loading
     * @param {Function} onComplete callback that is called after all assets are loaded
     */
    load(index, onProgress, onComplete)
    {
        if (index >= this.urls.length)
        {    
            onComplete(this.assetMap)
            this.assetMap.clear()
            this.loaderMap.clear()
            this.urls.splice(0, this.urls.length)
        }
        else
        {
            let loader = this.loaderMap.get(this.urls[index].url)
            loader.load(this.urls[index].url, asset=>{
                this.loaderMap.delete(this.urls[index].url)
                this.assetMap.set(this.urls[index].name, asset)
                onProgress(Math.round(((index + 1)/this.urls.length) * 100))
                this.load(++index, onProgress, onComplete)
            }, (xhr)=>{
                let localProgress = Math.round((xhr.loaded/ xhr.total) * 100)
                let globalProgress = index * 100
                onProgress(Math.round((localProgress + globalProgress)/this.urls.length))
            })
        }
    }
}