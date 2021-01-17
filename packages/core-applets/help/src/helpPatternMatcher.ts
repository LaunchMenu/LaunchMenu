import {createStandardSearchPatternMatcher} from "@launchmenu/core";

/**
 * A pattern matcher that checks whether a given query is a help query
 */
export const helpPatternMatcher = createStandardSearchPatternMatcher({
    name: "Help",
    matcher: /^:help\b\s*/,
});
