import { Card, CardContent, CardHeader } from "@/components/ui/card";
import clsx from "clsx";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import apiClient from "@/services/apiClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { useDropzone } from "react-dropzone";
import serverConfig from "@/services/config/server.config";
import Slider from "react-slick";

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

let settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
};

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
      formData.append('pics', file);
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
        console.log(items)
        const order = items.find((item) => item._id === selectedOrder);
        if (!order) return;    
        setOrderPics(order.pics);
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

    setOrderPics(order.pics);
    console.log("Order pics:", order.pics);

    setIsDialogOpen(true);
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
                <Draggable
                  key={item._id}
                  draggableId={item._id}
                  index={item.index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-white p-4 py-4 mb-2 rounded shadow relative"
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-bold">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            Order Date:{" "}
                            {new Date(item.createdAt).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => handleClicked(item._id)}
                          className="bg-blue-500 hover:bg-blue-700 text-white"
                        >
                          View Images
                        </Button>
                      </div>
                      <div className="border-t mt-2 pt-2">
                        <p>Order Summary:</p>
                        <ul className="list-disc list-inside">
                          {item.planes.map((plane: any) => (
                            <li key={plane._id}>
                              {plane.name} -{" "}
                              <span className="font-bold text-xs">
                                {plane.quantity} pc/s
                              </span>{" "}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="border-t mt-2 pt-2">
                        <p className="text-xs text-gray-500">
                          Estimated time due:{" "}
                          {new Date(
                            new Date(item.createdAt).getTime() +
                              60 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p
                          className={`text-xs font-bold ${
                            new Date() >
                            new Date(
                              new Date(item.createdAt).getTime() +
                                60 * 24 * 60 * 60 * 1000
                            )
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {new Date() >
                          new Date(
                            new Date(item.createdAt).getTime() +
                              60 * 24 * 60 * 60 * 1000
                          )
                            ? "Overdue"
                            : "On Time"}
                        </p>
                      </div>

                      <div className="absolute bottom-4 right-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-100 z-999"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the order.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item._id);
                                }}
                                disabled={isDeleting === item._id}
                              >
                                {isDeleting === item._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </CardContent>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-4">
              Order Pictures
              <Button onClick={() => setIsDropzoneOpen(true)}>
                Upload Pictures
              </Button>
            </DialogTitle>
            <DialogDescription>
              <div className="w-full overflow-hidden">
                <Slider className="h-full w-full overflow-hidden" {...settings}>
                  {orderPics.length > 0 ? (
                    orderPics.map((pic, index) => (
                      <div key={index} className="h-full w-full overflow-hidden">
                        <img src={`${serverConfig.url}/${pic}`} alt={`Order pic ${index + 1}`} className="h-full w-full object-contain" onContextMenu={(e) => e.stopPropagation()} />
                      </div>
                    ))
                  ) : (
                    [<div key='x'>No pictures available</div>]
                  )}
                </Slider>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
        </Dialog>

        <Dialog open={isDropzoneOpen} onOpenChange={setIsDropzoneOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Pictures</DialogTitle>
              <DialogDescription>
                <div {...getRootProps({ className: 'dropzone' })} className="border-dashed border-2 border-gray-300 p-4 mb-4">
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
    </Card>
  );
};

export default KanbanColumn;
