import {createStandardSearchPatternMatcher} from "../../actions/types/search/createStandardSearchPatternMatcher";

/**
 * A pattern matcher that checks whether a given query matches this pattern, and caches the result in the query
 */
export const settingPatternMatcher = createStandardSearchPatternMatcher({
    name: "Settings",
    matcher: /^s:/,
});
