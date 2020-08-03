import React, {FC} from "react";
import {getSpacingAttributes} from "./attributeRetrievers/getSpacingAttributes";
import {getColorAttributes} from "./attributeRetrievers/getColorAttributes";
import {getMappedAttributes} from "./attributeRetrievers/getMappedAttributes";
import {ClassNames} from "@emotion/core";
import {getDomAttributes} from "./attributeRetrievers/getDomAttributes";
import {IBoxProps} from "./_types/IBoxProps";
import {useTheme} from "../theming/ThemeContext";
import {getElevationAttribute} from "./attributeRetrievers/getElevation";

/**
 * A standard box element, which takes attributes/properties and translates them to css
 * @param props
 */
export const Box: FC<IBoxProps> = props => {
    // The LaunchMenu theme to use
    const theme = useTheme();

    // Extract the spacings, colors and general attributes
    const spacings = getSpacingAttributes(props, theme);
    const colors = getColorAttributes(props, theme);
    const general = getMappedAttributes(props);
    const elevation = getElevationAttribute(props, theme);
    const cssProps = {...spacings, ...colors, ...general, ...elevation};

    // Extract dom attributes to apply
    const {onTop, index, ...domProps} = props as any; // Remove onTop and index since these may be passed by the view stack
    const domAttributes = getDomAttributes(domProps);

    // Extract the component
    const Comp = props.as || ("div" as any);

    // Create the element with the retrieve data
    return (
        <ClassNames>
            {({css, cx}) => (
                <Comp
                    {...domAttributes}
                    className={
                        (Object.keys(cssProps).length ? css(cssProps) + " " : "") +
                        (domAttributes.className ? domAttributes.className + " " : "") +
                        (props.css
                            ? css(
                                  props.css instanceof Function
                                      ? (props as any).css(theme)
                                      : props.css
                              )
                            : "")
                    }
                />
            )}
        </ClassNames>
    );
};
