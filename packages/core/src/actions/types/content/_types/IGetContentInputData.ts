import {IIOContext} from "../../../../context/_types/IIOContext";
import {IUILayerContentData} from "../../../../uiLayers/_types/IUILayerContentData";

/** The data for an opening the content of a menu item */
export type IGetContentInputData =
    | Omit<IUILayerContentData, "ID">
    | ((context: IIOContext) => Omit<IUILayerContentData, "ID">);
