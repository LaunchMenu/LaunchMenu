import {
    createContextAction,
    createFolderMenuItem,
    createStandardMenuItem,
    groupBy,
    openMenuExecuteHandler,
    Priority,
    IUILayerContentData,
} from "@launchmenu/core";
import {filterTags} from "../../sanitize/filterTags";
import {getExamplesAction} from "./getExamplesAction";
import {IDefinitionData} from "./_types/IDefinitionData";
import {v4 as uuid} from "uuid";

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

        return {
            result: {
                /** Retrieves all the definitions grouped by category */
                get: getCategorizedDefinitions,
            },
            actionBindings: [
                openMenuExecuteHandler.createBinding({
                    items: () =>
                        getCategorizedDefinitions().map(({category, definitions}) =>
                            createFolderMenuItem({
                                name: category,
                                layerContentData,
                                children: definitions.map(({definition, examples}) =>
                                    createStandardMenuItem({
                                        name: filterTags(definition),
                                        onExecute: () => {},
                                        actionBindings: examples.map(example =>
                                            getExamplesAction.createBinding(example)
                                        ),
                                    })
                                ),
                                actionBindings: definitions.flatMap(({examples}) =>
                                    examples.map(example =>
                                        getExamplesAction.createBinding(example)
                                    )
                                ),
                            })
                        ),
                    pathName: "Definitions",
                }),
            ],
        };
    },
});
