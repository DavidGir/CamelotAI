'use client'

import { UploadButton } from "@bytescale/upload-widget-react";
import { useRouter } from 'next/navigation';
import DocumentIcon from '../../components/ui/DocumentIcon'
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import axios from 'axios';
import DeleteBinIcon from "@/components/ui/DeleteBinIcon";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SpinnerDotted } from 'spinners-react';
import '../../styles/global.css';

// Interface for the document object:
interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
}

// Interface for deletion status:
interface DeletionStatus {
  [key: string]: boolean;
}

export default function Dashboard({   
  docsList,
}: {
  docsList: Document[];
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<DeletionStatus>({});

  // Options is an object that contains the configuration for the Upload Widget:
  const options = {
    apiKey: !!process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
      ? process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
      : 'No Bytescale api key found',
    maxFileCount: 4,
    mimeTypes: ['application/pdf'],
    editor: { images: { crop: false } },
    styles: {
      colors: {
        primary: "#000000",   // Primary buttons & links
        error: "#d23f4d",     // Error messages
        shade600: "#000000",  // Border
        shade500: "#000000",  // Modal close button
        shade900: "#F3DFC1"   // Various (draggable crop buttons, etc.)
      },
      breakpoints: {
        fullScreenHeight: 420,
        fullScreenWidth: 750
      },
    },
  };

  // Function to handle the completion of the upload process within the Bytescale widget:
  const handleComplete = (files: any) => {
    if (docsList.length + files.length > 4) {
      toast.error('You cannot upload more than four documents.');
      return;
    }
    // Create a set to track unique file names in the current batch
    const fileNamesInBatch = new Set();
    // Filter out the files that are already uploaded:
    const newFiles = files.filter((file: any) => {
      const fileName = file.originalFile.originalFileName;
      if (fileNamesInBatch.has(fileName)) {
        return false;
      } else {
        fileNamesInBatch.add(fileName);
        return !docsList.some(doc => doc.fileName === fileName);
      }
    });
      
    // Notify the user if there are duplicates:
    if (newFiles.length < files.length) {
      toast.warn('Duplicate documents are not uploaded.');
    }

    if (newFiles.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Ingest the PDFs:
    Promise.all(newFiles.map((file: any) => 
      ingestPdf(file.fileUrl, file.originalFile.originalFileName || file.filePath)
        .catch(error => {
          console.error('Error during ingestion:', error);
          toast.error('Failed to ingest the PDF!');
        })))
      // .then(() => setLoading(false));
  };

  // Function to ingest a PDF file:
  async function ingestPdf(fileUrl: string, fileName: string) {
    try {
      const response = await axios.post('/api/ingestPdf', {
        fileUrl,
        fileName,
      });
      router.push(`/document/${response.data.id}`);
    } catch (error) {
      console.error('Error ingesting PDF', error);
      toast.error('Failed to ingest the PDF!');
    }
  };

  // Function to delete a document and also delete the vectors from Pinecone namespace
  // It sends a DELETE request to the server:
  async function deleteDocument(id: string, fileUrl: string) {
    // Set the loading status for the specific document:
    setDeletionStatus(prevStatus => ({ ...prevStatus, [id]: true }));
    try {
      await axios.delete(`/api/doc/${id}`, {
        params: {
          id: id,
          fileUrl: fileUrl,
        },
      })
      toast.success('Document successfully deleted!');
      router.refresh();
    } catch (error) {
      console.error('Error deleting document', error);
      toast.error('Failed to delete the document!');
    } finally {
      // Clear toast notifications as they pop up one after another:
      toast.clearWaitingQueue();
    }
  };

  return (
    <div className="mx-auto flex flex-col gap-4 container mt-10">
      <ToastContainer 
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="dark"
        limit={1}
      />
      {docsList.length > 0 && (
        <div className="flex flex-col gap-4 mx-10 my-5">
          <div className="flex flex-col sm:min-w-[650px] mx-auto gap-4">
            {docsList.map((doc: any) => (
              <div
                key={doc.id}
                className="flex justify-between border border-black shadow-lg bg-ancient-beige p-3 hover:bg-gray-100 transition sm:flex-row flex-col sm:gap-0 gap-3 rounded-xl"
              >
                <button
                  onClick={() => router.push(`/document/${doc.id}`)}
                  className="flex gap-4"
                >
                  <DocumentIcon />
                  <span className="truncate-text">{doc.fileName}</span>
                </button>
                <div className="flex gap-4 items-center">  
                <span>{formatDistanceToNow(doc.createdAt)} ago</span>
                <button onClick={() => deleteDocument(doc.id, doc.fileUrl)} className="flex items-center">
                  {deletionStatus[doc.id] ? (
                    <SpinnerDotted size={20} thickness={100} speed={140} color="rgba(0, 0, 0, 1)" /> 
                  ) : (
                    <DeleteBinIcon />
                  )}
                </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
              <button onClick={onClick} disabled={loading} className="flex justify-center bg-ancient-beige border border-black rounded-xl py-2 px-4 hover:bg-gray-100 transition">
                Upload a file...
              </button>
            )}
          </UploadButton>
        )}
      </div>
    </div>
  );
}