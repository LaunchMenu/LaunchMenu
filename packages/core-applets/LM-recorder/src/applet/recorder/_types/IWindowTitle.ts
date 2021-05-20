/** The type used for the window title to specify for a recording */
export type IWindowTitle =
    | string
    | ((available: Electron.DesktopCapturerSource[]) => Promise<string> | string);
