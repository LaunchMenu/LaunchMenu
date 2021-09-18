import React, {FC, useMemo} from "react";
import {
    Box,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    FuzzyRater,
    getHighlightThemeStyle,
    highlightTags,
    searchAction,
    SearchHighlighter,
    useIOContext,
    useTheme,
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

const Content: FC<{text: string}> = ({text}) => {
    const context = useIOContext();
    const search = "ornge";

    // Retrieve the style that can be used for highlighting
    const theme = useTheme();
    const syntaxStyling = useMemo(
        () => getHighlightThemeStyle(theme.highlighting),
        [theme]
    );

    // Use the fuzzy rater to retrieve a score and highlighter for this text
    const data = useMemo(() => {
        if (!context) return;
        const rater = new FuzzyRater(search, context.settings);

        const score = rater.rate({
            name: text,
        });
        return {
            score: score instanceof Array ? score : [score],
            highlighter: (text: string) => {
                const highlight = rater.highlight(text);
                // Deep copy them in the log, since the searchHighlighter mutates them
                console.log(highlight.map(node => ({...node, tags: [...node.tags]})));
                return highlight;
            },
        };
    }, [context, text]);
    if (!context || !data) return <div>No context</div>;

    // Use the SearchHighlighter component to highlight the text
    const query = {search, context};
    return (
        <Box css={syntaxStyling}>
            <SearchHighlighter
                searchHighlighter={data.highlighter}
                text={text}
                // We're not actually using the dat below, since the search data is hardcoded in the highlighter
                searchText={query.search}
                query={query}
            />
            : {data.score.join(",")}
        </Box>
    );
};

const items = [
    createStandardMenuItem({
        name: "Hello world",
        content: <Content text="I like oranges in my mouth" />,
        onExecute: () => alert("Hello!"),
    }),
    createStandardMenuItem({
        name: "Bye world",
        content: <Content text="Corngeese are not real animals" />,
        onExecute: () => alert("Bye!"),
    }),
];

export default declare({
    info,
    settings,
    async search(query, hook) {
        return {children: searchAction.get(items)};
    },
});
