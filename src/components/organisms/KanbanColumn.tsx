import { Card, CardContent, CardHeader } from "@/components/ui/card";
import clsx from "clsx";
import { Droppable } from "@hello-pangea/dnd";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { useDropzone } from "react-dropzone";
import apiClient from "@/services/apiClient";
import KanbanCard from "./KanbanCard";
import ImageGallery from "./ImageGallery";
import ImageUploadDialog from "./ImageUploadDialog";

interface KanbanColumnProps {
  status: string;
  count: number;
  color: string;
  icon?: string;
  label: string;
  items: { _id: string; index: number; name: string; pics: string[] }[];
  isLoading?: boolean;
  mutate: () => void;
}

const KanbanColumn = ({
  status,
  count,
  color,
  items,
  isLoading,
  icon,
  label,
  mutate,
}: KanbanColumnProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [orderPics, setOrderPics] = useState<string[]>([]);
  const [isDropzoneOpen, setIsDropzoneOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const onDrop = (acceptedFiles: File[]) => {
    if (!selectedOrder) {
      console.error("No order selected for upload");
      return;
    }
  
    if (acceptedFiles.length === 0) {
      console.error("No files selected for upload");
      return;
    }
  
    // Debugging logs
    console.log("Accepted files:", acceptedFiles);
  
    // Upload the pics to the server
    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('pictures', file);
    });
  
    // Log formData entries
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
  
    apiClient.post(`/api/orders/${selectedOrder}/pics`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        console.log("Upload successful", response);
        mutate();
        // Refresh pictures using the API endpoint
        fetchOrderPictures(selectedOrder);
        toast({
          title: "Success",
          description: "Pictures uploaded successfully",
        });
      })
      .catch(error => {
        console.error("Upload failed", error);
        toast({
          title: "Error",
          description: "Failed to upload pictures. Contact CJ for assistance.",
          variant: "destructive",
        });
      });
  
      setIsDropzoneOpen(false);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // Helper function to handle files added from different sources
  const handleFilesAdded = (files: File[]) => {
    onDrop(files);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      await apiClient.delete(`/api/orders/${id}`);
      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
      mutate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleClicked = (id: string) => {
    if (isDeleting) return;
    const order = items.find((item) => item._id === id);
    if (!order) return;

    setSelectedOrder(order._id);

    // Use the API endpoint to fetch pictures instead of relying on order.pics
    fetchOrderPictures(order._id);
    console.log("Order pics:", order.pics);

    setIsDialogOpen(true);
  };

  // Add function to delete individual pictures
  const handleDeletePicture = async (filename: string) => {
    if (!selectedOrder) return;
    
    try {
      await apiClient.delete(`/api/orders/${selectedOrder}/pics/${filename}`);
      toast({
        title: "Success",
        description: "Picture deleted successfully",
      });
      
      // Refresh the pictures list
      const response = await apiClient.get(`/api/orders/${selectedOrder}/pics`);
      setOrderPics(response.data.pictures?.map((pic: any) => pic.filename) || []);
      mutate(); // Also refresh the main data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete picture",
        variant: "destructive",
      });
    }
  };

  // Add function to fetch pictures for an order
  const fetchOrderPictures = async (orderId: string) => {
    try {
      const response = await apiClient.get(`/api/orders/${orderId}/pics`);
      // The API returns { orderId, pictures: [...] }, so we need to access response.data.pictures
      setOrderPics(response.data.pictures?.map((pic: any) => pic.filename) || []);
    } catch (error) {
      console.error("Failed to fetch pictures:", error);
      setOrderPics([]);
    }
  };

  return isLoading ? (
    <Card className="flex-1 min-w-[350px] flex flex-col bg-gray-100 rounded-lg shadow-md m-0">
      <CardHeader
        className={clsx(
          `bg-${color}-100`,
          `hover:bg-${color}-200`,
          "font-bold",
          "text-lg",
          "border-b-2"
        )}
      >
        <h2>
          {icon} {label}
        </h2>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="flex-1">
          <p>Loading...</p>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className="flex-1 min-w-[350px] flex flex-col bg-gray-100 rounded-lg shadow-md m-0">
      <CardHeader
        className={clsx(
          `bg-${color}-100`,
          `hover:bg-${color}-200`,
          "font-bold",
          "text-lg",
          "border-b-2"
        )}
      >
        <div className="flex flex-col gap-3">
          <h2>
            {icon} {label}
          </h2>
          <p className="text-xs font-light">{count} Orders</p>
        </div>
      </CardHeader>
      <CardContent className="pt-5 min-h-[calc(100vh-26vh)] h-[calc(100vh-26vh)]  overflow-y-scroll">
        <Droppable droppableId={status}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex-1 min-h-[calc(100vh-32vh)]"
            >
              {items.map((item: any) => (
                <KanbanCard
                  key={item._id}
                  item={item}
                  handleClicked={handleClicked}
                  handleDelete={handleDelete}
                  isDeleting={isDeleting}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </CardContent>
      
      <ImageGallery
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        orderPics={orderPics}
        handleDeletePicture={handleDeletePicture}
        setIsDropzoneOpen={setIsDropzoneOpen}
      />

      <ImageUploadDialog
        isDropzoneOpen={isDropzoneOpen}
        setIsDropzoneOpen={setIsDropzoneOpen}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        onFilesAdded={handleFilesAdded}
      />
    </Card>
  );
};

export default KanbanColumn;
