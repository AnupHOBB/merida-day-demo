import { GUI } from '../node_modules/lil-gui/dist/lil-gui.esm.js'

/**
 * Responsible for managing the debug ui
 */
export class DebugUI
{
    /**
     * @param {HTMLDivElement} container html element where the debug ui will be drawn into
     * @param {String} title title to be given to the debug ui 
     */
    constructor(container, title) 
    { 
        this._gui = new GUI({ autoPlace: false, container: container })
        this._gui.title(title)
        this._groups = new Map()
        this._elements = new Map()
        this._values = new Map()
    }

    /**
     * Adds a slider within a sub menu of the debug ui menu
     * @param {String} groupName name of the sub menu where the slider needs to be placed
     * @param {String} paramName label to be displayes beside the slider
     * @param {Number} defaultValue default value of the slider
     * @param {Number} min minimum value for the slider
     * @param {Number} max maximum value for the slider
     * @param {Function} callbackFunc funcion that is invoked when the slider's value is changed
     */
    addSlider(groupName, paramName, defaultValue, min, max, callbackFunc)
    {
        let object = this._createObject(paramName, defaultValue)
        let prevValue = defaultValue
        let sliderCallback = v => 
        {
            callbackFunc(v, v - prevValue)
            prevValue = v
        }
        let callback = this._prepareCallback(groupName, paramName, defaultValue, sliderCallback)
        let func = group => this._elements.set(groupName+'/'+paramName, group.add(object, paramName, min, max).onChange(callback))
        this._addToGroup(groupName, func)
    }

    /**
     * Adds a color picker within a sub menu of the debug ui menu
     * @param {String} groupName name of the sub menu where the color picker needs to be placed
     * @param {String} paramName label to be displayes beside the color picker
     * @param {THREE.Color} defaultValue default value of the color picker
     * @param {Function} callbackFunc funcion that is invoked when the color picker's value is changed
     */
    addColor(groupName, paramName, defaultValue, callbackFunc)
    {
        let object = this._createObject(paramName, defaultValue)
        let parser = v => { return JSON.stringify({r: v.r, g: v.g, b: v.b}) }
        let callback = this._prepareCallback(groupName, paramName, defaultValue, callbackFunc, parser)
        let func = group => this._elements.set(groupName+'/'+paramName, group.addColor(object, paramName).onChange(callback))
        this._addToGroup(groupName, func)
    }

    /**
     * Adds a checkbox within a sub menu of the debug ui menu
     * @param {String} groupName name of the sub menu where the checkbox needs to be placed
     * @param {String} paramName label to be displayes beside the checkbox
     * @param {Boolean} defaultValue default value of the checkbox
     * @param {Function} callbackFunc funcion that is invoked when the checkbox's value is changed
     */
    addCheckBox(groupName, paramName, defaultValue, callbackFunc)
    {
        let object = this._createObject(paramName, defaultValue)
        let callback = this._prepareCallback(groupName, paramName, defaultValue, callbackFunc)
        let func = group => this._elements.set(groupName+'/'+paramName, group.add(object, paramName).onChange(callback))
        this._addToGroup(groupName, func)
    }

    /**
     * Adds a button within a sub menu of the debug ui menu
     * @param {String} groupName name of the sub menu where the button needs to be placed
     * @param {String} paramName label to be displayes beside the button
     * @param {Function} callbackFunc funcion that is invoked when the button is pressed
     */
    addButton(groupName, paramName, callbackFunc)
    {
        let object = this._createObject(paramName, ()=>{})
        let callback = this._prepareCallback(groupName, paramName, '', callbackFunc)
        let func = group => this._elements.set(groupName+'/'+paramName, group.add(object, paramName).onChange(callback))
        this._addToGroup(groupName, func)
    }

    /**
     * Adds a drop down within a sub menu of the debug ui menu
     * @param {String} groupName name of the sub menu where the drop down needs to be placed
     * @param {String} paramName label to be displayes beside the drop down
     * @param {Function} callbackFunc funcion that is invoked when the drop down's value is changed
     */
    addDropDown(groupName, paramName, values, callbackFunc, defaultValue)
    {
        if (defaultValue == undefined)
            defaultValue = values[0]
        let object = this._createObject(paramName, defaultValue)
        let callback = this._prepareCallback(groupName, paramName, defaultValue, callbackFunc)
        let func = group => this._elements.set(groupName+'/'+paramName, group.add(object, paramName, values).onChange(callback))
        this._addToGroup(groupName, func)
    }

    /**
     * Adds an export button within a sub menu of the debug ui menu
     * @param {String} groupName name of the sub menu where the export button needs to be placed
     * @param {String} paramName label to be displayes beside the export button
     * @param {Function} callbackFunc funcion that is invoked when the export button is pressed
     */
    addExportButton(groupName, paramName, callbackFunc) 
    { 
        let object = this._createObject(paramName, ()=>{})
        let func = group => this._elements.set(groupName+'/'+paramName, group.add(object, paramName).onChange(() => callbackFunc(this._toJson())))
        this._addToGroup(groupName, func)
    }

    /**
     * Updates the value of the debug ui element whose group name and param name is given
     * @param {String} groupName name of the sub menu where the element is placed
     * @param {String} paramName label that is displayed besides the element
     * @param {any} value the new value to be set on element
     */
    updateElement(groupName, paramName, value)
    {
        let element = this._elements.get(groupName+'/'+paramName)
        if (element != undefined)
            element.setValue(value)
    }

    /**
     * Displays the debug menu
     */
    show() { this._gui.open() }

    /**
     * Closes the debug menu
     */
    close() { this._gui.close() }

    /**
     * Hides the debug menu
     */
    hide() { this._gui.hide() }

    /**
     * Displays the sub menu within the debug menu whose name is given
     * @param {String} groupName name of the sub menu to be displayed 
     */
    showGroup(groupName)
    {
        let group = this._groups.get(groupName)
        if (group != undefined)
            group.show()
    }

    /**
     * Hides the sub menu within the debug menu whose name is given
     * @param {String} groupName name of the sub menu to be hidden 
     */
    hideGroup(groupName)
    {
        let group = this._groups.get(groupName)
        if (group != undefined)
            group.hide()
    }

    /**
     * Displays the ui feature within a sub menu
     * @param {String} groupName name of the sub menu
     * @param {String} paramName name of the ui feature
     */
    showElement(groupName, paramName)
    {
        let element = this._elements.get(groupName+'/'+paramName)
        if (element != undefined)
            element.show()
    }

    /**
     * Hides the ui feature within a sub menu
     * @param {String} groupName name of the sub menu
     * @param {String} paramName name of the ui feature
     */
    hideElement(groupName, paramName)
    {
        let element = this._elements.get(groupName+'/'+paramName)
        if (element != undefined)
            element.hide()
    }

    /**
     * Sets the value of the ui feature within a sub menu
     * @param {String} groupName name of the sub menu
     * @param {String} paramName name of the ui feature
     * @param {any} value value to be assigned to the ui feature
     */
    setElementValue(groupName, paramName, value)
    {
        let element = this._elements.get(groupName+'/'+paramName)
        if (element != undefined)
            element.setValue(value)
    }

    /**
     * Returns the value of the ui feature within a sub menu
     * @param {String} groupName name of the sub menu
     * @param {String} paramName name of the ui feature
     * @returns {any} value to be retreived from the ui feature
     */
    getElementValue(groupName, paramName)
    {
        let element = this._elements.get(groupName+'/'+paramName)
        if (element != undefined)
            return element.getValue()
    }

    /**
     * Creates a json object with the name and value of the ui feature
     * @param {String} paramName name of the ui feature 
     * @param {any} value value to be assigned to the ui feature
     * @returns {json} json object
     */
    _createObject(paramName, value)
    {
        let objectJson = '{"'+paramName+'" : null'+'}'
        let object = JSON.parse(objectJson)
        object[paramName] = value
        return object
    }

    /**
     * Prepares the actual call back function for each ui feature by adding a logic to extract and store new values for each ui feature
     * @param {String} groupName name of the sub menu
     * @param {String} paramName name of the ui feature
     * @param {any} value value to be assigned to the ui feature
     * @param {Function} callbackFunc funcion that is invoked when there is a change in value in a ui feature.
     * This will be encapsulated inside the final and actual callback function returned by this function.
     * @param {Function} parser function that holds the logic regarding how should the value provided should be stored in _values map
     * @returns {Function} callback that will be actually used by the lil-gui library
     */
    _prepareCallback(groupName, paramName, value, callbackFunc, parser)
    {
        if (parser == undefined)
            parser = v => { return JSON.stringify(v) }
        let key = (groupName != '') ? groupName+'/'+paramName : paramName
        this._values.set(key, parser(value))
        let callback = v => 
        {
            this._values.set(key, parser(v))
            callbackFunc(v)
        }
        return callback
    }

    /**
     * Adds a ui feature into a sub menu
     * @param {String} groupName name of the sub menu
     * @param {Function} func holds the logic behind how a ui feature needs to be added within the sub menu
     */
    _addToGroup(groupName, func)
    {
        let group = (groupName == '') ? this._gui : this._groups.get(groupName)
        if (group == undefined)
        {
            group = this._gui.addFolder(groupName)
            group.open()
            this._groups.set(groupName, group)
        }
        func(group)
    }

    /**
     * Extracts all the values from all of the ui feature and produces a json consisting of all those values
     * @returns {json} json value consisting of all the values within all of the ui features
     */
    _toJson()
    {
        let json = '{\n'
        let keys = Array.from(this._values.keys())
        for (let key of keys)
        {
            json = json.concat('\t' + key + ' : ' + this._values.get(key))
            if (keys.indexOf(key) != (keys.length - 1))
                json = json.concat(',\n') 
        }
        json = json.concat('\n}')
        return json
    }
}