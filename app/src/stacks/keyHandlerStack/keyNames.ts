import {keyCodes} from "./keyCodes";
import {TInvert} from "../../_types/TInvert";

type IKeyCodes = typeof keyCodes;

const keys = {};
Object.keys(keyCodes).forEach(name => {
    keys[keyCodes[name]] = name;
});
export const keyNames = keys as TInvert<IKeyCodes> & {[key: number]: string};
