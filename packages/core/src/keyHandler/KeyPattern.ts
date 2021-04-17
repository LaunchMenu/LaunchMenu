import {
    IKeyArrayPatternData,
    IKeyPatternData,
} from "../menus/items/inputs/handlers/keyPattern/_types/IKeyPatternData";
import {IKeyMatcher} from "./keyIdentifiers/keys";
import {KeyEvent} from "./KeyEvent";

export class KeyPattern {
    public static keySeparator = "+";

    public readonly patterns: IKeyArrayPatternData[];

    /**
     * Creates the key pattern that can be tested against
     * @param pattern The pattern to be tested, in very simplified form, mostly intended for easy testing
     */
    public constructor(pattern: string);

    /**
     * Creates the key pattern that can be tested against
     * @param pattern The pattern to be tested
     */
    public constructor(patterns: IKeyPatternData[]);
    public constructor(patterns: string | IKeyPatternData[]) {
        if (typeof patterns == "string") patterns = [{pattern: patterns, type: "down"}];
        this.patterns = patterns.map(({pattern, type, allowExtra}) => ({
            type,
            allowExtra,
            pattern:
                typeof pattern == "string"
                    ? (KeyPattern.toArrayPattern(pattern) as IKeyMatcher[])
                    : pattern,
        }));
    }

    /**
     * Checks whether the given event matches the
     * @param event The event to check
     * @param ignoreType Whether to ignore the event type
     * @returns Whether a given event matches this pattern
     */
    public matches(event: KeyEvent, ignoreType: boolean = false): boolean {
        return !!this.patterns.find(({pattern, type: eventType, allowExtra}) => {
            // Check if the event type matches
            if (!ignoreType)
                if (eventType == "down or repeat") {
                    if (!["down", "repeat"].includes(event.type)) return false;
                } else if (eventType != event.type) return false;

            if (allowExtra && allowExtra.length > 0) {
                // Check if all pattern keys are included
                if (!event.includes(pattern)) return false;

                // Check if all event keys are allowed
                const all = [...allowExtra, ...pattern];
                const notAllowed = event.held.find(
                    ({name, id}) => !all.includes(name) && !all.includes(id)
                );
                if (notAllowed) return false;

                // Make sure that the key that just triggered was part of the pattern
                if (!pattern.includes(event.key.name) && !pattern.includes(event.key.id))
                    return false;
            } else {
                // Check if the event matches exactly
                if (!event.is(pattern, null)) return false;
            }

            return true;
        });
    }

    /**
     * Checks whether the event matches this pattern as a modifier key
     * @param event The event to check
     */
    public matchesModifier(event: KeyEvent): boolean {
        // TODO: move this behavior to a dedicated modifier class
        return !!this.patterns.find(({pattern}) => {
            return event.includes(pattern);
        });
    }

    /**
     * Simplifies the pattern to a string (leaving out some data)
     */
    public toString(): string {
        return this.patterns
            .map(({pattern}) => KeyPattern.toStringPattern(pattern))
            .join(", ");
    }

    // Serialization
    /**
     * Serializes the pattern
     * @returns The serialized pattern
     */
    public serialize(): IKeyArrayPatternData[] {
        return this.patterns;
    }

    // Helpers
    /**
     * Retrieves the purely string representation of a key pattern
     * @param keys The keys in the pattern
     * @returns The string form
     */
    public static toStringPattern(keys: IKeyMatcher[]): string {
        return keys.join(this.keySeparator);
    }

    /**
     * Retrieves the array representation of a key pattern
     * @param keys The key pattern
     * @returns The array form
     */
    public static toArrayPattern(keys: string): string[] {
        return keys.split(this.keySeparator).map(k => k.trim());
    }

    /**
     * Sorts the given keys
     * @param keys The keys to sort
     * @returns The sorted sequence of keys
     */
    public static sortKeys(keys: string[]): string[] {
        const codes = {
            ctrl: -3,
            controlLeft: -3,
            controlRight: -3,
            shift: -2,
            shiftLeft: -2,
            shiftRight: -2,
            alt: -1,
            altLeft: -1,
            altRight: -1,
        } as {[key: string]: number};
        return [...keys].sort((a, b) => {
            const code1 = codes[a] ?? a.charCodeAt(0);
            const code2 = codes[b] ?? b.charCodeAt(0);
            return code1 - code2;
        });
    }
}
