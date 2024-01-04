import { Color } from '../../node_modules/three/src/Three.js'
import { Vector3 } from '../../node_modules/three/src/Three.js'

export const Misc = 
{
    /**
     * Converts rgb value as string to threejs color object
     * @param {String} str rgb value as string 
     * @returns {THREE.Color} rgb value as threejs color
     */
    toColor : function(str)
    {
        let match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/)
        return match ? new Color(match[1]/255, match[2]/255, match[3]/255) : new Color()
    },

    /**
     * Converts hexadecimal color value as string to color object
     * @param {String} hex hexadecimal color value as string
     * @returns {THREE.Color} rgb value as threejs color
     */
    hexToColor : function(hex) 
    {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? new Color(parseInt(result[1], 16)/255, parseInt(result[2], 16)/255, parseInt(result[3], 16)/255) : new Color()
    },

    /**
     * Converts color object to hexadecimal color value in string
     * @param {THREE.Color} rgb value as threejs color
     * @returns {String} hex hexadecimal color value as string
     */
    colorToHex : function(color)
    {
        let scaledR = color.r * 255
        let hexR = scaledR.toString(16)
        hexR = (hexR.length == 1) ? '0'+hexR : hexR
        let scaledG = color.g * 255
        let hexG = scaledG.toString(16)
        hexG = (hexG.length == 1) ? '0'+hexG : hexG
        let scaledB = color.b * 255
        let hexB = scaledB.toString(16)
        hexB = (hexB.length == 1) ? '0'+hexB : hexB
        return ('#'+hexR+hexG+hexB).toUpperCase()
    },

    /**
     * Converts dimension value in px as string to valid numerical valu without format appended to it.
     * @param {String} pxString 
     */
    pxStringToNumber : function(pxString)
    {
        let pxValue = pxString.substring(0, pxString.length - 2)
        return Number.parseFloat(pxValue, 10)
    },

    /**
     * Checks if the app is running on handheld device or not.
     * @returns {Boolean} true if app is runnign on handheld device, false if otherwise
     */
    isHandHeldDevice : function() 
    { 
        let device = navigator.userAgent||navigator.vendor||window.opera
        return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(device)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(device.substr(0,4)))
    },

    /**
     * Converts vector in json format to threejs vector object
     * @param {any} vectorJson vector in json format
     * @returns {THREE.Vector3} threejs vector object
     */    
    toThreeJSVector : function(vectorJson) { return new Vector3(vectorJson.x, vectorJson.y, vectorJson.z) },

    /**
     * Multiplies two colors
     * @param {THREE.Color} color1 first color
     * @param {THREE.Color} color2 second color
     * @returns {THREE.Color} the final multiplied color
     */
    multiplyColors : function(color1, color2) { return new Color(color1.r * color2.r, color1.g * color2.g, color1.b * color2.b) },
    
    /**
     * Interpolates between two colors.
     * @param {THREE.Color} color1 first color. The rgb values should range between 0 to 1
     * @param {THREE.Color} color2 second color. The rgb values should range between 0 to 1
     * @param {THREE.Color} weight value used in interpolation. Should range between 0 to 1
     * @returns  {THREE.Color} the final interpolated color
     */
    interpolateColors : function(color1, color2, weight)
    {
        let r = (color1.r * weight) + (color2.r * (1 - weight))
        let g = (color1.g * weight) + (color2.g * (1 - weight))
        let b = (color1.b * weight) + (color2.b * (1 - weight))
        return new Color(r, g, b)
    },

    /**
     * Clamps the rgb values within 0 and 1
     * @param {THREE.Color} color threejs color value whose rgb should range between 0 to 1
     * 
     */
    clampColorValue : function(color)
    {
        color.r = (color.r < 0) ? 0 : color.r
        color.g = (color.g < 0) ? 0 : color.g
        color.b = (color.b < 0) ? 0 : color.b
        color.r = (color.r > 1) ? 1 : color.r
        color.g = (color.g > 1) ? 1 : color.g
        color.b = (color.b > 1) ? 1 : color.b
        return color
    },

    /**
     * Traverses through the mesh tree in post order
     * @param {THREE.Object3D} threeJsObject threejs object3d object
     * @param {Function} onNodeReach callback function called on reaching an object node in tree
     * @param {any} values set of values that need to be passed along the tree
     */
    postOrderTraversal : function(threeJsObject, onNodeReach, ...values)
    {
        if (threeJsObject.children.length > 0)
        {
            for (let i=0; i<threeJsObject.children.length; i++)   
                this.postOrderTraversal(threeJsObject.children[i], onNodeReach, values)
        }
        onNodeReach(threeJsObject, values)
    },

    /**
     * Traverses through the mesh tree in post order and deletes the nodes
     * @param {THREE.Mesh} mesh threejs object3d object
     * @param {Function} shouldDelete callback function called on reaching an object node in tree that
     * decides whether a node should be deleted
     */
    postOrderTraversalForDeletion : function(mesh, shouldDelete)
    {
        if (mesh != undefined && mesh != null)
        {
            if (shouldDelete(mesh))
            {
                if (mesh.parent != undefined && mesh.parent != null)
                {
                    let meshIndex = mesh.parent.children.indexOf(mesh)
                    mesh.parent.children.splice(meshIndex, 1)
                }
            }
            else
            {    
                let children = []
                for (let i=0; i < mesh.children.length; i++)
                    children.push(mesh.children[i])
                for (let i=0; i < children.length; i++)   
                    this.postOrderTraversalForDeletion(children[i], shouldDelete)
            }
        }
    }
}