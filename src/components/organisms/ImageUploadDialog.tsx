import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Upload, Link, Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadDialogProps {
  isDropzoneOpen: boolean;
  setIsDropzoneOpen: (open: boolean) => void;
  getRootProps: any;
  getInputProps: any;
  onFilesAdded: (files: File[]) => void;
}

const ImageUploadDialog = ({ 
  isDropzoneOpen, 
  setIsDropzoneOpen, 
  getRootProps, 
  getInputProps,
  onFilesAdded
}: ImageUploadDialogProps) => {
  const [urlInput, setUrlInput] = useState("");
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const { toast } = useToast();
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  // Handle paste events for clipboard images
  const handlePaste = async (e: ClipboardEvent) => {
    console.log("Paste event triggered", e);
    e.preventDefault();
    
    const items = e.clipboardData?.items;
    console.log("Clipboard items:", items);
    
    if (!items) {
      console.log("No clipboard items found");
      return;
    }
    
    const files: File[] = [];
    
    // Convert items to array for easier handling
    const itemsArray = Array.from(items);
    console.log("Items array:", itemsArray);
    
    for (const item of itemsArray) {
      console.log("Processing item:", item.type, item.kind);
      
      // Handle image files from clipboard
      if (item.type.startsWith('image/')) {
        console.log("Found image item:", item.type);
        const file = item.getAsFile();
        if (file) {
          console.log("Got file from clipboard:", file.name, file.size);
          files.push(file);
        }
      }
      
      // Handle text (potential URLs) from clipboard
      if (item.type === 'text/plain') {
        try {
          const text = await new Promise<string>((resolve) => {
            item.getAsString(resolve);
          });
          console.log("Got text from clipboard:", text);
          
          if (isValidImageUrl(text.trim())) {
            console.log("Valid image URL found, uploading:", text);
            handleUrlUpload(text.trim());
            return;
          }
        } catch (error) {
          console.error("Error getting text from clipboard:", error);
        }
      }
    }
    
    if (files.length > 0) {
      console.log("Processing", files.length, "files from clipboard");
      onFilesAdded(files);
      toast({
        title: "Success",
        description: `${files.length} image(s) pasted from clipboard`,
      });
      setIsDropzoneOpen(false);
    } else {
      console.log("No valid images found in clipboard");
      toast({
        title: "Info",
        description: "No images found in clipboard. Try copying an image first.",
        variant: "destructive",
      });
    }
  };

  // Check if URL is a valid image URL
  const isValidImageUrl = (url: string) => {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
    } catch {
      return false;
    }
  };

  // Handle URL upload
  const handleUrlUpload = async (url?: string) => {
    const imageUrl = url || urlInput;
    
    if (!imageUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
      return;
    }

    if (!isValidImageUrl(imageUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid image URL (.jpg, .png, .gif, etc.)",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingUrl(true);
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL does not point to a valid image');
      }
      
      const fileName = imageUrl.split('/').pop() || 'image';
      const file = new File([blob], fileName, { type: blob.type });
      
      onFilesAdded([file]);
      toast({
        title: "Success",
        description: "Image loaded from URL",
      });
      setUrlInput("");
      setIsDropzoneOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load image from URL. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUrl(false);
    }
  };

  // Set up paste event listener
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      console.log("Global paste event, modal open:", isDropzoneOpen);
      if (isDropzoneOpen) {
        handlePaste(e);
      }
    };

    if (isDropzoneOpen) {
      console.log("Adding paste event listener");
      document.addEventListener('paste', handleGlobalPaste);
    }
    
    return () => {
      console.log("Removing paste event listener");
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [isDropzoneOpen, onFilesAdded]);

  return (
    <Dialog open={isDropzoneOpen} onOpenChange={setIsDropzoneOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Pictures
          </DialogTitle>
          <DialogDescription>
            Choose from multiple upload methods below
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* File Drop Zone */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Drag & Drop or Click to Browse
            </h3>
            <div 
              {...getRootProps({ className: 'dropzone' })} 
              className="border-dashed border-2 border-gray-300 hover:border-gray-400 p-8 rounded-lg cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100"
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium">Drop images here, or click to browse</p>
                <p className="text-sm text-gray-500 mt-1">Supports: JPEG, PNG, GIF, WebP (max 10MB each)</p>
              </div>
            </div>
          </div>

          {/* URL Upload */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Link className="h-4 w-4" />
              Upload from URL
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Paste image URL here..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlUpload()}
                className="flex-1"
              />
              <Button 
                onClick={() => handleUrlUpload()}
                disabled={isLoadingUrl}
                className="px-6"
              >
                {isLoadingUrl ? "Loading..." : "Upload"}
              </Button>
            </div>
          </div>

          {/* Clipboard Paste */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Clipboard className="h-4 w-4" />
              Paste from Clipboard
            </h3>
            <div 
              ref={pasteAreaRef}
              className="border-2 border-dashed border-blue-300 bg-blue-50 p-6 rounded-lg text-center"
            >
              <Clipboard className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-sm font-medium text-blue-700">Press Ctrl+V (or Cmd+V) to paste images</p>
              <p className="text-xs text-blue-600 mt-1">Supports images copied from other websites or screenshot tools</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog; 