import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import serverConfig from "@/services/config/server.config";
import { useState } from "react";

interface ImageGalleryProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  orderPics: string[];
  handleDeletePicture: (filename: string) => void;
  setIsDropzoneOpen: (open: boolean) => void;
}

const ImageGallery = ({ 
  isDialogOpen, 
  setIsDialogOpen, 
  orderPics, 
  handleDeletePicture, 
  setIsDropzoneOpen 
}: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const handleImageClick = (pic: string, index: number) => {
    setSelectedImage(pic);
    setSelectedImageIndex(index);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setSelectedImageIndex(null);
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-6xl h-[90vh] overflow-hidden p-4 sm:p-6">
          <DialogHeader className="pb-3 sm:pb-4 pr-10 sm:pr-12">
            <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <span className="text-lg sm:text-xl font-semibold flex-1">Order Pictures</span>
              <Button 
                onClick={() => setIsDropzoneOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-sm w-full sm:w-auto sm:mr-4"
              >
                Upload Pictures
              </Button>
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="h-full">
            <div className="w-full h-full">
              {orderPics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-h-[70vh] overflow-y-auto p-1 sm:p-2">
                  {orderPics.map((pic, index) => (
                    <div key={index} className="relative group border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white">
                      <div className="aspect-square relative">
                        <img 
                          src={`${serverConfig.url}/api/orders/pics/${pic}`} 
                          alt={`Order pic ${index + 1}`} 
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200" 
                          onContextMenu={(e) => e.stopPropagation()}
                          onClick={() => handleImageClick(pic, index)}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          onClick={() => handleDeletePicture(pic)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {index + 1} / {orderPics.length}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium mb-2">No pictures available</p>
                    <p className="text-sm text-gray-400">Click "Upload Pictures" to add some images</p>
                  </div>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>

      {/* Large Image Viewer Modal */}
      <Dialog open={!!selectedImage} onOpenChange={closeImageModal}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              onClick={closeImageModal}
            >
              <X className="h-4 w-4" />
            </Button>
            {selectedImage && (
              <div className="flex flex-col">
                <div className="relative">
                  <img 
                    src={`${serverConfig.url}/api/orders/pics/${selectedImage}`} 
                    alt={`Order pic ${(selectedImageIndex || 0) + 1}`} 
                    className="w-full h-auto max-h-[90vh] object-contain bg-black" 
                  />
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full">
                    {(selectedImageIndex || 0) + 1} of {orderPics.length}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGallery; 