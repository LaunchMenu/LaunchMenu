import {IKeyArrayPatternData} from "../_types/IKeyPatternData";
import {KeyPattern} from "../../../../../../keyHandler/KeyPattern";
import {ExtendedObject} from "../../../../../../utils/ExtendedObject";

/**
 * Retrieves the option's index within a pattern
 * @param pattern The pattern to find the option index in
 * @param option The option for which to retrieve its index
 * @returns The index if found, or -1 otherwise
 */
export function getKeyPatternOptionIndex(
    pattern: KeyPattern,
    option: IKeyArrayPatternData
): number {
    return pattern.patterns.findIndex(pattern =>
        ExtendedObject.deepEquals(pattern, option)
    );
}
