import {IInputError} from "../../../../../uiLayers/types/input/_types/IInputError";
import {INumberConstraints} from "./_types/INumberConstraints";

/**
 * Checks whether a given text matches the numeric constraints specified
 * @param text The text to match
 * @param constraints The constraints
 * @returns The numbers
 */
export function checkTextNumberConstraints(
    text: string,
    {min, max, increment, baseValue, checkValidity}: INumberConstraints
): IInputError | undefined {
    // Make sure the text is numeric
    if (!/^(\-?\d*\.)?\d+$/.exec(text)) {
        const res = /(\-?\d*\.)?\d+/.exec(text);
        return {
            message: "Value must be a number",
            ranges: res
                ? [
                      ...(res.index > 0 ? [{start: 0, end: res.index}] : []),
                      ...(res.index + res[0].length < text.length
                          ? [{start: res.index + res[0].length, end: text.length}]
                          : []),
                  ]
                : [{start: 0, end: text.length}],
        };
    }

    // Check whether the number satisfies the constraints
    const value = Number(text);
    if (min != undefined && min > value)
        return {
            message: `Value must be larger than ${min}`,
            ranges: [{start: 0, end: text.length}],
        };
    if (max != undefined && max < value)
        return {
            message: `Value must be smaller than ${max}`,
            ranges: [{start: 0, end: text.length}],
        };
    if (increment != undefined) {
        const dif = (value - (baseValue ?? 0)) % increment;
        const slack = 1e-6;
        if (dif > slack && increment - dif > slack)
            return {
                message: `Value must be a multiple of ${increment}${
                    baseValue != undefined ? ` starting at ${baseValue}` : ""
                }`,
                ranges: [{start: 0, end: text.length}],
            };
    }
    return checkValidity?.(text);
}
