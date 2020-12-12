import {IRenderableSettingsTree} from "./IRenderableSettingsTree";
import {IMenuItem} from "../../menus/items/_types/IMenuItem";

/**
 * A menu item that is also a folder of setting values
 */
export type ISettingsFolderMenuItem<
    T extends IRenderableSettingsTree = IRenderableSettingsTree
> = IMenuItem & {children: T};
