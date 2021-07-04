import {isPlatform} from "./isPlatform";

/** The modifier to make the arrow keys jump entire words at once */
export const wordJumpModifier = isPlatform("mac") ? "alt" : "ctrl";
