import React from "react";
import {createFieldMenuItem} from "../createFieldMenuItem";
import {IFieldMenuItem} from "../_types/IFieldMenuItem";
import {IStringMenuItemData} from "./_types/IStringMenuItemData";
import {Loader} from "model-react";
import {adjustSubscribable} from "../../../../utils/subscribables/adjustSubscribable";
import {promptInputExecuteHandler} from "../../../../uiLayers/types/input/promptInputExecuteHandler";

/**
 * Creates a new string menu item
 * @param data The configuration data of the field
 * @returns The menu item
 */
export function createStringMenuItem({
    init,
    name,
    liveUpdate,
    undoable,
    actionBindings = [],
    checkValidity,
    tags = [],
    resetUndoable = undoable,
    ...rest
}: IStringMenuItemData): IFieldMenuItem<string> {
    return createFieldMenuItem({
        init,
        data: field => ({
            name,
            valueView: <Loader>{h => field.get(h)}</Loader>,
            tags: adjustSubscribable(tags, (tags, h) => [
                "field",
                ...tags,
                field.get(h).toString(),
            ]),
            resetUndoable,
            actionBindings: adjustSubscribable(actionBindings, bindings => [
                ...bindings,
                promptInputExecuteHandler.createBinding({
                    field,
                    liveUpdate,
                    undoable,
                    checkValidity,
                }),
            ]),
            ...rest,
        }),
    });
}
