import {DataCacher} from "model-react";
import {WikiPage} from "../wiki/WikiPage";
import {WikiSection} from "../wiki/WikiSection";
import {IWikiSectionInfo} from "../wiki/_types/IWikiSectionInfo";
import {WiktionarySection} from "./baseSections/WiktionarySection";
import {WiktionaryVerb} from "./definitionWordType/WiktionaryVerb";
import {WiktionaryWordType} from "./definitionWordType/WiktionaryWordType";
import {WiktionaryDefinition} from "./WiktionaryDefinition";
/**
 * A wiktionary section that contains all definitions for 1 given language
 */
export class WiktionaryLanguage extends WiktionarySection {
    /** The word definitions in this language */
    protected definitions = new DataCacher(() => {
        const definitions = this.subsections.filter(
            (child): child is WiktionaryDefinition =>
                child instanceof WiktionaryDefinition
        );
        if (definitions.length > 0) return definitions;

        const hasWordType = this.subsections.some(
            child => child instanceof WiktionaryWordType
        );
        if (!hasWordType) return [];

        return [new WiktionaryDefinition(this.page, this.info, this.subsections)];
    });

    /**
     * Retrieves the language this section is for
     * @returns The language
     */
    public getLanguage(): string {
        return this.getName().toLowerCase();
    }

    /**
     * Retrieves the definitions in this language
     * @returns The definitions
     */
    public getDefinitions(): WiktionaryDefinition[] {
        return this.definitions.get();
    }
}
