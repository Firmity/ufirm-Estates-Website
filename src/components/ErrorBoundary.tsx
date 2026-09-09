"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
    /** Rendered instead of children once an error is caught. Defaults to null (renders nothing). */
    fallback?: ReactNode;
    /** Optional tag used in the console log, e.g. "[RECAPTCHA_WIDGET]". */
    tag?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

/**
 * Generic error boundary for isolating unreliable subtrees (third-party widgets,
 * embeds, anything that can throw outside our control) so one component's failure
 * doesn't take down the whole page with Next.js's "Application error" screen.
 *
 * Only catches errors thrown during render/lifecycle of its children — not async
 * callbacks or event handlers, which need their own try/catch at the source.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error(`${this.props.tag ?? "[UI_BOUNDARY]"} caught render error:`, error, info.componentStack);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return this.props.fallback ?? null;
        }
        return this.props.children;
    }
}
