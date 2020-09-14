import React from "react";
import {createFieldMenuItem} from "../createFieldMenuItem";
import {IFieldMenuItem} from "../_types/IFieldMenuItem";
import {Loader} from "model-react";
import {IKeyPatternMenuItemData} from "./_types/IKeyPatternMenuItemData";
import {KeyPattern} from "../handlers/keyPattern/KeyPattern";
import {keyInputExecuteHandler} from "../handlers/keyPattern/keyInputExecuteHandler";
import {advancedKeyInputEditAction} from "../handlers/keyPattern/advancedKeyInputEditAction";
import {adjustSubscribable} from "../../../../utils/subscribables/adjustSubscribable";

/**
 * Creates a new key pattern menu item
 * @param data The configuration data of the field
 * @returns The menu item
 */
export function createKeyPatternMenuItem({
    init,
    name,
    liveUpdate,
    undoable,
    actionBindings = [],
    tags = [],
    resetUndoable = undoable,
    ...rest
}: IKeyPatternMenuItemData): IFieldMenuItem<KeyPattern> {
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
            actionBindings: adjustSubscribable(actionBindings, bindings => [
                ...bindings,
                keyInputExecuteHandler.createBinding({
                    field,
                    liveUpdate: liveUpdate as any,
                    undoable,
                }),
                advancedKeyInputEditAction.createBinding({
                    field,
                    liveUpdate: liveUpdate as any,
                    undoable,
                }),
            ]),
            ...rest,
        }),
    });
}
