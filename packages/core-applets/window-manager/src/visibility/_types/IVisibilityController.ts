import {BrowserWindow} from "electron";

export type IVisibilityController = {
    /**
     * Initializes anything required for the visibility functions to work
     * @param window The window to be shown
     */
    init(window: BrowserWindow): void;

    /**
     * Shows the given window
     * @param window The window to be shown
     */
    show(window: BrowserWindow): void;

    /**
     * Hides the given window
     * @param window The window to be shown
     */
    hide(window: BrowserWindow): void;
};
