import {IKeyEventListener} from "./_types/IKeyEventListener";
import {IKeyEvent} from "./_types/IKeyEvent";
import {IKeyHandlerTarget} from "./_types/IKeyHandlerTarget";
import {IKey} from "./_types/IKey";
import {keyNames} from "./keyNames";

/**
 * A key handler class
 */
export class KeyHandler {
    protected listeners: IKeyEventListener[] = [];

    protected pressedKeys = {} as {[key: number]: IKey};

    protected keyUpListener: (event: KeyboardEvent) => void;
    protected keyDownListener: (event: KeyboardEvent) => void;
    protected target: IKeyHandlerTarget;

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
     */
    protected setupListeners(): void {
        const createEvent = (e: KeyboardEvent, down: boolean) => {
            const repeat = down && !!this.pressedKeys[e.which];
            const key = {
                id: e.which,
                name: keyNames[e.which],
                char: e.char,
            };
            const event: IKeyEvent = {
                held: Object.values(this.pressedKeys),
                ctrl: e.ctrlKey,
                shift: e.shiftKey,
                alt: e.altKey,
                repeat,
                down,
                key,
                original: e,
            };
            return {key, event};
        };
        this.keyDownListener = e => {
            const {key, event} = createEvent(e, true);
            this.pressedKeys[e.which] = key;
            this.callListeners(event);
        };
        this.keyUpListener = e => {
            delete this.pressedKeys[e.which];
            const {event} = createEvent(e, false);
            this.callListeners(event);
        };
        this.target.addEventListener("keydown", this.keyDownListener);
        this.target.addEventListener("keyup", this.keyUpListener);
    }

    /**
     * Removes the handlers from the target
     */
    public destroy(): void {
        this.target.removeEventListener("keydown", this.keyDownListener);
        this.target.removeEventListener("keyup", this.keyUpListener);
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
    protected callListeners(event: IKeyEvent): void {
        this.listeners.forEach(listener => {
            if (listener(event)) {
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
}
