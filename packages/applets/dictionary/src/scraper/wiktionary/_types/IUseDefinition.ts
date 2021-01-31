import {IWord} from "./IWord";

/**
 * A word definition
 */
export type IUse = {
    text: Element;
    synonyms: IWord[];
    examples: Element[];
};
