import {IIdentifiedSettingsConfig} from "../../../settings/_types/IIdentifiedSettingsConfig";
import {ISettingsFolderMenuItem} from "../../../settings/_types/ISettingsFolderMenuItem";
import {IJSON} from "../../../_types/IJSON";
import {IUUID} from "../../../_types/IUUID";
import {IAppletConfig} from "./IAppletConfig";

/**
 * An applet plugin for LM
 */
export type IApplet<
    S extends IIdentifiedSettingsConfig<IJSON, ISettingsFolderMenuItem> = IIdentifiedSettingsConfig<IJSON, ISettingsFolderMenuItem>
> = {
    /** A unique ID for this module */
    ID: IUUID;
    /** A dispose function that could be specified by the return value of withLM*/
    onDispose?: () => void | Promise<void>;
    /** A dispose function that could be specified by the return value of withSession*/
    onCloseSession?: () => void | Promise<void>;
} & IAppletConfig<S>;
