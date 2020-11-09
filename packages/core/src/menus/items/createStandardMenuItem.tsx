import React, {memo} from "react";
import {IMenuItem} from "./_types/IMenuItem";
import {IStandardMenuItemData} from "./_types/IStandardMenuItemData";
import {MenuItemFrame} from "../../components/items/MenuItemFrame";
import {Truncated} from "../../components/Truncated";
import {MenuItemLayout} from "../../components/items/MenuItemLayout";
import {MenuItemIcon} from "../../components/items/MenuItemIcon";
import {SimpleSearchHighlight} from "../../components/items/SimpleSearchHighlight";
import {useDataHook} from "../../utils/modelReact/useDataHook";
import {adjustBindings} from "./adjustBindings";
import {getHooked} from "../../utils/subscribables/getHooked";
import {useIOContext} from "../../context/react/useIOContext";
import {Box} from "../../styling/box/Box";
import {getCategoryAction} from "../../actions/types/category/getCategoryAction";
import {executeAction} from "../../actions/types/execute/executeAction";
import {IActionBinding} from "../../actions/_types/IActionBinding";
import {ISubscribable} from "../../utils/subscribables/_types/ISubscribable";
import {simpleSearchHandler} from "../../actions/types/search/simpleSearch/simpleSearchHandler";
import {onSelectAction} from "../../actions/types/onSelect/onSelectAction";
import {onCursorAction} from "../../actions/types/onCursor/onCursorAction";
import {onMenuChangeAction} from "../../actions/types/onMenuChange/onMenuChangAction";
import {openMenuItemContentHandler} from "../../actions/types/onCursor/openMenuItemContentHandler";
import {shortcutHandler} from "../../actions/types/keyHandler/shortcutHandler";

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
    category,
    shortcut,
    content,
    searchPattern,
    actionBindings,
    onExecute,
    executePassively = false,
    onSelect,
    onCursor,
    onMenuChange,
}: IStandardMenuItemData): IMenuItem {
    const generatedBindings: IActionBinding[] = [
        simpleSearchHandler.createBinding({
            name,
            description,
            patternMatcher: searchPattern,
            tags,
            item: () => item,
        }),
    ];
    if (onExecute)
        generatedBindings.push(
            executeAction.createBinding({execute: onExecute, passive: executePassively})
        );
    if (onSelect) generatedBindings.push(onSelectAction.createBinding(onSelect));
    if (onCursor) generatedBindings.push(onCursorAction.createBinding(onCursor));
    if (onMenuChange)
        generatedBindings.push(onMenuChangeAction.createBinding(onMenuChange));
    if (category) generatedBindings.push(getCategoryAction.createBinding(category));
    if (content)
        generatedBindings.push(openMenuItemContentHandler.createBinding(content));
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

    const item: IMenuItem & {debugID: string} = {
        view: memo(({highlight, ...props}) => {
            const [h] = useDataHook();
            const ioContext = useIOContext();
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

                                {/* TODO: make some proper UI, also make that UI for other std menu items */}
                                {shortcut && (
                                    <Box marginLeft="large" display="inline">
                                        {(shortcut instanceof Function
                                            ? ioContext
                                                ? shortcut(ioContext)
                                                : ""
                                            : shortcut
                                        ).toString()}
                                    </Box>
                                )}

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
        get debugID(): string {
            return `StandardMenuItem: ${
                getHooked(name) +
                (getHooked(description) ? ", " + getHooked(description) : "")
            }`;
        },
    };
    return item;
}
