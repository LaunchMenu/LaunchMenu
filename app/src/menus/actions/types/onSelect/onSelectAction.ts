import {Action} from "../../Action";
import {ISelectable} from "./_types/ISelectable";

/**
 * An action that's use as an event listener for when an item gets selected
 */
export const onSelectAction = new Action((listeners: ISelectable[]) => {
    return {
        onSelect: (selected, menu) =>
            listeners.forEach(selectable => selectable.onSelect(selected, menu)),
    } as ISelectable;
});
