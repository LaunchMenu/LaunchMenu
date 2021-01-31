import React from "react";
import {
    copyAction,
    copyTextHandler,
    createStandardMenuItem,
    IMenuItem,
    copyExitPasteHandler,
} from "@launchmenu/core";
import {dictionaryIcon} from "..";
import {DefinitionView} from "./DefinitionView";
import {dictionaryPatternMatcher} from "../dictionaryPatternMatcher";
import {ILanguage} from "../_types/ILanguage";
import {Wiktionary} from "../Wiktionary";
import {getDefinitionsAction} from "./actions/getDefinitionsAction";

/**
 * Creates an item for the given dictionary term
 * @param word The word to create an item for
 * @param language The language to create a menu item for
 * @returns The created menu item
 */
export function createWordMenuItem(word: string, language: ILanguage): IMenuItem {
    return createStandardMenuItem({
        icon: dictionaryIcon,
        name: word,
        content: <DefinitionView word={word} language={language} />,
        searchPattern: dictionaryPatternMatcher,
        actionBindings: h => [
            ...Wiktionary.get(word, language).flatMap(({category, definitions}) =>
                definitions.map(({definition, examples}) =>
                    getDefinitionsAction.createBinding({category, definition, examples})
                )
            ),
            copyExitPasteHandler.createBinding(word),
            copyAction.createBinding(copyTextHandler.createBinding(word)),
        ],
    });
}
