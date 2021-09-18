import {
    createSettings,
    createSettingsFolder,
    createStandardSearchPatternMatcher,
    declare,
} from "@launchmenu/core";

const info = {
    name: "Example",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: "applets" as const,
};

const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {},
        }),
});

const patternMatcher = createStandardSearchPatternMatcher({
    name: "my pattern",
    matcher: /^orange:/,
});

export default declare({
    info,
    settings,
    async search(query, hook) {
        const match = patternMatcher(query);
        if (match) {
            const text = match.searchText; // The query search with the pattern subtracted
            return {
                patternMatch: match,
            };
        }

        // If this pattern doesn't match, manually create a custom match
        if (query.search[0] == "o")
            return {
                patternMatch: {
                    name: "my other pattern",
                    highlight: [
                        {start: 0, end: query.search.length, style: {color: "purple"}},
                    ],
                },
            };
        return {};
    },
});
