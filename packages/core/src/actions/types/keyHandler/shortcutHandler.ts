import {createAction} from "../../createAction";
import {IActionBinding} from "../../_types/IActionBinding";
import {IActionTarget} from "../../_types/IActionTarget";
import {executeAction} from "../execute/executeAction";
import {keyHandlerAction} from "./keyHandlerAction";
import {IItemShortcutHandler} from "./_types/IItemShortcutHandler";

/**
 * An action key handler specifically for handling shortcuts and execute an action when the shortcut is triggered
 */
export const shortcutHandler = createAction({
    name: "shortcut handler",
    parents: [keyHandlerAction],
    core: (shortcuts: IItemShortcutHandler[]) => ({
        children: [
            keyHandlerAction.createBinding({
                onKey: (key, menu, menuOnExecute) => {
                    // Normalize the data by making sure the shortcut is always a pattern, and that we have 1 getter for obtaining the action target
                    const normalizedShortcuts = shortcuts.map(
                        ({shortcut, ...data}, i) => ({
                            shortcut:
                                shortcut instanceof Function
                                    ? shortcut(menu.getContext())
                                    : shortcut,
                            getTarget: (): IActionTarget => {
                                if ("target" in data)
                                    if (data.target instanceof Function)
                                        return data.target();
                                    else return data.target;
                                else {
                                    let binding: IActionBinding;
                                    if ("action" in data.onExecute)
                                        binding = data.onExecute;
                                    else
                                        binding = executeAction.createBinding(
                                            data.onExecute
                                        );
                                    return {actionBindings: [binding]};
                                }
                            },
                        })
                    );

                    return normalizedShortcuts.reduce((cur, {shortcut, getTarget}) => {
                        if (!cur && shortcut.matches(key)) {
                            executeAction.execute(
                                menu.getContext(),
                                [getTarget()],
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
