import { useState } from 'react';
import useSWR from 'swr';
import KanbanBoard from '@/components/KanbanBoard';
import apiClient from '@/services/apiClient';
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
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
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
  priority: string;
}

const Kanban = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/orders', fetcher, {
    refreshInterval: 5000,
  });

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planes, setPlanes] = useState([{ name: '', quantity: 1, size: '' }]);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      priority: 'normal' as const,
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
        status: 'pending',
        priority: data.priority,
      };

      await apiClient.post('/api/orders', payload);
      
      form.reset();
      setPlanes([{ name: '', quantity: 1, size: '' }]);
      setOpen(false);
      
      toast({
        title: "Success",
        description: "Order created successfully",
      });
      
      mutate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsDone = async (id: string) => {
    try {
      await apiClient.patch(`/api/orders/${id}/done`);
      
      toast({
        title: "Success",
        description: "Order marked as done and moved to archive",
      });
      
      mutate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark order as done",
        variant: "destructive"
      });
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-20 text-red-500">
          Failed to load orders. Please check your connection.
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-base sm:text-lg font-bold">Total Orders: {data ? data.length : 0}</h1>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button
              size={"lg"}
              className="bg-green-600 hover:bg-green-500 text-white"
            >
              + Create Order
            </Button>
          </DrawerTrigger>

          <DrawerContent>
            <div className="mx-auto w-full max-w-lg">
              <DrawerHeader>
                <DrawerTitle>Create New Order</DrawerTitle>
                <DrawerDescription>Fill up the form to create new order</DrawerDescription>
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

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="low">Low</option>
                              <option value="normal">Normal</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {planes.map((_plane, index) => (
                      <div key={index} className="space-y-2">
                        <p className="text-sm text-gray-500">Plane {index + 1}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      
      <KanbanBoard data={data || []} isLoading={isLoading} mutate={mutate} handleMarkAsDone={handleMarkAsDone} />
    </div>
  );
};

export default Kanban;

