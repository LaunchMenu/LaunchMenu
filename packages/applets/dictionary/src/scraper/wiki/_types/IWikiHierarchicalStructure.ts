import {IWikiSectionInfo} from "./IWikiSectionInfo";

/** The section info as well as a named and unnamed list of subsections */
export type IWikiSection<
    T extends {
        [key: string]: IWikiSectionInfo | undefined;
    } = {
        [key: string]: IWikiSectionInfo;
    }
> = IWikiSectionInfo & {
    children: T;
    childList: IWikiSection[];
};
