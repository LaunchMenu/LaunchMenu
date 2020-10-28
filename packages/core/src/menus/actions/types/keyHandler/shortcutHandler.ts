import {executeItems} from "../../../menu/interaction/executeItems";
import {keyHandlerAction} from "./keyHandlerAction";
import {IItemShortcutHandler} from "./_types/IItemShortcutHandler";

/**
 * Creates a keyHandlerAction handler specifically for handling single shortcuts
 */
export const shortcutHandler = keyHandlerAction.createHandler(
    (shortcuts: IItemShortcutHandler[], items) => {
        return {
            onKey: (key, menu, menuOnExecute) => {
                // Normalize the data by making sure the shortcut is always a pattern, and that we have 1 getter for obtaining the data to be executed
                const normalizedShortcuts = shortcuts.map(({shortcut, onExecute}, i) => ({
                    shortcut:
                        shortcut instanceof Function
                            ? shortcut(menu.getContext())
                            : shortcut,
                    getExecutionItems: () =>
                        onExecute
                            ? items[i].map(item => ({item, actionBindings: [onExecute]}))
                            : items[i],
                }));

                return normalizedShortcuts.reduce(
                    (cur, {shortcut, getExecutionItems}) => {
                        if (!cur && shortcut.matches(key)) {
                            executeItems(
                                menu.getContext(),
                                getExecutionItems(),
                                menuOnExecute
                            );
                            return true;
                        }
                        return cur;
                    },
                    false
                );
            },
        };
    }
);
