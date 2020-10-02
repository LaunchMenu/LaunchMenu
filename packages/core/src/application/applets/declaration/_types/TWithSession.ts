import {IApplet} from "../../_types/IApplet";

/**
 * A type that transforms a given applet to the version that is retrieved if session is supplied
 */
export type TWithSession<E extends IApplet> = E extends {
    withSession: (...args: any[]) => infer S;
}
    ? Omit<E, "onCloseSession"> & S
    : E;
