import {DataCacher, IDataHook} from "model-react";
import {WikiPage} from "../wiki/WikiPage";
import {WikiSection} from "../wiki/WikiSection";
import {IWikiSection} from "../wiki/_types/IWikiHierarchicalStructure";
import {WiktionaryReferences} from "./baseSections/WiktionaryReferences";
import {WiktionarySeeAlso} from "./baseSections/WiktionarySeeAlso";
import {WiktionaryUsageNotes} from "./baseSections/WiktionaryUsageNotes";
import {WiktionaryLanguage} from "./WiktionaryLanguage";
import {WiktionaryAdjective} from "./definitionWordType/WiktionaryAdjective";
import {WiktionaryAdverb} from "./definitionWordType/WiktionaryAdverb";
import {WiktionaryDeterminer} from "./definitionWordType/WiktionaryDeterminer";
import {WiktionaryNoun} from "./definitionWordType/WiktionaryNoun";
import {WiktionaryVerb} from "./definitionWordType/WiktionaryVerb";
import {WiktionaryPronoun} from "./definitionWordType/WiktionaryPronoun";
import {WiktionaryDefinition} from "./WiktionaryDefinition";

export class WiktionaryPage extends WikiPage<WiktionaryLanguage> {
    /** @override */
    protected createSection(data: IWikiSection): WiktionaryLanguage {
        return new WiktionaryLanguage(
            this,
            data,
            data.childList.map(section => this.createDefinitionSection(section))
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
        const name = data.name.toLowerCase();
        if (name.match(/etymology\s*[0-9]+/)) Class = WiktionaryDefinition;
        else if (name == "pronunciation") Class = WikiSection;
        else if (name == "antonyms") Class = WikiSection;
        else if (name == "references") Class = WiktionaryReferences;
        else if (name == "see also") Class = WiktionarySeeAlso;
        // Word definition sections
        else if (name == "verb") Class = WiktionaryVerb;
        else if (name == "adverb") Class = WiktionaryAdverb;
        else if (name == "adjective") Class = WiktionaryAdjective;
        else if (name == "noun") Class = WiktionaryNoun;
        else if (name == "pronoun") Class = WiktionaryPronoun;
        else if (name == "determiner") Class = WiktionaryDeterminer;
        // Extra per word type
        else if (name == "derived terms") Class = WikiSection;
        else if (name == "related terms") Class = WikiSection;
        else if (name == "usage notes") Class = WiktionaryUsageNotes;

        // Instantiate the class
        return new Class(
            this,
            data,
            data.childList.map(section => this.createDefinitionSection(section))
        );
    }

    /**
     * Retrieves all the languages and the word's definitions in this language
     * @param hook The hook to subscribe to changes
     * @returns All the languages that have a definition for this word
     */
    public getLanguages(hook?: IDataHook): WiktionaryLanguage[] {
        return this.getSectionList(hook);
    }

    /**
     * Retrieves the definition of the word for the given language
     * @param language The language to get the definition for
     * @param hook The hook to subscribe to changes
     * @returns The language section if it exists
     */
    public getLanguage(language: string, hook?: IDataHook): WiktionaryLanguage | null {
        language = language.toLowerCase();
        return (
            this.getLanguages(hook).find(section => section.getLanguage() == language) ??
            null
        );
    }
}
