import {IApplet} from "../../_types/IApplet";

/**
 * A type that transforms a given applet to the version that is retrieved if LM is supplied
 */
export type TWithLM<E extends IApplet> = E extends {withLM: (...args: any[]) => infer L}
    ? L extends (...args: any[]) => any
        ? Omit<E, "onDispose"> & {withSession: L}
        : Omit<E, "onDispose"> & L
    : E;
