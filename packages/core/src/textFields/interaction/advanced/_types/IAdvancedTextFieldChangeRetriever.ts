import {ITextFieldData} from "../../commands/_types/ITextFieldData";
import {IAdvancedTextFieldChange} from "./IAdvancedTextFieldChange";

/** A retriever for alterations to a text field */
export type IAdvancedTextFieldChangeRetriever = {
    /**
     * Retrieves the new input for a given alteration
     * @param field The current data of the text field
     * @returns The alterations to the data of the text field
     */
    (field: ITextFieldData): IAdvancedTextFieldChange;
};
