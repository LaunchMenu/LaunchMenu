import {WiktionarySection} from "./baseSections/WiktionarySection";
/**
 * A wiktionary section that contains all definitions for 1 given language
 */
export class WiktionaryLanguage extends WiktionarySection {
    /**
     * Retrieves the language this section is for
     * @returns The language
     */
    public getLanguage(): string {
        return this.getName();
    }
}
