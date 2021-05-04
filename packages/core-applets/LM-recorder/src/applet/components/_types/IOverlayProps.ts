import {IBoxProps} from "@launchmenu/core";
import {ReactNode} from "react";

/** The props for the overlay component */
export type IOverlayProps = IBoxProps & {
    /** The opacity of the background */
    backgroundOpacity?: number;
    /** The number of pixels to blur */
    blur?: number;
    /** Shadow for the element */
    shadow?: string;
    /** Properties to pass to the inner container */
    innerProps?: IBoxProps;
    /** Properties to pass to the background container */
    backgroundProps?: IBoxProps;
    /** Extra children to add to the outside container */
    containerChildren?: ReactNode;
};
