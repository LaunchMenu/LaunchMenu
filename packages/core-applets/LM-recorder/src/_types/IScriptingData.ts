import {keyVisualizationManager} from "../controller/KeyVisualizationManager";
import {Recorder} from "../controller/recording/Recorder";

/** The data that scripts can use to make their video */
export type IScriptingData = {
    /** The recorder to start video capturing */
    recorder: Recorder;
    /** The visualizer to show key presses */
    keyVisualizer: keyVisualizationManager;
    /** The visualizer to show data in the screen */
    visualizer: void;
    /** The controller to automata LaunchMenu */
    controller: void;
};
