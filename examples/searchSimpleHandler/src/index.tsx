import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    IQuery,
    ISimpleSearchMethod,
    searchAction,
    simpleSearchHandler,
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

const items = [
    createStandardMenuItem({
        name: "Hello world",
        onExecute: () => alert("Hello!"),
    }),
    createStandardMenuItem({
        name: "Bye world",
        onExecute: () => alert("Bye!"),
    }),
];

// Create a custom search method, in this case testing for reverse sub-matches
export const reverseSearchMethod: ISimpleSearchMethod = {
    name: "Reverse",
    ID: "ReverseSearchMethod",
    view: createStandardMenuItem({name: "Reverse search"}),
    rate: ({name = "", content = "", description = "", tags = []}, search, query) => {
        // Make sure that an empty search never returns a result
        if (search.length == 0) return 0;

        const combined = `${name} ${description} ${content} ${tags.join(" ")}`;
        const included = combined.includes(getReverse(query, search));
        if (!included) return 0;

        // The longer the match was, the further off it was
        return [1 / combined.length];
    },
    highlight: (text, search, query) => {
        const index = text.indexOf(getReverse(query, search));
        if (index == -1) return [];

        return [
            {
                start: index,
                end: index + search.length,
            },
        ];
    },
};

// In many cases your search will need to do some preprocessing of the query,
//  we can cache the result of this preprocessing in the query for more efficient searches.
const reverseSearchSymbol = Symbol("reverse search");
function getReverse(
    query: IQuery & {[reverseSearchSymbol]?: Record<string, string>},
    search: string
): string {
    let reverses = query[reverseSearchSymbol];
    if (!reverses) reverses = query[reverseSearchSymbol] = {};

    let reverse = reverses[search];
    if (!reverse) reverse = reverses[search] = search.split("").reverse().join("");

    return reverse;
}

export default declare({
    info,
    settings,
    init() {
        // Add the handler when the applet is loaded
        simpleSearchHandler.addSearchMethod(reverseSearchMethod);

        return {
            search: async query => ({children: searchAction.get(items)}),

            // Remove the handler when the applet is unloaded
            onDispose: () => simpleSearchHandler.removeSearchMethod(reverseSearchMethod),
        };
    },
});
