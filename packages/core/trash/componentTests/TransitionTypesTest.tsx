import React, {FC, useState} from "react";
import {Box} from "../../src/styling/box/Box";
import {SlideChangeTransition} from "../../src/components/stacks/transitions/change/SlideChangeTransition";
import {FillBox} from "../../src/components/FillBox";
import {SlideCloseTransition} from "../../src/components/stacks/transitions/close/SlideCloseTransition";
import {SlideOpenTransition} from "../../src/components/stacks/transitions/open/SlideOpenTransition";

export const TransitionTypeTest: FC = () => {
    const [children, setChildren] = useState([
        <FillBox background="bgPrimary">shits</FillBox>,
        <FillBox background="bgSecondary">shits2</FillBox>,
    ]);

    return (
        <div>
            <Box
                width={300}
                height={300}
                position={"relative"}
                onClick={() => {
                    setChildren([
                        ...children,
                        <FillBox
                            background={
                                (["bgPrimary", "bgSecondary", "bgTertiary"] as const)[
                                    Math.floor(Math.random() * 3)
                                ]
                            }>
                            final
                        </FillBox>,
                    ]);
                }}>
                <SlideChangeTransition direction="right" duration={500}>
                    {children}
                </SlideChangeTransition>
            </Box>

            <Box width={300} height={300} position={"relative"}>
                <SlideCloseTransition direction="down">
                    <FillBox background="primary">shits</FillBox>
                </SlideCloseTransition>
            </Box>

            <Box width={300} height={300} position={"relative"}>
                <SlideOpenTransition direction="left">
                    <FillBox background="primary">shits</FillBox>
                </SlideOpenTransition>
            </Box>
        </div>
    );
};
