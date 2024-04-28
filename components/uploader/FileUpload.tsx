'use client'

import { UploadButton } from "@bytescale/upload-widget-react";
import { useState } from 'react';
import axios from 'axios';
import { SpinnerDotted } from 'spinners-react';
import '../../styles/global.css';
import notifyUser from "@/app/utils/notifyUser";
import { useRouter } from 'next/navigation'

// Interface for the document object:
interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
}

export default function FileUpload({   
  docsList,
  onDocumentAdd,
  
}: {
  docsList: Document[];
  onDocumentAdd: (newDocs: Document[]) => void;
}) {

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Options is an object that contains the configuration for the Upload Widget:
  const options = {
    apiKey: !!process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
      ? process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
      : 'No Bytescale api key found',
    maxFileCount: 6,
    mimeTypes: ['application/pdf'],
    editor: { images: { crop: false } },
    styles: {
      colors: {
        primary: "#000000",   // Primary buttons & links
        error: "#d23f4d",     // Error messages
        shade600: "#000000",  // Border
        shade500: "#000000",  // Modal close button
        shade900: "rgb(229, 231, 235)"   // Various (draggable crop buttons, etc.)
      },
      breakpoints: {
        fullScreenHeight: 420,
        fullScreenWidth: 750
      },
    },
  };

  const handleComplete = async (files: any) => {
    // Check if files array is empty or undefined
    if (!files || files.length === 0) {
      // If no files were uploaded, simply return without doing anything further
      setLoading(false);
      return;
    }
    // Check if the total number of documents in the list and the number of files uploaded exceeds the set limit of 6
    if (docsList.length + files.length > 6) {
      notifyUser('You cannot upload more than six documents.', {
        type: 'error',
      });
      return;
    }
    // Map existing document names for quick lookup
    const existingFileNames = new Set(docsList.map(doc => doc.fileName));
    const newFiles = [];
    const duplicateFileNames = [];
    // Filter new files to avoid duplicates in the current batch and existing docs
    for (const file of files) {
      const fileName = file.originalFile.originalFileName;
      if (!existingFileNames.has(fileName)) {
        newFiles.push(file);
        existingFileNames.add(fileName); 
      } else {
        duplicateFileNames.push(fileName);
      }
    }
    // Notify user if there are any duplicates in the batch
    if (duplicateFileNames.length > 0) {
      notifyUser(`Duplicate documents are not uploaded. Only one will upload.`, {
        type: 'warning',
      });
    }
    // If no new files were found, return without doing anything further
    if (newFiles.length === 0) {
      setLoading(false);
      return; 
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/ingestPdf', newFiles.map(file => ({
        fileUrl: file.fileUrl,
        fileName: file.originalFile.originalFileName
      })));
      if (response.status === 200) {
        onDocumentAdd(response.data.documents); 
        setLoading(false);
        router.refresh();
      } else {
        throw new Error('Failed to ingest PDFs');
      }
    } catch (error) {
      console.error('Error during ingestion:', error);
      notifyUser('Failed to ingest the PDF!', {
        type: 'error',
      });
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex flex-col gap-4 container mt-10">
      {docsList.length > 0 ? (
        <h2 className="text-3xl leading-[1.1] tracking-tighter font-medium text-center">
          Upload a new doc
        </h2>
      ) : (
        <h2 className="text-3xl leading-[1.1] tracking-tighter font-medium text-center mt-5">
          No docs found. Upload a new doc below!
        </h2>
      )}
      <div className="mx-auto min-w-[450px] flex justify-center mb-10">
        {loading ? (
          <button
            type="button"
            className="inline-flex items-center mt-4 px-4 py-2 font-semibold leading-6 text-lg shadow rounded-md text-black transition ease-in-out duration-150 cursor-not-allowed"
          >
            <SpinnerDotted size={20} thickness={100} speed={140} color="rgba(0, 0, 0, 1)" className="mr-4" />
            Ingesting your PDF...
          </button>
        ) : (
          <UploadButton options={options} onComplete={handleComplete}>
            {({ onClick }) => (
              <button onClick={onClick} disabled={loading} className="flex justify-center bg-gun-gray text-white rounded-full py-2 px-4 hover:bg-gray-600 transition">
                Upload a file...
              </button>
            )}
          </UploadButton>
        )}
      </div>
    </div>
  );
}