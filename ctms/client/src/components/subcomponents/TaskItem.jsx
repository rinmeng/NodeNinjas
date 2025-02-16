import { Trash, CalendarClock, SquarePen } from "lucide-react";

const TaskItem = ({
  task,
  handleDeleteTask,
  handleStatusChange,
  handleEditTask,
  getDateWithRelativeTime,
  getPriorityColor,
  getPriorityIcon,
  getStatusColor,
  getStatusIcon,
}) => {
  return (
    <div
      key={task.id}
      className="flex justify-between items-center bg-slate-700 p-4 mb-2 rounded-xl"
    >
      <div className="flex">
        <button onClick={() => handleDeleteTask(task.id)}>
          <Trash size={20} />
        </button>
        <div className="flex w-full mx-3">
          <div className="text-xl">{task.title} &nbsp;</div>
          <div className="text-xl">{task.description}</div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center justify-center">
            <CalendarClock size={20} className="mr-2" />
            <div className="mr-2">{getDateWithRelativeTime(task.date)}</div>
          </div>
          <div
            className={`flex items-center rounded-xl py-2 px-2 ${getPriorityColor(
              task.priority
            )}`}
          >
            <div className="mr-2">{getPriorityIcon(task.priority)}</div>
            <div className="mr-2 flex-grow">{task.priority}</div>
          </div>
          <div
            className={`flex items-center rounded-xl py-2 px-2 ${getStatusColor(
              task.status
            )}`}
          >
            <div className="mr-2">{getStatusIcon(task.status)}</div>
            <div className="mr-2 flex-grow">{task.status}</div>
          </div>
        </div>

        <select
          value={task.status.toLowerCase().replace(/\s+/g, "")}
          onChange={(e) => handleStatusChange(task.id, e.target.value)}
          className="forms"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button onClick={() => handleEditTask(task.id)}>
          <SquarePen size={30} />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
