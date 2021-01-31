import {
    createContextAction,
    createFolderMenuItem,
    createStandardMenuItem,
    groupBy,
    openMenuExecuteHandler,
    Priority,
    IUILayerContentData,
    copyTextHandler,
    copyAction,
    createContextFolderMenuItem,
    copyExitPasteHandler,
} from "@launchmenu/core";
import {filterTags} from "../../sanitize/filterTags";
import {getExamplesAction} from "./getExamplesAction";
import {IDefinitionData} from "./_types/IDefinitionData";
import {v4 as uuid} from "uuid";
import {DataCacher} from "model-react";

/** An action to show the user all definitions */
export const getDefinitionsAction = createContextAction({
    name: "Definitions",
    contextItem: actionBindings => ({
        priority: Priority.MEDIUM,
        item: createFolderMenuItem({name: "Definitions", children: [], actionBindings}),
    }),
    core: (definitions: IDefinitionData[]) => {
        const getCategorizedDefinitions = () =>
            groupBy(definitions, "category").map(({key, values}) => ({
                category: key,
                definitions: values as Omit<IDefinitionData, "category">[],
            }));
        const layerContentData: IUILayerContentData = {
            ID: uuid(),
            contentView: {close: true},
        };

        // Retrieves the items from the definitions
        const items = new DataCacher(() =>
            getCategorizedDefinitions().map(({category, definitions}) =>
                createContextFolderMenuItem({
                    name: category,
                    layerContentData,
                    children: definitions.map(({definition, examples}) => {
                        const def = filterTags(definition);
                        return createStandardMenuItem({
                            name: def,
                            onExecute: () => {},
                            actionBindings: [
                                ...examples.map(example =>
                                    getExamplesAction.createBinding(example)
                                ),
                                copyExitPasteHandler.createBinding(def),
                                copyAction.createBinding(
                                    copyTextHandler.createBinding(def)
                                ),
                            ],
                        });
                    }),
                    actionBindings: definitions.flatMap(({definition, examples}) => [
                        ...examples.map(example =>
                            getExamplesAction.createBinding(example)
                        ),
                        copyAction.createBinding(
                            copyTextHandler.createBinding(filterTags(definition))
                        ),
                    ]),
                })
            )
        );

        return {
            result: {
                /** Retrieves all the definitions grouped by category */
                get: getCategorizedDefinitions,
            },
            actionBindings: [
                openMenuExecuteHandler.createBinding({
                    items: () => items.get(),
                    closeOnExecute: true,
                    pathName: "Definitions",
                }),
            ],
        };
    },
});
