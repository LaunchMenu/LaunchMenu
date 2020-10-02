import {IRenderableSettingsTree} from "./IRenderableSettingsTree";
import {ISettingsFolderMenuItem} from "./ISettingsFolderMenuItem";
import {TSettingsTree} from "./TSettingsTree";

/**
 * Retrieves the settings type from a settings config type
 */
export type TSettingsFromConfig<
    S extends {settings: () => ISettingsFolderMenuItem}
> = S extends {settings: () => infer F}
    ? F extends {children: IRenderableSettingsTree<infer D>}
        ? TSettingsTree<F["children"], D>
        : never
    : never;
