import {IUUID} from "./IUUID";

/**
 * An item with an ID
 */
export type IIdentifiedItem<T> = {value: T; ID: IUUID};
