import {IRenderableSettingsTree} from "./IRenderableSettingsTree";
import {IMenuItem} from "../../menus/items/_types/IMenuItem";
import {IJSONDeserializer} from "./serialization/IJSONDeserializer";

/**
 * A menu item that is also a folder of setting values
 */
export type ISettingsFolderMenuItem<
    S extends IJSONDeserializer = IJSONDeserializer,
    T extends IRenderableSettingsTree<S> = IRenderableSettingsTree<S>
> = IMenuItem & {children: T};
