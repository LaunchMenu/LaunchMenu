export type IWindowFrameProps = {
    /** The name of the window, "LaunchMenu" for the main window */
    windowName?: string;
    /** The ID of the window this is the frame for */
    ID?: number;
    /** Whether this is the frame of the main window */
    isMainWindow?: boolean;
};
