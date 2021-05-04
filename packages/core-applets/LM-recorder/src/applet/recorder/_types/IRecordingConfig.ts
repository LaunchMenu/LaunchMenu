import {IRect} from "../../overlays/window/_types/IRect";

/** Some recording configs */
export type IRecordingConfig = {
    /** A section to crop to in the final render */
    crop?: IRect;
    /** The bitrate to output the final render at */
    bitRate?: number;
    /** Represents the amount of data loss 0-51 integers (0 =lossless), see ffmpeg -crf */
    crf?: number;
};
