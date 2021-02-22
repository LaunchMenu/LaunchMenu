import {createAction} from "../../createAction";
import {getConnectionGroupAction} from "./getConnectionGroupAction";

/**
 * A handler creating relevant dummy bindings for all required actions
 */
export const dummyItemHandler = createAction({
    name: "dummy item handler",
    parents: [getConnectionGroupAction],
    core: (data: void[]) => ({
        children: [
            getConnectionGroupAction.createBinding({
                skip: true,
            }),
        ],
        result: {
            isDummy: data.length > 0,
        },
    }),
});
