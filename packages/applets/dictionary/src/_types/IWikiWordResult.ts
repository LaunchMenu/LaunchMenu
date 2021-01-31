/** The result of a word fetc */
export type IWikiWordResult = {
    [language: string]: {
        partOfSpeech: string;
        language: string;
        definitions: {
            definition: string;
            parsedExamples?: {example: string; translation: string}[];
            examples?: string[];
        }[];
    }[];
};
