import {ISettingsTree} from "../../../settings/_types/ISettingsTree";
import {TConfigSettings} from "../../../settings/_types/TConfigSettings";
import {LaunchMenu} from "../../LaunchMenu";
import {IApplet} from "../_types/IApplet";
import {TWithLM} from "./_types/TWithLM";

/**
 * Retrieves an applet when a LM instance is supplied
 * @param applet The applet data
 * @param session The applet data when a LM instance is supplied
 * @returns The applet when a LM instance is provided
 */
export function withLM<E extends IApplet>(
    applet: E,
    LM: LaunchMenu,
    settings: E extends IApplet<infer S> ? TConfigSettings<S> : ISettingsTree
): TWithLM<E> {
    if (applet.init) {
        const execData = applet.init({
            settings,
            LM: LM,
        });
        if (execData instanceof Function) {
            return {
                ...applet,
                withSession: execData,
                onDispose: undefined,
            } as any;
        } else {
            return {
                ...applet,
                onDispose: undefined,
                ...execData,
            } as any;
        }
    }
    return applet as any;
}
