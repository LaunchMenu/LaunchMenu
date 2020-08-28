import {INumberInputExecuteData} from "./INumberInputExecuteData";

/**
 * The data that can be applied to the number select input executer
 */
export type INumberInputSelectExecuteData = INumberInputExecuteData & {
    /** The standard menu options */
    options: number[];
    /** Whether custom options are allowed */
    allowCustomInput?: boolean;
};
