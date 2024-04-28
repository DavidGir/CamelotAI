import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Document } from '@prisma/client';
import { IconPlus, IconClose } from '@/components/ui/icons';
import { Viewer, Worker  } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import type {
  ToolbarSlot,
  TransformToolbarSlot,
} from '@react-pdf-viewer/toolbar';
import PdfThumbnail from '@/components/ui/PdfThumbnail';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import notifyUser, { clearToastQueue } from "@/app/utils/notifyUser";
import DeleteBinIcon from "@/components/ui/DeleteBinIcon";
import { SpinnerCircularFixed } from 'spinners-react';
import DocumentIcon from '@/components/ui/DocumentIcon';

interface DocumentsProps {
  docsList: Document[];
  selectedDocId: string | null;
  selectedPage: number | null;
  onDocumentSelect: (docId: string, page: number) => void;
  resetSelection: () => void;
}

// Interface for deletion status:
interface DeletionStatus {
  [key: string]: boolean;
}

// Define the 'DocumentsComponent' functional component that takes 'docslist' as a prop
const DocumentsComponent: React.FC<DocumentsProps> = ({ docsList, selectedDocId, selectedPage, onDocumentSelect, resetSelection }) => {
  // Use the 'useState' hook to manage the 'showMore' and 'selectedDocument' state
  const [showMore, setShowMore] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  // Use the 'useState' hook to manage the 'loading' and 'deletionStatus' state
  const [loading, setLoading] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<DeletionStatus>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();

  // React-pdf-viewer plugins
  const toolbarPluginInstance = toolbarPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;
  const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
    ...slot,
    Download: () => <></>,
    SwitchTheme: () => <></>,
    Open: () => <></>,
  });

  // Use the 'useEffect' hook to set the 'selectedDocument' state when 'selectedDocId' changes
  useEffect(() => {
    const document = docsList.find(doc => doc.id === selectedDocId);
    if (document) {
      setSelectedDocument(document);
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
      setSelectedDocument(null);
    }
  }, [selectedDocId, selectedPage, docsList, pageNavigationPluginInstance]);

  // Define the 'handleDocumentClick' function to set the 'selectedDocument' state
  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document);
    // Call the 'onDocumentSelect' function to set the selected document and page; starting from page 1
    onDocumentSelect(document.id, 1);
    setIsModalOpen(true);
  };

  // Define the 'handleCloseModal' function to close the modal when clicking outside
  const handleCloseModal = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setSelectedDocument(null);
      setIsModalOpen(false);
      resetSelection();
    }
  };

  const handleDocumentLoadSuccess = () => {
    if (selectedPage !== null && selectedPage >= 0) {
        pageNavigationPluginInstance.jumpToPage(selectedPage - 1);
    }
  };

  // Define the 'DocumentsSkeleton' component to render a loading skeleton
  const DocumentsSkeleton = () => (
    <>
      {Array.from({ length: showMore ? 9 : 3 }).map((_, index) => (
        <div key={index} className="w-1/3 p-1">
          <div className="aspect-square w-full overflow-hidden animate-pulse">
            <DocumentIcon className="h-full w-full rounded bg-gray-gun"/>
          </div>
        </div>
      ))}
    </>
  );

  // Function to delete a document and also delete the vectors from Pinecone namespace
  // It sends a DELETE request to the server:
  async function deleteDocument(event: React.MouseEvent<HTMLButtonElement>, docId: string, fileUrl: string) {
    // Prevent event from bubbling up to parent elements
    event.stopPropagation();
    // Set the loading status for the specific document:
    setDeletionStatus(prevStatus => ({ ...prevStatus, [docId]: true }));
    try {
      const res = await fetch(`/api/doc/${docId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          docId,
          fileUrl,
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to delete the document');
      }
      notifyUser('Document successfully deleted!', {
        type: 'success',
      });
      router.refresh();
      // Clear any queued toasts before showing a new one:
      clearToastQueue();
    } catch (error) {
      console.error('Error deleting document', error);
      notifyUser('Failed to delete the document!', {
        type: 'error',
      });
    }
  };

  // Render the 'DocumentsComponent'
  return (
    <div className="mt-4 mr-2 rounded-lg bg-white p-4 shadow-lg dark:bg-gun-gray">
      <div className="flex items-center">
        <h2 className="flex-grow text-lg font-semibold text-black dark:text-white">
          Documents
        </h2>
        {docsList.length > 3 && (
          <div className="ml-2 flex justify-center">
            <button
              className="text-black focus:outline-none dark:text-white"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? <IconClose /> : <IconPlus />}
            </button>
          </div>
        )}
      </div>
      <div
        className={`mx-1 flex flex-wrap transition-all duration-500 ${showMore ? 'max-h-[800px]' : 'max-h-[800px]'} `}
      >
        {docsList.length === 0 ? (
          // Render the 'DocumentsSkeleton' if there are no documents
          <DocumentsSkeleton />
        ) : (
          // Render the documents with a hover effect and click handler
          docsList.slice(0, showMore ? 9 : 3).map((document, index) => (
            <Tooltip key={document.id || index}>
            <TooltipTrigger asChild>
              <div className="relative mt-2 w-1/3 cursor-pointer p-1 transition duration-200 ease-in-out hover:-translate-y-1 hover:scale-105" onClick={() => handleDocumentClick(document)}>
                <div className="aspect-square w-full overflow-hidden">
                  <PdfThumbnail fileUrl={document.fileUrl} />
                  <button 
                    onClick={(event) => deleteDocument(event, document.id, document.fileUrl)}  
                    className="absolute bottom-3 right-4 z-50 p-2 text-white bg-gun-gray rounded-full hover:bg-gray-600"
                    style={{ transform: 'translate(50%, 50%)' }} 
                  >
                  {deletionStatus[document.id] ? (
                    <SpinnerCircularFixed color="#FFFF" size="15"/> 
                  ) : (
                    <DeleteBinIcon />
                  )}
                </button>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-white">{document.fileName}</TooltipContent>
          </Tooltip>
          ))
        )}
      </div>

      {selectedDocument && (
        // Render a modal with the selected document if 'selectedDocument' is not null
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={handleCloseModal}
        >
          <div className="mt-10 h-full w-1/2">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
              <div className={`!important h-[90vh] w-full flex-col text-white`}>
                <div
                  className="align-center flex bg-[#eeeeee] p-1"
                  style={{
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
                </div>
                <Viewer
                  key={selectedDocument.id}
                  fileUrl={selectedDocument.fileUrl}
                  plugins={[
                    toolbarPluginInstance,
                    pageNavigationPluginInstance,
                  ]}
                  onDocumentLoad={handleDocumentLoadSuccess}
                />
              </div>
            </Worker>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsComponent;
