import React from "react";
import {createFieldMenuItem} from "../createFieldMenuItem";
import {IFieldMenuItem} from "../_types/IFieldMenuItem";
import {Loader} from "model-react";
import {IColorMenuItemData} from "./_types/IColorMenuItemData";
import {ColorPreview} from "../../../../components/items/inputs/ColorPreview";
import {promptColorInputExecuteHandler} from "../handlers/color/promptColorInputExecuteHandler";
import {adjustSubscribable} from "../../../../utils/subscribables/adjustSubscribable";

/**
 * Creates a new color menu item
 * @param data The configuration data of the field
 * @returns The menu item
 */
export function createColorMenuItem({
    init,
    name,
    liveUpdate,
    undoable,
    actionBindings = [],
    tags = [],
    resetUndoable = undoable,
    ...rest
}: IColorMenuItemData): IFieldMenuItem<string> {
    return createFieldMenuItem({
        init,
        data: field => ({
            name,
            valueView: (
                <Loader>{h => <ColorPreview color={field.get(h)} size={30} />}</Loader>
            ),
            tags: adjustSubscribable(tags, (tags, h) => [
                "field",
                ...tags,
                field.get(h).toString(),
            ]),
            resetUndoable,
            actionBindings: adjustSubscribable(actionBindings, bindings => [
                ...bindings,
                promptColorInputExecuteHandler.createBinding({
                    field,
                    liveUpdate: liveUpdate as any,
                    undoable,
                }),
            ]),
            ...rest,
        }),
    });
}
