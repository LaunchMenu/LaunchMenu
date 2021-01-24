import {DataCacher, DataLoader, IDataHook} from "model-react";
import {Wiki} from "./Wiki";
import {WikiSection} from "./WikiSection";
import {IWikiSection} from "./_types/IWikiHierarchicalStructure";
import {IWikiPageSectionsResult} from "./_types/IWikiPageSectionsResult";
import {IWikiSectionInfo} from "./_types/IWikiSectionInfo";

export class WikiPage<S extends WikiSection = WikiSection> {
    protected wiki: Wiki;
    protected title: string;

    /**
     * Creates a new local model of a wikipage
     * @param wiki The wiki that this page is for
     * @param title The name of the page
     */
    public constructor(wiki: Wiki, title: string) {
        this.wiki = wiki;
        this.title = title;
    }

    /**
     * Retrieves the wiki that this page is on
     * @returns The wiki that this page is on
     */
    public getWiki(): Wiki {
        return this.wiki;
    }

    /**
     * Retrieves the word that this page is for
     * @returns The term
     */
    public getTitle(): string {
        return this.title;
    }

    // Sections
    protected rawSections = new DataLoader(
        async () => {
            const result = await fetch(
                `${this.wiki.getApiUrl()}?action=parse&format=json&prop=sections&page=${
                    this.title
                }`
            );
            const data: IWikiPageSectionsResult = await result.json();
            const sectionsData = data.parse.sections;

            // Turn the list of sections into a hierarchy
            const sectionList = sectionsData.reduceRight((sections, data) => {
                const sectionInfo: IWikiSectionInfo = {
                    name: data.line,
                    level: Number(data.level),
                    index: Number(data.index),
                    number: data.number,
                };
                const subSections = sections.filter(
                    section => section.level > sectionInfo.level
                );
                const remainingSections = sections.filter(
                    section => section.level <= sectionInfo.level
                );

                const namedSubSections = {} as {
                    [key: string]: IWikiSection;
                };
                subSections.forEach(subSection => {
                    namedSubSections[subSection.name] = subSection;
                });
                return [
                    {...sectionInfo, childList: subSections, children: namedSubSections},
                    ...remainingSections,
                ];
            }, [] as IWikiSection[]);

            const sections = {} as {[key: string]: IWikiSection};
            sectionList.forEach(section => {
                sections[section.name] = section;
            });

            return {sections, sectionList};
        },
        {sections: {}, sectionList: []} as {
            sections: {[key: string]: IWikiSection};
            sectionList: IWikiSection[];
        }
    );

    /**
     * Creates a section of this page
     * @param data The section data
     * @returns The wiki section
     */
    protected createSection(data: IWikiSection): S {
        return new WikiSection(
            this,
            data,
            data.childList.map(section => this.createSection(section))
        ) as S;
    }

    /**
     * The sections model
     */
    protected sections = new DataCacher(hook => {
        const rawSections = this.rawSections.get(hook);
        return {
            sectionList: rawSections.sectionList.map(section =>
                this.createSection(section)
            ),
        };
    });

    /**
     * Retrieves the sections of this page
     * @param hook The hook to subscribe to changes
     * @returns The sections
     */
    public getSectionList(hook?: IDataHook): S[] {
        return this.sections.get(hook).sectionList;
    }
}
