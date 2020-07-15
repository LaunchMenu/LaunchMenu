import {Action} from "../../Action";

/**
 * The default execute action of any menu item
 */
export const onSelectAction = new Action((listeners: ((selected: boolean) => void)[]) => {
    return {
        onSelect: (selected: boolean) => {
            listeners.forEach(listener => listener(selected));
        },
    };
});
