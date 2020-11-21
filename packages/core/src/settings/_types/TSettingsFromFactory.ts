import {IRenderableSettingsTree} from "./IRenderableSettingsTree";
import {ISettingsFolderMenuItem} from "./ISettingsFolderMenuItem";
import {TSettingsTree} from "./TSettingsTree";

/**
 * Retrieves the settings type from a settings factory type
 */
export type TSettingsFromFactory<
    S extends () => ISettingsFolderMenuItem
> = S extends () => infer F
    ? F extends {children: IRenderableSettingsTree}
        ? TSettingsTree<F["children"]>
        : never
    : never;
