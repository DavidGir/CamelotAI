import usePdfThumbnail from '@/app/hooks/usePdfThumbnail';
import { SpinnerCircularFixed } from 'spinners-react';

const Thumbnail = ({ fileUrl }: { fileUrl: string }) => {
  const thumbnailSrc = usePdfThumbnail(fileUrl);

  return (
    <div className="relative aspect-square w-full h-full">  
      {thumbnailSrc ? (
        <img 
          src={thumbnailSrc} 
          alt="PDF thumbnail" 
          className="absolute inset-0 h-full w-full object-cover" 
        />
      ) : (
        <div className="flex items-center justify-center h-full w-full">  
          <SpinnerCircularFixed color="#FFFF" />
        </div>
      )}
    </div>
  );
};

export default Thumbnail;