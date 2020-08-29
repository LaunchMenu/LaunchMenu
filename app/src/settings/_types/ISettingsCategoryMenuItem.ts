import {IRenderableSettingsTree} from "./IRenderableSettingsTree";
import {IMenuItem} from "../../menus/items/_types/IMenuItem";

/**
 * A menu item that is also a category of setting values
 */
export type ISettingsCategoryMenuItem<
    T extends IRenderableSettingsTree = IRenderableSettingsTree
> = IMenuItem & {children: T};
