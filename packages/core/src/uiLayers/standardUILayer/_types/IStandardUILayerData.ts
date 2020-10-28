import {IIOContext} from "../../../context/_types/IIOContext";
import {IUILayer} from "../../_types/IUILayer";
import {IStandardUILayerContentData} from "./IStandardUILayerContentData";
import {IStandardUILayerFieldData} from "./IStandardUILayerFieldData";
import {IStandardUILayerMenuData} from "./IStandardUILayerMenuData";

/**
 * The acceptable data for a standard UI layer
 */
export type IStandardUILayerData =
    | IStandardUILayerDataObject
    | ((
          context: IIOContext,
          close: () => void
      ) => IStandardUILayerDataObject & {onClose?: () => void | Promise<void>})
    | IUILayer;

/** The format for one of the layer's objects */
export type IStandardUILayerDataObject = Partial<IStandardUILayerContentData> &
    Partial<IStandardUILayerMenuData> &
    Partial<IStandardUILayerFieldData>;
