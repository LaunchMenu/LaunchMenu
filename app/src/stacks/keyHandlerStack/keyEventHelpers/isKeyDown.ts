import {IKeyEvent} from "../_types/IKeyEvent";

/**
 * Checks whether a given key is held down as this key event is fired
 * @param event The event to check in
 * @param key The key to test for
 * @returns Whether the key was down
 */
export function isKeyDown(event: IKeyEvent, key: string | number): boolean {
    return !!event.held.find(({name, id}) => name == key || id == key);
}
