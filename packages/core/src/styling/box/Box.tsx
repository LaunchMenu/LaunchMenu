import React, {FC} from "react";
import {ClassNames} from "@emotion/react";
import {IBoxProps} from "./_types/IBoxProps";
import {useTheme} from "../theming/ThemeContext";
import {mapCssProps} from "./propRetrievers/mapCssProps";
import {mapDomProps} from "./propRetrievers/mapDomProps";

/**
 * A standard box element, which takes attributes/properties and translates them to css
 * @param props The properties of the box
 */
export const Box: FC<IBoxProps> = props => {
    // The LaunchMenu theme to use
    const theme = useTheme();

    // Extract the css and dom props
    const cssProps = mapCssProps(props, theme);
    const domProps = mapDomProps(props, theme);

    // Extract the component
    const Comp = props.as || ("div" as any);

    // Create the element with the retrieve data
    return (
        <ClassNames>
            {({css, cx}) => (
                <Comp
                    {...domProps}
                    className={
                        (Object.keys(cssProps).length ? css(cssProps) + " " : "") +
                        (domProps.className ? domProps.className + " " : "")
                    }
                />
            )}
        </ClassNames>
    );
};
