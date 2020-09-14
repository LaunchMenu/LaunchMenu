import {KeyPattern} from "./KeyPattern";
import {IKeyEventListener} from "../../../../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {ITextField} from "../../../../../textFields/_types/ITextField";

/**
 * Creates a text field key handler that captures the keys as a key pattern
 * @param textField The text field to create the handler for
 * @param onExit The code to execute when the text field is exited
 * @returns The key handler that can be added to the input handler stack
 */
export function createKeyPatternFieldKeyHandler(
    textField: ITextField,
    onExit?: () => void
): IKeyEventListener {
    // Keep track of whether anything was pressed so far, in order to not trigger close on release of a key that this handler didn't register (for instance enter to open this handler)
    let pressedAnything = false;
    return e => {
        if (e.type == "up" && e.held.length == 0) {
            if (pressedAnything) {
                onExit?.();
                pressedAnything = false;
            }
        } else if (e.type == "down") {
            pressedAnything = true;
            textField.set(
                KeyPattern.sortKeys([...e.held, e.key].map(({name}) => name)).join(
                    KeyPattern.keySeparator
                )
            );
        }
        return true;
    };
}
