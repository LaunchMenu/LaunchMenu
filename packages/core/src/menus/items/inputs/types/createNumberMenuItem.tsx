import React from "react";
import {createFieldMenuItem} from "../createFieldMenuItem";
import {IFieldMenuItem} from "../_types/IFieldMenuItem";
import {Loader} from "model-react";
import {INumberMenuItemData} from "./_types/INumberMenuItemData";
import {promptNumberInputExecuteHandler} from "../handlers/number/promptNumberInputExecuteHandler";
import {promptNumberInputSelectExecuteHandler} from "../handlers/number/promptNumberInputSelectExecuteHandler";
import {adjustSubscribable} from "../../../../utils/subscribables/adjustSubscribable";

/**
 * Creates a new string menu item
 * @param data The configuration data of the field
 * @returns The menu item
 */
export function createNumberMenuItem({
    init,
    name,
    liveUpdate,
    undoable,
    actionBindings = [],
    checkValidity,
    tags = [],
    options,
    allowCustomInput,
    resetUndoable = undoable,
    min,
    max,
    baseValue,
    increment,
    ...rest
}: INumberMenuItemData): IFieldMenuItem<number> {
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
                options
                    ? promptNumberInputSelectExecuteHandler.createBinding({
                          field,
                          options,
                          allowCustomInput,
                          liveUpdate: liveUpdate as any,
                          undoable,
                          min,
                          max,
                          baseValue,
                          increment,
                          checkValidity,
                      })
                    : promptNumberInputExecuteHandler.createBinding({
                          field,
                          liveUpdate: liveUpdate as any,
                          undoable,
                          min,
                          max,
                          baseValue,
                          increment,
                          checkValidity,
                      }),
            ]),
            ...rest,
        }),
    });
}
