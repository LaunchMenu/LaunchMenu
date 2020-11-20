import {IIOContext} from "../../../../context/_types/IIOContext";
import {IUILayerContentData} from "../../../../uiLayers/_types/IUILayerContentData";

/**
 * The data that the getContentAction collects
 */
export type IGetContentData =
    | IUILayerContentData
    | ((context: IIOContext) => IUILayerContentData);
