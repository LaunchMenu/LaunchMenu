/** The format of the data returned by a wiki sections parse */
export type IWikiPageSectionsResult = {
    parse: {
        sections: {
            toclevel: number;
            level: string;
            line: string;
            number: string;
            index: string;
            anchor: string;
            byteoffset: number;
            fromtitle: string;
        }[];
    };
};
