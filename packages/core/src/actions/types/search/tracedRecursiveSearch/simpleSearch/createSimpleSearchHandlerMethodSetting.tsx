import React from "react";
import {Field, IDataHook, Loader} from "model-react";
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
    const field = new Field(null as ISimpleSearchMethod | null);
    const get = (hook?: IDataHook) =>
        field.get(hook) || simpleSearchHandler.getSearchMethods()[0];
    const serializedField = {
        get,
        set: (value: ISimpleSearchMethod) => field.set(value),
        getSerialized: (hook?: IDataHook) => get(hook).ID,
        setSerialized: (value: IUUID) => {
            const methods = simpleSearchHandler.getSearchMethods();
            const method = methods.find(({ID}) => ID == value) || methods[0];
            field.set(method);
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
