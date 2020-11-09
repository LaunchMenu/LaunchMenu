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
    const {
        valueView,
        name,
        icon,
        description,
        tags,
        content,
        shortcut,
        onExecute,
        onSelect,
        onCursor,
        onMenuChange,
        category,
        resetable,
        resetUndoable,
        actionBindings,
        searchPattern,
    } = data(field);

    let generatedBindings: IActionBinding[] = [
        simpleSearchHandler.createBinding({
            name,
            description,
            tags,
            patternMatcher: searchPattern,
            item: () => item,
        }),
    ];
    if (onExecute) generatedBindings.push(executeAction.createBinding(onExecute));
    if (onSelect) generatedBindings.push(onSelectAction.createBinding(onSelect));
    if (onCursor) generatedBindings.push(onCursorAction.createBinding(onCursor));
    if (onMenuChange)
        generatedBindings.push(onMenuChangeAction.createBinding(onMenuChange));
    if (category) generatedBindings.push(getCategoryAction.createBinding(category));
    if (content)
        generatedBindings.push(openMenuItemContentHandler.createBinding(content));
    if (resetable)
        generatedBindings.push(
            resetFieldAction.createBinding({
                default: init,
                field,
                undoable: resetUndoable,
            })
        );
    if (shortcut)
        generatedBindings.push(
            shortcutHandler.createBinding({shortcut, target: () => item})
        );

    // Combine the input action bindings with the created ones
    let bindings: ISubscribable<IActionBinding[]> = generatedBindings;
    if (actionBindings)
        bindings = adjustBindings(actionBindings, actionBindings => [
            ...actionBindings,
            ...generatedBindings,
        ]);

    const item: IFieldMenuItem<T> = {
        get: (hook = null) => field.get(hook),
        set: value => field.set(value),
        view: memo(({highlight, ...props}) => {
            const [h] = useDataHook();
            const ico = getHooked(icon, h);
            const desc = getHooked(description, h);
            return (
                <MenuItemFrame {...props}>
                    <MenuItemLayout
                        icon={
                            ico &&
                            (typeof ico == "string" ? <MenuItemIcon icon={ico} /> : ico)
                        }
                        content={
                            <>
                                <SimpleSearchHighlight query={highlight}>
                                    {getHooked(name, h)}
                                </SimpleSearchHighlight>
                                :
                                <Box display="inline" marginLeft="small">
                                    {valueView}
                                </Box>
                                {desc && (
                                    <Truncated title={desc}>
                                        <SimpleSearchHighlight query={highlight}>
                                            {desc}
                                        </SimpleSearchHighlight>
                                    </Truncated>
                                )}
                            </>
                        }
                    />
                </MenuItemFrame>
            );
        }),
        actionBindings: bindings,
    };
    return item;
}
