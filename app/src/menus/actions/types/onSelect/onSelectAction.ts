import {Action} from "../../Action";
import {IActionHandlerItems} from "../../_types/IActionHandlerItems";

/**
 * The default execute action of any menu item
 */
export const onSelectAction = new Action(
    (handlers: IActionHandlerItems<(selected: boolean) => void>) => {
        return {
            onSelect: (selected: boolean) => {
                handlers.forEach(({handler, data}) => {
                    return handler.get(data)(selected);
                });
            },
        };
    }
);
