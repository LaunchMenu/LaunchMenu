import {IRecordingConfig} from "./IRecordingConfig";

/** The config for a recording */
export type IExtendedRecordingConfig = IRecordingConfig & {
    /** A callback to perform once the recording stopped */
    onStop?: () => void;
    /** The default bitrate to use if postprocessing */
    defaultBitRate?: number;
    /** A function to check whether still running, throws an error if not */
    checkRunning?: () => void;
};
