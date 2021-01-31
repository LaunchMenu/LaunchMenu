import {IWordCategory} from "./IWordCategory";

/**
 * The normalized data retrieved for words
 */
export type IWordData = {
    category: IWordCategory;
    language: string;
    definitions: {
        definition: string;
        examples: {example: string; translation?: string}[];
    }[];
};
