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
    const clearCacheTimeout = 20e3; // 20 seconds

    // TODO: start using the search cacher
    const searches: Map<
        string,
        {
            result: DataLoader<string[]>;
            filteredResults: Map<ILanguage, DataCacher<string[]>>;
        }
    > = new Map();
    const words: Map<
        string,
        {
            result: DataLoader<IWordData[]>;
            filteredResults: Map<ILanguage, DataCacher<IWordData[]>>;
        }
    > = new Map();

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
        getAll(term, hook);

        const result = words.get(term);
        if (!result) return [];

        if (!result.filteredResults.has(language)) {
            result.filteredResults.set(
                language,
                new DataCacher(hook => {
                    const items = result.result.get(hook);
                    return items.filter(item => item.language == language);
                })
            );
        }

        return result.filteredResults.get(language)?.get(hook) as IWordData[];
    }

    /**
     * Retrieves all definitions for the given word
     * @param term The word to retrieve the definitions for
     * @param hook The hook to subscribe to changes
     * @returns The retrieved data
     */
    export function getAll(term: string, hook?: IDataHook): IWordData[] {
        if (!words.has(term)) {
            words.set(term, {
                result: new DataLoader<IWordData[]>(async () => {
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
                }, []),
                filteredResults: new Map(),
            });
        }
        extendClearCacheTimeout();

        return words.get(term)?.result.get(hook) as IWordData[];
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
        searchAll(term, hook);
        const result = searches.get(term);
        if (!result) return [];

        if (!result.filteredResults.has(language)) {
            result.filteredResults.set(
                language,
                new DataCacher(hook => {
                    const items = result.result.get(hook);
                    return items.filter(item => get(item, language, hook).length > 0);
                })
            );
        }

        return result.filteredResults.get(language)?.get(hook) as string[];
    }

    /**
     * Retrieves all results for a given search term (applying autocorrection)
     * @param term The term to search for
     * @param hook The hook to subscribe to changes
     * @returns The search results
     */
    export function searchAll(term: string, hook?: IDataHook): string[] {
        if (!searches.has(term)) {
            searches.set(term, {
                result: new DataLoader<string[]>(async () => {
                    const result = await fetch(
                        `${domain}/w/api.php?action=opensearch&format=json&search=${encodeURI(
                            term
                        )}`
                    );
                    const data: IWikiSearchResult = await result.json();
                    return data[1];
                }, []),
                filteredResults: new Map(),
            });
        }

        extendClearCacheTimeout();

        return searches.get(term)?.result.get(hook) as string[];
    }

    let timeout: NodeJS.Timeout | undefined;
    /**
     * Registers a timeout to clear the cache, or extends it if the timeout is already set
     */
    export function extendClearCacheTimeout(): void {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(clearCache, clearCacheTimeout);
    }

    /**
     * Clears the cache that prevents repeated searches
     */
    export function clearCache(): void {
        searches.clear();
        words.clear();
    }
}
