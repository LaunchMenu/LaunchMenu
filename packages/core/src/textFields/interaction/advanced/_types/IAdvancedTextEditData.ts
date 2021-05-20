import {ITextSelection} from "../../../_types/ITextSelection";
import {ITextAlteration} from "../../commands/_types/ITextAlteration";

/** The data computed and stored by a text edit command when executed */
export type IAdvancedTextEditData = {
    oldSelection: ITextSelection;
    oldText: string;
    newSelection: ITextSelection;
    newText: string;
    alterations: ITextAlteration[];
};
