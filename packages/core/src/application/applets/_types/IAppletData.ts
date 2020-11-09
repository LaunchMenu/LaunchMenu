import {HMRWatcher} from "@launchmenu/hmr";
import {ICategory} from "../../../actions/types/category/_types/ICategory";
import {IUUID} from "../../../_types/IUUID";
import {IApplet} from "./IApplet";

/**
 * Data associated to an applet at runtime
 */
export type IAppletData = {
    /** The applet instance itself */
    applet: IApplet;
    /** The category to put data of this applet under */
    category: ICategory;
    /** A version number for this instance of the applet data (used for HMR) */
    version: IUUID;
    /** The watcher that's used for HMR for this applet */
    watcher?: HMRWatcher;
};
