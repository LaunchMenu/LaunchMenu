import React from "react";
import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    searchAction,
    SearchCache,
    createOptionSetting,
    IQuery,
    SearchMenu,
    UILayer,
    TextField,
} from "@launchmenu/core";
import {IDataHook, Observer} from "model-react";
import {Wiktionary} from "./Wiktionary";
import {ILanguage, languages} from "./_types/ILanguage";
import {BiBookAlt} from "react-icons/bi";
import {dictionaryPatternMatcher} from "./dictionaryPatternMatcher";
import {createWordMenuItem} from "./items/createWordMenuItem";

export const dictionaryIcon = <BiBookAlt />;
export const info = {
    name: "Dictionary",
    description: "A dictionary applet",
    version: "0.0.0",
    icon: dictionaryIcon,
} as const;

export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {
                language: createOptionSetting({
                    name: "Default language",
                    init: "English" as ILanguage,
                    options: Object.values(languages),
                    createOptionView: option => createStandardMenuItem({name: option}),
                }),
            },
        }),
});

const resultCache = new SearchCache(createWordMenuItem);

/**
 * A search function to get the dictionary results
 * @param query The query
 * @param hook The hook to subscribe to changes
 * @returns The search entry point
 */
const search = async (query: IQuery, hook: IDataHook) => {
    const pattern = dictionaryPatternMatcher(query);
    const search = pattern?.searchText ?? query.search;
    const language =
        pattern?.metadata?.language ||
        query.context.settings.get(settings).language.get(hook);
    const words = await Wiktionary.search(search, language, hook);
    const items = resultCache.getAll(words.map(word => [word, language]));
    return {
        patternMatch: pattern,
        children: searchAction.get(items),
    };
};

export default declare({
    info,
    settings,
    search,
    open({context, onClose}) {
        const searchField = new TextField();
        const searchMenu = new SearchMenu(context, {search});
        const searchObserver = new Observer(h => searchField.get(h)).listen(search =>
            searchMenu.setSearch(search)
        );

        context.open(
            new UILayer(
                () => ({
                    icon: dictionaryIcon,
                    field: searchField,
                    menu: searchMenu,
                    searchable: false,
                    onClose: () => {
                        searchObserver.destroy();
                        onClose();
                    },
                }),
                {path: "Dictionary"}
            )
        );
    },
});
