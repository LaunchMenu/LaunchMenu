/** Information about an applet as obtained from an applet repository (E.g. npm) */
export type IAppletRepoInfo = {
    /** The name of the applet */
    name: string;
    /** A short description of the applet */
    description: string;
    /** The current version of the applet */
    version: string;
    /** The LaunchMenu version which this applet is compatible with */
    LMCompatibleVersion: string;
    /** The content in the readme of the applet */
    readme?: string;
    /** The website at which you can find more information about the applet */
    website?: string;
    /** An icon to represent the applet */
    icon?: string;
    /** Additional tags that can be used for searching */
    tags?: string[];
};
