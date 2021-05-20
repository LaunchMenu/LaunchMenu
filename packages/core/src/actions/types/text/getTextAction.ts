import {createAction} from "../../createAction";
import {IMenuItemText} from "./_types/IMenuItemText";

/** An action to retrieve the textual data of items */
export const getTextAction = createAction({
    name: "Get text",
    core: (data: IMenuItemText[]) => ({
        result: data,
    }),
});
