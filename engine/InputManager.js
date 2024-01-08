import { SceneObject } from './core/SceneManager.js'
import { Misc } from './helpers/misc.js'

/**
 * Responsible for notifying objects whenever user provides a mouse, touch or key input
 */
export class InputManager extends SceneObject
{ 
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     */
    constructor(name)
    {
        super(name)
        this.keyEvent = new KeyEventCore()
        this.cursorEvent = new CursorEventCore()
    }

    /**
     * Registers key event callbacks
     * @param {Function} callback callback that is called whenever user presses a key in keyboard 
     */
    registerKeyEvent(callback) { this.keyEvent.callbacks.push(callback) }

    /**
     * Delegates call to KeyEventCore notify
     */
    notifyKeyEvent() { this.keyEvent.notify() }

    /**
     * Sets the mouse sensitivity value
     * @param {Number} sensitivity 
     */
    setCursorSensitivity(sensitivity)
    {
        if (sensitivity != null && sensitivity != undefined)
            this.cursorEvent.sensitivity = sensitivity
    }

    /**
     * Registers mouse lmb click callbacks
     * @param {Function} onClick callback that is called whenever user click on mouse
     */
    registerLMBClickEvent(onClick)
    {
        if (onClick != null && onClick != undefined)
            this.cursorEvent.clickCallbacks[0].push(onClick)
    }

    /**
     * Registers lmb press callbacks
     * @param {Function} onPressEvent callback that is called whenever the mouse or touch cursor is pressed
     */
    registerLMBPressEvent(onPressEvent)
    {
        if (onPressEvent != null && onPressEvent != undefined)
            this.cursorEvent.pressCallbacks[0].push(onPressEvent)
    }

    /**
     * Registers lmb hold movement callbacks
     * @param {Function} onMoveEvent callback that is called whenever the mouse or touch cursor is relocated
     */
    registerLMBMoveEvent(onMoveEvent)
    {
        if (onMoveEvent != null && onMoveEvent != undefined)
            this.cursorEvent.moveCallbacks[0].push(onMoveEvent)
    }

    /**
     * Registers lmb release callbacks
     * @param {Function} onReleaseEvent callback that is called whenever the mouse or touch cursor is released
     */
    registerLMBReleaseEvent(onReleaseEvent)
    {
        if (onReleaseEvent != null && onReleaseEvent != undefined)
            this.cursorEvent.releaseCallbacks[0].push(onReleaseEvent)
    }

    /**
     * Registers lmb double click callbacks
     * @param {Function} onDblClick callback that is called whenever user double clicks on mouse
     */
    registerLMBDoubleClickEvent(onDblClick)
    {
        if (onDblClick != null && onDblClick != undefined)
            this.cursorEvent.dblClickCallbacks[0].push(onDblClick)
    }

    /**
     * Registers mouse rmb click callbacks
     * @param {Function} onClick callback that is called whenever user clicks lmb button
     */
    registerRMBClickEvent(onClick)
    {
        if (onClick != null && onClick != undefined)
            this.cursorEvent.clickCallbacks[2].push(onClick)
    }

    /**
     * Registers rmb press callbacks
     * @param {Function} onPressEvent callback that is called whenever the mouse or touch cursor is pressed
     */
    registerRMBPressEvent(onPressEvent)
    {
        if (onPressEvent != null && onPressEvent != undefined)
            this.cursorEvent.pressCallbacks[2].push(onPressEvent)
    }

    /**
     * Registers rmb hold movement callbacks
     * @param {Function} onMoveEvent callback that is called whenever the user holds lmb button
     */
    registerRMBMoveEvent(onMoveEvent)
    {
        if (onMoveEvent != null && onMoveEvent != undefined)
            this.cursorEvent.moveCallbacks[2].push(onMoveEvent)
    }

    /**
     * Registers rmb release callbacks
     * @param {Function} onReleaseEvent callback that is called whenever the mouse or touch cursor is released
     */
    registerRMBReleaseEvent(onReleaseEvent)
    {
        if (onReleaseEvent != null && onReleaseEvent != undefined)
            this.cursorEvent.releaseCallbacks[2].push(onReleaseEvent)
    }

    /**
     * Registers rmb double click callbacks
     * @param {Function} onDblClick callback that is called whenever the user double clicks lmb button
     */
    registerRMBDoubleClickEvent(onDblClick)
    {
        if (onDblClick != null && onDblClick != undefined)
            this.cursorEvent.dblClickCallbacks[2].push(onDblClick)
    }

    /**
     * Registers touch tap callbacks
     * @param {Function} onTap callback that is called whenever user click on mouse
     */
    registerTouchTapEvent(onTap)
    {
        if (onTap != null && onTap != undefined)
            this.cursorEvent.clickCallbacks[3].push(onTap)
    }

    /**
     * Registers touch press callbacks
     * @param {Function} onPressEvent callback that is called whenever the mouse or touch cursor is pressed
     */
    registerTouchPressEvent(onPressEvent)
    {
        if (onPressEvent != null && onPressEvent != undefined)
            this.cursorEvent.pressCallbacks[3].push(onPressEvent)
    }

    /**
     * Registers touch movement callbacks
     * @param {Function} onTouchMove callback that is called whenever the mouse or touch cursor is relocated
     */
    registerTouchMoveEvent(onTouchMove)
    {
        if (onTouchMove != null && onTouchMove != undefined)
            this.cursorEvent.moveCallbacks[3].push(onTouchMove)
    }

    /**
     * Registers touch release callbacks
     * @param {Function} onReleaseEvent callback that is called whenever the mouse or touch cursor is released
     */
    registerTouchReleaseEvent(onReleaseEvent)
    {
        if (onReleaseEvent != null && onReleaseEvent != undefined)
            this.cursorEvent.releaseCallbacks[3].push(onReleaseEvent)
    }

    /**
     * Registers touch double tap callbacks
     * @param {Function} onDblTap callback that is called whenever user double clicks on mouse
     */
    registerTouchDoubleTapEvent(onDblTap)
    {
        if (onDblTap != null && onDblTap != undefined)
            this.cursorEvent.dblClickCallbacks[3].push(onDblTap)
    }

    /**
     * Registers mouse wheel callbacks
     * @param {Function} onWheelMove callback that is called whenever user moves the mouse wheel
     */
    registerMouseWheelEvent(onWheelMove)
    {
        if (onWheelMove != null && onWheelMove != undefined)
            this.cursorEvent.wheelCallbacks.push(onWheelMove)
    }

    /**
     * Called by SceneManager every frame.
     * This function delegates call to KeyEventCore notify
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onSceneRender(sceneManager) { this.keyEvent.notify() }
}

/**
 * Responsible for detecting and notifying mouse and touch events
 */
class CursorEventCore
{
    constructor()
    {
        this.enable = true
        this.firstClicks = [true, true, true, true]
        this.lastXYs = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]
        this.sensitivity = 1
        this.clickCallbacks = [[],[],[],[]]
        this.pressCallbacks = [[],[],[],[]]
        this.moveCallbacks = [[],[],[],[]]
        this.releaseCallbacks = [[],[],[],[]]
        this.dblClickCallbacks = [[],[],[],[]]
        this.wheelCallbacks = []
        this.buttonPresses = [false, false, false, false]
        this.buttonDblTapCounter = [0, 0, 0, 0]
        this.registerCanvasEvents()
    }

    /**
     * Registers event listeners
     */
    registerCanvasEvents()
    {
        document.addEventListener('contextmenu', e=>e.preventDefault())
        document.addEventListener('mousedown', e=>this.onButtonPress(e))
        document.addEventListener('mouseup', e=>this.onButtonRelease(e))
        document.addEventListener('mousemove', e=>this.onCursorMove(e))
        document.addEventListener('touchstart', e=>this.onButtonPress(e))
        document.addEventListener('touchend', e=>this.onButtonRelease(e))
        document.addEventListener('touchmove', e=>this.onCursorMove(e))
        document.addEventListener('wheel', e=>this.onMouseWheelRoll(e))
    }

    /**
     * Called whenever user presses the mouse button or touches the screen.
     * This function sets the mousePress flag to true and notifies all the registered double click callbacks
     * on detecting double taps.
     * @param {Event} event mouse or touch event object
     */
    onButtonPress(event) 
    { 
        let isDevice = Misc.isHandHeldDevice()
        if ((isDevice && event.type == 'touchstart') || (!isDevice && event.type == 'mousedown'))
        {
            let callbackIndex
            if (event.type == 'touchstart')
            {    
                event = event.touches[0]
                callbackIndex = 3
            }
            else
                callbackIndex = event.button
            let callbacks = this.pressCallbacks[callbackIndex]
            for (let pressCallback of callbacks)
                pressCallback(event.clientX, event.clientY)
            this.buttonPresses[callbackIndex] = true 
            this.buttonDblTapCounter[callbackIndex] = this.buttonDblTapCounter[callbackIndex] + 1
            if (this.buttonDblTapCounter[callbackIndex] > 2)
                this.buttonDblTapCounter[callbackIndex] = 2   
            if (this.buttonDblTapCounter[callbackIndex] == 1)
            {
                setTimeout(()=>{
                    if (this.buttonDblTapCounter[callbackIndex] > 1)
                    {
                        let callbacks = this.dblClickCallbacks[callbackIndex]
                        for (let dblClickCallback of callbacks)
                            dblClickCallback(event)
                    }
                    else
                    {
                        let callbacks = this.clickCallbacks[callbackIndex]
                        for (let clickCallback of callbacks)
                            clickCallback(event.clientX, event.clientY)
                    }
                    this.buttonDblTapCounter[callbackIndex] = 0
                }, 250) 
            }
        }  
    }

    /**
     * Called whenever user releases the mouse button or touches the screen.
     * This function sets the mousePress flag to false and firstClick value to true
     * and also resets the value of lastXY object.
     * @param {Event} event mouse or touch event object
     */
    onButtonRelease(event)
    {
        this.buttonPresses[event.button] = false
        this.firstClicks[event.button] = true
        this.lastXYs[event.button] = { x: 0, y: 0 }
        let callbacks = this.releaseCallbacks[event.button]
        if (callbacks != undefined)
        {
            for (let releaseCallback of callbacks)
                releaseCallback(event)
        }
    }

    /**
     * Called whenever the mouse or touch cursor is relocated.
     * If there are registered move callbacks and if the mousePress is true, then this function will 
     * calculate the displacement of the cursor and call the callbacks by providing the displacement
     * as well as the cursor positions.
     * @param {Event} event mouse or touch event object
     */
    onCursorMove(event)
    {
        let callbackIndex
        if (event.type == 'touchmove') 
            callbackIndex = 3
        else
            callbackIndex = this.toButtonIndex(event.buttons)
        let buttonPress = this.buttonPresses[callbackIndex]
        if (buttonPress && callbackIndex >= 0 && callbackIndex < this.moveCallbacks.length)
        {
            let callbacks = this.moveCallbacks[callbackIndex]
            if (callbacks.length > 0 && this.buttonPresses[callbackIndex])
            {    
                if (event.type == 'touchmove') 
                    event = event.touches[0]
                if (this.firstClicks[callbackIndex])
                {
                    this.lastXYs[callbackIndex] = { x: event.clientX, y: event.clientY }
                    this.firstClicks[callbackIndex] = false
                }
                let lastXY = this.lastXYs[callbackIndex]
                this.currentXY = { x: event.clientX, y: event.clientY }
                let deltaX = (this.currentXY.x - lastXY.x) * this.sensitivity
                let deltaY = (this.currentXY.y - lastXY.y) * this.sensitivity
                let callbacks = this.moveCallbacks[callbackIndex]
                for (let moveCallback of callbacks)
                    moveCallback(deltaX, deltaY, event.clientX, event.clientY)
                this.lastXYs[callbackIndex] = this.currentXY
            }
        }
    }

    /**
     * Called by canvas event listener whenever it detects a mouse double click.
     * This function notifies all the registered double click callbacks.
     * @param {MouseEvent} event mouse event object
     */
    onDblClick(event)
    {
        let callbacks = this.dblClickCallbacks[event.button]
        for (let dblClickCallback of callbacks)
            dblClickCallback(event)
    }

    /**
     * Called whenever the mouse wheel is rolled.
     * @param {Event} event mouse wheel event
     */
    onMouseWheelRoll(event)
    {
        if (this.wheelCallbacks.length > 0)
        {    
            for (let wheelCallback of this.wheelCallbacks)
                wheelCallback(event.deltaY/100)
        }
    }

    /**
     * Converts the mouse button move event index to their actual index. During mouse move event, the browser sets the event.button value as zero no matter
     * which button is pressed during move. Thus, to determine which buttons are pressed, the buttons field in the mouse event object is used that maps out
     * the button index as mentioned in this website : https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
     * @param {Number} moveEventIndex index of the mouse button during mouse move
     * @returns 
     */
    toButtonIndex(moveEventIndex)
    {
        switch (moveEventIndex)
        {
            case 1 :
                return 0;
            case 2 :
                return 2;
            case 4 :
                return 1;
            case 8 :
                return 3;
            case 16 :
                return 4;
            default :
                return 0;
        }
    }
}

/**
 * Responsible for detecting and notifying key events
 */
class KeyEventCore
{
    constructor()
    {
        this.keyMap = new Map()
        this.callbacks = []
        window.addEventListener("keydown", e=>this.onDown(e))
        window.addEventListener("keyup", e=>this.onUp(e))
    }

    /**
     * Called by window whenever it detects a key press.
     * This function stores the key in keymap
     * @param {KeyboardEvent} event 
     */
    onDown(event)
    {
        let entry = this.keyMap.get(event.key)
        if (entry == null || entry == undefined)
            this.keyMap.set(event.key, true)
    }

    /**
     * Called by window whenever it detects a key release.
     * This function remove the key from keymap
     * @param {KeyboardEvent} event 
     */
    onUp(event)
    {
        let entry = this.keyMap.get(event.key)
        if (entry != null && entry != undefined)
            this.keyMap.delete(event.key)
    }

    /**.
     * This function calls all the keyevent callbacks on every frame
     */
    notify()
    {
        for (let callback of this.callbacks)
            callback(this.keyMap)
    }
}