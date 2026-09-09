"use client";

import { useEffect } from "react";

export default function ContactPageError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[CONTACT_PAGE_ERROR]", error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h2 className="text-2xl font-bold mb-2">This page hit a snag</h2>
            <p className="text-gray-600 mb-6 max-w-md">
                Something failed to load on the Contact page. You can retry, or reach us directly at{" "}
                <a href="mailto:support@ufirm.in" className="text-[#1f4e7a] underline">
                    support@ufirm.in
                </a>
                .
            </p>
            <button
                onClick={reset}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-md font-medium"
            >
                Try again
            </button>
        </div>
    );
}
