import React, {Fragment} from "react";
import {
    getSeededRandom,
    IField,
    IJSON,
    IKey,
    IKeyName,
    KeyEvent,
    LaunchMenu,
    wait,
    standardWindowSize,
    LMSession,
    IMenuItem,
    getContextMenuStack,
    getUIStack,
    waitForRetrieve,
    IMenu,
    getTextAction,
    getHooked,
} from "@launchmenu/core";
import {DataCacher, Field, IDataHook, IDataRetriever, Loader, waitFor} from "model-react";
import {remote} from "electron";
import {IRemoteElement} from "../overlays/window/_types/IRemoteElement";
import {IRect} from "../overlays/window/_types/IRect";
import {v4 as uuid} from "uuid";
import Path from "path";
import {getKeyList, keyVisualizationManager} from "./KeyVisualizationManager";
import {Recorder} from "./recording/Recorder";
import {IKeyInput} from "./_types/IKeyInput";
import {getKeyFromCharacter} from "./getKeyFromCharacter";
import {IShowScreenConfig} from "./recording/_types/IShowScreenConfig";
import {IShowConfig} from "./recording/_types/IShowConfig";
import {FadeTransition} from "../components/FadeTransition";

/**
 * A class that a script can use to control the LaunchMenu instance and recording
 */
export class Controller<T extends Record<string, IJSON> = Record<string, IJSON>> {
    public readonly keyVisualizer: keyVisualizationManager;
    public readonly recorder: Recorder = new Recorder(this);

    public random = getSeededRandom(0);

    public readonly LM: LaunchMenu;
    protected enableScreenOverlays: (
        enabled?: boolean,
        showDebug?: boolean
    ) => Promise<void>;
    protected screenOverlaysEnabled: IDataRetriever<boolean>;
    protected overlays: IField<JSX.Element[]>;
    protected screenOverlays: IField<IRemoteElement[]>;
    protected hasQuit: IDataRetriever<boolean>;

    protected cursorVisible = new Field(true);
    protected hideCursorCount = new Field(0);
    protected screenOverlayRectangle = new Field({x: 0, y: 0, width: 1920, height: 1080});
    protected screenOverlayState = new Field<T>({} as T);
    protected screenOverlayThemePath = new Field<string | undefined>(undefined);
    protected screenKeyVisualizationEnabled = new Field(false);

    /**
     * Creates a new recording controller
     * @param data The data to use
     */
    constructor({
        overlays,
        screenOverlays,
        LM,
        enableScreenOverlays,
        screenOverlaysEnabled,
        quit,
    }: {
        overlays: IField<JSX.Element[]>;
        screenOverlays: IField<IRemoteElement[]>;
        LM: LaunchMenu;
        enableScreenOverlays: (enabled?: boolean, showDebug?: boolean) => Promise<void>;
        screenOverlaysEnabled: IDataRetriever<boolean>;
        quit: IDataRetriever<boolean>;
    }) {
        this.LM = LM;
        this.enableScreenOverlays = enableScreenOverlays;
        this.screenOverlaysEnabled = screenOverlaysEnabled;
        this.overlays = overlays;
        this.screenOverlays = screenOverlays;
        this.hasQuit = quit;

        this.keyVisualizer = new keyVisualizationManager({LM, overlays, screenOverlays});
        this.keyVisualizer.setListenerEnabled(true);
    }

    /**
     * Checks whether this session is still running and throws an error if not
     */
    public checkRunning(): void {
        if (this.hasQuit()) throw new Error("Recording was (forcefully) exited");
    }

    /**
     * Sets the seeded random function to use
     * @param seed The seed to be used
     */
    public setRandomSeed(seed: number): void {
        this.random = getSeededRandom(seed);
    }

    // Automation
    /**
     * Resets the UI state of LaunchMenu
     */
    public async resetLM(): Promise<void> {
        const sessionManager = this.LM.getSessionManager();
        sessionManager
            .getSessions()
            .forEach(session => sessionManager.removeSession(session));
        sessionManager.addSession();
        remote
            .getCurrentWindow()
            .setSize(standardWindowSize.width, standardWindowSize.height);

        await wait(500);
    }

    /**
     * Types the given text in LM sequentially
     * @param sequence The text to be typed
     * @param config Additional optional configuration
     */
    public async type(
        sequence:
            | string
            | (
                  | string
                  | {
                        /** A key combination to execute */
                        key?: IKeyInput;
                        /** Text to be typed */
                        text?: string;
                        /** Additional delay before this event */
                        delay?: number;
                        /** The number of times to repeat this */
                        repeat?: number;
                        /** The delay in between repeats */
                        repeatDelay?: number;
                    }
              )[],
        {
            delay = 100,
            variation = 100,
        }: {
            /** The base delay between key presses */
            delay?: number;
            /** The additional type delay variation */
            variation?: number;
        } = {}
    ): Promise<void> {
        // Normalize the inputs
        if (typeof sequence == "string") sequence = [sequence];
        const keySequence = sequence.flatMap(seq => {
            // Normalize text input
            if (typeof seq == "string") seq = {text: seq};

            // turn text input to a key sequence
            let keys: IKeyInput[] = [];
            if ("text" in seq && seq.text) {
                const shiftKey: IKey = {name: "shift", id: "shiftLeft"};
                let shift = false;
                for (let char of seq.text) {
                    // Retrieve the key from the character
                    const key = getKeyFromCharacter(char);
                    if (!key)
                        throw new Error(`Unsupported character specified: "${char}"`);

                    // Update shift
                    if (key.usesShift != shift) {
                        keys.push(
                            new KeyEvent({
                                key: shiftKey,
                                type: key.usesShift ? "down" : "up",
                            })
                        );
                        shift = key.usesShift;
                    }

                    // Add the key
                    keys.push(key.usesShift ? [shiftKey, key.key] : [key.key]);
                }
            } else if (seq.key) {
                keys.push(seq.key);
            }

            return {
                keys,
                delay: seq.delay,
                repeat: seq.repeat || 1,
                repeatDelay: seq.repeatDelay,
            };
        });

        // Perform the key presses
        for (let {keys, delay: preDelay, repeat, repeatDelay} of keySequence) {
            if (preDelay) await wait(preDelay);

            while (repeat-- > 0) {
                for (let key of keys) {
                    const extraDelay = delay + this.random() * variation;
                    const pressTime = (extraDelay * 2) / 3;
                    const intermediateTime = extraDelay / 3;
                    await this.press(key, {duration: pressTime});
                    await wait(intermediateTime);
                }

                if (repeat > 0 && repeatDelay) await wait(repeatDelay);
            }
        }
    }

    /**
     * Presses the given keyboard shortcut for a given amount of time in LM
     * @param keys The key combination to be pressed
     * @param config Additional optional configuration
     */
    public async press(
        keys: IKeyInput,
        {
            duration = 200,
        }: {
            /** The duration to hold the key for (not applicable if KeyEvent instance was supplied) */
            duration?: number;
        } = {}
    ): Promise<void> {
        this.checkRunning();

        // Normalize the keys input to a key event
        let releaseKeys: KeyEvent | undefined;
        if (typeof keys == "string") keys = [keys];
        if (keys instanceof Array) {
            const keyList = getKeyList(keys);
            const last = keyList.pop();
            if (!last) throw Error("Keys may not be empty");
            keys = new KeyEvent({key: last, type: "down"}, keyList);
            releaseKeys = new KeyEvent({key: last, type: "up"}, keyList);
        }

        // Send the event
        const handler = this.LM.getKeyHandler();
        handler.emit(keys);

        if (releaseKeys) {
            await wait(duration);
            handler.emit(releaseKeys);
        }
    }

    /**
     * Retrieves the currently visible session
     * @param hook The hook to subscribe to changes
     * @returns The currently visible session
     */
    public getSession(hook?: IDataHook): LMSession | null {
        this.checkRunning();
        return this.LM.getSessionManager().getSelectedSession(hook);
    }

    /**
     * Selects a given item in the menu by navigating to it with the keyboard
     * @param itemMatch The name pattern of the item to select, or a callback to check if this is the item to look for
     * @param config The config for how to navigate to items
     * @returns A promise that resolves once the item was selected
     */
    public async selectItem(
        itemMatch: RegExp | ((item: IMenuItem, hook: IDataHook) => boolean),
        {
            delay = 200,
            variation = 100,
            downKey = "down",
            upKey = "up",
        }: {
            /** The base delay between key presses */
            delay?: number;
            /** The additional type delay variation */
            variation?: number;
            /** The name of the key to move the cursor down */
            downKey?: IKeyInput;
            /** The name of the key to move the cursor up */
            upKey?: IKeyInput;
        } = {}
    ): Promise<void> {
        this.checkRunning();

        // Normalize the item into a function
        if (!(itemMatch instanceof Function)) {
            const regex = itemMatch;
            itemMatch = (item, hook) => {
                const texts = getTextAction.get([item], hook);
                const combinedText = texts
                    .map(
                        ({name, description}) =>
                            `${getHooked(name, hook) ?? ""}\n${
                                getHooked(description, hook) ?? ""
                            }`
                    )
                    .join("\n");
                return !!combinedText.match(regex);
            };
        }
        const checkItem = itemMatch;

        // Get the menu
        const menuSource = new DataCacher(h => {
            const session = this.getSession(h);
            if (!session) return undefined;
            const menus = session?.context
                .getUI(h)
                .flatMap(layer => layer.getMenuData(h))
                .map(menuData => menuData.menu)
                .filter((menu): menu is IMenu => !!menu);
            const menu = menus[menus.length - 1];
            return menu;
        });

        // Wait for an item that matches
        const result = await waitForRetrieve(h => {
            if (this.hasQuit(h)) return false;

            const menu = menuSource.get(h);
            if (!menu) return;

            const item = menu.getItems(h).find(item => checkItem(item, h));
            if (item) return {item, menu};
        });
        if (!result) throw new Error("Item could not be found");
        const {item, menu} = result;

        // Navigate to the item
        while (menu.getCursor() != item) {
            this.checkRunning();

            const items = menu.getItems();
            if (!items.includes(item)) throw Error("Item was removed from menu");

            const cursor = menu.getCursor();
            const cursorIndex = cursor ? items.indexOf(cursor) : -1;
            const itemIndex = items.indexOf(item);

            // Press the key to navigate there
            const key = cursorIndex < itemIndex ? downKey : upKey;
            const time = this.random() * variation + delay;
            await this.press(key, {duration: time / 2});
            await wait(time / 2);
        }
    }

    /**
     * Retrieves a promise that resolves once LM is visible
     * @returns A promise that resolves once LM is opened
     */
    public async waitForOpen(): Promise<void> {
        await waitFor(h => this.LM.isWindowOpen(h) || this.hasQuit(h));
        this.checkRunning();
    }

    // Overlay management
    /**
     * Sets the screen overlay state data
     * @param state The state data
     */
    public setScreenOverlayState(state: T): void {
        this.checkRunning();
        this.screenOverlayState.set(state);
    }

    /**
     * Retrieves the state data to send to the screen overlay
     * @param hook The hook to subscribe to changes
     * @returns The current state
     */
    public getScreenOverlayState(hook?: IDataHook): Partial<T> {
        return this.screenOverlayState.get(hook);
    }

    /**
     * Shows a given remote element in the overlay screen (only if screen overlay is enabled)
     * @param path The absolute path to the component to be displayed
     * @param config Additional configuration
     * @returns Functions to control to element
     */
    public async showScreen<T extends Record<string, IJSON>>(
        path: string,
        {
            duration,
            fadeIn = true,
            fadeOut = true,
            props,
            hideCursor,
        }: IShowScreenConfig<T> = {}
    ): Promise<{
        /** Disposes the element */
        destroy: () => void;
        /** Updates the element's props */
        update: (props: T) => void;
    }> {
        this.checkRunning();
        const id = uuid();
        const absPath = Path.resolve(path);
        if (hideCursor) this.hideCursorCount.set(this.hideCursorCount.get() + 1);

        // Setup updating and destroying
        const update = (props: T) => {
            const currentOverlays = this.screenOverlays.get();
            this.screenOverlays.set([
                ...currentOverlays.filter(({key}) => key != id),
                {
                    componentPath: absPath,
                    key: id,
                    props,
                    fadeIn: typeof fadeIn == "number" ? fadeIn : fadeIn ? 200 : 0,
                    fadeOut: typeof fadeOut == "number" ? fadeOut : fadeOut ? 200 : 0,
                },
            ]);
        };
        const destroy = () => {
            const currentOverlays = this.screenOverlays.get();
            const newOverlays = currentOverlays.filter(({key}) => key != id);
            this.screenOverlays.set(newOverlays);
            if (newOverlays.length != currentOverlays.length && hideCursor)
                this.hideCursorCount.set(this.hideCursorCount.get() - 1);
        };

        // Initialize and possibly destroy
        update(props || ({} as T));
        if (duration) {
            await wait(duration);
            destroy();
        }

        // Return the functions to update the screen with
        return {
            destroy,
            update,
        };
    }

    /**
     * Shows a given remote element in the overlay screen (only if screen overlay is enabled)
     * @param path The absolute path to the component to be displayed
     * @param config Additional configuration
     * @returns Functions to control to element
     */
    public async show(
        element: JSX.Element,
        {fadeIn = true, fadeOut = true, duration}: IShowConfig = {}
    ): Promise<{
        /** Disposes the element */
        destroy: () => void;
    }> {
        this.checkRunning();
        const id = uuid();
        const fade = fadeIn || fadeOut;
        const fadeInDuration = typeof fadeIn == "number" ? fadeIn : fadeIn ? 200 : 0;
        const fadeOutDuration = typeof fadeOut == "number" ? fadeOut : fadeOut ? 200 : 0;
        const elementSource = new Field<JSX.Element | undefined>(element);
        const keyedElement = fade ? (
            <Loader key={id}>
                {h => {
                    const el = elementSource.get(h);
                    return (
                        <FadeTransition
                            deps={[el]}
                            inDuration={fadeInDuration}
                            outDuration={fadeOutDuration}>
                            {el}
                        </FadeTransition>
                    );
                }}
            </Loader>
        ) : (
            <element.type {...element.props} key={id} />
        );

        // Setup destroying
        const remove = () => {
            const currentOverlays = this.overlays.get();
            this.overlays.set(currentOverlays.filter(({key}) => key != id));
        };
        const destroy = () => {
            elementSource.set(<Fragment />);
            if (fadeOutDuration) setTimeout(remove, fadeOutDuration);
            else remove();
        };

        // Initialize and possibly destroy
        this.overlays.set([...this.overlays.get(), keyedElement]);
        if (duration) {
            await wait(duration);
            destroy();
        }

        // Return the functions to update the element with
        return {
            destroy,
        };
    }

    // Screen overlay data
    /**
     * Sets whether screen overlays are used
     * @param screenKeyViz Whether to also show the keypress visualization in fullscreen (defaults to value of enabled)
     * @param enabled Whether enabled or disabled
     */
    public setScreenOverlaysEnabled(
        enabled: boolean,
        screenKeyViz?: boolean
    ): Promise<void>;

    /**
     * Sets whether screen overlays are used
     * @param enabled Whether enabled or disabled
     * @param screenKeyViz Whether to also show the keypress visualization in fullscreen (defaults to true)
     * @param debugConsole Whether the debug console should be enabled
     */
    public setScreenOverlaysEnabled(
        enabled: true,
        screenKeyViz?: boolean,
        debugConsole?: boolean
    ): Promise<void>;
    public setScreenOverlaysEnabled(
        enabled: boolean,
        screenKeyViz: boolean = enabled,
        debugConsole?: boolean
    ): Promise<void> {
        this.checkRunning();
        this.keyVisualizer.setFullScreenMode(screenKeyViz);
        return this.enableScreenOverlays(enabled, debugConsole);
    }

    /**
     * Retrieves whether screen overlays are used
     * @param hook A hook to subscribe to changes
     * @returns Whether to use overlays
     */
    public areScreenOverlaysEnabled(hook?: IDataHook): boolean {
        return this.screenOverlaysEnabled(hook);
    }

    /**
     * Sets whether to use screen overlays for key press visualization
     * @param enabled Whether enabled or disabled
     */
    public setUseScreenKeyVisualization(enabled: boolean): void {
        this.checkRunning();
        this.screenKeyVisualizationEnabled.set(enabled);
    }

    /**
     * Retrieves whether screen overlays are used for key press visualization
     * @param hook A hook to subscribe to changes
     * @returns Whether to use overlays
     */
    public useScreenKeyVisualization(hook?: IDataHook): boolean {
        return this.screenKeyVisualizationEnabled.get(hook);
    }

    /**
     * Sets the rectangle of the overlay screen to use
     * @param rect The rectangle
     */
    public setScreenOverlayRect(rect: IRect): void {
        this.checkRunning();
        this.screenOverlayRectangle.set(rect);
    }

    /**
     * Retrieves the current rectangle boundary of the overlay screen to use
     * @param hook The hook to subscribe to changes
     * @returns The window rectangle
     */
    public getScreenOverlayRect(hook?: IDataHook): IRect {
        return this.screenOverlayRectangle.get(hook);
    }

    /**
     * Sets the path to the theme to use in the overlay screen
     * @param path The absolute path
     */
    public setScreenOverlayThemePath(path: string): void {
        this.checkRunning();
        this.screenOverlayThemePath.set(path);
    }

    /**
     * Retrieves the current path to the theme that's used in the overlay screen
     * @param hook The hook to subscribe to changes
     * @returns The path to the overlay theme
     */
    public getScreenOverlayThemePath(hook?: IDataHook): string | undefined {
        return this.screenOverlayThemePath.get(hook);
    }

    /**
     * Sets whether the cursor is visible, can only be false if screen overlay is enabled
     * @param visible Whether the cursor should be visible
     */
    public setCursorVisible(visible: boolean): void {
        this.checkRunning();
        if (!this.areScreenOverlaysEnabled())
            throw new Error("Cursor can only be disable if overlay is enabled");
        this.cursorVisible.set(visible);
    }

    /**
     * Whether the mouse cursor should be visible
     * @param hook The hook to subscribe to changes
     * @returns Whether the cursor should be visible
     */
    public isCursorVisible(hook?: IDataHook): boolean {
        return this.cursorVisible.get(hook) && this.hideCursorCount.get(hook) == 0;
    }
}
