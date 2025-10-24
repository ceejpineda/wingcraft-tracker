import { useEffect, useState } from 'react'
import KanbanColumn from '@/components/organisms/KanbanColumn'
import { DragDropContext } from '@hello-pangea/dnd'
import apiClient from '@/services/apiClient'

const columns = [
  { status: 'stock', color: 'teal', 'icon': '📦', label: 'In Stock' },
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
  handleMarkAsDone?: (id: string) => void;
}

const KanbanBoard = ({ data, isLoading, mutate, handleMarkAsDone }: KanbanBoardProps) => {
  const [orders, setOrders] = useState<any>({
    pending: [],
    moulding: [],
    putty: [],
    artist: [],
    detail: [],
    quality: [],
    stock: [],
    shipped: [],
  })
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>({})

  const toggleColumn = (status: string) => {
    setCollapsedColumns(prev => ({
      ...prev,
      [status]: !prev[status]
    }))
  }

  useEffect(() => {
    if (data) {
      const pending = data.filter((order:any) => order.status === 'pending').map((order, index) => ({ ...order, index }));
      const moulding = data.filter((order:any) => order.status === 'moulding').map((order, index) => ({ ...order, index }));
      const putty = data.filter((order:any) => order.status === 'putty').map((order, index) => ({ ...order, index }));
      const artist = data.filter((order:any) => order.status === 'artist').map((order, index) => ({ ...order, index }));
      const detail = data.filter((order:any) => order.status === 'detail').map((order, index) => ({ ...order, index }));
      const quality = data.filter((order:any) => order.status === 'quality').map((order, index) => ({ ...order, index }));
      const stock = data.filter((order:any) => order.status === 'stock').map((order, index) => ({ ...order, index }));
      const shipped = data.filter((order:any) => order.status === 'shipped').map((order, index) => ({ ...order, index }));

      setOrders({ pending, moulding, putty, artist, detail, quality, stock, shipped });
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

      const sourceItems = [...orders[sourceColumn]];
      const destinationItems = [...orders[destinationColumn]];

      const [draggedItem] = sourceItems.splice(source.index, 1);
      
      const updatedDraggedItem = { ...draggedItem, status: destinationColumn };
      destinationItems.splice(destination.index, 0, updatedDraggedItem);

      const updatedSourceItems = sourceItems.map((item, index) => ({ ...item, index }));
      const updatedDestinationItems = destinationItems.map((item, index) => ({ ...item, index }));

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
      <div className="kanban-board flex space-x-1 sm:space-x-2 overflow-x-auto pb-4">
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
            isCollapsed={collapsedColumns[column.status] || false}
            onToggleCollapse={() => toggleColumn(column.status)}
            handleMarkAsDone={handleMarkAsDone}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;