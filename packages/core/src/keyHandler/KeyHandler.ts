import {IKeyEventListener} from "./_types/IKeyEventListener";
import {IKeyHandlerTarget} from "./_types/IKeyHandlerTarget";
import {IKey} from "./_types/IKey";
import {KeyEvent} from "./KeyEvent";
import {keyIds} from "./keyIdentifiers/keyIds";
import {keyIdMapping} from "./keyIdentifiers/keys";

/**
 * A key handler class
 */
export class KeyHandler {
    protected listeners: IKeyEventListener[] = [];

    protected pressedKeys = {} as {[key: string]: IKey};

    protected keyListener: (event: KeyboardEvent) => void;
    protected target: IKeyHandlerTarget;
    protected id = Math.random(); // TODO: remove after testing

    /**
     * Creates a new key handler for the specified target
     * @param target The target to add the listeners to
     */
    public constructor(target: IKeyHandlerTarget) {
        this.target = target;
        this.setupListeners();
    }

    /**
     * Sets up the listeners for the target
     * @param resetOnBlur Whether to reset the pressed keys if the window loses focus
     */
    protected setupListeners(): void {
        this.keyListener = (e: KeyboardEvent) => {
            const event = KeyHandler.getKeyEvent(e);
            if (event) this.emit(event);
        };
        this.target.addEventListener("keydown", this.keyListener);
        this.target.addEventListener("keyup", this.keyListener);
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
        if (insertHeldKeys) {
            if(event.held.length>0) event.setHeldKeys([...event.held, ...Object.values(this.pressedKeys)]);
            else event.setHeldKeys(Object.values(this.pressedKeys));
        }
        if (event.type != "up" && store) this.pressedKeys[event.key.id] = event.key;

        this.callListeners(event);
    }

    /**
     * Removes the handlers from the target
     */
    public destroy(): void {
        this.target.removeEventListener("keydown", this.keyListener);
        this.target.removeEventListener("keyup", this.keyListener);
    }

    /**
     * Releases all currently held keys
     */
    public resetKeys(): void {
        // Release all keys on blur
        Object.values(this.pressedKeys).forEach(key => {
            this.emit(new KeyEvent({key, type: "up"}));
        });
        this.pressedKeys = {};
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
        this.listeners.forEach(listener => listener(event));

        event.original?.stopImmediatePropagation();
        event.original?.stopPropagation();
        event.original?.preventDefault();
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
     * @returns The input for the event
     */
    public static getKeyEvent(event: KeyboardEvent): KeyEvent | null {
        const cc = event.code[0].toLowerCase() + event.code.substr(1);
        const keyId = keyIds[cc as keyof typeof keyIds];
        const keyName = keyIdMapping[keyId];
        const char = event.key.length == 1 ? event.key : "";
        return new KeyEvent({
            key: {
                id: keyId ?? "",
                name: keyName ?? "",
                char,
            },
            type: event.type == "keydown" ? "down" : "up",
            original: event,
        });
    }
}
