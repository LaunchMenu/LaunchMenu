import React, {useEffect, useState, FC, useCallback, useRef} from "react";
import {FillBox} from "../../../../FillBox";
import {IFadeOpenTransitionProps} from "./_types/IFadeOpenTransitionProps";

/**
 * A simple fading transition
 */
export const FadeOpenTransition: FC<IFadeOpenTransitionProps> = ({
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
        <FillBox
            elRef={transitionEl}
            onTransitionEnd={_onComplete}
            css={{
                transition: started ? `opacity ${duration}ms linear` : "",
                opacity: started ? 1 : 0,
            }}>
            {children}
        </FillBox>
    );
};
