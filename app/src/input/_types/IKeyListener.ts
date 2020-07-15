import {IKeyEvent} from "./IKeyEvent";

export type IKeyListener =
    /**
     * Responds to a key event
     * @param event The event to react to
     * @returns Whether the event should be caught
     */
    (event: IKeyEvent) => boolean;
