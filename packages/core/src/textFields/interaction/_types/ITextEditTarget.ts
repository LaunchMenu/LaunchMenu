import {ITextField} from "../../_types/ITextField";
import {ITextEditCommand} from "../commands/_types/ITextEditCommand";

/** The target for text edits. Received commands shouldn't be executed yet, this target is responsible for execution. */
export type ITextEditTarget = {
    /** The textfield to be altered */
    textField: ITextField;
    /** The callback for the created commands to alter the field */
    onChange: {
        /**
         * Handles execution of the given command
         * @param command The unexecuted command
         */
        (command: ITextEditCommand): void;
    };
};
