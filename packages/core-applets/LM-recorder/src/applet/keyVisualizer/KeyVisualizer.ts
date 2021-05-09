import {
    IField,
    IKey,
    IKeyId,
    IKeyName,
    keyIdMapping,
    LaunchMenu,
    wait,
} from "@launchmenu/core";
import {Field, IDataHook, IDataRetriever, Observer} from "model-react";
import {setupKeyPressListener} from "./retrieveKeys/setupKeyPressListener";
import {IBundleKeyPressConfig} from "./retrieveKeys/_types/IBundleKeyPressConfig";
import {IRemoteElement} from "../overlays/window/_types/IRemoteElement";
import {v4 as uuid} from "uuid";
import {combineBundleSources} from "./retrieveKeys/combineBundleSources";
import {createScreenOverlayKeyVisualizer} from "./visuals/createScreenOverlayKeyVisualizer";
import {createOverlayKeyVisualizer} from "./visuals/createOverlayKeyVisualizer";
import {IKeyBundle} from "./retrieveKeys/_types/IKeyBundle";
import {IKeyBundleType} from "./retrieveKeys/_types/IKeyBundleType";
import {IKeyVizProps} from "./visuals/components/_types/IKeyVizProps";
import {FC} from "react";

export class KeyVisualizer {
    protected hasQuit: IDataRetriever<boolean>;

    protected LM: LaunchMenu;
    protected overlays: IField<JSX.Element[]>;
    protected screenOverlays: IField<IRemoteElement[]>;

    protected disposePrev?: () => void;
    protected timeoutID: number;

    protected config?: IBundleKeyPressConfig;
    protected listenerEnabled = new Field(false);
    protected fullscreen = new Field(false);
    protected customKeyText = new Field<IKeyBundle>({
        ID: uuid(),
        keys: [],
        type: "shortcut",
    });

    protected screenVisualizerCompPath: undefined | string;
    protected VisualizerComp: undefined | FC<IKeyVizProps>;

    /**
     * Creates a new key visualization manager, that manages updating of key visualizations
     * @param config The configuration data
     */
    public constructor({
        LM,
        overlays,
        screenOverlays,
        hasQuit,
    }: {
        /** The LaunchMenu instance to visualize the keys presses of */
        LM: LaunchMenu;
        /** The overlays field to alter to add the visualization */
        overlays: IField<JSX.Element[]>;
        /** The screen overlays field to alter to add the visualization */
        screenOverlays: IField<IRemoteElement[]>;
        /** Whether the recording should be stopped */
        hasQuit: IDataRetriever<boolean>;
    }) {
        this.LM = LM;
        this.overlays = overlays;
        this.screenOverlays = screenOverlays;
        this.hasQuit = hasQuit;
    }

    /**
     * Checks whether this session is still running and throws an error if not
     */
    protected checkRunning(): void {
        if (this.hasQuit()) throw new Error("Recording was (forcefully) exited");
    }

    /**
     * Manually shows the given key events
     * @param keys The keys to be displayed
     * @param config Additional configuration
     * @returns A promise that resolves once the specified duration elapsed
     */
    public async showKeyText(
        keys: IKey[] | IKeyName[],
        {
            type = "shortcut",
            duration,
        }: {
            /** The event type */
            type?: IKeyBundleType;
            /** The predetermined duration to show the text */
            duration?: number;
        } = {}
    ): Promise<{
        /**
         * Updates the given text, without showing an update animation
         * @param keys The keys to be displayed
         * @param type The event type
         */
        update(keys: IKey[] | IKeyName[], type?: IKeyBundleType): void;
    }> {
        this.checkRunning();

        const ID = uuid();
        this.customKeyText.set({ID, keys: getKeyList(keys), type});
        if (duration) {
            await wait(duration);
            this.customKeyText.set({ID, keys: [], type});
        }

        return {
            update: (keys, type = "shortcut") =>
                this.customKeyText.set({ID, keys: getKeyList(keys), type}),
        };
    }

    // Configuration
    /**
     * Sets whether the key listener should be enabled
     * @param enabled Whether enabled
     */
    public setListenerEnabled(enabled: boolean): void {
        this.checkRunning();

        if (this.listenerEnabled.get() != enabled) {
            this.listenerEnabled.set(enabled);
            if (enabled) this.scheduleUpdate();
            // Make disposing instant
            else this.updateListeners();
        }
    }

    /**
     * Retrieves whether the key listener is enabled
     * @param hook The hook to subscribe to changes
     * @returns Whether enabled
     */
    public isListenerEnabled(hook?: IDataHook): boolean {
        this.checkRunning();

        return this.listenerEnabled.get(hook);
    }

    /**
     * Sets whether the key presses should be shown in an overlay on the entire screen
     * @param enabled Whether enabled (only works if controller's screen overlays are also enabled)
     */
    public setFullScreenMode(enabled: boolean): void {
        this.checkRunning();

        if (this.fullscreen.get() != enabled) {
            this.fullscreen.set(enabled);
            this.scheduleUpdate();
        }
    }

    /**
     * Retrieves whether full screen key overlay mode is enabled
     * @param hook The hook to subscribe to changes
     * @returns Whether enabled
     */
    public isFullScreenMode(hook?: IDataHook): boolean {
        this.checkRunning();

        return this.fullscreen.get(hook);
    }

    /**
     * Sets the config options for the key listener
     * @param config The configuration of the listener
     */
    public setListenerOptions(config: IBundleKeyPressConfig): void {
        this.checkRunning();

        this.config = config;
        this.scheduleUpdate();
    }

    /**
     * Sets the path to the screen key visualization component
     * @param path The path to be used
     */
    public setScreenVisualizationComponentPath(path: string | undefined): void {
        this.checkRunning();

        this.screenVisualizerCompPath = path;
        this.scheduleUpdate();
    }

    /**
     * Sets the key visualization component
     * @param comp The component to be used
     */
    public setVisualizationComponent(comp: FC<IKeyVizProps>): void {
        this.checkRunning();

        this.VisualizerComp = comp;
        this.scheduleUpdate();
    }

    // Manage the setup
    /**
     * Schedules a key update
     */
    protected scheduleUpdate() {
        this.checkRunning();

        clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(() => {
            this.updateListeners();
        });
    }

    /**
     * Updates the key visualizer
     */
    protected updateListeners() {
        this.checkRunning();
        clearTimeout(this.timeoutID);

        this.disposePrev?.();

        // Setup the key source
        let keySource: IDataRetriever<IKeyBundle>;
        let destroyListener: undefined | (() => void);
        if (this.listenerEnabled.get()) {
            const {bundle, destroy} = setupKeyPressListener(this.LM, this.config);
            destroyListener = destroy;
            keySource = combineBundleSources(bundle, h => this.customKeyText.get(h));
        } else {
            keySource = h => this.customKeyText.get(h);
        }

        // Setup the visualization
        if (this.fullscreen.get()) {
            const elementSource = createScreenOverlayKeyVisualizer(
                keySource,
                this.screenVisualizerCompPath
            );

            let prev: IRemoteElement;
            const observer = new Observer(elementSource).listen(remoteElement => {
                this.screenOverlays.set([
                    ...this.screenOverlays.get().filter(el => el != prev),
                    remoteElement,
                ]);
                prev = remoteElement;
            });

            // Store the disposer for when performing the next update
            this.disposePrev = () => {
                observer.destroy();
                destroyListener?.();
            };
        } else {
            const element = createOverlayKeyVisualizer(keySource, this.VisualizerComp);
            this.overlays.set([...this.overlays.get(), element]);

            // Store the disposer for when performing the next update
            this.disposePrev = () => {
                this.overlays.set(this.overlays.get().filter(el => el != element));
                destroyListener?.();
            };
        }
    }
}

function isKeyNameList(keys: IKey[] | IKeyName[]): keys is IKeyName[] {
    return typeof keys[0] == "string";
}

const keyPairs = Object.entries(keyIdMapping);
export function getKeyList(keys: IKey[] | IKeyName[]): IKey[] {
    if (isKeyNameList(keys))
        return keys.map(key => ({
            name: key,
            id: keyPairs.find(([id, name]) => name == key)?.[0] as IKeyId,
        }));
    return keys;
}
