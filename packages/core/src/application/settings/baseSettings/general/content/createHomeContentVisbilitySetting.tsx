import React from "react";
import {Loader} from "model-react";
import {createFieldMenuItem} from "../../../../../menus/items/inputs/createFieldMenuItem";
import {IFieldMenuItem} from "../../../../../menus/items/inputs/_types/IFieldMenuItem";
import {settingPatternMatcher} from "../../../../../settings/inputs/settingPatternMatcher";
import {HomeContentVisibility} from "./_types/HomeContentVisibility";
import {promptSelectExecuteHandler} from "../../../../../uiLayers/types/select/promptSelectExecuteHandler";
import {createStandardMenuItem} from "../../../../../menus/items/createStandardMenuItem";

/**
 * Creates a new content visibility setting
 * @returns The menu item to represent the home content visibility setting
 */
export function createHomeContentVisibilitySetting(): IFieldMenuItem<HomeContentVisibility> {
    return createFieldMenuItem({
        init: HomeContentVisibility.inEmptyMenu,
        data: field => ({
            name: "Home content visibility",
            resetUndoable: true,
            icon: "settings",
            searchPattern: settingPatternMatcher,
            resetable: true,
            valueView: <Loader>{h => field.get(h)}</Loader>,
            actionBindings: [
                promptSelectExecuteHandler.createBinding({
                    field,
                    options: Object.values(HomeContentVisibility),
                    createOptionView: v => createStandardMenuItem({name: v}),
                }),
            ],
        }),
    });
}
