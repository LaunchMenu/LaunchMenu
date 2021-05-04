import React from "react";
import {Field, IDataHook, Loader} from "model-react";
import {IMenuItem} from "../../../../../menus/items/_types/IMenuItem";
import {IUUID} from "../../../../../_types/IUUID";
import {IHomeContentOption} from "./_types/IHomeContentOptions";
import {IHomeContentSetting} from "./_types/IHomeContentSetting";
import {settingPatternMatcher} from "../../../../../settings/inputs/settingPatternMatcher";
import {createFieldMenuItem} from "../../../../../menus/items/inputs/createFieldMenuItem";
import {promptSelectExecuteHandler} from "../../../../../uiLayers/types/select/promptSelectExecuteHandler";

/**
 * Creates a new content setting menu item
 * @param initOptions The initial content options, should contain at least 1 default option
 * @returns The menu item and home content setting
 */
export function createHomeContentSetting(
    initOptions: {0: IHomeContentOption} & IHomeContentOption[]
): IHomeContentSetting & IMenuItem {
    const options = new Field(initOptions as IHomeContentOption[]);
    const value = new Field(initOptions[0] as IHomeContentOption);

    return {
        ...createFieldMenuItem<IUUID, IHomeContentOption>({
            field: {
                setSerialized: (v: IUUID) => {
                    const currentOptions = options.get();
                    value.set(
                        currentOptions.find(item => item.ID == v) || currentOptions[0]
                    );
                },
                getSerialized: (hook?: IDataHook) => {
                    const currentValue = value.get(hook);
                    const currentOptions = options.get(hook);
                    return (
                        currentOptions.find(item => item == currentValue)?.ID ||
                        currentOptions[0]?.ID ||
                        "unknown"
                    );
                },
                set: (data: IHomeContentOption) => {
                    const option = options.get().find(item => item.ID == data.ID);
                    if (option) value.set(option);
                },
                get: (hook?: IDataHook) => value.get(hook),
            },
            data: field => ({
                name: "Home content",
                resetUndoable: true,
                icon: "settings",
                searchPattern: settingPatternMatcher,
                resetable: true,
                valueView: <Loader>{h => field.get(h).ID}</Loader>,
                actionBindings: [
                    promptSelectExecuteHandler.createBinding<IHomeContentOption>({
                        subscribableData: h => ({
                            field,
                            options: options.get(h),
                            createOptionView: v => v.view,
                        }),
                    }),
                ],
            }),
        }),
        addOption: option => {
            const current = options.get();
            if (!current.find(({ID}) => ID == option.ID))
                options.set([...current, option]);
        },
        removeOption: option => {
            const optionID = typeof option == "object" ? option.ID : option;
            const current = options.get();
            const index = current.findIndex(({ID}) => ID == optionID);
            if (index != -1)
                options.set([...current.slice(0, index), ...current.slice(index + 1)]);
        },
        getOptions: hook => options.get(hook),
    };
}
