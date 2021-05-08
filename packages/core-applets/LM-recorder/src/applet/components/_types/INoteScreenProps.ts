import {IBoxProps} from "@launchmenu/core";

/** Props for the note screen */
export type INoteScreenProps = {
    /** The opacity of the background */
    backgroundOpacity?: number;
    /** Additional properties to set on the background */
    backgroundProps?: IBoxProps;
    /** The amount to blur the background */
    blur?: number;
} & IBoxProps;
