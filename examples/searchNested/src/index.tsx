import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    IMenuSearchable,
    Priority,
} from "@launchmenu/core";
import {v4 as uuid} from "uuid";
import {Field} from "model-react";

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

// A collection of items and searchables that always return no matter what the query is
const staticSubSearchables: IMenuSearchable[] = ["Bob", "Henry", "Emma", "Tim"].map(
    (name, i) => {
        const item = {
            priority: [Priority.MEDIUM, i],
            item: createStandardMenuItem({name}),
        };
        return {
            ID: uuid(),
            search: async () => ({item}),
        };
    }
);

// Create two items and searchables for them
const searchables: IMenuSearchable[] = [
    {name: "people", children: staticSubSearchables},
    {name: "not people"},
].map(({name, children}, i) => {
    const item = {
        priority: [Priority.HIGH, i],
        item: createStandardMenuItem({name}),
    };
    return {
        ID: uuid(),
        async search({search}) {
            // Perform some shitty text match, and if matched return both the item and children
            if (search.length > 2 && name.includes(search)) return {item, children};

            return {};
        },
    };
});

export default declare({
    info,
    settings,
    search: async (query, hook) => ({children: searchables}),
});
