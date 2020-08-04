import {IKey} from "./_types/IKey";
import {IKeyEventInput} from "./_types/IKeyEventInputs";
import {IKeyEventType} from "./_types/IKeyEventType";
import {IKeyMatcher} from "./keyIdentifiers/keys";

export class KeyEvent {
    /** The keys that were held down when this event was fired */
    public held: IKey[] = [];

    /** Whether the ctrl key is down */
    public ctrl: boolean;
    /** Whether the shift key is down */
    public shift: boolean;
    /** Whether the alt key is down */
    public alt: boolean;
    /** Whether the meta key is down */
    public meta: boolean;

    /** The keyboard event type */
    public type: IKeyEventType;
    /** The key that was altered */
    public key: IKey;

    /** The original event this event was obtained from if any */
    public original?: KeyboardEvent;

    /**
     * Creates a new keyboard event
     * @param event The data for the event to create
     * @param heldKeys The keys that are also held currently
     */
    public constructor(event: IKeyEventInput, heldKeys?: IKey[]) {
        this.type = event.type;
        this.key = event.key;
        this.original = event.original;

        if (heldKeys) this.setHeldKeys(heldKeys);
    }

    /**
     * Sets the keys that are also held while this event was created
     * @param keys The keys that are held, overrides the previous keys
     */
    public setHeldKeys(keys: IKey[]): void {
        this.held = [...this.held, ...keys];
        this.ctrl = !!this.held.find(k => k.name == "ctrl");
        this.shift = !!this.held.find(k => k.name == "shift");
        this.alt = !!this.held.find(k => k.name == "alt");
        this.meta = !!this.held.find(k => k.name == "meta");

        // Make sure the key type is consistent with the held keys
        if (this.type == "down") {
            // Change type to repeat if the key was already held
            if (this.held.find(k => k.id == this.key.id)) this.type = "repeat";
        } else if (this.type == "up") {
            // Remove the key from held if type is false
            this.held = this.held.filter(k => k.id != this.key.id);
        }
    }

    /**
     * Checkers whether this event fits a given description.
     * @param keys The keys to check for
     * @param type The event type to check for, defaults to "down"
     */
    public is(
        keys: IKeyMatcher | IKeyMatcher[],
        type: IKeyEventType | IKeyEventType[] = "down"
    ): boolean {
        // Check whether the event type corresponds
        if (type instanceof Array ? !type.includes(this.type) : type != this.type)
            return false;

        // Make sure the triggered event is in the collection
        if (!(keys instanceof Array)) keys = [keys];
        const includes = keys.find(key => this.key.id == key || this.key.name == key);
        if (!includes) return false;

        // Make sure all keys are covered
        const all = [...this.held, this.key];
        const unmatched = keys.filter(
            key => !all.find(held => held.id == key || held.name == key)
        );
        if (unmatched.length > 0) return false;

        return true;
    }
}
