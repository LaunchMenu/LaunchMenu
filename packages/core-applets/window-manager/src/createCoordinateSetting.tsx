import React from "react";
import {
    createFieldMenuItem,
    IActionBinding,
    IField,
    IInputError,
    inputExecuteHandler,
    IPosition,
    ISize,
    settingPatternMatcher,
} from "@launchmenu/core";
import {Loader} from "model-react";

/**
 * Creates a setting to control window positions
 * @param param0
 */
export function createCoordinateSetting<T extends IPosition | ISize>({
    name,
    init,
    allowNegative,
    actionBindings = () => [],
    min,
    max,
}: {
    name: string;
    init: T;
    allowNegative?: boolean;
    actionBindings?: (field: IField<T>) => IActionBinding[];
    min?: T;
    max?: T;
}) {
    const castMin = min as IPosition | ISize;
    const castMax = max as IPosition | ISize;
    const normalizedMin =
        castMin &&
        ("x" in castMin
            ? ([castMin.x, castMin.y] as const)
            : ([castMin.width, castMin.height] as const));
    const normalizedMax =
        castMax &&
        ("x" in castMax
            ? ([castMax.x, castMax.y] as const)
            : ([castMax.width, castMax.height] as const));

    return createFieldMenuItem<T, T>({
        init: init as any,
        data: (field: IField<T>) => ({
            name,
            icon: "window",
            valueView: (
                <Loader>
                    {h => {
                        const coordinates: IPosition | ISize = field.get(h);
                        if ("x" in coordinates) {
                            const {x, y} = coordinates;
                            return `${x}, ${y}`;
                        } else {
                            const {width, height} = coordinates;
                            return `${width}, ${height}`;
                        }
                    }}
                </Loader>
            ),
            searchPattern: settingPatternMatcher,
            resetable: true,
            resetUndoable: true,
            actionBindings: [
                ...actionBindings(field),
                inputExecuteHandler.createBinding({
                    field,
                    undoable: true,
                    serialize: (coordinate: IPosition | ISize) =>
                        "x" in coordinate
                            ? `${coordinate.x}, ${coordinate.y}`
                            : `${coordinate.width}, ${coordinate.height}`,
                    deserialize: (text): IPosition | ISize => {
                        const numbers = text.split(",").map(v => {
                            const number = Number(v);
                            if (isNaN(number)) return 0;
                            return number ?? 0;
                        });
                        if ("x" in init) return {x: numbers[0] ?? 0, y: numbers[1] ?? 0};
                        else return {width: numbers[0] ?? 0, height: numbers[1] ?? 0};
                    },
                    checkValidity: text =>
                        checkValidity(text, allowNegative, normalizedMin, normalizedMax),
                }),
            ],
        }),
    });
}

/**
 * Checks whether a given piece of text is a valid coordinate input
 * @param text The text to be checked
 * @param allowNegative Whether to allow negative values
 * @param min The minimum values
 * @param max The maximum values
 * @returns An input error if present
 */
const checkValidity = (
    text: string,
    allowNegative?: boolean,
    min?: readonly [number, number],
    max?: readonly [number, number]
): IInputError | undefined => {
    const match = text.match(
        allowNegative
            ? /([^\s\d\-]*)(\s*)(-?\d*)(\s*)([^\s,]*)(\s*)(,?)(\s*)([^\s\d\-]*)(\s*)(-?\d*)(\s*)(.*)/
            : /([^\s\d]*)(\s*)(\d*)(\s*)([^\s,]*)(\s*)(,?)(\s*)([^\s\d]*)(\s*)(\d*)(\s*)(.*)/
    );
    if (match) {
        const extraRanges = match.slice(1).reduce(
            ({ranges, index}, value, i) => {
                const end = index + value.length;
                if (i % 4 == 0 && value.length > 0)
                    return {
                        index: end,
                        ranges: [...ranges, {start: index, end}],
                    };
                return {ranges, index: end};
            },
            {ranges: [], index: 0}
        ).ranges;
        if (extraRanges.length > 0)
            return {
                message: "Invalid characters",
                ranges: extraRanges,
            };

        const missingRanges = match.slice(1).reduce(
            ({ranges, index}, value, i) => {
                const end = index + value.length;
                if (i % 4 == 2 && value.length == 0)
                    return {
                        index: end,
                        ranges: [...ranges, {start: index, end}],
                    };
                return {ranges, index: end};
            },
            {ranges: [], index: 0}
        ).ranges;
        if (missingRanges.length > 0)
            return {
                message: "Invalid format, should be 'x, y'",
                ranges: missingRanges,
            };

        const v1 = Number(match[3]);
        const v2 = Number(match[11]);
        if (min && (v1 < min[0] || v2 < min[1]))
            return {
                message: `Values should be at least: ${min[0]}, ${min[1]}`,
                ranges: [],
            };
        if (max && (v1 < max[0] || v2 < max[1]))
            return {
                message: `Values should be at most: ${max[0]}, ${max[1]}`,
                ranges: [],
            };
    } else {
        // I don't think this case is reachable, but just in case
        return {
            message: "Invalid format, should be 'x, y'",
            ranges: [{start: 0, end: text.length}],
        };
    }
};
