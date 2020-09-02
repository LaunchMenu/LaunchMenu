import React from "react";
import {createFieldMenuItem} from "../createFieldMenuItem";
import {IFieldMenuItem} from "../_types/IFieldMenuItem";
import {Loader} from "model-react";
import {IBooleanMenuItemData} from "./_types/IBooleanMenuItemData";
import {booleanInputExecuteHandler} from "../handlers/boolean/booleanInputExecuteHandler";

/**
 * Creates a new boolean menu item
 * @param data The configuration data of the field
 * @returns The menu item
 */
export function createBooleanMenuItem({
    init,
    name,
    liveUpdate,
    undoable,
    actionBindings = [],
    tags = [],
    resetable,
    resetUndoable = undoable,
    ...rest
}: IBooleanMenuItemData): IFieldMenuItem<boolean> {
    return createFieldMenuItem({
        init,
        data: field => ({
            name,
            valueView: <Loader>{h => field.get(h).toString()}</Loader>,
            tags: ["field", ...tags],
            resetable,
            resetUndoable,
            actionBindings: [
                ...actionBindings,
                booleanInputExecuteHandler.createBinding({
                    field,
                    liveUpdate: liveUpdate as any,
                    undoable,
                }),
            ],
            ...rest,
        }),
    });
}
