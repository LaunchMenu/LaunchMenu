import {IUUID} from "../../../../_types/IUUID";
import {IActionTarget} from "../../../_types/IActionTarget";

/** The identity data for action targets */
export type IIdentityData = {ID: IUUID; item: IActionTarget | (() => IActionTarget)};
