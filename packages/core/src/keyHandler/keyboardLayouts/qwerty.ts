import {IKeyboardLayout} from "./_types/IKeyboardLayout";

export const keyboardLayout: IKeyboardLayout = {
    name: "qwerty",
    keys: {
        8: {name: "backspace", id: "backspace", char: ""},
        9: {name: "tab", id: "tab", char: ""},
        13: {name: "enter", id: "enter", char: ""},
        "16-1": {name: "shift", id: "shiftLeft", char: ""},
        "17-1": {name: "ctrl", id: "controlLeft", char: ""},
        "18-1": {name: "alt", id: "altLeft", char: ""},
        "16-2": {name: "shift", id: "shiftRight", char: ""},
        "17-2": {name: "ctrl", id: "controlRight", char: ""},
        "18-2": {name: "alt", id: "altRight", char: ""},
        27: {name: "esc", id: "escape", char: ""},
        32: {name: "space", id: "space", char: " ", shiftChar: " "},
        33: {name: "pageUp", id: "pageUp", char: ""},
        34: {name: "pageDown", id: "pageDown", char: ""},
        35: {name: "end", id: "end", char: ""},
        36: {name: "home", id: "home", char: ""},
        37: {name: "left", id: "arrowLeft", char: ""},
        38: {name: "up", id: "arrowUp", char: ""},
        39: {name: "right", id: "arrowRight", char: ""},
        40: {name: "down", id: "arrowDown", char: ""},
        45: {name: "insert", id: "insert", char: ""},
        46: {name: "delete", id: "delete", char: ""},
        48: {name: "0", id: "digit0", char: "0", shiftChar: ")"},
        49: {name: "1", id: "digit1", char: "1", shiftChar: "!"},
        50: {name: "2", id: "digit2", char: "2", shiftChar: "@"},
        51: {name: "3", id: "digit3", char: "3", shiftChar: "#"},
        52: {name: "4", id: "digit4", char: "4", shiftChar: "$"},
        53: {name: "5", id: "digit5", char: "5", shiftChar: "%"},
        54: {name: "6", id: "digit6", char: "6", shiftChar: "^"},
        55: {name: "7", id: "digit7", char: "7", shiftChar: "&"},
        56: {name: "8", id: "digit8", char: "8", shiftChar: "*"},
        57: {name: "9", id: "digit9", char: "9", shiftChar: "("},
        65: {name: "a", id: "keyA", char: "a", shiftChar: "A"},
        66: {name: "b", id: "keyB", char: "b", shiftChar: "B"},
        67: {name: "c", id: "keyC", char: "c", shiftChar: "C"},
        68: {name: "d", id: "keyD", char: "d", shiftChar: "D"},
        69: {name: "e", id: "keyE", char: "e", shiftChar: "E"},
        70: {name: "f", id: "keyF", char: "f", shiftChar: "F"},
        71: {name: "g", id: "keyG", char: "g", shiftChar: "G"},
        72: {name: "h", id: "keyH", char: "h", shiftChar: "H"},
        73: {name: "i", id: "keyI", char: "i", shiftChar: "I"},
        74: {name: "j", id: "keyJ", char: "j", shiftChar: "J"},
        75: {name: "k", id: "keyK", char: "k", shiftChar: "K"},
        76: {name: "l", id: "keyL", char: "l", shiftChar: "L"},
        77: {name: "m", id: "keyM", char: "m", shiftChar: "M"},
        78: {name: "n", id: "keyN", char: "n", shiftChar: "N"},
        79: {name: "o", id: "keyO", char: "o", shiftChar: "O"},
        80: {name: "p", id: "keyP", char: "p", shiftChar: "P"},
        81: {name: "q", id: "keyQ", char: "q", shiftChar: "Q"},
        82: {name: "r", id: "keyR", char: "r", shiftChar: "R"},
        83: {name: "s", id: "keyS", char: "s", shiftChar: "S"},
        84: {name: "t", id: "keyT", char: "t", shiftChar: "T"},
        85: {name: "u", id: "keyU", char: "u", shiftChar: "U"},
        86: {name: "v", id: "keyV", char: "v", shiftChar: "V"},
        87: {name: "w", id: "keyW", char: "w", shiftChar: "W"},
        88: {name: "x", id: "keyX", char: "x", shiftChar: "X"},
        89: {name: "y", id: "keyY", char: "y", shiftChar: "Y"},
        90: {name: "z", id: "keyZ", char: "z", shiftChar: "Z"},
        "91-1": {name: "meta", id: "metaLeft", char: ""},
        "91-2": {name: "meta", id: "metaRight", char: ""},
        112: {name: "f1", id: "f1", char: ""},
        113: {name: "f2", id: "f2", char: ""},
        114: {name: "f3", id: "f3", char: ""},
        115: {name: "f4", id: "f4", char: ""},
        116: {name: "f5", id: "f5", char: ""},
        117: {name: "f6", id: "f6", char: ""},
        118: {name: "f7", id: "f7", char: ""},
        119: {name: "f8", id: "f8", char: ""},
        120: {name: "f9", id: "f9", char: ""},
        121: {name: "f10", id: "f10", char: ""},
        122: {name: "f11", id: "f11", char: ""},
        123: {name: "f12", id: "f12", char: ""},
        124: {name: "f13", id: "f13", char: ""},
        125: {name: "f14", id: "f14", char: ""},
        126: {name: "f15", id: "f15", char: ""},
        127: {name: "f16", id: "f16", char: ""},
        128: {name: "f17", id: "f17", char: ""},
        129: {name: "f18", id: "f18", char: ""},
        130: {name: "f19", id: "f19", char: ""},
        186: {name: "semicolon", id: "semicolon", char: ";", shiftChar: ":"},
        187: {name: "equal", id: "equal", char: "=", shiftChar: "+"},
        188: {name: "comma", id: "comma", char: ",", shiftChar: "<"},
        189: {name: "minus", id: "minus", char: "-", shiftChar: "_"},
        190: {name: "period", id: "period", char: ".", shiftChar: ">"},
        191: {name: "slash", id: "slash", char: "/", shiftChar: "?"},
        192: {name: "backQuote", id: "backQuote", char: "`", shiftChar: "~"},
        219: {name: "bracketLeft", id: "bracketLeft", char: "[", shiftChar: "{"},
        220: {name: "backslash", id: "backslash", char: "\\", shiftChar: "|"},
        221: {name: "bracketRight", id: "bracketRight", char: "]", shiftChar: "}"},
        222: {name: "quote", id: "quote", char: "'", shiftChar: '"'},
    },
};
