import {IMenuItem} from "../../../../menus/items/_types/IMenuItem";
import {Priority} from "../../../../menus/menu/priority/Priority";
import {createContextAction} from "../../../contextMenuAction/createContextAction";
import {sequentialExecuteHandler} from "../../execute/sequentialExecuteHandler";
import {locationContextFolder} from "./locationContextFolder";
import {ISearchTraceNode} from "./_types/ISearchTraceNode";

/**
 * An action to open a given menu item in a particular folder
 */
export const openInParentAction = createContextAction({
    name: "Open in parent",
    folder: locationContextFolder,
    contextItem: {
        priority: [Priority.MEDIUM],
    },
    core: (traces: (ISearchTraceNode[] | (() => ISearchTraceNode[]))[]) => {
        return {
            actionBindings: traces.flatMap(trace =>
                sequentialExecuteHandler.createBinding(async ({context}) => {
                    const nodes = trace instanceof Function ? [...trace()] : [...trace];

                    // Open the folders in sequence, focusing on their child
                    let child = nodes.pop();
                    let folder = nodes.pop();
                    while (folder && !folder.showChild) {
                        child = folder;
                        folder = nodes.pop();
                    }

                    //Show the child
                    if (child && folder?.showChild)
                        await folder.showChild({
                            parent: folder.item,
                            child: child.item,
                            context,
                        });
                })
            ),
        };
    },
});
