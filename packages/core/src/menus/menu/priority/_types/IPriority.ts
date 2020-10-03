/** 
 * A priority definition (the higher the number, the higher the priority).
 * When an array of type [f, ...rest] is supplied the f is leading, and rest will be used recursively for comparisons to settle ties. Absent values in rest will be interpreted as Priority.MEDIUM.
 **/
export type IPriority = number | number[];