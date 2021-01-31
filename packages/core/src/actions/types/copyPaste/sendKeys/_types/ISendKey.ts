import {IKeyMatcher} from "../../../../../keyHandler/keyIdentifiers/keys";

/** A key format for sending key patterns to the OS */
export type ISendKey = {
    key: IKeyMatcher;
    modifiers: ("ctrl" | "shift" | "alt" | "meta")[];
};
