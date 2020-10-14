import {IUILayerFieldData} from "../../_types/IUILayerFieldData";

/** The input data for the content of a standard UI Layer */
export type IStandardUILayerFieldData = Omit<IUILayerFieldData, "ID">;
