import {ISimpleSearchPatternMatcher} from "@launchmenu/launchmenu";

/**
 * The prefix pattern that indicates a given search is a applet search
 */
export const appletManagerPattern = "applet: ";

/**
 * Checks whether the given query matches the pattern for applets
 * @param query The query to be matched
 * @returns The pattern match if found
 */
export const appletManagerPatternMatcher: ISimpleSearchPatternMatcher = query => {
    if (query.search.substr(0, appletManagerPattern.length) == appletManagerPattern) {
        return {
            name: "Applet",
            id: "applet-manager",
            highlight: [{start: 0, end: appletManagerPattern.length}],
        };
    }
};
