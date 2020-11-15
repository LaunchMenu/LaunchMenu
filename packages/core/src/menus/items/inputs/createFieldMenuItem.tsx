import React, {memo} from "react";
import {IFieldMenuItemData} from "./_types/IFieldMenuItemData";
import {IFieldMenuItem} from "./_types/IFieldMenuItem";
import {Field} from "model-react";
import {useDataHook} from "../../../utils/modelReact/useDataHook";
import {MenuItemFrame} from "../../../components/items/MenuItemFrame";
import {MenuItemLayout} from "../../../components/items/MenuItemLayout";
import {MenuItemIcon} from "../../../components/items/MenuItemIcon";
import {SimpleSearchHighlight} from "../../../components/items/SimpleSearchHighlight";
import {Truncated} from "../../../components/Truncated";
import {Box} from "../../../styling/box/Box";
import {resetFieldAction} from "./resetFieldAction";
import {adjustBindings} from "../adjustBindings";
import {getHooked} from "../../../utils/subscribables/getHooked";
import {getCategoryAction} from "../../../actions/types/category/getCategoryAction";
import {executeAction} from "../../../actions/types/execute/executeAction";
import {onSelectAction} from "../../../actions/types/onSelect/onSelectAction";
import {onCursorAction} from "../../../actions/types/onCursor/onCursorAction";
import {onMenuChangeAction} from "../../../actions/types/onMenuChange/onMenuChangAction";
import {openMenuItemContentHandler} from "../../../actions/types/onCursor/openMenuItemContentHandler";
import {shortcutHandler} from "../../../actions/types/keyHandler/shortcutHandler";
import {simpleSearchHandler} from "../../../actions/types/search/simpleSearch/simpleSearchHandler";
import {IActionBinding} from "../../../actions/_types/IActionBinding";
import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";
import {menuItemIdentityAction} from "../../../actions/types/identity/menuItemIdentityAction";
import {createStandardActionBindings} from "../createStandardActionBindings";
import {ShortcutLabel} from "../../../components/items/ShortcutLabel";

// TODO: reuse standard menu item to reduce code duplication

/**
 * Creates a new field menu item
 * @param data The data to create the menu item with
 * @returns The created field menu item
 */
export function createFieldMenuItem<T>({
    init,
    data,
}: IFieldMenuItemData<T>): IFieldMenuItem<T> {
    const field = new Field(init);
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

    const item: IFieldMenuItem<T> = {
        get: (hook = null) => field.get(hook),
        set: value => field.set(value),
        view: memo(({highlight, ...props}) => {
            const [h] = useDataHook();
            const iconV = getHooked(icon, h);
            const descriptionV = getHooked(description, h);
            const nameV = getHooked(name, h);
            return (
                <MenuItemFrame {...props}>
                    <MenuItemLayout
                        icon={
                            iconV &&
                            (typeof iconV == "string" ? (
                                <MenuItemIcon icon={iconV} />
                            ) : (
                                iconV
                            ))
                        }
                        name={
                            <Box font="header">
                                <SimpleSearchHighlight query={highlight}>
                                    {nameV}
                                </SimpleSearchHighlight>
                            </Box>
                        }
                        value={valueView}
                        shortcut={shortcut && <ShortcutLabel shortcut={shortcut} />}
                        description={
                            descriptionV && (
                                <Truncated title={descriptionV}>
                                    <SimpleSearchHighlight query={highlight}>
                                        {descriptionV}
                                    </SimpleSearchHighlight>
                                </Truncated>
                            )
                        }
                    />
                </MenuItemFrame>
            );
        }),
        actionBindings: bindings,
    };
    return item;
}
