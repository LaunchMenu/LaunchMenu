import {IIdentifiedSettingsConfig} from "../../../settings/_types/IIdentifiedSettingsConfig";
import {ISettingsFolderMenuItem} from "../../../settings/_types/ISettingsFolderMenuItem";
import {IJSONDeserializer} from "../../../settings/_types/serialization/IJSONDeserializer";
import {IJSON} from "../../../_types/IJSON";
import {IAppletExecutionConfig} from "./IAppletExecutionConfig";
import {IAppletInfo} from "./IAppletInfo";
import {IAppletLMInitializer} from "./IAppletLMInitializer";
import {IAppletSessionInitializer} from "./IAppletSessionInitializer";

/**
 * An applet plugin for LM
 */
export type IAppletConfig<
    S extends IIdentifiedSettingsConfig<
        IJSON,
        ISettingsFolderMenuItem,
        IJSONDeserializer
    > = IIdentifiedSettingsConfig<IJSON, ISettingsFolderMenuItem, any>
> = {
    /** The applet info for listings */
    info: IAppletInfo;
    /** Settings of the applet */
    settings: S;
    /** Development time specific information/tools */
    development?: {
        /** Whether to listen for changes in code and auto reload the applet when detected */
        liveReload?: boolean;
        /** The directory to watch for changes (defaults to 'build') */
        watchDirectory?: string;
    };
    /** A function to get the execution data of the config given a LM (and potentially session) instance */
    withLM?: IAppletLMInitializer;
    /** A function to get the execution data of the config given a session instance  */
    withSession?: IAppletSessionInitializer;
} & Partial<IAppletExecutionConfig>;
