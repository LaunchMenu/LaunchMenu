import {LMSession} from "../../LMSession/LMSession";
import {IAppletExecutionConfig} from "./IAppletExecutionConfig";

/** An initializer for applets by providing a session instance */
export type IAppletSessionInitializer = (
    session: LMSession
) => IAppletExecutionConfig & {onCloseSession?: () => void | Promise<void>};
