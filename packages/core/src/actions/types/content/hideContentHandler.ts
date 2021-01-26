import {createAction} from "../../createAction";
import {getContentAction} from "./getContentAction";

/**
 * A handler that creates a content item that hides the content area
 */
export const hideContentHandler = createAction({
    name: "Hide content handler",
    parents: [getContentAction],
    core: (bindings: void[]) => ({
        children: bindings.length
            ? [getContentAction.createBinding({contentView: {close: true}})]
            : [],
    }),
});
