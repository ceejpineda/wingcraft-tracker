import { useEffect, useState } from 'react'
import KanbanColumn from '@/components/organisms/KanbanColumn'
import { DragDropContext } from '@hello-pangea/dnd'
import apiClient from '@/services/apiClient'

const columns = [
  { status: 'pending', color: 'red', 'icon': '🕙', label: 'Pending' },
  { status: 'moulding', color: 'yellow', 'icon': '🛠️', label: 'Moulding' },
  { status: 'putty', color: 'green', 'icon': '🎨', label: 'Putty and Spray' },
  { status: 'artist', color: 'blue', 'icon': '🧑‍🎨', label: 'Artist' },
  { status: 'detail', color: 'purple', 'icon': '📦', label: 'Detailing' },
  { status: 'quality', color: 'pink', 'icon': '🔍', label: 'Quality' },
  { status: 'shipped', color: 'orange', 'icon': '🚚', label: 'Shipped' },
]

interface Order {
  _id: string;
  status: string;
}

const batchUpdateOrders = async (orders: Record<string, Order[]>) => {
  const formattedOrders = Object.values(orders).flat().map((order, index) => {
    if (!order) return null;
    return {
      id: order._id,
      status: order.status,
      index: index,
    };
  }).filter(order => order !== null);

  const response = await apiClient.put('/api/orders', { orders: formattedOrders });
  return response.data;
};


interface KanbanBoardProps {
  data: Order[];
  isLoading: boolean;
  mutate: () => void;
}

const KanbanBoard = ({ data, isLoading, mutate }: KanbanBoardProps) => {
  const [orders, setOrders] = useState<any>({
    pending: [],
    moulding: [],
    putty: [],
    artist: [],
    detail: [],
    quality: [],
    shipped: [],
  })

  useEffect(() => {
    if (data) {
      const pending = data.filter((order:any) => order.status === 'pending');
      const moulding = data.filter((order:any) => order.status === 'moulding');
      const putty = data.filter((order:any) => order.status === 'putty');
      const artist = data.filter((order:any) => order.status === 'artist');
      const detail = data.filter((order:any) => order.status === 'detail');
      const quality = data.filter((order:any) => order.status === 'quality');
      const shipped = data.filter((order:any) => order.status === 'shipped');

      setOrders({ pending, moulding, putty, artist, detail, quality, shipped });
    }
  }, [data]);

  const onDragEnd = async (result: any) => {
    const { source, destination } = result;
  
    if (!destination) return;
    if (source.droppableId === destination.droppableId) {
      const sourceItems = [...orders[source.droppableId]];
    
      const [draggedItem] = sourceItems.splice(source.index, 1);
      
      sourceItems.splice(destination.index, 0, draggedItem);
      
      const updatedItems = sourceItems.map((item, index) => ({
        ...item,
        index
      }));
      
      setOrders({
        ...orders,
        [source.droppableId]: updatedItems
      });
      
      await batchUpdateOrders({
        ...orders,
        [source.droppableId]: updatedItems
      });
      mutate();
    } else {
      const sourceColumn = source.droppableId
      const destinationColumn = destination.droppableId

      const sourceItems = Array.isArray(orders[sourceColumn]) ? [...orders[sourceColumn]] : [];
      const destinationItems = Array.isArray(orders[destinationColumn]) ? [...orders[destinationColumn]] : [];

      const removed = orders[sourceColumn].find((order: any) => order.index === source.index);

      const updatedSourceItems = sourceItems.filter((order: any) => order.index !== source.index);
      const updatedDestinationItems = [...destinationItems, { ...removed, status: destinationColumn }];

      setOrders({
        ...orders,
        [sourceColumn]: updatedSourceItems,
        [destinationColumn]: updatedDestinationItems,
      });

      await batchUpdateOrders({
        ...orders,
        [sourceColumn]: updatedSourceItems,
        [destinationColumn]: updatedDestinationItems,
      });
      mutate();
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <h1 className="text-lg font-bold mb-5">Total Orders: {data ? data.length : 0}</h1>
      <div className="kanban-board flex space-x-4">
        {columns.map((column, index) => (
          <KanbanColumn
            key={index}
            status={column.status}
            label={column.label}
            color={column.color}
            count={orders[column.status] ? orders[column.status].length : 0}
            icon={column.icon}
            items={orders[column.status] || []}
            isLoading={isLoading}
            mutate={mutate}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;