import {WiktionaryPage} from "../WitkionaryPage";

/**
 * The standard type for words such as synonyms
 */
export type IWord = {
    word: string;
    url: string;
    getPage(): WiktionaryPage;
};
