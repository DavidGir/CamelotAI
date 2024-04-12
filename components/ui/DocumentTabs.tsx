'use client'

import React, { useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import type {
  ToolbarSlot,
  TransformToolbarSlot,
} from '@react-pdf-viewer/toolbar';
import { Document } from '@prisma/client';

interface DocumentTabsProps {
  docsList: Document[];
  navigateToPage: { docIndex: number; pageNumber: number } | null;
  onTabSelect: (index: number) => void;
  selectedTab: number;
}

const DocumentTabs: React.FC<DocumentTabsProps> = ({ docsList, navigateToPage, onTabSelect, selectedTab }) => {
  
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

  // Utilize the selectedTab prop to set the active tab
  useEffect(() => {
    onTabSelect(selectedTab);
  }, [selectedTab, onTabSelect]);

  const handleTabSelect = (index: number) => {
    onTabSelect(index);
  };

  // Navigate to the page in the document
  useEffect(() => {
    // Only navigate if the pageNavigation instance and navigateToPage are set
    if (navigateToPage && pageNavigationPluginInstance && selectedTab === navigateToPage.docIndex) {
      pageNavigationPluginInstance.jumpToPage(navigateToPage.pageNumber);
    }
  }, [navigateToPage, pageNavigationPluginInstance, selectedTab]);

  return (
    <Tabs selectedIndex={selectedTab} onSelect={handleTabSelect}>
      <TabList className="flex overflow-x-auto">
        {docsList.map((doc, index) => (
          <Tab key={doc.id || index} className="flex-auto truncate max-w-[100px] cursor-pointer p-2 hover:bg-gray-100 border" title={doc.fileName}>{doc.fileName}</Tab>
        ))}
      </TabList>

      {docsList.map((doc, index) => (
        <TabPanel key={doc.id || index}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
          <div
            className={`w-full h-[90vh] flex-col text-white !important`}
          >
            <div
                className="align-center bg-[#eeeeee] flex p-1"
                style={{
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
              </div>
              <Viewer
                fileUrl={doc.fileUrl}
                plugins={[toolbarPluginInstance, pageNavigationPluginInstance]}
              />
          </div>
          </Worker>
        </TabPanel>
      ))}
    </Tabs>
  );
};

export default DocumentTabs;
