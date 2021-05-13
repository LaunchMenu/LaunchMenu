import {IGlobalKey} from "node-global-key-listener";
import {IKeyId} from "../keyIdentifiers/keyIds";

/** A mapping from global key listener keys to standardized LM key ids */
export const nodeGlobalKeyListenerMapping: Record<IGlobalKey, IKeyId | undefined> = {
    "0": "digit0",
    "1": "digit1",
    "2": "digit2",
    "3": "digit3",
    "4": "digit4",
    "5": "digit5",
    "6": "digit6",
    "7": "digit7",
    "8": "digit8",
    "9": "digit9",
    A: "keyA",
    B: "keyB",
    C: "keyC",
    D: "keyD",
    E: "keyE",
    F: "keyF",
    G: "keyG",
    H: "keyH",
    I: "keyI",
    J: "keyJ",
    K: "keyK",
    L: "keyL",
    M: "keyM",
    N: "keyN",
    O: "keyO",
    P: "keyP",
    Q: "keyQ",
    R: "keyR",
    S: "keyS",
    T: "keyT",
    U: "keyU",
    V: "keyV",
    W: "keyW",
    X: "keyX",
    Y: "keyY",
    Z: "keyZ",
    "CAPS LOCK": undefined,
    "": undefined,
    "DOWN ARROW": "arrowDown",
    "UP ARROW": "arrowUp",
    "LEFT ARROW": "arrowLeft",
    "RIGHT ARROW": "arrowRight",
    "LEFT ALT": "altLeft",
    "RIGHT ALT": "altRight",
    "LEFT CTRL": "controlLeft",
    "RIGHT CTRL": "controlRight",
    "LEFT META": "metaLeft",
    "RIGHT META": "metaRight",
    "LEFT SHIFT": "shiftLeft",
    "RIGHT SHIFT": "shiftRight",
    "NUMPAD 0": "digit0",
    "NUMPAD 1": "digit1",
    "NUMPAD 2": "digit2",
    "NUMPAD 3": "digit3",
    "NUMPAD 4": "digit4",
    "NUMPAD 5": "digit5",
    "NUMPAD 6": "digit6",
    "NUMPAD 7": "digit7",
    "NUMPAD 8": "digit8",
    "NUMPAD 9": "digit9",
    "PAGE DOWN": "pageDown",
    "PAGE UP": "pageUp",
    F1: "f1",
    F2: "f2",
    F3: "f3",
    F4: "f4",
    F5: "f5",
    F6: "f6",
    F7: "f7",
    F8: "f8",
    F9: "f9",
    F10: "f10",
    F11: "f11",
    F12: "f12",
    F13: "f13",
    F14: "f14",
    F15: "f15",
    F16: "f16",
    F17: "f17",
    F18: "f18",
    F19: "f19",
    F20: "f19",
    F21: "f19",
    F22: "f19",
    F23: "f19",
    F24: "f19",
    "MOUSE LEFT": undefined,
    "MOUSE MIDDLE": undefined,
    "MOUSE RIGHT": undefined,
    "MOUSE X1": undefined,
    "MOUSE X2": undefined,
    "NUM LOCK": undefined,
    "NUMPAD CLEAR": undefined,
    "NUMPAD DIVIDE": "slash",
    "NUMPAD DOT": "period",
    "NUMPAD EQUALS": "equal",
    "NUMPAD MINUS": "minus",
    "NUMPAD MULTIPLY": undefined,
    "NUMPAD PLUS": undefined,
    "NUMPAD RETURN": undefined,
    "PRINT SCREEN": "printscreen",
    "SCROLL LOCK": undefined,
    "SQUARE BRACKET CLOSE": "bracketRight",
    "SQUARE BRACKET OPEN": "bracketLeft",
    BACKTICK: "backquote",
    COMMA: "comma",
    DELETE: "delete",
    DOT: "period",
    END: "end",
    EQUALS: "equal",
    ESCAPE: "escape",
    BACKSPACE: "backspace",
    "FORWARD SLASH": "slash",
    BACKSLASH: "backslash",
    FN: undefined,
    HOME: "home",
    INS: "insert",
    MINUS: "minus",
    QUOTE: "quote",
    RETURN: "enter",
    SECTION: undefined,
    SEMICOLON: "semicolon",
    SPACE: "space",
    TAB: "tab",
};
