'use client'

import { UploadDropzone } from "@bytescale/upload-widget-react";
import { useRouter } from 'next/navigation';
import DocumentIcon from '../../components/ui/DocumentIcon'
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import axios from 'axios';
import DeleteBinIcon from "@/components/ui/DeleteBinIcon";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SpinnerDotted } from 'spinners-react';

export default function Dashboard({ docsList }: { docsList: any }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<DeletionStatus>({});

  type DeletionStatus = {
    [key: string]: boolean;
  };

  const options = {
    apiKey: !!process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
      ? process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
      : 'no bytescale api key found',
    maxFileCount: 1,
    mimeTypes: ['application/pdf'],
    editor: { images: { crop: false } },
    styles: {
      colors: {
        primary: "#000000", // Primary buttons & links
        error: "#d23f4d", // Error messages
      },
    },
    onValidate: async (file: File): Promise<undefined | string> => {
      return docsList.length > 3
        ? `You've reached your limit for PDFs.`
        : undefined;
    },
  };

  const UploadDropZone = () => (
    <UploadDropzone
      options={options}
      onUpdate={({ uploadedFiles }) => {
        if (uploadedFiles.length !== 0) {
          setLoading(true);
          ingestPdf(
            uploadedFiles[0].fileUrl,
            uploadedFiles[0].originalFile.originalFileName || uploadedFiles[0].filePath,
          );
        }
      }}
      width="470px"
      height="250px"
      className="upload-dropzone-text upload-widget upload-widget__internal--draggable"
    />
  );

  async function ingestPdf(fileUrl: string, fileName: string) {
    try {
      const response = await axios.post('/api/ingestPdf', {
        fileUrl,
        fileName,
      });
      router.push(`/document/${response.data.id}`);
    } catch (error) {
      console.error('Error ingesting PDF', error);
    }
  };

  // Function to delete a document and also delete the vectors from Pinecone namespace
  // It sends a DELETE request to the server:
  async function deleteDocument(id: string) {
    // Set the loading status for the specific document:
    setDeletionStatus(prevStatus => ({ ...prevStatus, [id]: true }));
    try {
      await axios.delete(`/api/doc/${id}`, {
        params: {
          id: id,
        },
      })
      toast.success('Document successfully deleted!');
      router.refresh();
    } catch (error) {
      console.error('Error deleting document', error);
      toast.error('Failed to delete the document!');
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
      />
      {docsList.length > 0 && (
        <div className="flex flex-col gap-4 mx-10 my-5">
          <div className="flex flex-col sm:min-w-[650px] mx-auto gap-4">
            {docsList.map((doc: any) => (
              <div
                key={doc.id}
                className="flex justify-between border border-black shadow-lg bg-ancient-beige p-3 hover:bg-gray-100 transition sm:flex-row flex-col sm:gap-0 gap-3 rounded-xl "
              >
                <button
                  onClick={() => router.push(`/document/${doc.id}`)}
                  className="flex gap-4"
                >
                  <DocumentIcon />
                  <span>{doc.fileName}</span>
                </button>
                <div className="flex gap-4 items-center">  
                <span>{formatDistanceToNow(doc.createdAt)} ago</span>
                <button onClick={() => deleteDocument(doc.id)} className="flex items-center">
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
          Or upload a new doc
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
          <UploadDropZone />
        )}
      </div>
    </div>
  );
}