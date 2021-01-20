import {DataCacher, DataLoader, IDataHook} from "model-react";
import {WikiPage} from "./WikiPage";
import {IWikiSectionContentResult} from "./_types/IWikiSectionContentResult";
import {IWikiSectionInfo} from "./_types/IWikiSectionInfo";

export class WikiSection {
    protected page: WikiPage;
    protected info: IWikiSectionInfo;
    protected subsections: WikiSection[];

    protected content = new DataLoader(async () => {
        const page = this.page;
        const result = await fetch(
            `${page
                .getWiki()
                .getApiUrl()}?action=parse&format=json&prop=text&disabletoc=true&section=${
                this.info.index
            }&page=${page.getTitle()}`
        );
        const data: IWikiSectionContentResult = await result.json();
        return data.parse.text["*"];
    }, null as null | string);

    protected contentDom = new DataCacher<Document | null>((h, prev) => {
        if (this.contentDomSource) return this.contentDomSource(h);
        if (!prev) this.setSubsectionsContents();

        const content = this.content.get(h);
        if (!content) return null;

        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/xml");
        return doc;
    });

    protected contentDomSource?: (h?: IDataHook) => Document | null;

    /**
     * Creates a new local model of a wikipage section
     * @param page The page that this section is a part of
     * @param info The section info
     * @param subsections The ids of child sections
     */
    public constructor(
        page: WikiPage,
        info: IWikiSectionInfo,
        subsections?: WikiSection[]
    ) {
        this.page = page;
        this.info = info;
        this.subsections = subsections || [];
    }

    /**
     * Retrieves the page that this section is a part of
     * @returns The page
     */
    public getPage(): WikiPage {
        return this.page;
    }

    /**
     * Retrieves all subsections of this section
     * @returns All subsections
     */
    public getSubSections(): WikiSection[] {
        return this.subsections;
    }

    /**
     * Finds the subsections with the specified class
     * @param constructor The class of the subsection to find
     * @returns The subsections that were found
     */
    protected findSubsections<T extends WikiSection>(constructor: {
        new (...args: any[]): T;
    }): T[] {
        return this.subsections.filter(
            (subsection): subsection is T => subsection instanceof constructor
        );
    }

    // Getters for the section info
    /**
     * Retrieves the depth of the section
     * @returns The depth
     */
    public getLevel(): number {
        return this.info.level;
    }

    /**
     * Retrieves the name of the section
     * @returns The section's name
     */
    public getName(): string {
        return this.info.name;
    }

    /**
     * Retrieves the non-hierarchical index of the section
     * @returns The section's index
     */
    public getIndex(): number {
        return this.info.index;
    }

    /**
     * Retrieves the hierarchical id of the section, e.g. `1.3.2`
     * @returns The hierarchical id
     */
    public getID(): string {
        return this.info.number;
    }

    // Content
    /**
     * Retrieves the raw section content
     * @param hook The hook to subscribe to changes
     * @returns The currently loaded content of this section
     */
    public getContent(hook?: IDataHook): string | null {
        return this.content.get(hook);
    }

    /**
     * Retrieves the section content parsed as an html document
     * @param hook The hook to subscribe to changes
     * @returns The currently loaded content of this section
     */
    public getContentDom(hook?: IDataHook): Document | null {
        return this.contentDom.get(hook);
    }

    /**
     * Sets the dom source in order to help with efficiency, prevents performing a data fetch if the data can be obtained from here
     * @param source THe data source to retrieve the data from
     */
    protected setContentDomSource(source: (hook?: IDataHook) => Document | null): void {
        if (this.getContentDom() == null) {
            this.contentDomSource = source;
        }
    }

    /**
     * Sets the contents of the subsections based on the content of this section
     */
    protected setSubsectionsContents(): void {
        this.subsections.forEach(section => {
            this.setSubsectionContents(section);
        });
    }

    /**
     * Sets the contents of the given subsection based on the content of this section
     * @param subsection The subsection to set the content for
     */
    protected setSubsectionContents(subsection: WikiSection): void {
        const source = new DataCacher(hook => {
            const contents = this.getContentDom(hook);
            if (!contents) return null;

            // Get the header of this section
            const header = contents.querySelector(`#${subsection.getName()}`)?.parentNode;
            if (!header) return null;
            const headerType = header.nodeType;

            // Get all nodes that fall under this section
            const nodes = [header] as Node[];
            let node = header.nextSibling;
            while (node && node.nodeType != headerType) {
                nodes.push(node);
                node = node.nextSibling;
            }

            // Create a document with these nodes
            const container = new HTMLDivElement();
            container.append(...nodes);
            container.className = "mw-parser-output";

            const document = new Document();
            document.appendChild(container);
            return document;
        });

        subsection.setContentDomSource(h => source.get(h));
    }
}
