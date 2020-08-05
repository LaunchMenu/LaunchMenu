import {Stack} from "../Stack";
import {IKeyEventListener} from "./_types/IKeyEventListener";
import {KeyHandler} from "./KeyHandler";
import {IKeyHandlerStack} from "./_types/IKeyHandlerStack";
import {KeyEvent} from "./KeyEvent";

/**
 * A stack to handle keyboard inputs
 */
export class KeyHandlerStack extends Stack<IKeyEventListener>
    implements IKeyHandlerStack {
    /**
     * Creates a new key handler stack
     * @param handler The handler to create the stack for
     */
    public constructor(handler?: KeyHandler);
    /**
     * Creates a new key handler
     * @param listeners The initial listeners
     */
    public constructor(listeners?: IKeyEventListener[]);
    public constructor(handler?: KeyHandler | IKeyEventListener[]) {
        super(handler instanceof Array ? handler : undefined);
        if (!(handler instanceof Array) && handler) handler.listen(e => this.emit(e));
    }

    /**
     * Emits a key event
     * @param event The event to emit
     * @returns Whether the event was caught
     */
    public async emit(event: KeyEvent): Promise<boolean> {
        const handlers = this.get();
        for (let i = handlers.length - 1; i >= 0; i--) {
            const handler = handlers[i];
            if (await (handler instanceof Function ? handler : handler.emit)(event))
                return true;
        }
        return false;
    }
}
