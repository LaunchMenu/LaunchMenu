import {cssSpacingMappers} from "./cssMappers/cssSpacingMappers";
import {TPropMapperInputs} from "./_types/TPropMapperInputs";
import {ITheme} from "../../theming/_types/ITheme";
import {mapProps} from "./mapProps";
import {TPropMapperOutputs} from "./_types/TPropMapperOutputs";
import {ICssProp} from "../_types/ICssProp";
import {cssColorMappers} from "./cssMappers/cssColorMappers";
import {cssThemeMappers} from "./cssMappers/cssThemeMappers";
import {cssLiteralMappers} from "./cssMappers/cssLiteralMapper";

/**
 * All the mapping functions to map properties to css
 */
export const cssMappers = {
    ...cssSpacingMappers,
    ...cssColorMappers,
    ...cssThemeMappers,
    ...cssLiteralMappers,
};

/**
 * All the allowed css props
 */
export type ICssMapperProps = TPropMapperInputs<typeof cssMappers>;

/**
 * All valid css theming props
 */
export type ICssProps = ICssMapperProps & {
    css?: ICssProp;
};

/**
 * Maps the given theme props to css properties
 * @param props The properties to map
 * @param theme The theme to use for the mapping
 * @returns The pure css properties
 */
export function mapCssProps<P extends Partial<ICssProps>>(
    props: P,
    theme: ITheme
): TPropMapperOutputs<typeof cssMappers, keyof P & keyof typeof cssMappers> &
    (P["css"] extends (theme: ITheme) => infer V ? V : P["css"]) {
    const themeCssProps = mapProps(props, cssMappers, theme) as any;

    const allCssProps = props.css
        ? {
              ...themeCssProps,
              ...(props.css instanceof Function ? props.css(theme) : props.css),
          }
        : themeCssProps;

    return allCssProps;
}
