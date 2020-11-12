import {createAction} from "../../createAction";
import {ISelectable} from "./_types/ISelectable";

/**
 * An action that's use as an event listener for when an item gets selected
 */
export const onSelectAction = createAction({
    name: "on select",
    core: (listeners: ISelectable[]) => ({
        result: {
            onSelect: ((selected, menu) =>
                listeners.forEach(onSelect => onSelect(selected, menu))) as ISelectable,
        },
    }),
});
