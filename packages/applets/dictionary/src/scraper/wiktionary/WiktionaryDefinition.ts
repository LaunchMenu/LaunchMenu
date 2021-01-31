import {DataCacher, IDataHook} from "model-react";
import {WiktionarySection} from "./baseSections/WiktionarySection";
import {WiktionaryWordType} from "./definitionWordType/WiktionaryWordType";
import {IWordTypeDefinition} from "./_types/IWordTypeDefinition";

/**
 * A wiktionary section that contains a definition type
 */
export class WiktionaryDefinition extends WiktionarySection {
    protected definition = new DataCacher(h => {
        const wordType = this.subsections.find(
            (section): section is WiktionaryWordType =>
                section instanceof WiktionaryWordType
        );

        if (!wordType)
            return {
                text: document.createElement("span"),
                uses: [],
            } as IWordTypeDefinition;

        return wordType.getDefinition(h);
    });

    /**
     * Retrieves the definition
     * @param hook The hook to subscribe to changes
     */
    public getDefinition(hook?: IDataHook): IWordTypeDefinition {
        return this.definition.get(hook);
    }
}
