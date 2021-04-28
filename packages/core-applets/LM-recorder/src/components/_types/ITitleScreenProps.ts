import {ReactNode} from "react";

/** The serializable props for the title screen */
export type ITitleScreenJSONProps = {
    /** The title of the screen */
    title?: string;
    /** The description of the screen */
    description?: string;
    /** The list of items to show in the screen */
    list?: string[];
    /** The background color */
    background?: string;
    /** Whether this is the full monitor mode */
    monitor?: boolean;
};

/** All props for the title screen */
export type ITitleScreenProps = ITitleScreenJSONProps & {
    /** The title of the screen */
    title?: ReactNode;
    /** The description of the screen */
    description?: ReactNode;
};
