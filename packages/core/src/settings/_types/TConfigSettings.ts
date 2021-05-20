import {IIdentifiedSettingsConfig} from "./IIdentifiedSettingsConfig";
import {TSettingsTree} from "./TSettingsTree";

/**
 * Extracts the settings type from a given config
 */
export type TConfigSettings<
    C extends IIdentifiedSettingsConfig<any, any>
> = TSettingsTree<
    C extends IIdentifiedSettingsConfig<any, infer U> ? U["children"] : never
>;
