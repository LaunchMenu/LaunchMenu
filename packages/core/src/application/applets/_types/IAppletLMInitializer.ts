import {LaunchMenu} from "../../LaunchMenu";
import {IAppletExecutionConfig} from "./IAppletExecutionConfig";
import {IAppletSessionInitializer} from "./IAppletSessionInitializer";

type IAppletDisposer = {
    onDispose?: () => void | Promise<void>;
};

/** An initializer for applets by providing a LM instance */
export type IAppletLMInitializer = (
    lm: LaunchMenu
) =>
    | IAppletSessionInitializer
    | ({withSession?: IAppletSessionInitializer} & IAppletExecutionConfig & IAppletDisposer);
