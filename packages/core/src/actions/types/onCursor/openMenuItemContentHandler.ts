import {UILayer} from "../../../uiLayers/standardUILayer/UILayer";
import {groupBy} from "../../../utils/groupBy";
import {createAction} from "../../createAction";
import {onCursorAction} from "./onCursorAction";
import {IOpenMenuItemContentHandlerData} from "./_types/IOpenMenuItemContentHandlerData";

// TODO: make the content only appear if parent menu is open
/**
 * A handler that can be used to automatically open certain content when an item gets selected
 */
export const openMenuItemContentHandler = createAction({
    name: "open menu item content handler",
    parents: [onCursorAction],
    core: (contents: IOpenMenuItemContentHandlerData[]) => ({
        children: [
            onCursorAction.createBinding((isCursor, menu) => {
                // Find the layer that the menu is in of possible
                const defaultContext = menu.getContext();
                const menuLayer = defaultContext
                    .getUI()
                    .find(layer =>
                        layer.getMenuData().find(({menu: fMenu}) => fMenu == menu)
                    );

                // Normalize the contents
                const normalizedContents = contents.map(content =>
                    "context" in content ? content : {content, context: defaultContext}
                );

                // Group by context
                const grouped = groupBy(normalizedContents, "context");

                // Either open or close the data
                if (isCursor) {
                    // For each group, only open the first item
                    grouped.forEach(({key: context, values: [{content}, ..._]}) => {
                        context.open(new UILayer({contentView: content}), {
                            after: context == defaultContext ? menuLayer : undefined,
                        });
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
            }),
        ],
    }),
});
