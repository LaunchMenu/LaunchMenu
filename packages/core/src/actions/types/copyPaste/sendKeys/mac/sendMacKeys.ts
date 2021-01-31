import {run} from "@jxa/run";
import {macKeyCodes} from "./macKeyCodes";
import {ISendKey} from "../_types/ISendKey";

//TODO: Port https://stackoverflow.com/a/1971027 to JXA

/**
 * Sends the given key presses to the Mac OS
 * @param keys The keys to be send
 */
export async function sendMacKeys(keys: ISendKey[]): Promise<void> {
    // Format the data into mac compatible codes
    const macCodes = keys.map(({key, modifiers}) => {
        const code = macKeyCodes[key as keyof typeof macKeyCodes];
        const macModifiers = modifiers.map(
            modifier =>
                (({
                    meta: "command down",
                    ctrl: "control down",
                    shift: "shift down",
                    alt: "option down",
                } as const)[modifier])
        );
        return code ? {code, modifiers: macModifiers} : {key, modifiers: macModifiers};
    });

    // Merge all keys in order to make fewer calls
    const mergedKeys = macCodes.reduceRight((list, {key, code, modifiers}) => {
        if (list.length == 0)
            return [key ? {keys: key, modifiers} : {codes: [code], modifiers}];

        const [first, ...rest] = list;
        if (modifiersEqual(first.modifiers, modifiers)) {
            if (key && "keys" in first)
                return [{...first, keys: key + first.keys}, ...rest];
            if (code && "codes" in first)
                return [{...first, codes: [code, ...first.codes]}, ...rest];
        }

        return [
            key ? {keys: key, modifiers} : {codes: [code], modifiers},
            first,
            ...rest,
        ];
    }, [] as IMergedKeys[]);

    // Send the commands using jxa
    await run((sequence: IMergedKeys[]) => {
        const events = Application("System Events");
        sequence.forEach(data => {
            if ("keys" in data) events.keystroke(data.keys, {using: data.modifiers});
            if ("codes" in data) events.keyCode(data.codes, {using: data.modifiers});
        });
    }, mergedKeys);
}

/** Declare the base application function that JXA uses */
declare function Application(name: string): any;

/** The merged keys format */
type IMergedKeys = ({keys: string} | {codes: number[]}) & {
    modifiers: ("shift down" | "control down" | "option down" | "command down")[];
};

/**
 * Checks whether the given modifiers are equal
 * @param modifiersA The set of modifiers A
 * @param modifiersB The set of modifiers B
 * @returns Whether these modifiers are equal
 */
function modifiersEqual(modifiersA: string[], modifiersB: string[]): boolean {
    return modifiersA || modifiersB
        ? modifiersA?.length == modifiersB?.length &&
              modifiersA.every(modifier => modifiersB.includes(modifier)) &&
              modifiersB.every(modifier => modifiersA.includes(modifier))
        : true;
}
