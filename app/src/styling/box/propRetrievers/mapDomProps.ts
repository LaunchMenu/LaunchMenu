import {domListenerMappers} from "./domMappers/domListenerMappers";
import {TPropMapperInputs} from "./_types/TPropMapperInputs";
import {ITheme} from "../../theming/_types/ITheme";
import {mapProps} from "./mapProps";
import {domLiteralMappers} from "./domMappers/domLiteralMappers";

/**
 * All the mapping functions to map properties to attributes
 */
export const domMappers = {...domListenerMappers, ...domLiteralMappers};

/**
 * All the allowed dom props
 */
export type IDomProps = TPropMapperInputs<typeof domMappers>;

/**
 * Maps the given props to dom properties
 * @param props The properties to map
 * @param theme The theme to use for the mapping
 * @returns The pure dom properties
 */
export function mapDomProps<P extends Partial<IDomProps>>(props: P, theme: ITheme) {
    return mapProps(props, domMappers, theme);
}
