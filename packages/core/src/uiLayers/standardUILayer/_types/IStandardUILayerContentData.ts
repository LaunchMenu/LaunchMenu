import {IUILayerContentData} from "../../_types/IUILayerContentData";

/** The input data for the content of a standard UI Layer */
export type IStandardUILayerContentData = Omit<IUILayerContentData, "ID">;
