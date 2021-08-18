import {ErrorInfo, ReactNode} from "react";
import {IBoxProps} from "../../../styling/box/_types/IBoxProps";

/** A type to pass custom error component to an error boundary */
export type IErrorComp = (props: {
    /** The error that was thrown */
    error: any;
    /** Additional react info about the error */
    errorInfo?: ErrorInfo;
    /** A function to reload the error boundary */
    reload?: () => void;
    /** The message to be shown on the user reload button */
    reloadMessage: ReactNode;
    /** An additional error component to augment this component with */
    AdditionalComp?: IErrorComp;

    /** Additional box properties to apply to the outer container */
    boxProps?: IBoxProps;
}) => JSX.Element;
