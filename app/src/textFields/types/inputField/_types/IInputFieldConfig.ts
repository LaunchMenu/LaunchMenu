import {IInputFieldError} from "./IInputFieldError";

/**
 * A config object for input fields
 */
export type IInputFieldConfig<T> = {
    /** Checks whether the given input is valid */
    checkValidity?: (v: string) => IInputFieldError | undefined;
    /** The function to transform the field value into a string */
    serialize?: (v: T) => string;
    /** The function to transform the input string to a valid field value (if the input is valid) */
    deserialize?: (v: string) => T;
    /** Whether to only update on any valid input, or only when the input field (defaults to true)*/
    liveUpdate?: boolean;
} & (T extends string
    ? unknown
    : {
          /** The function to transform the field value into a string */
          serialize: unknown;
          /** The function to transform the input string to a valid field value (if the input is valid) */
          deserialize: unknown;
      });
