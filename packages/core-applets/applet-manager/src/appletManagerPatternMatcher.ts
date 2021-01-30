import {createStandardSearchPatternMatcher} from "@launchmenu/core";

/**
 * A pattern matcher that checks whether a given query matches the applet pattern
 */
export const appletManagerPatternMatcher = createStandardSearchPatternMatcher({
    name: "Applet",
    matcher: /^applet:/i,
});
