import {IRenderableSettingsTree} from "./IRenderableSettingsTree";
import {IMenuItem} from "../../menus/items/_types/IMenuItem";
import {IJSONDeserializer} from "./serialization/IJSONDeserializer";

/**
 * A menu item that is also a category of setting values
 */
export type ISettingsCategoryMenuItem<
    S extends IJSONDeserializer = IJSONDeserializer,
    T extends IRenderableSettingsTree<S> = IRenderableSettingsTree<S>
> = IMenuItem & {children: T};
