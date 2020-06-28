import {FC} from "react";

/**
 * An icon component
 */
export type IIcon = FC<{
    /** The pixel size of the icon */
    size: number;
    /** The color of the icon */
    color: string;
}>;
