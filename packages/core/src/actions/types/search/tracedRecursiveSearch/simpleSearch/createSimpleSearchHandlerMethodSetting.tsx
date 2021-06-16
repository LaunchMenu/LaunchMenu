import React from "react";
import {DataCacher, Field, IDataHook, Loader} from "model-react";
import {createFieldMenuItem} from "../../../../../menus/items/inputs/createFieldMenuItem";
import {IUUID} from "../../../../../_types/IUUID";
import {simpleSearchHandler} from "./simpleSearchHandler";
import {ISimpleSearchMethod} from "./_types/ISimpleSearchMethod";
import {promptSelectExecuteHandler} from "../../../../../uiLayers/types/select/promptSelectExecuteHandler";
import {settingPatternMatcher} from "../../../../../settings/inputs/settingPatternMatcher";

/**
 * Creates a menu item to select the search handler method
 * @returns The menu item field that can be used as a setting
 */
export function createSimpleSearchHandlerMethodSetting() {
    // Allow for retrieval according to ID (from which a method from the simpleSearchHandler can be obtained)
    const methodIdSource = new Field(null as IUUID | null);

    // And allow for direct defining of a method for custom unregistered methods, which takes precedence
    const methodSource = new Field(null as ISimpleSearchMethod | null);

    // Define a retriever that can be used to obtain the current method using the above sources
    const methodRetriever = new DataCacher(h => {
        const customMethod = methodSource.get(h);
        if (customMethod) return customMethod;

        const methodId = methodIdSource.get(h);
        const methods = simpleSearchHandler.getSearchMethods(h);
        return methods.find(({ID}) => ID == methodId) || methods[0];
    });

    const serializedField = {
        get: (hook?: IDataHook) => methodRetriever.get(hook),
        set: (value: ISimpleSearchMethod) => {
            methodSource.set(value);
            methodIdSource.set(value.ID);
        },
        getSerialized: (hook?: IDataHook) => methodIdSource.get(hook) || "",
        setSerialized: (value: IUUID) => {
            methodSource.set(null);
            methodIdSource.set(value);
        },
    };
    return createFieldMenuItem<IUUID, ISimpleSearchMethod>({
        field: serializedField,
        data: field => ({
            name: "Simple search method",
            icon: "settings",
            valueView: <Loader>{h => field.get(h).name}</Loader>,
            tags: ["field"],
            resetUndoable: true,
            actionBindings: [
                promptSelectExecuteHandler.createBinding({
                    subscribableData: h => ({
                        field,
                        options: simpleSearchHandler.getSearchMethods(h),
                        createOptionView: (method: ISimpleSearchMethod) => method.view,
                    }),
                }),
            ],
            searchPattern: settingPatternMatcher,
        }),
    });
}
