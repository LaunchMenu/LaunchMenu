import {WikiPage} from "../../wiki/WikiPage";
import {WikiSection} from "../../wiki/WikiSection";
import {IWikiSectionInfo} from "../../wiki/_types/IWikiSectionInfo";
import {WiktionaryReferences} from "./WiktionaryReferences";
import {WiktionarySeeAlso} from "./WiktionarySeeAlso";
import {WiktionaryUsageNotes} from "./WiktionaryUsageNotes";

/**
 * The standard class for sections in the wiktionary
 */
export class WiktionarySection extends WikiSection {
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
        super(page, info, subsections);
        this.setSubsectionsContents();
    }

    /**
     * Retrieves the references for this section
     * @returns The references if present
     */
    protected getReferences(): WiktionaryReferences | null {
        return this.findSubsections(WiktionaryReferences)[0] ?? null;
    }

    /**
     * Retrieves the usage notes for this section
     * @returns The usage notes if present
     */
    protected getUsageNotes(): WiktionaryUsageNotes | null {
        return this.findSubsections(WiktionaryUsageNotes)[0] ?? null;
    }

    /**
     * Retrieves the 'see also' for this section
     * @returns The 'see also' if present
     */
    protected getSeeAlso(): WiktionarySeeAlso | null {
        return this.findSubsections(WiktionarySeeAlso)[0] ?? null;
    }
}
