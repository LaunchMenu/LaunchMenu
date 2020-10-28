import {KeyPattern} from "../../../../../../keyHandler/KeyPattern";

export type IAdvancedKeyPatternUIData = {
    /** Whether the field should update while editing */
    liveUpdate?: boolean;
    /** Whether the change action is undoable */
    undoable?: boolean;
    /** The callback to make once the user submits their changes */
    onSubmit?: (value: KeyPattern) => void;
};
