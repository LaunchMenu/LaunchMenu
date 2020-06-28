import React from "react";
import {getSpacingAttributes} from "./attributeRetrievers/getSpacingAttributes";
import {getColorAttributes} from "./attributeRetrievers/getColorAttributes";
import {getMappedAttributes} from "./attributeRetrievers/getMappedAttributes";
import {ClassNames} from "@emotion/core";
import {getDomAttributes} from "./attributeRetrievers/getDomAttributes";
import {IBoxProps} from "./_types/IBoxProps";
import {useTheme} from "../theming/ThemeContext";

/**
 * A standard box element, which takes attributes/properties and translates them to css
 * @param props
 */
export const Box = (props: IBoxProps) => {
    // The LaunchMenu theme to use
    const theme = useTheme();

    // Extract the spacings, colors and general attributes
    const spacings = getSpacingAttributes(props, theme);
    const colors = getColorAttributes(props, theme);
    const general = getMappedAttributes(props);
    const cssProps = {...spacings, ...colors, ...general};

    // Extract dom attributes to apply
    const domAttributes = getDomAttributes(props);

    // Extract the component
    const Comp = props.as || ("div" as any);

    // Create the element with the retrieve data
    return (
        <ClassNames>
            {({css, cx}) => (
                <Comp
                    {...domAttributes}
                    className={
                        css(cssProps) +
                        " " +
                        domAttributes.className +
                        " " +
                        css(props.css)
                    }
                />
            )}
        </ClassNames>
    );
};
