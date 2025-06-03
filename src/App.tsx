import "./App.css";
import { useState } from "react";
import KanbanBoard from "./components/KanbanBoard";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import apiClient from "./services/apiClient";
import useSWR from 'swr'
import { Toaster } from "./components/ui/toaster";

const getOrders = async () => {
  const response = await apiClient.get('/api/orders')
  return response.data
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  planes: z.array(z.object({
    name: z.string().min(1, 'Plane name is required'),
    quantity: z.number().min(1, 'Quantity is required'),
    size: z.string().min(1, 'Size is required'),
  })),
});

interface Plane {
  name: string;
  quantity: number;
  size: string;
}

interface OrderPayload {
  name: string;
  planes: Plane[];
  status: 'pending';
}

function App() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, mutate } = useSWR('/api/orders', getOrders)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planes, setPlanes] = useState([{ name: '', quantity: 1, size: '' }]);
  const toast = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      planes: [{ name: '', quantity: 1, size: '' }]
    }
  });

  const addPlane = () => {
    setPlanes([...planes, { name: '', quantity: 1, size: '' }]);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      const payload: OrderPayload = {
        name: data.name,
        planes: data.planes,
        status: 'pending'
      };

      await apiClient.post('/api/orders', payload);
      
      form.reset();
      setPlanes([{ name: '', quantity: 1, size: '' }]);
      setOpen(false); // Close drawer
      
      toast.toast({
        title: "Success",
        description: "Order created successfully",
      });
      
      mutate(); // Refresh data
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5">
      <div className="flex items-center gap-5">
        <div>
          <h1 className="text-xl font-bold">Wingcraft Models Order Tracker</h1>
        </div>
        <Drawer open={open} onOpenChange={setOpen}>

          <DrawerTrigger asChild>
            <Button
              size={"lg"}
              className="bg-green-600 hover:bg-green-500 text-white"
            >
              Create Order
            </Button>
          </DrawerTrigger>

          <DrawerContent>
            
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Create New Order</DrawerTitle>
            <DrawerDescription>Fill up the form to Create new Order</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 max-h-[70vh] overflow-y-auto">
          <Form {...form}>
            <form className="p-4 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter customer name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {planes.map((_plane, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-sm text-gray-500">Plane {index + 1}</p>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`planes.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter model" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`planes.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                          <Input 
                              type="number" 
                              min="1" 
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`planes.${index}.size`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter size" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              <Button type="button" onClick={addPlane} variant="outline" className="w-full">
                + Add Another Plane
              </Button>

              <DrawerFooter>
                <Button type="submit" className="bg-green-600 hover:bg-green-500 text-white" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Order"}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
          </div>
        </div>
      </DrawerContent>
        </Drawer>
      </div>
      
      <KanbanBoard 
        data={data}
        isLoading={isLoading}
        mutate={mutate}
      />
      <Toaster />
    </div>
  );
}

export default App;
