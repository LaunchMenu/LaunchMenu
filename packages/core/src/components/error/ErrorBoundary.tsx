import React, {Component, ReactNode, ErrorInfo} from "react";
import {IBoxProps} from "../../styling/box/_types/IBoxProps";
import {Button} from "../Button";
import {ErrorMessage} from "../content/error/ErrorMessage";
import {ErrorBoundariesContext, ErrorBoundaryController} from "./ErrorBoundaryController";
import {IErrorComp} from "./_types/IErrorComp";

export type IErrorBoundaryProps = {
    /** An component to show when an error occurs */
    ErrorComp?: IErrorComp;
    /** A component to augment the default error */
    ErrorAdditionComp?: IErrorComp;
    /** A callback to perform when the user reloads the component */
    onReload?: () => void | Promise<void>;
    /** Whether to allow the user to attempt a reload, defaults to true */
    allowReload?: boolean;
    /** The message to show on the reload button, defaults to 'reload' */
    reloadMessage?: ReactNode;
};

/** A simple error boundary class */
export class ErrorBoundary extends Component<
    IErrorBoundaryProps & IBoxProps,
    {error?: any; errorInfo?: ErrorInfo; hasError: boolean; ErrorComp: IErrorComp}
> {
    protected controller?: ErrorBoundaryController;
    protected errorUnregistrar?: () => void;

    /** Creates a new error boundary component */
    public constructor(props: IErrorBoundaryProps) {
        super(props);
        this.state = {hasError: false, ErrorComp: DefaultErrorComp};
    }

    /** @override */
    public componentDidCatch(error: any, errorInfo: ErrorInfo) {
        this.removeRegisteredError();
        this.errorUnregistrar = this.controller?.registerError?.(
            error,
            this.reload,
            errorInfo
        );
        this.setState({
            hasError: true,
            error,
            errorInfo,
            ErrorComp:
                this.controller?.getErrorComp(this.props.ErrorComp ?? DefaultErrorComp) ??
                DefaultErrorComp,
        });
    }

    /** Tries to reload the component */
    protected reload = async () => {
        const {onReload} = this.props;
        await onReload?.();

        this.removeRegisteredError();
        this.setState({hasError: false});
    };

    /** Removes the error from the error boundary controller obtained from the context */
    protected removeRegisteredError() {
        this.errorUnregistrar?.();
        this.errorUnregistrar = undefined;
    }

    /** @override */
    render() {
        const {
            children,
            onReload,
            reloadMessage = "Reload",
            allowReload = true,
            ErrorAdditionComp,
            ...rest
        } = this.props;
        const {hasError, error, errorInfo, ErrorComp} = this.state;

        if (hasError) {
            return (
                <ErrorComp
                    error={error}
                    errorInfo={errorInfo}
                    reload={allowReload ? this.reload : undefined}
                    reloadMessage={reloadMessage}
                    boxProps={rest}
                    AdditionalComp={ErrorAdditionComp}
                />
            );
        }

        return (
            <ErrorBoundariesContext.Consumer>
                {controller => {
                    this.controller = controller;
                    return children;
                }}
            </ErrorBoundariesContext.Consumer>
        );
    }
}

const DefaultErrorComp: IErrorComp = ({
    error,
    reloadMessage,
    errorInfo,
    reload,
    AdditionalComp,
    boxProps,
}) => (
    <ErrorMessage padding="medium" overflow="auto" maxHeight="100%" {...boxProps}>
        {error + ""}
        {errorInfo && (
            <details style={{whiteSpace: "pre-wrap"}}>{errorInfo.componentStack}</details>
        )}
        {reload && (
            <Button primary marginTop="small" display="block" onClick={reload}>
                {reloadMessage}
            </Button>
        )}
        {AdditionalComp && (
            <AdditionalComp error={error} reload={reload} reloadMessage={reloadMessage} />
        )}
    </ErrorMessage>
);
