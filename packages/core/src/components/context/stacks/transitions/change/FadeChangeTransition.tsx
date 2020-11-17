import React, {useEffect, useState, FC, useCallback, useRef, isValidElement} from "react";
import {FillBox} from "../../../../FillBox";
import {IFadeChangeTransitionProps} from "./_types/IFadeChangeTransitionProps";

/**
 * A simple fading transition
 */
export const FadeChangeTransition: FC<IFadeChangeTransitionProps> = ({
    onComplete,
    children,
    duration = 150,
    activate = true,
}) => {
    const [started, setStarted] = useState(false);
    const transitionEl = useRef<HTMLElement>();
    useEffect(() => {
        setStarted(activate);
    }, [activate]);
    const _onComplete = useCallback((e: React.TransitionEvent) => {
        if (e.target != transitionEl.current) return;
        onComplete?.();
        e.stopPropagation();
        e.preventDefault();
    }, []);

    return (
        <>
            {[...children].reverse().map((child, i) => (
                <FillBox
                    elRef={transitionEl}
                    css={{
                        transition:
                            started && i > 0 ? `opacity ${duration}ms linear` : "",
                        opacity: started && i > 0 ? 0 : 1,
                    }}
                    onTransitionEnd={i == 1 ? _onComplete : undefined}
                    key={(isValidElement(child) && child.key) || i}>
                    {child}
                </FillBox>
            ))}
        </>
    );
};
