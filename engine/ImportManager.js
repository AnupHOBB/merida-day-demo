/**
 * This file SHOULD NOT contain any import statement that references either any external libraries
 * or any files within the project.
 */

/**
 * Responsible for importing js files
 */
export const ImportManager =
{
    /**
     * Imports all the files whose path is present within the pathMap
     * @param {Map} pathMap consist of the paths of the js files to be imported
     * @param {Function} onProgress callback that is called after every successful import
     * @param {Function} onComplete callback that is called after successfully importing all files
     */
    execute : function(pathMap, onProgress, onComplete)
    {
        if (onProgress == undefined)
            onProgress = (p, s)=>{}
        if (onComplete == undefined)
            onComplete = (m)=>{}
        let names = pathMap.keys()
        let progress = 0
        for (let name of names)
        {    
            import(pathMap.get(name)).then((module)=>{
                onProgress(name, module, Math.round((progress++/pathMap.size) * 100))
                if (progress == pathMap.size)
                    onComplete()
            })
        }
    }
}