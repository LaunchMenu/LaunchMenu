import {createStandardSearchPatternMatcher} from "../../actions/types/search/createStandardSearchPatternMatcher";

/**
 * A pattern matcher that checks whether a given query matches the settings pattern, and caches the result in the query
 */
export const settingPatternMatcher = createStandardSearchPatternMatcher({
    name: "Settings",
    matcher: /^(s|setting):\s*/,
});
