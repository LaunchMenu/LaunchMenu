import {IInputError} from "../../../../../../uiLayers/types/input/_types/IInputError";

/**
 * The constraints on a number
 */
export type INumberConstraints = {
    /** The minimum allowed value */
    min?: number;
    /** The maximum allowed value */
    max?: number;
    /** The allowed increment step */
    increment?: number;
    /** The base value to take the increments relative to */
    baseValue?: number;
    /** Checks whether the given input is valid */
    checkValidity?: (text: string) => IInputError | undefined;
};
