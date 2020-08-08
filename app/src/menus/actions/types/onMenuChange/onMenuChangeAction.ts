import {Action} from "../../Action";
import {IMenuChangeable} from "./_types/IMenuChangeable";

/**
 * An action that's used as an event listener for when the item is added to or removed from a menu
 */
export const onMenuChangeAction = new Action((listeners: IMenuChangeable[]) => {
    return {
        onMenuChange: (menu, added) =>
            listeners.forEach(menuChangeable => menuChangeable.onMenuChange(menu, added)),
    } as IMenuChangeable;
}, []);
