import React from "react";
import {
    createFieldMenuItem,
    IActionBinding,
    IField,
    IInputError,
    inputExecuteHandler,
    IPosition,
    settingPatternMatcher,
} from "@launchmenu/core";
import {Loader} from "model-react";

/**
 * Creates a setting to control window positions
 * @param param0
 */
export function createWindowPositionSetting({
    name,
    actionBindings = () => [],
}: {
    name: string;
    actionBindings?: (field: IField<IPosition>) => IActionBinding[];
}) {
    return createFieldMenuItem({
        init: {x: 0, y: 0},
        data: field => ({
            name,
            valueView: (
                <Loader>
                    {h => {
                        const {x, y} = field.get(h);
                        return `${x}, ${y}`;
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
                    serialize: ({x, y}) => `${x}, ${y}`,
                    deserialize: text => {
                        const numbers = text.split(",").map(v => {
                            const number = Number(v);
                            if (isNaN(number)) return 0;
                            return number ?? 0;
                        });
                        return {x: numbers[0] ?? 0, y: numbers[1] ?? 0};
                    },
                    checkValidity,
                }),
            ],
        }),
    });
}

/**
 * Checks whether a given piece of text is a valid coordinate input
 * @param text The text to be checked
 * @returns An input error if present
 */
const checkValidity = (text: string): IInputError | undefined => {
    const match = text.match(
        /([^\s\d\-]*)(\s*)(-?\d*)(\s*)([^\s,]*)(\s*)(,?)(\s*)([^\s\d\-]*)(\s*)(-?\d*)(\s*)(.*)/
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
    }
};
