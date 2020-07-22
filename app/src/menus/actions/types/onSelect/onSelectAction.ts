import {Action} from "../../Action";

/**
 * An action that's use as an event listener for when an item gets selected
 */
export const onSelectAction = new Action((listeners: ((selected: boolean) => void)[]) => {
    return {
        onSelect: (selected: boolean) => {
            listeners.forEach(listener => listener(selected));
        },
    };
});
