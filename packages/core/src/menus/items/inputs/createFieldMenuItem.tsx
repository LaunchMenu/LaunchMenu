import React, {memo} from "react";
import {IFieldMenuItemData} from "./_types/IFieldMenuItemData";
import {IFieldMenuItem} from "./_types/IFieldMenuItem";
import {Field, IDataHook, useDataHook} from "model-react";
import {MenuItemFrame} from "../../../components/items/MenuItemFrame";
import {MenuItemLayout} from "../../../components/items/MenuItemLayout";
import {MenuItemIcon} from "../../../components/items/MenuItemIcon";
import {Truncated} from "../../../components/Truncated";
import {Box} from "../../../styling/box/Box";
import {resetFieldAction} from "./resetFieldAction";
import {adjustBindings} from "../adjustBindings";
import {getHooked} from "../../../utils/subscribables/getHooked";
import {IActionBinding} from "../../../actions/_types/IActionBinding";
import {createStandardActionBindings} from "../createStandardActionBindings";
import {ShortcutLabel} from "../../../components/items/ShortcutLabel";
import {IJSON} from "../../../_types/IJSON";
import {ISerializableField} from "../../../settings/_types/ISerializableField";
import {IMenuItemView} from "../_types/IMenuItemView";
import {IField} from "../../../_types/IField";
import {ISerializeField} from "../../../settings/storage/fileTypes/FieldsFile/_types/ISerializedField";
import {simpleSearchHandler} from "../../../actions/types/search/tracedRecursiveSearch/simpleSearch/simpleSearchHandler";

// TODO: try to fix the types (removing any)

/**
 * Creates a new field menu item
 * @param data The data to create the menu item with
 * @returns The created field menu item
 */
export function createFieldMenuItem<D extends IJSON, T = D>({
    data,
    ...fieldData
}: IFieldMenuItemData<T, D>): IFieldMenuItem<T, D> {
    let init: T;
    let f: ISerializableField<T, D>;
    if ("field" in fieldData) {
        f = fieldData.field;
        init = fieldData.init ?? f.get();
    } else {
        f = new Field(fieldData.init) as any;
        init = fieldData.init;
    }
    const field: ISerializableField<T, D> = f;

    const {valueView, resetable, resetUndoable, actionBindings, ...rest} = data(field);
    const extraBindings: IActionBinding[] = [];
    if (resetable)
        extraBindings.push(
            resetFieldAction.createBinding({
                default: init,
                field,
                undoable: resetUndoable,
            })
        );

    let bindings = createStandardActionBindings(
        {
            ...rest,
            actionBindings: adjustBindings(actionBindings ?? [], extraBindings),
        },
        () => item,
        undefined
    );

    const {name, icon, description, shortcut} = rest;

    function isSerializeable(
        field: ISerializableField<any, any>
    ): field is IField<T> & ISerializeField<D> {
        return "getSerialized" in field;
    }
    const item = {
        get: (hook?: IDataHook) => field.get(hook),
        set: (value: T) => field.set(value),
        ...(isSerializeable(field) && {
            getSerialized: (hook?: IDataHook) => field.getSerialized(hook),
            setSerialized: (value: D) => field.setSerialized(value),
        }),
        view: memo(({highlight, ...props}) => {
            const [h] = useDataHook();
            const iconV = getHooked(icon, h);
            const descriptionV = getHooked(description, h);
            return (
                <MenuItemFrame {...props}>
                    <MenuItemLayout
                        icon={iconV && <MenuItemIcon icon={iconV} />}
                        name={
                            <Box font="header">
                                <simpleSearchHandler.Highlighter
                                    query={highlight}
                                    pattern={rest.searchPattern}>
                                    {name}
                                </simpleSearchHandler.Highlighter>
                            </Box>
                        }
                        value={valueView}
                        shortcut={shortcut && <ShortcutLabel shortcut={shortcut} />}
                        description={
                            descriptionV && (
                                <Truncated title={descriptionV}>
                                    <simpleSearchHandler.Highlighter
                                        query={highlight}
                                        pattern={rest.searchPattern}>
                                        {descriptionV}
                                    </simpleSearchHandler.Highlighter>
                                </Truncated>
                            )
                        }
                    />
                </MenuItemFrame>
            );
        }) as IMenuItemView,
        actionBindings: bindings,
    } as any;
    return item;
}
