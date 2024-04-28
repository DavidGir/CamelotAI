import { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js';

export default function usePdfThumbnail(fileUrl: string): string {
  const [thumbnailSrc, setThumbnailSrc] = useState('');

  useEffect(() => {
    const fetchPdfThumbnail = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1); // Get the first page
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context!,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        setThumbnailSrc(canvas.toDataURL());
      } catch (error) {
        console.error('Error loading PDF for thumbnail', error);
      }
    };

    fetchPdfThumbnail();
  }, [fileUrl]);

  return thumbnailSrc;
};