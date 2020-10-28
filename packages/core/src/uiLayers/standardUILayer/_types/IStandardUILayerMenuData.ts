import {IUILayerMenuData} from "../../_types/IUILayerMenuData";

/** The input data for the menu of a standard UI Layer */
export type IStandardUILayerMenuData = Omit<IUILayerMenuData, "ID">;
