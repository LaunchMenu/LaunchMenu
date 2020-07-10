import React, {FC, useState} from "react";
import {Box} from "../styling/box/Box";
import {SlideChangeTransition} from "../components/stacks/transitions/change/SlideChangeTransition";
import {FillBox} from "../components/FillBox";
import {SlideCloseTransition} from "../components/stacks/transitions/close/SlideCloseTransition";
import {SlideOpenTransition} from "../components/stacks/transitions/open/SlideOpenTransition";

export const TransitionTypeTest: FC = () => {
    const [children, setChildren] = useState([
        <FillBox background="neutral9">shits</FillBox>,
        <FillBox background="neutral7">shits2</FillBox>,
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
                                (["primary", "neutral9", "neutral4"] as const)[
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
