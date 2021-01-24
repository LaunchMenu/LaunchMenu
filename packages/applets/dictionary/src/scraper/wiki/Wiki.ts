import {WikiPage} from "./WikiPage";
import {IWikiSearchResult} from "./_types/IWikiSearchResult";

/**
 * The main entry to the wiktionary
 */
export class Wiki<T extends WikiPage = WikiPage> {
    protected createPage: (name: string) => T;
    protected domain: string;

    /**
     * Creates a new local model of a wiki
     * @param domain The domain of the wiki
     * @param createPage The function to create a new page given the page's name
     */
    public constructor(
        domain: string,
        createPage: (name: string) => T = title => new WikiPage(this, title) as T
    ) {
        this.domain = domain;
        this.createPage = createPage;
    }

    /**
     * Retrieves the domain that this wiki is for
     * @returns The domain
     */
    public getDomain(): string {
        return this.domain;
    }

    /**
     * Retrieves the api url of the wiki
     * @returns The api url
     */
    public getApiUrl(): string {
        return `${this.domain}/w/api.php`;
    }

    /**
     * Retrieves the found pages for a given search term
     * @param query The term to search for
     * @returns The found pages
     */
    async search(query: string): Promise<T[]> {
        const result = await fetch(
            `${this.getApiUrl()}?action=opensearch&format=json&search=${encodeURI(query)}`
        );
        const data: IWikiSearchResult = await result.json();

        const pageNames = data[1];
        return pageNames.map(this.createPage);
    }
}
