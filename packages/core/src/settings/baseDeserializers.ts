import {KeyPattern} from "../keyHandler/KeyPattern";
import {IJSONDeserializer} from "./_types/serialization/IJSONDeserializer";

/** The standard deserializers used in settings */
export const baseDeserializers = [KeyPattern];

/** The base deserializes types */
export type IBaseDeserializers = typeof baseDeserializers[any] & IJSONDeserializer;
