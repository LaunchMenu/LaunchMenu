import React from "react";
import {createFieldMenuItem} from "../createFieldMenuItem";
import {IFieldMenuItem} from "../_types/IFieldMenuItem";
import {Field, IDataHook, Loader} from "model-react";
import {IKeyPatternMenuItemData} from "./_types/IKeyPatternMenuItemData";
import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {promptKeyInputExecuteHandler} from "../handlers/keyPattern/promptKeyInputExecuteHandler";
import {advancedKeyInputEditAction} from "../handlers/keyPattern/advancedKeyInputEditAction";
import {adjustSubscribable} from "../../../../utils/subscribables/adjustSubscribable";
import {IKeyArrayPatternData} from "../handlers/keyPattern/_types/IKeyPatternData";
import {ShortcutLabel} from "../../../../components/items/ShortcutLabel";

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
    const field = new Field(init);
    const serializableField = {
        get: (h: IDataHook) => field.get(h),
        set: (value: KeyPattern) => field.set(value),
        getSerialized: (h: IDataHook) => field.get(h).serialize(),
        setSerialized: (value: IKeyArrayPatternData[]) =>
            field.set(new KeyPattern(value)),
    };
    return createFieldMenuItem({
        field: serializableField,
        data: field => ({
            name,
            valueView: (
                <Loader>
                    {h => <ShortcutLabel shortcut={field.get(h)} explicitEmpty />}
                </Loader>
            ),
            tags: adjustSubscribable(tags, (tags, h) => [
                "field",
                ...tags,
                field.get(h).toString(),
            ]),
            resetUndoable,
            actionBindings: adjustSubscribable(actionBindings, bindings => [
                ...bindings,
                promptKeyInputExecuteHandler.createBinding({
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
