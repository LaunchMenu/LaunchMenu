export type IActionHandlerCore<I, O> =
    /**
     * Transforms the item bindings to the output action handler function
     * @param bindingData The data to create execution functions for
     * @returns The handler execution function(s)
     */
    (bindingData: I[]) => O;
