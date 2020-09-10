import {IUUID} from "./IUUID";
/** An extended UUID set that may include symbols (for if IDs aren't used in iterating) */
export type IExtendedUUID = IUUID | symbol;
