import React, {memo} from "react";
import {IFieldMenuItemData} from "./_types/IFieldMenuItemData";
import {IFieldMenuItem} from "./_types/IFieldMenuItem";
import {Field, IDataHook} from "model-react";
import {IActionBinding} from "../../actions/_types/IActionBinding";
import {createSimpleSearchBinding} from "../../actions/types/search/simpleSearch/simpleSearchHandler";
import {executeAction} from "../../actions/types/execute/executeAction";
import {onSelectAction} from "../../actions/types/onSelect/onSelectAction";
import {onCursorAction} from "../../actions/types/onCursor/onCursorAction";
import {onMenuChangeAction} from "../../actions/types/onMenuChange/onMenuChangeAction";
import {getCategoryAction} from "../../actions/types/category/getCategoryAction";
import {useDataHook} from "../../../utils/modelReact/useDataHook";
import {MenuItemFrame} from "../../../components/items/MenuItemFrame";
import {MenuItemLayout} from "../../../components/items/MenuItemLayout";
import {MenuItemIcon} from "../../../components/items/MenuItemIcon";
import {SimpleSearchHighlight} from "../../../components/items/SimpleSearchHighlight";
import {Truncated} from "../../../components/Truncated";
import {Box} from "../../../styling/box/Box";
import {resetFieldAction} from "./resetFieldAction";
import {ISubscribableActionBindings} from "../_types/ISubscribableActionBindings";
import {adaptBindings} from "../adjustBindings";

const get = <T extends unknown>(f: T, h?: IDataHook) =>
    f instanceof Function ? f(h) : f;

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
        onExecute,
        onSelect,
        onCursor,
        onMenuChange,
        category,
        resetable,
        resetUndoable,
        actionBindings,
    } = data(field);

    let generatedBindings: IActionBinding<any>[] = [
        // TODO: make the action actually update if any of these change
        createSimpleSearchBinding({
            name: get(name),
            description: get(description),
            tags: get(tags),
        }),
    ];
    if (onExecute)
        generatedBindings.push(executeAction.createBinding({execute: onExecute}));
    if (onSelect) generatedBindings.push(onSelectAction.createBinding({onSelect}));
    if (onCursor) generatedBindings.push(onCursorAction.createBinding({onCursor}));
    if (onMenuChange)
        generatedBindings.push(onMenuChangeAction.createBinding({onMenuChange}));
    if (category) generatedBindings.push(getCategoryAction.createBinding(category));
    if (resetable)
        generatedBindings.push(
            resetFieldAction.createBinding({
                default: init,
                field,
                undoable: resetUndoable,
            })
        );

    // Combine the input action bindings with the created ones
    let bindings = generatedBindings as ISubscribableActionBindings;
    if (actionBindings)
        bindings = adaptBindings(actionBindings, actionBindings => [
            ...actionBindings,
            ...generatedBindings,
        ]);

    return {
        get: (hook = null) => field.get(hook),
        set: value => field.set(value),
        view: memo(({highlight, ...props}) => {
            const [h] = useDataHook();
            const ico = get(icon, h);
            const desc = get(description, h);
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
                                    {get(name, h)}
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
}
