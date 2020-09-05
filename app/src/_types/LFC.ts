import {ReactElement, ValidationMap, WeakValidationMap} from "react";

/**
 * Leaf Functional Component. A functional react component, that doesn't by default accept children
 */
export interface LFC<P = {}> {
    (props: P, context?: any): ReactElement<any, any> | null;
    propTypes?: WeakValidationMap<P>;
    contextTypes?: ValidationMap<any>;
    defaultProps?: Partial<P>;
    displayName?: string;
}
