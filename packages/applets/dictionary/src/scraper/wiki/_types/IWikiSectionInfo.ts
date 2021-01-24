/** The input information for a section */
export type IWikiSectionInfo = {
    /** The name of the section */
    name: string;
    /** The depth of the section */
    level: number;
    /** The identifier of the section */
    number: string;
    /** The index of the section (non hierarchical index) */
    index: number;
};
