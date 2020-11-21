import {IAppletConfig} from "../_types/IAppletConfig";
import {IIdentifiedSettingsConfig} from "../../../settings/_types/IIdentifiedSettingsConfig";
import {IJSON} from "../../../_types/IJSON";
import {IApplet} from "../_types/IApplet";
import {v4 as uuid} from "uuid";

/**
 * Declares the applet to be exported
 * @param applet The applet to be type checked and exported
 * @returns The same applet but now with a runtime identifier
 */
export function declare<
    S extends IIdentifiedSettingsConfig<IJSON, any>
>(applet: IAppletConfig<S>): IApplet<S> {
    return {ID: uuid(), ...applet};
}
