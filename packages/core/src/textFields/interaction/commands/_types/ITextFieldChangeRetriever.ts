import {ITextFieldChange} from "./ITextFieldChange";
import {ITextFieldData} from "./ITextFieldData";

/** A retriever for alterations to a text field */
export type ITextFieldChangeRetriever = {
    /**
     * Retrieves the new input for a given alteration
     * @param field The current data of the text field
     * @returns The alterations to the data of the text field
     */
    (field: ITextFieldData): ITextFieldChange;
};
