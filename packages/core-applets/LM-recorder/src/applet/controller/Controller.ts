import {
    getSeededRandom,
    IJSON,
    IKey,
    KeyEvent,
    LaunchMenu,
    wait,
    standardWindowSize,
    LMSession,
    IMenuItem,
    waitForRetrieve,
    IMenu,
    getTextAction,
    getHooked,
} from "@launchmenu/core";
import {DataCacher, IDataHook, IDataRetriever, waitFor} from "model-react";
import {remote} from "electron";
import {getKeyList} from "../keyVisualizer/KeyVisualizer";
import {IKeyInput} from "./_types/IKeyInput";
import {getKeyFromCharacter} from "./getKeyFromCharacter";

/**
 * A class that a script can use to control the LaunchMenu instance and recording
 */
export class Controller {
    public random = getSeededRandom(0);

    protected hasQuit: IDataRetriever<boolean>;
    protected LM: LaunchMenu;

    /**
     * Creates a new recording controller
     * @param config The configuration data
     */
    constructor({
        LM,
        hasQuit,
    }: {
        /** The LM instance to automate */
        LM: LaunchMenu;
        /** Whether the recording should be stopped */
        hasQuit: IDataRetriever<boolean>;
    }) {
        this.LM = LM;
        this.hasQuit = hasQuit;
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
            delay = 150,
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

    /**
     * Waits for the given duration
     * @param duration The duration to wait for
     * @returns A promise that resolves after the given delay
     */
    public async wait(duration?: number): Promise<void> {
        return wait(duration);
    }
}
