import {ISettingsCategoryMenuItem} from "../../../settings/_types/ISettingsCategoryMenuItem";
import {ISettingsConfig} from "../../../settings/_types/ISettingsConfig";
import {IJSON} from "../../../_types/IJSON";
import {IApplet} from "./IApplet";

/**
 * The input data to create an applet with
 */
export type IAppletConfig<
    S extends ISettingsConfig<IJSON, ISettingsCategoryMenuItem>
> = Omit<IApplet<S>, "id">;
