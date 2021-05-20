import {ITextSelection} from "../../../_types/ITextSelection";
import {ITextAlteration} from "./ITextAlteration";

/** The data computed and stored by a text edit command when executed */
export type ITextEditData = {
    oldSelection: ITextSelection;
    oldText: string;
    newSelection: ITextSelection;
    newText: string;
    alteration?: ITextAlteration;
};
