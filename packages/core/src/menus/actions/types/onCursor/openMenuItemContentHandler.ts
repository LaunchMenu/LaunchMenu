import {groupBy} from "../../../../utils/groupBy";
import {onCursorAction} from "./onCursorAction";
import {IOpenMenuItemContentHandlerData} from "./_types/IOpenMenuItemContentHandlerData";

/**
 * A handler that can be used to automatically open certain content when an item gets selected
 */
export const openMenuItemContentHandler = onCursorAction.createHandler(
    (contents: IOpenMenuItemContentHandlerData[]) => {
        return {
            onCursor: (isCursor, menu) => {
                // TODO: fix with new context
                // // Normalize the contents
                // const defaultContext = menu.getContext();
                // const normalizedContents = contents.map(content =>
                //     "context" in content ? content : {content, context: defaultContext}
                // );
                // // Group by context
                // const grouped = groupBy(normalizedContents, "context");
                // // Either open or close the data
                // if (isCursor) {
                //     // For each group, only open the first item
                //     grouped.forEach(({key: context, values: [{content}, ..._]}) => {
                //         context.panes.content.push(content);
                //     });
                // } else {
                //     // Close all content
                //     grouped.forEach(({key: context, values}) => {
                //         values.forEach(({content}) => {
                //             context.panes.content.remove(content);
                //         });
                //     });
                // }
            },
        };
    }
);
