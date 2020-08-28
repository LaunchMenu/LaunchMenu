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

const get = <T extends unknown>(f: T, h?: IDataHook) =>
    f instanceof Function ? f(h) : f;

/**
 * Creates a new field menu item
 * @param data The data to create the menu item with
 * @returns The created field menu item
 */
export function createFieldMenuItem<T>({
    default: def,
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
    actionBindings = [],
}: IFieldMenuItemData<T>): IFieldMenuItem<T> {
    const field = new Field(def);

    let bindings: IActionBinding<any>[] = [
        // TODO: make the action actually update if any of these change
        createSimpleSearchBinding({
            name: get(name),
            description: get(description),
            tags: get(tags),
        }),
        ...actionBindings,
    ];
    if (onExecute) bindings.push(executeAction.createBinding({execute: onExecute}));
    if (onSelect) bindings.push(onSelectAction.createBinding({onSelect}));
    if (onCursor) bindings.push(onCursorAction.createBinding({onCursor}));
    if (onMenuChange) bindings.push(onMenuChangeAction.createBinding({onMenuChange}));
    if (category) bindings.push(getCategoryAction.createBinding(category));

    return {
        get: hook => field.get(hook),
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
