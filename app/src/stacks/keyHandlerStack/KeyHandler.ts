import {IKeyEventListener} from "./_types/IKeyEventListener";
import {IKeyHandlerTarget} from "./_types/IKeyHandlerTarget";
import {IKey} from "./_types/IKey";
import {KeyEvent} from "./KeyEvent";
import {keyboardLayout} from "./keyboardLayouts/qwerty";
import {ipcRenderer} from "electron";

/**
 * A key handler class
 */
export class KeyHandler {
    protected listeners: IKeyEventListener[] = [];

    protected pressedKeys = {} as {[key: number]: IKey};

    protected keyListener: (event: KeyboardEvent) => void;
    protected blurListener: () => void;
    protected target: IKeyHandlerTarget;

    /**
     * Creates a new key handler for the specified target
     * @param target The target to add the listeners to
     * @param resetOnBlur Whether to reset the pressed keys if the window loses focus
     */
    public constructor(target: IKeyHandlerTarget, resetOnBlur: boolean = true) {
        this.target = target;
        this.setupListeners(resetOnBlur);
    }

    /**
     * Sets up the listeners for the target
     * @param resetOnBlur Whether to reset the pressed keys if the window loses focus
     */
    protected setupListeners(resetOnBlur: boolean): void {
        this.keyListener = (e: KeyboardEvent) => {
            const event = KeyHandler.getKeyEvent(e);
            if (event) this.emit(event);
        };
        this.target.addEventListener("keydown", this.keyListener);
        this.target.addEventListener("keyup", this.keyListener);

        this.blurListener = () => {
            // Release all keys on blur
            Object.values(this.pressedKeys).forEach(key => {
                this.emit(new KeyEvent({key, type: "up"}));
            });
            this.pressedKeys = {};
        };
        if (resetOnBlur) ipcRenderer.on("blur", this.blurListener);
    }

    /**
     * Emits a given keyboard event
     * @param event
     */
    public emit(
        event: KeyEvent,
        {
            store = true,
            insertHeldKeys = true,
        }: {
            /** Whether to use the event to alter the held keys */
            store?: boolean;
            /** Whether to add the held keys to the event */
            insertHeldKeys?: boolean;
        } = {}
    ): void {
        if (event.type == "up" && store) delete this.pressedKeys[event.key.id];
        if (insertHeldKeys) event.setHeldKeys(Object.values(this.pressedKeys));
        if (event.type != "up" && store) this.pressedKeys[event.key.id] = event.key;

        this.callListeners(event);
    }

    /**
     * Removes the handlers from the target
     */
    public destroy(): void {
        this.target.removeEventListener("keydown", this.keyListener);
        this.target.removeEventListener("keyup", this.keyListener);
        ipcRenderer.off("blur", this.blurListener);
    }

    /**
     * Checks wether the key with the specified id is pressed
     * @param id The id of the key
     * @returns Whether the key is pressed
     */
    public isDown(id: number): boolean;
    /**
     * Checks wether the key with the specified name is pressed
     * @param name The name of the key
     * @returns Whether the key is pressed
     */
    public isDown(name: string): boolean;
    public isDown(name: number | string): boolean {
        if (typeof name == "number") return !!this.pressedKeys[name];
        return !!Object.values(this.pressedKeys).find(key => key.name == name);
    }

    // Listener management
    /**
     * Calls all the listeners with the loaded data
     */
    protected callListeners(event: KeyEvent): void {
        this.listeners.forEach(async listener => {
            if (!(listener instanceof Function)) listener = listener.emit;
            if (await listener(event)) {
                event.original?.stopImmediatePropagation();
                event.original?.stopPropagation();
                event.original?.preventDefault();
            }
        });
    }

    /**
     * Adds a listener to the key handler
     * @param listener The listener to add
     * @returns This, for method chaining
     */
    public listen(listener: IKeyEventListener): this {
        this.listeners.push(listener);
        return this;
    }

    /**
     * Removes a listener from the key handler
     * @param listener The listener to remove
     * @returns Whether the listener was removed
     */
    public removeListener(listener: IKeyEventListener): boolean {
        const index = this.listeners.indexOf(listener);
        if (index != -1) {
            this.listeners.splice(index, 1);
            return true;
        }
        return false;
    }

    // Static helper methods
    /**
     * Retrieves the input data for a 'synthetic' key event
     * @param event The original event
     * @param shift Whether shift was pressed
     * @returns The input for the event
     */
    public static getKeyEvent(event: KeyboardEvent): KeyEvent | null {
        const layout = keyboardLayout; //TODO: Get the layout to use dynamically from settings
        const key =
            layout.keys[event.which] || layout.keys[event.which + "-" + event.location];
        if (!key) return null;
        return new KeyEvent({
            key: {
                id: key.id,
                name: key.name,
                char: event.shiftKey ? key.shiftChar : key.char ?? event.char,
            },
            type: event.type == "keydown" ? "down" : "up",
            original: event,
        });
    }
}
