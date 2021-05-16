import {IKey, IKeyId, IKeyName, keyIdMapping} from "@launchmenu/core";

/**
 * Retrieves a given key from the character
 * @param character The character to get the name for
 * @returns The key name if it could be found
 */
export function getKeyFromCharacter(
    character: string
): {key: IKey; usesShift: boolean} | undefined {
    if (character in keyCharMap) {
        const data = keyCharMap[character as keyof typeof keyCharMap];
        const dataObj = typeof data == "string" ? {key: data, usesShift: false} : data;
        const keyId = keyPairs.find(([id, name]) => name == dataObj.key)?.[0] as IKeyId;
        if (keyId) {
            return {
                key: {name: dataObj.key, id: keyId, char: character},
                usesShift: dataObj.usesShift,
            };
        }
    }
    return undefined;
}

const keyPairs = Object.entries(keyIdMapping);

const keyCharMap = {
    a: "a",
    b: "b",
    c: "c",
    d: "d",
    e: "e",
    f: "f",
    g: "g",
    h: "h",
    i: "i",
    j: "j",
    k: "k",
    l: "l",
    m: "m",
    n: "n",
    o: "o",
    p: "p",
    q: "q",
    r: "r",
    s: "s",
    t: "t",
    u: "u",
    v: "v",
    w: "w",
    x: "x",
    y: "y",
    z: "z",
    "0": "0",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "[": "bracketLeft",
    "]": "bracketRight",
    " ": "space",
    "-": "minus",
    "=": "equal",
    "`": "backquote",
    "\\": "backslash",
    ";": "semicolon",
    "'": "quote",
    ".": "period",
    ",": "comma",
    "\n": "enter",
    A: {key: "a", usesShift: true},
    B: {key: "b", usesShift: true},
    C: {key: "c", usesShift: true},
    D: {key: "d", usesShift: true},
    E: {key: "e", usesShift: true},
    F: {key: "f", usesShift: true},
    G: {key: "g", usesShift: true},
    H: {key: "h", usesShift: true},
    I: {key: "i", usesShift: true},
    J: {key: "j", usesShift: true},
    K: {key: "k", usesShift: true},
    L: {key: "l", usesShift: true},
    M: {key: "m", usesShift: true},
    N: {key: "n", usesShift: true},
    O: {key: "o", usesShift: true},
    P: {key: "p", usesShift: true},
    Q: {key: "q", usesShift: true},
    R: {key: "r", usesShift: true},
    S: {key: "s", usesShift: true},
    T: {key: "t", usesShift: true},
    U: {key: "u", usesShift: true},
    V: {key: "v", usesShift: true},
    W: {key: "w", usesShift: true},
    X: {key: "x", usesShift: true},
    Y: {key: "y", usesShift: true},
    Z: {key: "z", usesShift: true},
    "!": {key: "1", usesShift: true},
    "@": {key: "2", usesShift: true},
    "#": {key: "3", usesShift: true},
    $: {key: "4", usesShift: true},
    "%": {key: "5", usesShift: true},
    "^": {key: "6", usesShift: true},
    "&": {key: "7", usesShift: true},
    "*": {key: "8", usesShift: true},
    "(": {key: "9", usesShift: true},
    ")": {key: "0", usesShift: true},
    "{": {key: "bracketLeft", usesShift: true},
    "}": {key: "bracketLeft", usesShift: true},
    _: {key: "minus", usesShift: true},
    "+": {key: "equal", usesShift: true},
    "~": {key: "backquote", usesShift: true},
    "|": {key: "backslash", usesShift: true},
    ":": {key: "semicolon", usesShift: true},
    '"': {key: "quote", usesShift: true},
    "<": {key: "comma", usesShift: true},
    ">": {key: "period", usesShift: true},
} as const;
