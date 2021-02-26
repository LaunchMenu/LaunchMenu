import {IKeyEventListener} from "../../../keyHandler/_types/IKeyEventListener";

/** A standard interface to return a key handler as well as a function to dispose it */
export type IDisposableKeyEventListener = {
    /** The key handler itself */
    handler: IKeyEventListener;
    /** A function to dispose any dependencies the handler may have created */
    destroy: () => void;
};
