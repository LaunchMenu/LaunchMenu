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
    /** Whether this is the full screen mode instead of in LM*/
    bigScreen?: boolean;
};

/** All props for the title screen */
export type ITitleScreenProps = Omit<ITitleScreenJSONProps, "title" | "description"> & {
    /** The title of the screen */
    title?: ReactNode;
    /** The description of the screen */
    description?: ReactNode;
};
