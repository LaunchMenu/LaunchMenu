import {baseSettings} from "../../../../application/settings/baseSettings/baseSettings";
import {Priority} from "../../../../menus/menu/priority/Priority";
import {createContextAction} from "../../../contextMenuAction/createContextAction";
import {sequentialExecuteHandler} from "../../execute/sequentialExecuteHandler";
import {locationContextFolder} from "./locationContextFolder";
import {ISearchTraceNode} from "./_types/ISearchTraceNode";

/**
 * An action to open a given menu item at a particular menu folder trace at which it can be found
 */
export const openAtTraceAction = createContextAction({
    name: "Open at trace",
    folder: locationContextFolder,
    contextItem: {
        name: "Open in location",
        priority: [Priority.HIGH],
        shortcut: (context, h) =>
            context.settings
                .get(baseSettings)
                .controls.shortcuts.search.openAtTrace.get(h),
    },
    core: (traces: (ISearchTraceNode[] | (() => ISearchTraceNode[]))[]) => {
        return {
            actionBindings: traces.map(trace =>
                sequentialExecuteHandler.createBinding(async ({context}) => {
                    const nodes = trace instanceof Function ? trace() : [...trace];

                    const promises = [] as Promise<void>[];

                    // Open the folders in sequence, focusing on their child
                    let folder = nodes.shift();
                    let child: ISearchTraceNode | undefined;
                    while ((child = nodes.shift())) {
                        if (folder?.showChild)
                            promises.push(
                                folder.showChild({
                                    parent: folder.item,
                                    child: child.item,
                                    context,
                                })
                            );

                        folder = child;
                    }

                    // Wait for the menus to be closed
                    await Promise.all(promises);
                })
            ),
        };
    },
});
