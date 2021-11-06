import {IAppletRepoInfo} from "./IAppletRepoInfo";

/** The response obtained from a search */
export type IAppletSearchResponse = {
    /** The found applet */
    applets: IAppletRepoInfo[];
    /** The number of total results */
    totalCount: number;
};

/** The format of the web API response data obtained by a search */
export type IAppletSearchAPIResponse = {
    objects: {
        package: {
            name: string;
            scope: string;
            version: string;
            date: string;
            description?: string;
            keywords?: string[];
            links?: {
                npm?: string;
                homepage?: string;
                repository?: string;
                bugs?: string;
            };
            author?: {
                name?: string;
                url?: string;
            };
            publisher: {
                username: string;
                email: string;
            };
            maintainers: {
                username: string;
                email: string;
            }[];
        };
        score: {
            final: number;
            detail: {
                quality: number;
                popularity: number;
                maintenance: number;
            };
        };
        searchScore: number;
    }[];
    total: number;
    time: string;
};
