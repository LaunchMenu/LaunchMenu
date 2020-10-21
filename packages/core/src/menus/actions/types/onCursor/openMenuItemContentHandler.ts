import {UILayer} from "../../../../uiLayers/standardUILayer/UILayer";
import {groupBy} from "../../../../utils/groupBy";
import {onCursorAction} from "./onCursorAction";
import {IOpenMenuItemContentHandlerData} from "./_types/IOpenMenuItemContentHandlerData";

// TODO: make the content only appear if parent menu is open
/**
 * A handler that can be used to automatically open certain content when an item gets selected
 */
export const openMenuItemContentHandler = onCursorAction.createHandler(
    (contents: IOpenMenuItemContentHandlerData[]) => {
        return {
            onCursor: (isCursor, menu) => {
                // Normalize the contents
                const defaultContext = menu.getContext();
                const normalizedContents = contents.map(content =>
                    "context" in content ? content : {content, context: defaultContext}
                );
                // Group by context
                const grouped = groupBy(normalizedContents, "context");

                // Either open or close the data
                if (isCursor) {
                    // For each group, only open the first item
                    grouped.forEach(({key: context, values: [{content}, ..._]}) => {
                        context.open(new UILayer({contentView: content}));
                    });
                } else {
                    // Close all content
                    grouped.forEach(({key: context, values}) => {
                        const layers = context.getUI();
                        values.forEach(({content}) => {
                            const contentLayer = layers.find(layer =>
                                layer
                                    .getContentData()
                                    .find(({contentView}) => contentView == content)
                            );
                            if (contentLayer) context.close(contentLayer);
                        });
                    });
                }
            },
        };
    }
);
