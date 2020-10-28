import {IUILayer} from "../../_types/IUILayer";
import {IUILayerContentData} from "../../_types/IUILayerContentData";
import {IUILayerFieldData} from "../../_types/IUILayerFieldData";
import {IUILayerMenuData} from "../../_types/IUILayerMenuData";

/** All the types of data the UILayer can hold */
export type IUILayerData = (
    | IUILayerContentData
    | IUILayerFieldData
    | IUILayerMenuData
    | IUILayer
) & {onClose?: () => Promise<void>};
