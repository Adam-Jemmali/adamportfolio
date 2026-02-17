import React, { useState, useRef } from 'react'
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import WindowsControls from "#components/WindowsControls.jsx";
import {DownloadIcon, ChevronUp, ChevronDown} from "lucide-react";
import useWindowStore from "#store/window.js";

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const Resume = () => {
    const data = useWindowStore((state) => state.windows.resume.data);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const scrollContainerRef = useRef(null);

    // Use default if no data is passed (e.g. from Navbar)
    const pdfFile = data?.href || data?.fileUrl || "/public/public/files/resume.pdf";
    const fileName = data?.name || "My resume!";

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const scrollToPage = (targetPage) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const pageHeight = container.scrollHeight / numPages;
            const targetScroll = (targetPage - 1) * pageHeight;

            container.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });

            setPageNumber(targetPage);
        }
    };

    const goToPrevPage = () => {
        const targetPage = Math.max(pageNumber - 1, 1);
        scrollToPage(targetPage);
    };

    const goToNextPage = () => {
        const targetPage = Math.min(pageNumber + 1, numPages);
        scrollToPage(targetPage);
    };

    // Track scroll position to update page number
    const handleScroll = () => {
        if (scrollContainerRef.current && numPages) {
            const container = scrollContainerRef.current;
            const pageHeight = container.scrollHeight / numPages;
            const currentPage = Math.floor(container.scrollTop / pageHeight) + 1;

            if (currentPage !== pageNumber && currentPage <= numPages) {
                setPageNumber(currentPage);
            }
        }
    };

    return <>
        <div id="window-header">
            <WindowsControls target="resume"/>
            <h2>{fileName}</h2>

            <div className="flex items-center gap-2">
                <button
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="icon disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronUp size={16}/>
                </button>

                <span className="text-xs">
                    {pageNumber} / {numPages || '—'}
                </span>

                <button
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    className="icon disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronDown size={16}/>
                </button>
            </div>

            <a href={pdfFile} download className="cursor-pointer icon">
                <DownloadIcon size={16}/>
            </a>
        </div>

        <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="overflow-auto flex-1 p-4 bg-gray-100"
        >
            <Document
                file={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex flex-col items-center gap-4"
            >
                {Array.from(new Array(numPages), (el, index) => (
                    <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        renderTextLayer
                        renderAnnotationLayer
                        className="shadow-lg"
                    />
                ))}
            </Document>
        </div>
    </>
}

const ResumeWindow = WindowWrapper(Resume, "resume");
export default ResumeWindow;