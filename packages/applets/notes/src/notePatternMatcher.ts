import {createStandardSearchPatternMatcher} from "@launchmenu/core";

/**
 * The pattern matcher for note items
 */
export const notePatternMatcher = createStandardSearchPatternMatcher({
    name: "Notes",
    matcher: /^note\s*:\s*/i,
});
