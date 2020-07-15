import {IKeyEvent} from "../_types/IKeyEvent";

/**
 * Checks whether the given event is strictly a key down event of a given type
 * @param event The event to check
 * @param key The key to check
 * @returns Whether it was a key down event of the given type
 */
export function isDownEvent(event: IKeyEvent, key: string | number): boolean {
    return (event.key.id == key || event.key.name == key) && event.down && !event.repeat;
}
