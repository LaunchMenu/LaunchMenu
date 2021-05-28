import {isPlatform} from "./isPlatform";

/** The modifier to make the arrow keys act for menu navigation instead of text navigation */
export const menuNavigationModifier = isPlatform("mac") ? "ctrl" : "alt";
