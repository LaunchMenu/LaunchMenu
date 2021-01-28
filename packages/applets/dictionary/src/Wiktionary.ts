import {SearchCache} from "@launchmenu/core";
import {DataCacher, DataLoader, IDataHook} from "model-react";
import {ILanguage} from "./_types/ILanguage";
import {IWikiSearchResult} from "./_types/IWikiSearchResult";
import {IWikiWordResult} from "./_types/IWikiWordResult";
import {IWordData} from "./_types/IWordData";

/**
 * A simple wiktionary API to retrieve words
 */
export namespace Wiktionary {
    const domain = "https://en.wiktionary.org/";

    /** Search cache */
    const allSearches = new SearchCache(
        (term: string) =>
            new DataLoader<string[]>(async () => {
                if (term == "") return [];
                const result = await fetch(
                    `${domain}/w/api.php?action=opensearch&format=json&search=${encodeURI(
                        term
                    )}`
                );
                const data: IWikiSearchResult = await result.json();
                return data[1];
            }, [])
    );
    const searches = new SearchCache(
        (term: string, language: ILanguage) =>
            new DataCacher(hook => {
                const items = allSearches.get(term).get(hook);
                return items.filter(item => get(item, language, hook).length > 0);
            })
    );

    /** Words cache */
    const allWords = new SearchCache(
        (term: string) =>
            new DataLoader<IWordData[]>(async () => {
                const result = await fetch(
                    `${domain}/api/rest_v1/page/definition/${encodeURI(term)}`
                );
                const data: IWikiWordResult | {type: string} = await result.json();
                if ("type" in data) return [];

                return Object.values(data)
                    .flat()
                    .map(({definitions, language, partOfSpeech}) => ({
                        category: partOfSpeech as IWordData["category"],
                        language,
                        definitions: definitions.map(
                            ({definition, parsedExamples, examples}) => ({
                                definition,
                                examples:
                                    parsedExamples ??
                                    examples?.map(example => ({example})) ??
                                    [],
                            })
                        ),
                    }));
            }, [])
    );
    const words = new SearchCache(
        (term: string, language: ILanguage) =>
            new DataCacher(hook => {
                const items = allWords.get(term).get(hook);
                return items.filter(item => item.language == language);
            })
    );

    /**
     * Retrieves all definitions for the given word in a given language
     * @param term The word to retrieve the definitions for
     * @param language The language for which to retrieve the definitions
     * @param hook The hook to subscribe to changes
     * @returns The retrieved data
     */
    export function get(
        term: string,
        language: ILanguage,
        hook?: IDataHook
    ): IWordData[] {
        return words.get(term, language).get(hook);
    }

    /**
     * Retrieves all definitions for the given word
     * @param term The word to retrieve the definitions for
     * @param hook The hook to subscribe to changes
     * @returns The retrieved data
     */
    export function getAll(term: string, hook?: IDataHook): IWordData[] {
        return allWords.get(term).get(hook);
    }

    /**
     * Retrieves all results for a given search term in a given language (applying autocorrection)
     * @param term The term to search for
     * @param language The language of the term to retrieve
     * @param hook The hook to subscribe to changes
     * @returns The search results
     */
    export function search(
        term: string,
        language: ILanguage,
        hook?: IDataHook
    ): string[] {
        return searches.get(term, language).get(hook);
    }

    /**
     * Retrieves all results for a given search term (applying autocorrection)
     * @param term The term to search for
     * @param hook The hook to subscribe to changes
     * @returns The search results
     */
    export function searchAll(term: string, hook?: IDataHook): string[] {
        return allSearches.get(term).get(hook);
    }
}
