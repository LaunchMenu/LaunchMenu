import {remote} from "electron";
import {IKeyArrayPatternData} from "../../menus/items/inputs/handlers/keyPattern/_types/IKeyPatternData";
import {KeyPattern} from "../KeyPattern";
import {electronAcceleratorKeyMapping} from "./electronAcceleratorKeyMapping";
import {primaryGlobalShortcutKeys} from "./primaryGlobalShortcutKeys";
import {
    GlobalKeyboardListener,
    IGlobalKeyListener as IGKL,
    IGlobalKey as IGK,
    IGlobalKeyEvent as IGKE,
} from "node-global-key-listener";
import {IGlobalKeyListener} from "../_types/IGlobalKeyListener";
import {nodeGlobalKeyListenerMapping} from "./nodeGlobalKeyListenerMapping";
import {IGlobalKeyEvent} from "../_types/IGlobalKeyEvent";
import {IKeyId} from "../keyIdentifiers/keyIds";
import {IKeyMatcher, keyIdMapping} from "../keyIdentifiers/keys";
import {IKeyName} from "../keyIdentifiers/keyNames";
import {IDataHook, IDataRetriever, Observer} from "model-react";
import {isPlatform} from "../../utils/platform/isPlatform";

/** A class that can be used for registering keyboard shortcuts. Should be used as a singleton obtained from LaunchMenu */
export class GlobalKeyHandler {
    protected advancedManager: GlobalKeyboardListener | undefined;

    protected invokeListeners?: IGKL;
    protected keyListeners: IGlobalKeyListener[] = [];
    protected electronListeners: Record<string, (() => void)[]> = {};

    // Track whether the handler is disposed in order to not register new handlers when it is
    protected silentError = true; // TODO: May want to change this in the future and/or make it configurable (but it currently happens on every reload, so silent error is preferable)
    protected disposed = false;

    // Some methods to allow switching between electron's key listener and the custom key listener
    protected useElectronListener: IDataRetriever<boolean>;
    protected useElectronListenerObserver: Observer<boolean>;
    protected currentUseElectronListener: boolean = false;
    protected shortcutListeners: {
        shortcut: KeyPattern;
        callback: () => void;
        dispose: () => void;
    }[] = [];

    /**
     * Creates a new instance of the global key handler
     * @param useElectronListener A data retriever to determine whether to force use electron's listener
     */
    public constructor(useElectronListener: IDataRetriever<boolean> = () => true) {
        try {
            this.advancedManager = new GlobalKeyboardListener();
        } catch (e) {
            console.error(e);
        }
        this.useElectronListener = useElectronListener;
        this.useElectronListenerObserver = this.setupShortcutMethodObserver();
    }

    /**
     * Adds a global key listeners that listens to all events
     * @param callback The key press callback
     * @returns A function that can be invoked to remove the listener
     */
    public addListener(callback: IGlobalKeyListener): () => void {
        if (this.disposed) {
            if (this.silentError) return () => {};
            throw new Error("Handler already disposed");
        }
        if (!this.advancedManager)
            throw new Error("Global key listeners are not supported on this platform");

        this.keyListeners.push(callback);

        // If this is the first listener, add it to key hook
        if (this.keyListeners.length == 1) {
            this.invokeListeners = (event, held) => {
                if (this.currentUseElectronListener) return;

                const ev = this.convertKeyEvent(event, held);
                if (!ev) return;

                let stopPropagation = false;
                let stopImmediatePropagation = false;
                for (let listener of this.keyListeners) {
                    const res = listener(ev);
                    if (typeof res == "object") {
                        if (res.stopPropagation) stopPropagation = true;
                        if (res.stopImmediatePropagation) {
                            stopImmediatePropagation = true;
                            break;
                        }
                    } else if (res) stopPropagation = true;
                }

                return {
                    stopImmediatePropagation,
                    stopPropagation,
                };
            };
            this.advancedManager?.addListener(this.invokeListeners);
        }

        // Return a function to remove the listener
        return () => {
            const index = this.keyListeners.indexOf(callback);
            if (index != -1) this.keyListeners.splice(index, 1);

            // Remove the key hook listener if no listeners remain
            if (this.keyListeners.length == 0 && this.invokeListeners) {
                this.advancedManager?.removeListener(this.invokeListeners);
            }
        };
    }

    /**
     * Converts a global key event to the format as used by LM
     * @param event The event to convert
     * @param held The keys that are currently held
     * @returns The LM event
     */
    protected convertKeyEvent(
        event: IGKE,
        held: {
            [K in IGK]?: boolean;
        }
    ): IGlobalKeyEvent | undefined {
        if (!event.name) return undefined;
        const key = nodeGlobalKeyListenerMapping[event.name];
        if (!key) return undefined;

        return {
            key,
            rawcode: event.name,
            type: event.state == "UP" ? "keyup" : "keydown",
            altKey: held["LEFT ALT"] ? "left" : held["RIGHT ALT"] ? "right" : undefined,
            ctrlKey: held["LEFT CTRL"]
                ? "left"
                : held["RIGHT CTRL"]
                ? "right"
                : undefined,
            metaKey: held["LEFT META"]
                ? "left"
                : held["RIGHT META"]
                ? "right"
                : undefined,
            shiftKey: held["LEFT SHIFT"]
                ? "left"
                : held["RIGHT SHIFT"]
                ? "right"
                : undefined,
        };
    }

    /**
     * Checks whether global key listeners are supported on the current OS/environment
     * @param hook The hook to subscribe to changes
     * @returns Whether listeners are supported
     */
    public areListenersSupported(hook?: IDataHook): boolean {
        return (
            !this.useElectronListener(hook) &&
            !!this.advancedManager &&
            (!isPlatform("mac") ||
                remote.systemPreferences.isTrustedAccessibilityClient(false))
        );
    }

    /**
     * Sets up an observer that takes care of moving the shortcut listeners if the setting changed
     */
    protected setupShortcutMethodObserver(): Observer<boolean> {
        return new Observer(h => !this.areListenersSupported(h)).listen(useElectron => {
            if (this.currentUseElectronListener != useElectron) {
                this.currentUseElectronListener = useElectron;

                // Dispose all the old listeners
                const allListeners = this.shortcutListeners;
                this.shortcutListeners = [];
                allListeners.forEach(({dispose}) => dispose());

                // Unregister all listeners
                allListeners.forEach(bundle => {
                    const newDispose = this.addShortcut(bundle.shortcut, bundle.callback);
                    // Make sure that the original dispose method can still be used (since this was returned from the original addShortcut callback)
                    bundle.dispose = newDispose;
                });

                // Add or remove the global listener
                if (this.advancedManager && this.invokeListeners) {
                    if (useElectron) {
                        this.advancedManager.removeListener(this.invokeListeners);
                        this.advancedManager.kill();
                    } else {
                        this.advancedManager.addListener(this.invokeListeners);
                    }
                }
            }
        }, true);
    }

    /**
     * Adds a global shortcut
     * @param shortcut The keypattern to listen for
     * @param callback The callback to trigger when the event is fired
     * @returns A function that can be invoked to remove the shortcut
     */
    public addShortcut(shortcut: KeyPattern, callback: () => void): () => void {
        if (this.disposed) {
            if (this.silentError) return () => {};
            throw new Error("Handler already disposed");
        }

        const invalid = this.isShortcutInvalid(shortcut);
        if (invalid) throw invalid[0].error;

        // Use one of the two shortcut methods
        let dispose: () => void;
        if (!this.areListenersSupported())
            dispose = this.addElectronShortcut(shortcut, callback);
        else dispose = this.addCustomShortcut(shortcut, callback);

        // Setup a callback to dispose all data associated to a shortcut
        const fullDispose = () => {
            const index = this.shortcutListeners.indexOf(bundle);
            if (index != -1) this.shortcutListeners.splice(index, 1);
            dispose();
        };
        const bundle = {shortcut, callback, dispose: fullDispose};
        this.shortcutListeners.push(bundle);

        // Note that bundle's fullDispose method can be changed throughout its lifetime, the bundle object mutates (to support dynamic `useElectronListener`)
        return () => bundle.dispose();
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
     * Adds a global shortcut using the node-global-key-listener package
     * @param shortcut The key pattern to listen for
     * @param callback The callback to trigger when the event is fired
     * @returns A function that can be invoked to remove the shortcut
     */
    protected addCustomShortcut(shortcut: KeyPattern, callback: () => void): () => void {
        type IModifierState = "left" | "right" | undefined;
        type IModifiers = {
            altKey: IModifierState[];
            shiftKey: IModifierState[];
            ctrlKey: IModifierState[];
            metaKey: IModifierState[];
        };

        // Create a format that's faster to compare with
        const keys: {[P in IKeyId]?: IModifiers[]} = {};

        shortcut.patterns.forEach(({pattern}, i) => {
            const primaryKey = pattern.find(
                key =>
                    !(
                        [
                            "altLeft",
                            "altRight",
                            "controlLeft",
                            "controlRight",
                            "shiftLeft",
                            "shiftRight",
                            "metaLeft",
                            "metaRight",
                            "alt",
                            "ctrl",
                            "shift",
                            "meta",
                        ] as IKeyMatcher[]
                    ).includes(key)
            );

            function getState(
                pattern: IKeyMatcher[],
                left: IKeyId,
                right: IKeyId,
                either: IKeyName
            ): IModifierState[] {
                const includesLeft = pattern.includes(left);
                const includesRight = pattern.includes(right);
                const includesEither = pattern.includes(either);
                return [
                    ...(includesLeft || includesEither ? ["left" as const] : []),
                    ...(includesRight || includesEither ? ["right" as const] : []),
                    ...(!includesLeft && !includesRight && !includesEither
                        ? [undefined]
                        : []),
                ];
            }

            if (primaryKey) {
                Object.entries(keyIdMapping)
                    .filter(([id, name]) => id == primaryKey || name == primaryKey)
                    .forEach(([id]) => {
                        if (!keys[id as IKeyId]) keys[id as IKeyId] = [];
                        keys[id as IKeyId]?.push({
                            altKey: getState(pattern, "altLeft", "altRight", "alt"),
                            ctrlKey: getState(
                                pattern,
                                "controlLeft",
                                "controlRight",
                                "ctrl"
                            ),
                            shiftKey: getState(
                                pattern,
                                "shiftLeft",
                                "shiftRight",
                                "shift"
                            ),
                            metaKey: getState(pattern, "metaLeft", "metaRight", "meta"),
                        });
                    });
            }
        });

        // Create the listener
        const listener: IGlobalKeyListener = event => {
            if (event.type == "keyup") return;

            const modifiers = keys[event.key];
            if (modifiers != undefined) {
                const matches = modifiers.some(
                    modifiers =>
                        modifiers.altKey.includes(event.altKey) &&
                        modifiers.ctrlKey.includes(event.ctrlKey) &&
                        modifiers.shiftKey.includes(event.shiftKey) &&
                        modifiers.metaKey.includes(event.metaKey)
                );
                if (matches) {
                    setTimeout(callback); // Prevents reaching timeout (apart from when node is already busy while triggering the shortcut :/)
                    return true;
                }
            }
        };
        return this.addListener(listener);
    }

    /**
     * Adds a global shortcut using electron's shortcut system
     * @param shortcut The key pattern to listen for
     * @param callback The callback to trigger when the event is fired
     * @returns A function that can be invoked to remove the shortcut
     */
    protected addElectronShortcut(
        shortcut: KeyPattern,
        callback: () => void
    ): () => void {
        const accelerators = this.getElectronAccelerators(shortcut).filter(
            (n): n is string => typeof n == "string"
        );

        // Register each accelerator
        accelerators.forEach(accelerator => {
            if (!this.electronListeners[accelerator]) {
                const listeners: (() => void)[] = [];
                this.electronListeners[accelerator] = listeners;

                const invoker = () => listeners.forEach(listener => listener());
                remote.globalShortcut.register(accelerator, invoker);
            }
            this.electronListeners[accelerator].push(callback);
        });

        // Return a function to remove the listeners
        return () => {
            accelerators.forEach(accelerator => {
                const listeners = this.electronListeners[accelerator];
                if (!listeners) return;
                const index = listeners.indexOf(callback);
                if (index != -1) {
                    listeners.splice(index, 1);
                    if (listeners.length == 0) {
                        remote.globalShortcut.unregister(accelerator);
                        delete this.electronListeners[accelerator];
                    }
                }
            });
        };
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

    /**
     * Disposes all listeners
     */
    public destroy(): void {
        this.disposed = true;
        this.useElectronListenerObserver.destroy();

        if (this.advancedManager) {
            if (this.invokeListeners)
                this.advancedManager.removeListener(this.invokeListeners);
            this.keyListeners = [];
            this.advancedManager.kill();
        }

        for (let shortcut in this.electronListeners)
            remote.globalShortcut.unregister(shortcut);
        this.electronListeners = {};
    }
}
