import {createAction} from "../../createAction";
import {IActionBinding} from "../../_types/IActionBinding";
import {IActionTarget} from "../../_types/IActionTarget";
import {executeAction} from "../execute/executeAction";
import {identityAction} from "../identity/identityAction";
import {keyHandlerAction} from "./keyHandlerAction";
import {IItemShortcutHandler} from "./_types/IItemShortcutHandler";

/**
 * An action key handler specifically for handling shortcuts and execute an action when the shortcut is triggered
 */
export const shortcutHandler = createAction({
    name: "shortcut handler",
    parents: [keyHandlerAction],
    core: (shortcuts: IItemShortcutHandler[], _1, _2, items) => ({
        children: [
            keyHandlerAction.createBinding({
                onKey: (key, menu, menuOnExecute) => {
                    // Normalize the data by making sure the shortcut is always a pattern, and that we have 1 getter for obtaining the action target
                    const normalizedShortcuts = shortcuts.map(({shortcut, ...data}) => ({
                        shortcut:
                            shortcut instanceof Function
                                ? shortcut(menu.getContext())
                                : shortcut,
                        getTarget: (): IActionTarget | undefined => {
                            if ("itemID" in data) {
                                const IDMap = identityAction.get(items);
                                return IDMap.get(data.itemID)?.();
                            } else {
                                let binding: IActionBinding;
                                if ("action" in data.onExecute) binding = data.onExecute;
                                else
                                    binding = executeAction.createBinding(data.onExecute);
                                return {actionBindings: [binding]};
                            }
                        },
                    }));

                    return normalizedShortcuts.reduce((cur, {shortcut, getTarget}) => {
                        if (!cur && shortcut.matches(key)) {
                            const target = getTarget();
                            if (target)
                                executeAction.execute(
                                    menu.getContext(),
                                    [target],
                                    menuOnExecute
                                );
                            return true;
                        }
                        return cur;
                    }, false);
                },
            }),
        ],
    }),
});
