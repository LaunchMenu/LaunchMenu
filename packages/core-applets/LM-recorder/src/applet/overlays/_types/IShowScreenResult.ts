/** The result for the show screen function */
export type IShowScreenResult<T> = {
    /** Disposes the element */
    destroy: () => void;
    /** Updates the element's props */
    update: (props: T) => void;
};
