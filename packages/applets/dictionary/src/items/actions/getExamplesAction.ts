import {
    createContextAction,
    createFolderMenuItem,
    createStandardMenuItem,
    openMenuExecuteHandler,
    Priority,
    hideContentHandler,
    copyTextHandler,
    copyAction,
    copyExitPasteHandler,
} from "@launchmenu/core";
import {filterTags} from "../../sanitize/filterTags";
import {IExampleData} from "./_types/IExampleData";

/** An action to show the user all examples */
export const getExamplesAction = createContextAction({
    name: "Examples",
    contextItem: actionBindings => ({
        priority: Priority.MEDIUM,
        item: createFolderMenuItem({name: "Examples", children: [], actionBindings}),
    }),
    core: (examples: IExampleData[]) => ({
        result: {
            /** Retrieves all the examples */
            get: () => examples,
        },
        actionBindings: [
            openMenuExecuteHandler.createBinding({
                items: () =>
                    examples.map(({example, translation}) =>
                        createStandardMenuItem({
                            name: filterTags(example),
                            description: translation && filterTags(translation),
                            onExecute: () => {},
                            actionBindings: [
                                copyExitPasteHandler.createBinding(filterTags(example)),
                                copyAction.createBinding(
                                    copyTextHandler.createBinding(filterTags(example))
                                ),
                                hideContentHandler.createBinding(),
                            ],
                        })
                    ),
                pathName: "Examples",
            }),
        ],
    }),
});
