import {IContextActionConfig} from "./_types/IContextActionConfig";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {IContextActionCore} from "./_types/IContextActionCore";
import {IContextMenuItemGetter} from "./_types/IContextMenuItemGetter";
import {createStandardMenuItem} from "../../items/createStandardMenuItem";
import {keyHandlerAction} from "../types/keyHandler/keyHandlerAction";
import {TGetActionCoreOutput} from "./_types/TGetActionCoreOutput";
import {TGetActionCoreInput} from "./_types/TGetActionCoreInput";
import {IActionCore} from "../_types/IActionCore";
import {IContextActionResult} from "./_types/IContextActionResult";

/**
 * Creates an action that can be displayed in a menu like the context menu
 * @param getter The getter of the action data
 * @param config The configuration for the menu item
 * @returns A context action core
 */
export function createContextAction<
    G extends IActionCore<I, O>,
    I,
    O extends IContextActionResult
>(
    getter: G,
    {
        shortcut,
        actionBindings,
        name,
        icon,
        description,
        tags,
        closeOnExecute,
    }: IContextActionConfig
): IContextActionCore<
    TGetActionCoreInput<G>,
    TGetActionCoreOutput<G> & {getMenuItem: IContextMenuItemGetter}
> {
    return ((data, items) => {
        const actionGetterResult = getter(data, items);

        // Retrieve the original result as well as a menu item getter
        return {
            ...actionGetterResult,
            getMenuItem: ((context, closeMenu) => {
                //  Create an execute method that closes the menu when called
                const executeItem = () => {
                    const result = actionGetterResult.execute(context, closeMenu);
                    if (closeOnExecute != false && closeMenu) closeMenu();
                    return result;
                };

                // Create shortcut bindings if requested
                const shortcutBinding =
                    shortcut &&
                    keyHandlerAction.createBinding({
                        onKey: e => {
                            if (e.is(shortcut)) {
                                executeItem();
                                return true;
                            }
                        },
                    });

                // Create the menu item
                return createStandardMenuItem({
                    name: name + (shortcut ? `(${shortcut.join("+")})` : ""),
                    description,
                    icon,
                    tags,
                    onExecute: executeItem,
                    actionBindings: shortcutBinding
                        ? actionBindings
                            ? [shortcutBinding, ...actionBindings]
                            : [shortcutBinding]
                        : undefined,
                }) as IMenuItem;
            }) as IContextMenuItemGetter,
        };
    }) as any;
}
