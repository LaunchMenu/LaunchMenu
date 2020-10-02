import {IKeyPatternEventType} from "./IKeyPatternEventType";
import {IKeyMatcher} from "../../../../../../stacks/keyHandlerStack/keyIdentifiers/keys";

/**
 * The data for a particular key pattern to match
 */
export type IKeyPatternData = {
    /** The pattern to match */
    pattern: string | IKeyMatcher[];
    /** The event type to trigger on */
    type: IKeyPatternEventType;
    /** Allows any of these keys to also be pressed */
    allowExtra?: IKeyMatcher[];
};

/**
 * The data for a particular key pattern to match
 */
export type IKeyArrayPatternData = {
    /** The pattern to match */
    pattern: IKeyMatcher[];
    /** The event type to trigger on */
    type: IKeyPatternEventType;
    /** Allows any of these keys to also be pressed */
    allowExtra?: IKeyMatcher[];
};
