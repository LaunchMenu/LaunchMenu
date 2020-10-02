import {IAdvancedKeyInputExecuteData} from "./IAdvancedKeyInputExecuteData";
import {KeyPattern} from "../KeyPattern";

export type IAdvancedKeyPatternMenuData = Omit<
    IAdvancedKeyInputExecuteData,
    "undoable"
> & {
    /** The callback to make once the user submits their changes */
    onFinish?: (value: KeyPattern) => void;
};
