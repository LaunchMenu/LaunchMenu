import {isPlatform} from "./isPlatform";

/**
 * The (cross-platform compatible) keyboard modifier used commonly for commands.
 * On Windows and Linux ctrl key is commonly used as a modifier. However on mac, cmd is often used instead.
 * */
export const cmdModifier = isPlatform("mac") ? "meta" : "ctrl";
