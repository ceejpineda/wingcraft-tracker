import { Button } from "@/components/ui/button";
import { Draggable } from "@hello-pangea/dnd";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import EditOrderDialog from "./EditOrderDialog";

interface KanbanCardProps {
  item: any;
  handleClicked: (id: string) => void;
  handleDelete: (id: string) => void;
  handleUpdate: () => void;
  handleMarkAsDone?: (id: string) => void;
  isDeleting: string | null;
}

const KanbanCard = ({ item, handleClicked, handleDelete, handleUpdate, handleMarkAsDone, isDeleting }: KanbanCardProps) => {
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

  return (
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
          className="bg-white p-4 mb-3 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          {/* Header Section */}
          <div className="mb-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1">
                <p className="font-bold text-base text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500">
                  📅 {new Date(item.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <EditOrderDialog item={item} onUpdate={handleUpdate} />
                <DeleteConfirmationDialog
                  itemId={item._id}
                  handleDelete={handleDelete}
                  isDeleting={isDeleting}
                />
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="border-t border-gray-200 pt-3 mb-3">
            <p className="text-xs font-semibold text-gray-600 mb-2">ORDER SUMMARY</p>
            <ul className="space-y-1.5">
              {item.planes.map((plane: any) => (
                <li key={plane._id} className="text-sm text-gray-700 flex justify-between">
                  <span className="flex-1">{plane.name}</span>
                  <span className="font-semibold text-blue-600 ml-2">
                    {plane.quantity} pc{plane.quantity !== 1 ? 's' : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Due Date Section */}
          <div className="border-t border-gray-200 pt-3 mb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs text-gray-500">
                  ⏰ Due: {new Date(
                    new Date(item.createdAt).getTime() +
                      60 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p
                  className={`text-xs font-bold mt-1 ${
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
                    ? "⚠️ Overdue"
                    : "✓ On Time"}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getPriorityColor(item.priority || 'normal')}`}>
                {getPriorityLabel(item.priority)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleClicked(item._id)}
              className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-medium"
            >
              🖼️ View Images
            </Button>
            
            {/* Mark as Done button - only show for shipped orders */}
            {item.status === 'shipped' && handleMarkAsDone && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAsDone(item._id)}
                className="w-full border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 font-medium"
              >
                ✓ Mark as Done
              </Button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard; 