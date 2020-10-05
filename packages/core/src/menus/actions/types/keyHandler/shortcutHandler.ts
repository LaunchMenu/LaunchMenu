import {keyHandlerAction} from "./keyHandlerAction";
import {IItemShortcutHandler} from "./_types/IItemShortcutHandler";

/**
 * Creates a keyHandlerAction handler specifically for handling single shortcuts
 */
export const shortcutHandler = keyHandlerAction.createHandler(
    (shortcuts: IItemShortcutHandler[]) => {
        return {
            onKey: (key, context) => {
                return false; // TODO: implement when having access to onExecute
                // const normalizedShortcuts = shortcuts.map((({shortcut})=>shortcut instanceof Function ? shortcut(context) : shortcut);
                // return normalizedShortcuts.reduce((cur, shortcut)=>{
                //     if(!cur && shortcut.matches(key)) {

                //         return true;
                //     }
                //     return cur;
                // }, false);
            },
        };
    }
);
