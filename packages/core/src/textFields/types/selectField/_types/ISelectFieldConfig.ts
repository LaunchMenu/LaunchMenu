import {ISelectOption} from "./ISelectOption";
import {IInputFieldError} from "../../inputField/_types/IInputFieldError";
import {IMenuItem} from "../../../../menus/items/_types/IMenuItem";
import {IPrioritizedMenuCategoryConfig} from "../../../../menus/menu/_types/IAsyncMenuCategoryConfig";

export type ISelectFieldConfig<T> = {
    /** The options for the dropdown */
    options: ISelectOption<T>[];
    /** A method to retrieve the UI for a custom option */
    createOptionView: (value: T, isDisabled: boolean) => IMenuItem;
    /** Whether to allow custom user inputs */
    allowCustomInput?: boolean;
    /** Whether to only update on any valid input, or only when the input field (defaults to true)*/
    liveUpdate?: boolean;
    /** A check whether two values are equal, used to highlight the currently selected option */
    equals?: (a: T, b: T) => boolean;
    /** Menu category configuration for the search results */
    categoryConfig?: IPrioritizedMenuCategoryConfig;
} & (
    | {
          /** Whether to allow custom user inputs */
          allowCustomInput?: false;

          checkValidity?: undefined;
          serialize?: undefined;
          deserialize?: undefined;
          customView?: undefined;
      }
    | ({
          /** Whether to allow custom user inputs */
          allowCustomInput: true;
          /** Checks whether the given input is valid */
          checkValidity?: (v: string) => IInputFieldError | undefined;
          /** The function to transform the field value into a string */
          serialize?: (v: T) => string;
          /** The function to transform the input string to a valid field value (if the input is valid) */
          deserialize?: (v: string) => T;
          /** The item to use for custom input */
          customView?: IMenuItem;
      } & (T extends string
          ? unknown
          : {
                /** The function to transform the field value into a string */
                serialize: unknown;
                /** The function to transform the input string to a valid field value (if the input is valid) */
                deserialize: unknown;
            }))
);