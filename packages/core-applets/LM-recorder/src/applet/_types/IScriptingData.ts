import {IJSON, LaunchMenu} from "@launchmenu/core";
import {Controller} from "../controller/Controller";
import {KeyVisualizer} from "../keyVisualizer/KeyVisualizer";
import {Visualizer} from "../overlays/Visualizer";
import {Recorder} from "../recorder/Recorder";

/** The data that scripts can use to make their video */
export type IScriptingData<T extends Record<string, IJSON> = Record<string, IJSON>> = {
    /** The recorder to start video capturing */
    recorder: Recorder;
    /** The visualizer to show key presses */
    keyVisualizer: KeyVisualizer;
    /** The visualizer to show data in the screen */
    visualizer: Visualizer<T>;
    /** The controller to automata LaunchMenu */
    controller: Controller;
    /** THe LaunchMenu instance that's being recorded */
    LM: LaunchMenu;
};
