import { useState } from 'react';
import useSWR from 'swr';
import apiClient from '@/services/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import DeleteConfirmationDialog from '@/components/organisms/DeleteConfirmationDialog';

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

const DoneOrders = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/orders/done', fetcher);
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleRestore = async (id: string) => {
    try {
      await apiClient.patch(`/api/orders/${id}/undone`);
      
      toast({
        title: "Success",
        description: "Order restored to Kanban board",
      });
      
      mutate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore order",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      await apiClient.delete(`/api/orders/${id}`);
      toast({
        title: "Success",
        description: "Order deleted permanently",
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-400 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getPriorityLabel = (priority: string) => {
    return priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Normal';
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-20 text-red-500">
          Failed to load done orders. Please check your connection.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">✓ Done Orders</h1>
        <div className="text-center py-20">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">✓ Done Orders</h1>
        <p className="text-gray-600">Archive of completed and finalized orders</p>
      </div>

      {!data || data.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center text-gray-500">
            <p className="text-lg mb-2">No done orders yet</p>
            <p className="text-sm">Orders marked as done will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((order: any) => (
            <Card key={order._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {order.name}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getPriorityColor(order.priority || 'normal')}`}>
                        {getPriorityLabel(order.priority)}
                      </span>
                    </CardTitle>
                  </div>
                  <DeleteConfirmationDialog
                    itemId={order._id}
                    handleDelete={handleDelete}
                    isDeleting={isDeleting}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Order Summary */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">ORDER SUMMARY</p>
                  <ul className="space-y-1">
                    {order.planes.map((plane: any) => (
                      <li key={plane._id} className="text-sm text-gray-700 flex justify-between">
                        <span>{plane.name}</span>
                        <span className="font-semibold text-blue-600">{plane.quantity} pc{plane.quantity !== 1 ? 's' : ''}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dates */}
                <div className="border-t pt-3 space-y-1">
                  <p className="text-xs text-gray-500">
                    📅 Created: {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  {order.completedAt && (
                    <p className="text-xs text-gray-500">
                      🚚 Shipped: {new Date(order.completedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                  {order.doneAt && (
                    <p className="text-xs text-green-600 font-semibold">
                      ✓ Done: {new Date(order.doneAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>

                {/* Completion Time */}
                {order.completedAt && (
                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500">
                      Total time: {Math.floor((new Date(order.completedAt).getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(order._id)}
                  className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-medium"
                >
                  ↩️ Restore to Kanban
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoneOrders;

