import {createAction, createStandardBinding} from "../../createAction";
import {IAction} from "../../_types/IAction";
import {IActionBinding} from "../../_types/IActionBinding";
import {IBindingCreatorConfig} from "../../_types/IBindingCreator";
import {IGetContentInputData} from "./_types/IGetContentInputData";
import {v4 as uuid} from "uuid";
import {adjustBindingInput} from "../../utils/adjustBindingInput";
import {IUUID} from "../../../_types/IUUID";
import {IGetContentData} from "./_types/IGetContentData";
import {IIOContext} from "../../../context/_types/IIOContext";

/**
 * An action that can be used to extract preview/extended contents from items
 */
export const getContentAction = createAction({
    name: "open menu item content handler",
    core: (contents: IGetContentData[]) => ({
        result: contents,
    }),

    /**
     * Creates a new action binding and generates an ID for this item identity
     * @param config The data for the binding, and optionally extra configuration
     * @param ID The ID for this item
     * @returns The created binding with the identity key
     */
    createBinding: function (
        config: IGetContentInputData | IBindingCreatorConfig<IGetContentInputData>,
        ID: IUUID = uuid()
    ): IActionBinding<IAction<IGetContentData, IGetContentData[]>> {
        return createStandardBinding.call(
            this,
            adjustBindingInput(config, data => {
                if (data instanceof Function)
                    return (context: IIOContext) => ({ID, ...data(context)});
                return {ID, ...data};
            })
        );
    },
});
