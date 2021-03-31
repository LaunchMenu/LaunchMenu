import {KeyPattern} from "../../../../../keyHandler/KeyPattern";
import {IFieldMenuItem} from "../../_types/IFieldMenuItem";

/** The field menu item that may be triggered, and to which listeners can be attached */
export type ITriggerablePatternMenuItem = IFieldMenuItem<KeyPattern> & {
    /** Registers a trigger callback */
    onTrigger: {
        /**
         * Registers a callback to trigger when this key pattern is invoked
         * @param callback The callback to be invoked
         * @returns A function that can be invoked to remove the listener
         */
        (callback: () => void): () => void;
    };
};
