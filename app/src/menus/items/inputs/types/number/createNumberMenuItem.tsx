import React from "react";
import {createFieldMenuItem} from "../../createFieldMenuItem";
import {IFieldMenuItem} from "../../_types/IFieldMenuItem";
import {Loader} from "model-react";
import {INumberMenuItemData} from "./_types/INumberMenuItemData";
import {numberInputExecuteHandler} from "../../handlers/number/numberInputExecuteHandler";
import {numberInputSelectExecuteHandler} from "../../handlers/number/numberInputSelectExecuteHandler";

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
    description,
    actionBindings = [],
    checkValidity,
    tags = [],
    options,
    allowCustomInput,
    resetable,
    resetUndoable = undoable,
    ...rest
}: INumberMenuItemData): IFieldMenuItem<number> {
    return createFieldMenuItem({
        init,
        data: field => ({
            name,
            valueView: <Loader>{h => field.get(h)}</Loader>,
            tags: ["field", ...tags],
            description,
            resetable,
            resetUndoable,
            actionBindings: [
                ...actionBindings,
                options
                    ? numberInputSelectExecuteHandler.createBinding({
                          field,
                          options,
                          allowCustomInput,
                          liveUpdate: liveUpdate as any,
                          undoable,
                          ...rest,
                      })
                    : numberInputExecuteHandler.createBinding({
                          field,
                          liveUpdate: liveUpdate as any,
                          undoable,
                          ...rest,
                      }),
            ],
        }),
    });
}
