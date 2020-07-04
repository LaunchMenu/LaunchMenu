import {onSelectAction} from "./onSelectAction";

/**
 * The standard handler that is called when an item is selected
 */
export const onSelectHandler = onSelectAction.createHandler(
    (data: ((selected: boolean) => void)[]) => {
        return selected => data.forEach(f => f(selected));
    }
);
