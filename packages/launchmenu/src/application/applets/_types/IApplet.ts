import {IOContext} from "../../../context/IOContext";
import {IMenuSearchable} from "../../../menus/actions/types/search/_types/IMenuSearchable";
import {IIdentifiedSettingsConfig} from "../../../settings/_types/IIdentifiedSettingsConfig";
import {ISettingsCategoryMenuItem} from "../../../settings/_types/ISettingsCategoryMenuItem";
import {IJSON} from "../../../_types/IJSON";
import {IUUID} from "../../../_types/IUUID";
import {IAppletInfo} from "./IAppletInfo";

/**
 * An applet plugin for LM
 */
export type IApplet<
    S extends IIdentifiedSettingsConfig<IJSON, ISettingsCategoryMenuItem, any>
> = {
    /**  */
    id: IUUID;
    /** Settings of the applet */
    settings: S;
    /** The applet info for listings */
    info: IAppletInfo;
    /** Opens the application */
    open?: (context: IOContext, onClose: () => void) => void;
    /** A search method to find item matches within this applet  */
    search?: IMenuSearchable["search"];
};
