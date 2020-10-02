/**
 * Options that affect the development process
 */
export type IAppletDevOptions = {
    /** Whether to listen for changes in code and auto reload the applet when detected */
    liveReload?: boolean;
    /** The directory to watch for changes (defaults to 'build') */
    watchDirectory?: string;
};
