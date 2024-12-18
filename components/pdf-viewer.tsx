'use client';

import { Viewer, Worker } from '@react-pdf-viewer/core';
import type { LoadError } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

interface PDFViewerProps {
  url: string;
}

function PDFViewer({ url }: PDFViewerProps) {
  return (
    <div className="h-[750px] border border-gray-300 rounded-lg">
      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
        <Viewer
          fileUrl={url}
          defaultScale={1.2}
          renderError={(error: LoadError) => (
            <div className="text-center py-8 text-red-600">
              Error loading PDF. Please try downloading instead.
              <div className="mt-2 text-sm text-gray-600">
                {error.message}
              </div>
            </div>
          )}
        />
      </Worker>
    </div>
  );
}

export default PDFViewer; 