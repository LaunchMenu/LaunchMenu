import React from "react";
import {createFieldMenuItem} from "../createFieldMenuItem";
import {IFieldMenuItem} from "../_types/IFieldMenuItem";
import {Loader} from "model-react";
import {IBooleanMenuItemData} from "./_types/IBooleanMenuItemData";
import {promptBooleanInputExecuteHandler} from "../handlers/boolean/promptBooleanInputExecuteHandler";
import {adjustSubscribable} from "../../../../utils/subscribables/adjustSubscribable";
import {adjustBindings} from "../../adjustBindings";

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
    resetUndoable = undoable,
    ...rest
}: IBooleanMenuItemData): IFieldMenuItem<boolean> {
    return createFieldMenuItem({
        init,
        data: field => ({
            name,
            valueView: <Loader>{h => field.get(h).toString()}</Loader>,
            tags: adjustSubscribable(tags, (tags, h) => [
                "field",
                ...tags,
                field.get(h).toString(),
            ]),
            resetUndoable,
            actionBindings: adjustBindings(actionBindings, [
                promptBooleanInputExecuteHandler.createBinding({
                    field,
                    liveUpdate: liveUpdate as any,
                    undoable,
                }),
            ]),
            ...rest,
        }),
    });
}
