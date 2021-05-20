import {ISettingsTree} from "../../../settings/_types/ISettingsTree";
import {LaunchMenu} from "../../LaunchMenu";
import {IAppletExecutionConfig} from "./IAppletExecutionConfig";
import {IAppletSessionInitializer} from "./IAppletSessionInitializer";

type IAppletDisposer = {
    onDispose?: () => void | Promise<void>;
};

/** An initializer for applets by providing a LM instance */
export type IAppletLMInitializer<T extends ISettingsTree> = (data: {
    /** The settings for this applet */
    settings: T;
    /** The running lm instance */
    LM: LaunchMenu;
}) =>
    | IAppletSessionInitializer
    | ({withSession?: IAppletSessionInitializer} & IAppletExecutionConfig &
          IAppletDisposer);
