import {IDataHook} from "model-react";
import {createAction, createStandardBinding} from "../../createAction";
import {IAction} from "../../_types/IAction";
import {IActionBinding} from "../../_types/IActionBinding";
import {IBindingCreatorConfig} from "../../_types/IBindingCreator";
import {IContentData} from "./_types/IContentData";
import {v4 as uuid} from "uuid";
import {getHooked} from "../../../utils/subscribables/getHooked";
import {IUILayerContentData} from "../../../uiLayers/_types/IUILayerContentData";
import {adjustBindingInput} from "../../utils/adjustBindingInput";

/**
 * A handler that can be used to automatically open certain content when an item gets selected
 */
export const getContentAction = createAction({
    name: "open menu item content handler",
    core: (contents: IUILayerContentData[]) => ({
        result: contents,
    }),

    /**
     * Creates a new action binding and generates an ID for this item identity
     * @param config The data for the binding, and optionally extra configuration
     * @returns The created binding with the identity key
     */
    createBinding: function (
        config: IContentData | IBindingCreatorConfig<IContentData>
    ): IActionBinding<IAction<IUILayerContentData, IUILayerContentData[]>> {
        // TODO: create some helper method to deal with these types of transformations to reduce clutter
        const ID = uuid();
        return createStandardBinding.call(
            this,
            adjustBindingInput(config, data => {
                if (!("contentView" in data)) return {ID, contentView: data};
                else return {ID, ...data};
            })
        );
    },
});
