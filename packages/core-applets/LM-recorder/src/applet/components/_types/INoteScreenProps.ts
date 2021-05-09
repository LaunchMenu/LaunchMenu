import {IBoxProps} from "@launchmenu/core";

/** Props for the note screen */
export type INoteScreenProps = INoteScreenJSONProps & {
    /** Additional properties to set on the background */
    backgroundProps?: IBoxProps;
} & IBoxProps;

/** Props for the note screen that are purely JSON */
export type INoteScreenJSONProps = {
    /** The opacity of the background */
    backgroundOpacity?: number;
    /** The amount to blur the background */
    blur?: number;
};
