import React, {memo} from "react";
import {IMenuItem} from "./_types/IMenuItem";
import {IStandardMenuItemData} from "./_types/IStandardMenuItemData";
import {IActionBinding} from "../actions/_types/IActionBinding";
import {MenuItemFrame} from "../../components/items/MenuItemFrame";
import {Truncated} from "../../components/Truncated";
import {executeAction} from "../actions/types/execute/executeAction";
import {onCursorAction} from "../actions/types/onCursor/onCursorAction";
import {onSelectAction} from "../actions/types/onSelect/onSelectAction";
import {getCategoryAction} from "../actions/types/category/getCategoryAction";
import {MenuItemLayout} from "../../components/items/MenuItemLayout";
import {MenuItemIcon} from "../../components/items/MenuItemIcon";
import {createSimpleSearchBinding} from "../actions/types/search/simpleSearch/simpleSearchHandler";
import {SimpleSearchHighlight} from "../../components/items/SimpleSearchHighlight";
import {onMenuChangeAction} from "../actions/types/onMenuChange/onMenuChangeAction";
import {useDataHook} from "../../utils/modelReact/useDataHook";
import {IDataHook} from "model-react";

const get = <T extends unknown>(f: T, h?: IDataHook) =>
    f instanceof Function ? f(h) : f;

/**
 * Creates a new standard menu item
 * @param data The data to create a simple menu item with
 * @returns The menu item
 */
export function createStandardMenuItem({
    name,
    description,
    tags,
    icon,
    onExecute,
    onSelect,
    onCursor,
    onMenuChange,
    category,
    actionBindings = [],
}: IStandardMenuItemData): IMenuItem {
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
