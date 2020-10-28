import {IQuery} from "../../menus/menu/_types/IQuery";
import {IPatternMatch} from "../../utils/searchExecuter/_types/IPatternMatch";

/**
 * The settings search pattern
 */
export const settingsSearchPattern = {name: "Settings", highlight: [{start: 0, end: 2}]};

/**
 * Checks whether the given query contains the settings search pattern
 * @param query The query to check for a pattern in
 * @returns The found search pattern if found
 */
export function settingPatternMatcher({search}: IQuery): IPatternMatch | undefined {
    return search.substr(0, 2) == "s:" ? settingsSearchPattern : undefined;
}
