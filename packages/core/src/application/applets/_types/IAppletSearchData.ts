export type IAppletSearchData = {
    /** The term to search for */
    search?: string;
    /** Keywords to search for */
    keywords?: string[];
    /** The maximum number of results to retrieve (limit with offset define the window of results) */
    limit?: number;
    /** The number of results to skip (limit with offset define the window of results) */
    offset?: number;
};
