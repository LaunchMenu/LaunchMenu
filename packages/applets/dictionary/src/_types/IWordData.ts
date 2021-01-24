export type IWordData = {
    partOfSpeech:
        | "Verb"
        | "Adverb"
        | "Adjective"
        | "Noun"
        | "Pronoun"
        | "Determiner"
        | "Interjection";
    language: string;
    definitions: {
        definition: string;
        examples: {example: string; translation?: string}[];
    }[];
};
