export type IAppletSearchData = {
    /** Whether to hide applets that are incompatible with the currently installed LaunchMenu version, defaults to false */
    hideIncompatible?: boolean;
    /** The term to search for */
    search?: string;
    /** Keywords to search for */
    keywords?: string[];
    /** The maximum number of results to retrieve (limit with offset define the window of results) */
    limit?: number;
    /** The number of results to skip (limit with offset define the window of results) */
    offset?: number;
};
