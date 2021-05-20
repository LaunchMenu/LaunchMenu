import React from "react";
import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    searchAction,
    SearchCache,
} from "@launchmenu/core";

export const info = {
    name: "Rick and Morty",
    description: "A Rick and Morty search applet",
    version: "0.0.0",
    icon: "applets" as const,
};

export const settings = createSettings({
    version: "0.0.0",
    settings: () => createSettingsFolder({...info, children: {}}),
});

// Use a cache to keep the same items when typing
const resultCache = new SearchCache((name: string, image: string, species: string) =>
    createStandardMenuItem({
        name,
        description: species,
        content: <img width="100%" src={image} />,
        onExecute: () => alert(`${name}!`),
    })
);

export default declare({
    info,
    settings,
    search: async (query, hook) => {
        const rawData = await fetch(
            `https://rickandmortyapi.com/api/character?name=${query.search}`
        );
        const data: {
            results: {name: string; image: string; species: string}[];
        } = rawData.ok ? await rawData.json() : {results: []};

        const items = data.results.map(({name, image, species}) =>
            resultCache.get(name, image, species)
        );
        return {children: searchAction.get(items)};
    },
});
