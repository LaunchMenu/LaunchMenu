import {createStandardSearchPatternMatcher} from "@launchmenu/core";

/** A pattern matcher for record items */
export const recordPatternMatcher = createStandardSearchPatternMatcher({
    name: "Record",
    matcher: /^record:\s*/,
});
