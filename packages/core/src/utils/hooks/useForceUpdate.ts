import {useState} from "react";

/**
 * A hook that can be used to force an update/rerender in a react component
 * @returns The function to call for a rerender
 */
export const useForceUpdate = (): (() => void) => {
    const [_, update] = useState(0);
    return () => update(v => v + 1);
};
