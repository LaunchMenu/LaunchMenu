import {IWikiSection} from "../../wiki/_types/IWikiHierarchicalStructure";
import {IWikiSectionInfo} from "../../wiki/_types/IWikiSectionInfo";

/** The section hierarchy of a wiktionary page */
export type IWiktionaryHierarchy = {
    [language: string]:
        | IDefinitionHierarchy
        | IWikiSection<{
              [etymology: string]: IDefinitionHierarchy;
          }>;
};

export type IDefinitionHierarchy = IWikiSection<{
    Pronunciation?: IWikiSection;
    "See also"?: IWikiSection;
    Verb?: IVerbHierarchy;
    Adverb?: IAdverbHierarchy;
    Adjective?: IAdjectiveHierarchy;
    Noun?: INounHierarchy;
    Pronoun?: IPronounHierarchy;
    Determiner?: IDeterminerHierarchy;
}>;

// Word types
export type IVerbHierarchy = IWikiSection<{}>;

export type IAdverbHierarchy = IWikiSection<{}>;

export type IAdjectiveHierarchy = IWikiSection<{
    Antonyms?: IAntonymHierarchy;
    "Derived terms"?: IDerivationsHierarchy;
    "Related terms"?: IRelatedHierarchy;
}>;

export type INounHierarchy = IWikiSection<{}>;

export type IPronounHierarchy = IWikiSection<{}>;

export type IDeterminerHierarchy = IWikiSection<{}>;

// Information types
export type IAntonymHierarchy = IWikiSection<{}>;
export type IAnagramHierarchy = IWikiSection<{}>;
export type IDerivationsHierarchy = IWikiSection<{}>;
export type IRelatedHierarchy = IWikiSection<{}>;
