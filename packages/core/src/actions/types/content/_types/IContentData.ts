import {IUILayerContentData} from "../../../../uiLayers/_types/IUILayerContentData";
import {IViewStackItem} from "../../../../uiLayers/_types/IViewStackItem";

/** The data for an opening the content of a menu item */
export type IContentData = Omit<IUILayerContentData, "ID"> | IViewStackItem;
