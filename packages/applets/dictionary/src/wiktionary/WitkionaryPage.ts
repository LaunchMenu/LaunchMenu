import {DataCacher, IDataHook} from "model-react";
import {WikiPage} from "../wiki/WikiPage";
import {WikiSection} from "../wiki/WikiSection";
import {IWikiSection} from "../wiki/_types/IWikiHierarchicalStructure";
import {WiktionaryReferences} from "./baseSections/WiktionaryReferences";
import {WiktionarySeeAlso} from "./baseSections/WiktionarySeeAlso";
import {WiktionaryUsageNotes} from "./baseSections/WiktionaryUsageNotes";
import {WiktionaryLanguage} from "./WiktionaryLanguage";
import {WiktionaryAdjective} from "./wordTypes/WiktionaryAdjective";
import {WiktionaryAdverb} from "./wordTypes/WiktionaryAdverb";
import {WiktionaryDeterminer} from "./wordTypes/WiktionaryDeterminer";
import {WiktionaryNoun} from "./wordTypes/WiktionaryNoun";
import {WiktionaryPronoun} from "./wordTypes/WiktionaryPronoun";
import {WiktionaryVerb} from "./wordTypes/WiktionaryVerb";

export class WiktionaryPage extends WikiPage<WiktionaryLanguage> {
    /** @override */
    protected createSection(data: IWikiSection): WiktionaryLanguage {
        return new WiktionaryLanguage(
            this,
            data,
            data.childList.map(section => this.createSection(section))
        );
    }

    /**
     * Creates a section using the appropriate class given the section data
     * @param data The data of the section
     * @returns The created section
     */
    protected createDefinitionSection(data: IWikiSection): WikiSection {
        let Class: {
            new (
                page: WiktionaryPage,
                data: IWikiSection,
                children: WikiSection[]
            ): WikiSection;
        } = WikiSection;

        // Select an appropriate class given the section name
        const {name} = data;
        if (name == "Pronunciation") Class = WikiSection;
        else if (name == "Antonyms") Class = WikiSection;
        else if (name == "References") Class = WiktionaryReferences;
        else if (name == "See also") Class = WiktionarySeeAlso;
        // Word types
        else if (name == "Verb") Class = WiktionaryVerb;
        else if (name == "Adverb") Class = WiktionaryAdverb;
        else if (name == "Adjective") Class = WiktionaryAdjective;
        else if (name == "Noun") Class = WiktionaryNoun;
        else if (name == "Pronoun") Class = WiktionaryPronoun;
        else if (name == "Determiner") Class = WiktionaryDeterminer;
        // Extra per word type
        else if (name == "Derived terms") Class = WikiSection;
        else if (name == "Related terms") Class = WikiSection;
        else if (name == "Usage notes") Class = WiktionaryUsageNotes;

        // Instantiate the class
        return new Class(
            this,
            data,
            data.childList.map(section => this.createSection(section))
        );
    }

    /**
     * Retrieves all the languages and the word's definitions in this language
     * @param hook The hook to subscribe to changes
     * @returns All the languages that have a definition for this word
     */
    protected getLanguages(hook?: IDataHook): WiktionaryLanguage[] {
        return this.getSectionList(hook);
    }

    /**
     * Retrieves the definition of the word for the given language
     * @param language The language to get the definition for
     * @param hook The hook to subscribe to changes
     * @returns The language section if it exists
     */
    protected getLanguage(language: string, hook?: IDataHook): WiktionaryLanguage | null {
        return (
            this.getLanguages(hook).find(section => section.getLanguage() == language) ??
            null
        );
    }
}
