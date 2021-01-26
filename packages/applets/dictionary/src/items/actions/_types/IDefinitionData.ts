import {IWordCategory} from "../../../_types/IWordCategory";

/** The definition data for the getDefinitionsAction */
export type IDefinitionData = {
    category: IWordCategory;
    definition: string;
    examples: {example: string; translation?: string}[];
};
