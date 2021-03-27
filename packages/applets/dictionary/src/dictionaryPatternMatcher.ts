import {createStandardSearchPatternMatcher, highlightTags} from "@launchmenu/core";
import {ILanguage, languages} from "./_types/ILanguage";

/**
 * The pattern matcher for dictionary items
 */
export const dictionaryPatternMatcher = createStandardSearchPatternMatcher({
    name: "Dictionary",
    matcher: ({search}) => {
        const match = search.match(/^((define\s*)(\w+)?\:).*$/);

        if (match) {
            const dl = match[2].length;
            const inpLanguage = match[3]?.toLowerCase();
            const language = (Object.values(languages).find(
                lang => lang.toLowerCase() == inpLanguage
            ) || languages[inpLanguage as keyof typeof languages]) as ILanguage;

            return {
                highlight: inpLanguage
                    ? [
                          {start: 0, end: dl},
                          {
                              start: dl,
                              end: dl + inpLanguage.length,
                              tags: language
                                  ? [highlightTags.literal]
                                  : [highlightTags.error],
                          },
                          {start: dl + inpLanguage.length, end: match[1].length},
                      ]
                    : [{start: 0, end: match[1].length}],
                metadata: {language},
            };
        }
    },
});
