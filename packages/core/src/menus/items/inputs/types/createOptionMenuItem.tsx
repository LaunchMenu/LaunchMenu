import React from "react";
import {createFieldMenuItem} from "../createFieldMenuItem";
import {IFieldMenuItem} from "../_types/IFieldMenuItem";
import {Loader} from "model-react";
import {adjustSubscribable} from "../../../../utils/subscribables/adjustSubscribable";
import {adjustBindings} from "../../adjustBindings";
import {IOptionMenuItemData} from "./_types/IOptionMenuItemData";
import {IJSON} from "../../../../_types/IJSON";
import {promptSelectExecuteHandler} from "../../../../uiLayers/types/select/promptSelectExecuteHandler";

/**
 * Creates a new option menu item
 * @param data The configuration data of the field
 * @returns The menu item
 */
export function createOptionMenuItem<T extends IJSON>({
    init,
    options,
    createOptionView,
    getValueView,
    name,
    liveUpdate,
    undoable,
    actionBindings = [],
    tags = [],
    resetUndoable = undoable,
    ...rest
}: IOptionMenuItemData<T>): IFieldMenuItem<T> {
    return createFieldMenuItem<T, T>({
        init: init as any,
        data: field => ({
            name,
            valueView: (
                <Loader>
                    {h => {
                        const value = field.get(h);
                        return getValueView?.(value) ?? value?.toString();
                    }}
                </Loader>
            ),
            tags: adjustSubscribable(tags, (tags, h) => [
                "field",
                ...tags,
                ...(field.get(h)?.toString instanceof Function
                    ? [(field.get(h) as any).toString()]
                    : []),
            ]),
            resetUndoable,
            actionBindings: adjustBindings(actionBindings, [
                promptSelectExecuteHandler.createBinding({
                    field,
                    options,
                    createOptionView,
                }),
            ]),
            ...rest,
        }),
    });
}
