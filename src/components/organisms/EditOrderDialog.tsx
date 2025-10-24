import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/services/apiClient";
import { useToast } from "@/hooks/use-toast";

interface Plane {
  _id?: string;
  name: string;
  quantity: number;
  size: string;
}

interface EditOrderDialogProps {
  item: any;
  onUpdate: () => void;
}

const EditOrderDialog = ({ item, onUpdate }: EditOrderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [planes, setPlanes] = useState<Plane[]>([]);
  const [priority, setPriority] = useState("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && item) {
      setName(item.name || "");
      setPlanes(item.planes || []);
      setPriority(item.priority || "normal");
    }
  }, [open, item]);

  const handleAddPlane = () => {
    setPlanes([...planes, { name: "", quantity: 1, size: "" }]);
  };

  const handleRemovePlane = (index: number) => {
    const newPlanes = planes.filter((_, i) => i !== index);
    setPlanes(newPlanes);
  };

  const handlePlaneChange = (index: number, field: keyof Plane, value: string | number) => {
    const newPlanes = [...planes];
    newPlanes[index] = { ...newPlanes[index], [field]: value };
    setPlanes(newPlanes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive",
      });
      return;
    }

    if (planes.length === 0) {
      toast({
        title: "Error",
        description: "At least one plane is required",
        variant: "destructive",
      });
      return;
    }

    // Validate all planes
    for (const plane of planes) {
      if (!plane.name.trim() || !plane.size.trim() || plane.quantity <= 0) {
        toast({
          title: "Error",
          description: "All plane fields must be filled and quantity must be positive",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await apiClient.put(`/api/orders/${item._id}`, {
        name,
        planes: planes.map(({ _id, ...plane }) => plane), // Remove _id from planes
        priority,
      });
      
      toast({
        title: "Success",
        description: "Order updated successfully",
      });
      
      setOpen(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-green-50 text-green-600 hover:text-green-700"
          title="Edit Order"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Order</DialogTitle>
          <DialogDescription>
            Update the customer name and order details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter customer name"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Order Items</Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddPlane}
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-700 text-white"
                >
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {planes.map((plane, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-2 p-3 border rounded-md bg-gray-50"
                  >
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Plane name"
                        value={plane.name}
                        onChange={(e) =>
                          handlePlaneChange(index, "name", e.target.value)
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="w-full sm:w-24 space-y-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={plane.quantity}
                        onChange={(e) =>
                          handlePlaneChange(index, "quantity", parseInt(e.target.value) || 0)
                        }
                        min="1"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="w-full sm:w-32 space-y-2">
                      <Input
                        placeholder="Size"
                        value={plane.size}
                        onChange={(e) =>
                          handlePlaneChange(index, "size", e.target.value)
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemovePlane(index)}
                      disabled={isSubmitting || planes.length === 1}
                      className="w-full sm:w-auto"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-700"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;

