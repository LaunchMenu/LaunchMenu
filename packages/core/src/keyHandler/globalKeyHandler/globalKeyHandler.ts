import {remote} from "electron";
import {IKeyArrayPatternData} from "../../menus/items/inputs/handlers/keyPattern/_types/IKeyPatternData";
import {KeyPattern} from "../KeyPattern";
import {IGlobalKeyEvent} from "../_types/IGlobalKeyEvent";
import {electronAcceleratorKeyMapping} from "./electronAcceleratorKeyMapping";
import {primaryGlobalShortcutKeys} from "./primaryGlobalShortcutKeys";

// TODO: find a library to wrap and get these events from
export class GlobalKeyHandler {
    protected keyListeners: ((event: IGlobalKeyEvent) => void)[] = [];
    protected invokeListeners: (event: IGlobalKeyEvent) => void | undefined;
    protected started: boolean = false;

    // TODO: fill in details
    protected advancedManager: any;
    protected globalListeners: Record<string, (() => void)[]> = {};

    /**
     * Adds a global key listeners that listens to all events
     * @param callback The key press callback
     * @returns A function that can be invoked to remove the listener
     */
    public addListener(callback: (event: IGlobalKeyEvent) => void): () => void {
        this.keyListeners.push(callback);

        // If this is the first listener, add it to key hook
        if (this.keyListeners.length == 1) {
            this.invokeListeners = event =>
                this.keyListeners.forEach(listener => listener(event));
            // TODO: fill in details
        }

        // Return a function to remove the listener
        return () => {
            const index = this.keyListeners.indexOf(callback);
            if (index != -1) this.keyListeners.splice(index, 1);

            // Remove the key hook listener if no listeners remain
            if (this.keyListeners.length == 0) {
                // TODO: fill in details
            }
        };
    }

    /**
     * Checks whether global key listeners are supported on the current OS/environment
     */
    public areListenersSupported(): boolean {
        return false;
    }

    /**
     * Adds a global shortcut
     * @param shortcut The keypattern to listen for
     * @param callback The callback to trigger when the event is fired
     * @returns A function that can be invoked to remove the shortcut
     */
    public addShortcut(shortcut: KeyPattern, callback: () => void): () => void {
        if (!this.advancedManager) {
            const accelerators = this.getElectronAccelerators(shortcut).filter(
                (n): n is string => typeof n == "string"
            );

            // Register each accelerator
            accelerators.forEach(accelerator => {
                if (!this.globalListeners[accelerator]) {
                    const listeners: (() => void)[] = [];
                    this.globalListeners[accelerator] = listeners;

                    const invoker = () => listeners.forEach(listener => listener());
                    remote.globalShortcut.register(accelerator, invoker);
                }
                this.globalListeners[accelerator].push(callback);
            });

            // Return a function to remove the listeners
            return () => {
                accelerators.forEach(accelerator => {
                    const listeners = this.globalListeners[accelerator];
                    if (!listeners) return;

                    const index = listeners.indexOf(callback);
                    if (index != -1) {
                        listeners.splice(index, 1);
                        if (listeners.length == 0) {
                            remote.globalShortcut.unregister(accelerator);
                            delete this.globalListeners[accelerator];
                        }
                    }
                });
            };
        }

        // TODO: fill in details
        return () => {};
    }

    /**
     * Checks whether the given keypattern is valid as a global shortcut or not
     * @param shortcut The key pattern to check
     * @returns False if the pattern is valid, or the patterns and errors if invalid
     */
    public isShortcutInvalid(
        shortcut: KeyPattern
    ): {pattern: IKeyArrayPatternData; error: Error}[] | false {
        type IError = {pattern: IKeyArrayPatternData; error: Error};
        const invalid = this.getElectronAccelerators(shortcut)
            .map((res, index) => ({pattern: shortcut.patterns[index], error: res}))
            .filter((res): res is IError => typeof res.error != "string");
        return invalid.length > 0 ? invalid : false;
    }

    /**
     * Retrieves the electron accelerator string if valid, or an error object otherwise
     * @param shortcut The key pattern shortcut
     * @returns The accelerator string or error object
     */
    protected getElectronAccelerators(shortcut: KeyPattern): (string | Error)[] {
        return shortcut.patterns.map(({allowExtra, pattern, type}) => {
            // Check the extra pattern event data
            if (allowExtra?.length ?? 0 > 0)
                return new Error("Global shortcuts can't have extra keys");
            if (type != "down")
                return new Error("Global shortcuts can only listen for key up events");

            // Check the pattern itself
            const {error} = pattern.reduce(
                ({error, charCount}, key) => {
                    if (error) return {error, charCount};
                    if (primaryGlobalShortcutKeys.includes(key)) {
                        charCount += 1;
                        if (charCount > 1)
                            error = new Error(
                                "Global shortcuts can only contain 1 primary key"
                            );
                    }
                    return {error, charCount};
                },
                {error: null as null | Error, charCount: 0}
            );
            if (error) return error;

            // Obtain the shortcut
            return pattern
                .map(
                    key =>
                        electronAcceleratorKeyMapping[
                            key as keyof typeof electronAcceleratorKeyMapping
                        ] ?? key
                )
                .join("+");
        });
    }
}

/**
 * The manager to handle global key events (events that occur even when LM isn't focused)
 */
export const globalKeyHandler = new GlobalKeyHandler();
