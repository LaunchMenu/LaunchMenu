import React, {cloneElement, FC, Fragment} from "react";
import {IField, IJSON, wait} from "@launchmenu/core";
import {Field, IDataHook, IDataRetriever, Loader} from "model-react";
import {IRect} from "./window/_types/IRect";
import {remote} from "electron";
import {v4 as uuid} from "uuid";
import Path from "path";
import {IRemoteElement} from "./window/_types/IRemoteElement";
import {FadeTransition} from "../components/FadeTransition";
import {IShowConfig} from "./_types/IShowConfig";
import {IShowScreenConfig} from "./_types/IShowScreenConfig";

/** The class to manage extra overlays and components in the video */
export class Visualizer<T extends Record<string, IJSON> = Record<string, IJSON>> {
    protected hasQuit: IDataRetriever<boolean>;

    protected enableScreenOverlays: (
        enabled?: boolean,
        showDebug?: boolean
    ) => Promise<void>;
    protected screenOverlaysEnabled: IDataRetriever<boolean>;

    protected overlays: IField<JSX.Element[]>;
    protected screenOverlays: IField<IRemoteElement[]>;

    protected cursorVisible = new Field(true); // Manual assignment of the cursor being visible or not
    protected hideCursorCount = new Field(0); // The number of views that requested the cursor to be hidden

    protected screenOverlayRectangle = new Field({x: 0, y: 0, width: 1920, height: 1080});
    protected screenOverlayState = new Field<T>({} as T);
    protected screenOverlayThemePath = new Field<string | undefined>(undefined);

    /**
     * Creates a new visualizer instance
     * @param config The configuration data
     */
    public constructor({
        overlays,
        screenOverlays,
        hasQuit,
        enableScreenOverlays,
        screenOverlaysEnabled,
    }: {
        /** The field to track the overlays in */
        overlays: IField<JSX.Element[]>;
        /** The field to track the screen overlays in */
        screenOverlays: IField<IRemoteElement[]>;
        /** Whether the recording should be stopped */
        hasQuit: IDataRetriever<boolean>;
        /** The callback to enable or disable screen overlays */
        enableScreenOverlays: (enabled?: boolean, showDebug?: boolean) => Promise<void>;
        /** The retriever to check whether screen overlays are enabled */
        screenOverlaysEnabled: IDataRetriever<boolean>;
    }) {
        this.overlays = overlays;
        this.screenOverlays = screenOverlays;
        this.hasQuit = hasQuit;
        this.enableScreenOverlays = enableScreenOverlays;
        this.screenOverlaysEnabled = screenOverlaysEnabled;
    }

    /**
     * Checks whether this session is still running and throws an error if not
     */
    public checkRunning(): void {
        if (this.hasQuit()) throw new Error("Recording was (forcefully) exited");
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
        const update = (props: Partial<T>) => {
            const currentOverlays = this.screenOverlays.get();
            this.screenOverlays.set([
                ...currentOverlays.filter(({key}) => key != id),
                {
                    componentPath: absPath,
                    key: id,
                    props: {...currentOverlays.find(({key}) => key != id), ...props},
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
                            containerProps={{zIndex: 1}}
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

    /**
     * Shows the given component with the initial props, and allows for simple prop updates afterwards
     * @param Comp The component to be shown and controlled
     * @param config Additional configuration
     * @returns Functions to control to element
     */
    public async showControllable<T extends Record<string, any>>(
        Comp: FC<T>,
        {props: initialProps, ...config}: IShowConfig & {props: T}
    ): Promise<{
        /** Disposes the element */
        destroy: () => void;
        /** Updates the element's props */
        update: (props: Partial<T>) => void;
    }> {
        // Create the element with controllable props
        const props = new Field<T>(initialProps);
        const el = <Loader>{h => <Comp {...props.get(h)} />}</Loader>;

        // Show the element
        const {destroy} = await this.show(el, config);

        // Return the controller
        return {
            update: newProps => props.set({...props.get(), ...newProps}),
            destroy,
        };
    }

    // Overlay config
    /**
     * Sets whether screen overlays are used
     * @param enabled Whether enabled or disabled
     */
    public setScreenOverlaysEnabled(enabled: boolean): Promise<void>;

    /**
     * Sets whether screen overlays are used
     * @param enabled Whether enabled or disabled
     * @param debugConsole Whether the debug console should be enabled
     */
    public setScreenOverlaysEnabled(enabled: true, debugConsole?: boolean): Promise<void>;
    public setScreenOverlaysEnabled(
        enabled: boolean,
        debugConsole?: boolean
    ): Promise<void> {
        this.checkRunning();
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
     * Sets the rectangle of the overlay screen to use
     * @param rect The rectangle to set, or a point within the monitor whose rectangle to use
     */
    public setScreenOverlayRect(rect: IRect | {x: number; y: number}): void {
        this.checkRunning();
        if (!("width" in rect)) {
            const displays = remote.screen.getAllDisplays();
            const display = displays.find(display => {
                const {x, y, width, height} = display.bounds;
                return (
                    x <= rect.x &&
                    rect.x <= x + width &&
                    y <= rect.y &&
                    rect.y <= y + height
                );
            });
            if (!display)
                throw Error(
                    `No display containing the point (${rect.x}, ${rect.y}) could be found`
                );

            this.screenOverlayRectangle.set(display.bounds);
        } else {
            this.screenOverlayRectangle.set(rect);
        }
    }

    /**
     * Retrieves the current rectangle boundary of the overlay screen to use
     * @param hook The hook to subscribe to changes
     * @returns The window rectangle
     */
    public getScreenOverlayRect(hook?: IDataHook): IRect {
        this.checkRunning();
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
        this.checkRunning();
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
        this.checkRunning();
        return this.cursorVisible.get(hook) && this.hideCursorCount.get(hook) == 0;
    }
}
