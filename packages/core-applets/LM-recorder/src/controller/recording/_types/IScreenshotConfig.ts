import {IRect} from "../../../overlays/window/_types/IRect";

/** Some screenshot configs */
export type IScreenshotConfig = {
    /** A section to crop to in the final picture */
    crop?: IRect;
};
