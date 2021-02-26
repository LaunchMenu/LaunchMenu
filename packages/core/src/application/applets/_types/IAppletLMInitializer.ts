import {IDataHook} from "model-react";
import {SettingsContext} from "../../../settings/SettingsContext";
import {LaunchMenu} from "../../LaunchMenu";
import {IAppletExecutionConfig} from "./IAppletExecutionConfig";
import {IAppletSessionInitializer} from "./IAppletSessionInitializer";

type IAppletDisposer = {
    onDispose?: () => void | Promise<void>;
};

/** An initializer for applets by providing a LM instance */
export type IAppletLMInitializer = (data: {
    /** A standard entry for retrieving settings */
    getSettings: (h?: IDataHook) => SettingsContext;
    /** The running lm instance */
    LM: LaunchMenu;
}) =>
    | IAppletSessionInitializer
    | ({withSession?: IAppletSessionInitializer} & IAppletExecutionConfig &
          IAppletDisposer);
