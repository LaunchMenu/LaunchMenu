import {IIdentifiedSettingsConfig} from "../../../settings/_types/IIdentifiedSettingsConfig";
import {ISettingsCategoryMenuItem} from "../../../settings/_types/ISettingsCategoryMenuItem";
import {IJSONDeserializer} from "../../../settings/_types/serialization/IJSONDeserializer";
import {IJSON} from "../../../_types/IJSON";
import {IApplet} from "./IApplet";

/**
 * The input data to create an applet with
 */
export type IAppletConfig<
    S extends IIdentifiedSettingsConfig<
        IJSON,
        ISettingsCategoryMenuItem,
        IJSONDeserializer
    >
> = Omit<IApplet<S>, "ID">;
