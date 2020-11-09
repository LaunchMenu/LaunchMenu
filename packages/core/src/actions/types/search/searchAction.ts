import {createAction} from "../../createAction";
import {IMenuSearchable} from "./_types/IMenuSearchable";

export const searchAction = createAction({
    name: "search",
    core: (searchers: IMenuSearchable[]) => ({
        result: searchers,
    }),
});
