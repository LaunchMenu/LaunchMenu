import {createAction} from "../../createAction";
import {IMenuChangeable} from "./_types/IMenuChangeable";

/**
 * An action that's used as an event listener for when the item is added to or removed from a menu
 */
export const onMenuChangeAction = createAction({
    name: "on menu change",
    core: (listeners: IMenuChangeable[]) => ({
        result: {
            onMenuChange: ((menu, added) =>
                listeners.forEach(onMenuChange =>
                    onMenuChange(menu, added)
                )) as IMenuChangeable,
        },
    }),
});
