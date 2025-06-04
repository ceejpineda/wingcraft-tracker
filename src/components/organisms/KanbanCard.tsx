import { Button } from "@/components/ui/button";
import { Draggable } from "@hello-pangea/dnd";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

interface KanbanCardProps {
  item: any;
  handleClicked: (id: string) => void;
  handleDelete: (id: string) => void;
  isDeleting: string | null;
}

const KanbanCard = ({ item, handleClicked, handleDelete, isDeleting }: KanbanCardProps) => {
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
            <DeleteConfirmationDialog
              itemId={item._id}
              handleDelete={handleDelete}
              isDeleting={isDeleting}
            />
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard; 