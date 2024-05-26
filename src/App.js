import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./index.css";

const initialList = [
  { id: "1", task: "Complete online JavaScript course", completed: true },
  { id: "2", task: "Jog around the park 3x", completed: false },
  { id: "3", task: "10 minutes meditation", completed: false },
  { id: "4", task: "Read for 1 hour", completed: false },
  { id: "5", task: "Pick up groceries", completed: false },
  { id: "6", task: "Complete Todo App on Frontend Mentor", completed: false },
];

export default function App() {
  const [list, setList] = useState(initialList);
  const [mode, setMode] = useState("light");
  const [filter, setFilter] = useState("all");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const handleAddTask = (newTask) => {
    setList((prevList) => [...prevList, newTask]);
  };

  const handleToggleComplete = (index) => {
    const newList = [...list];
    newList[index].completed = !newList[index].completed;
    setList(newList);
  };

  const handleDeleteTask = (index) => {
    const newList = list.filter((_, i) => i !== index);
    setList(newList);
  };

  const handleClearCompleted = () => {
    const newList = list.filter((item) => !item.completed);
    setList(newList);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(list);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setList(items);
  };

  const filteredList = list.filter((item) => {
    if (filter === "all") return true;
    if (filter === "active") return !item.completed;
    if (filter === "completed") return item.completed;
    return true;
  });

  return (
    <div className="app">
      <Header mode={mode} toggleMode={toggleMode} />
      <main className="main">
        <Input handleAddTask={handleAddTask} />
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <TaskList
                  list={filteredList}
                  handleToggleComplete={handleToggleComplete}
                  handleDeleteTask={handleDeleteTask}
                  handleClearCompleted={handleClearCompleted}
                  filter={filter}
                  setFilter={setFilter}
                  windowWidth={windowWidth}
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {windowWidth <= 700 && (
          <FilterFooter filter={filter} setFilter={setFilter} />
        )}
        <Drag />
      </main>
    </div>
  );
}

function Header({ mode, toggleMode }) {
  return (
    <header className="header">
      <h1 className="logo">TODO</h1>
      <button onClick={toggleMode} className="mode-toggle">
        {mode === "light" ? <MoonIcon /> : <SunIcon />}
      </button>
    </header>
  );
}

function Input({ handleAddTask }) {
  const [task, setTask] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task.trim()) return;
    handleAddTask({ id: Date.now().toString(), task, completed: false });
    setTask("");
  };

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <span className="check"></span>
      <input
        value={task}
        onChange={(e) => setTask(e.target.value)}
        type="text"
        placeholder="Create a new todo..."
      />
    </form>
  );
}

function TaskList({
  list,
  handleToggleComplete,
  handleDeleteTask,
  handleClearCompleted,
  filter,
  setFilter,
  windowWidth,
}) {
  return (
    <ul className="task-list">
      {list.map((item, index) => (
        <Draggable key={item.id} draggableId={item.id} index={index}>
          {(provided) => (
            <React.Fragment>
              <li
                className={`task ${item.completed ? "completed" : ""}`}
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <span
                  className={`check ${item.completed ? "checked" : ""}`}
                  onClick={() => handleToggleComplete(index)}
                >
                  {item.completed && <CheckIcon />}
                </span>
                {item.task}
                <button
                  className="delete-button"
                  onClick={() => handleDeleteTask(index)}
                >
                  <CrossIcon />
                </button>
              </li>
              {index < list.length - 1 && <hr className="task-divider" />}
            </React.Fragment>
          )}
        </Draggable>
      ))}
      <TaskFooter
        list={list}
        handleClearCompleted={handleClearCompleted}
        filter={filter}
        setFilter={setFilter}
        windowWidth={windowWidth}
      />
    </ul>
  );
}

function TaskFooter({
  list,
  handleClearCompleted,
  filter,
  setFilter,
  windowWidth,
}) {
  const activeTasksCount = list.filter((item) => !item.completed).length;

  return (
    <div className="task-footer">
      <span>{activeTasksCount} items left</span>
      {windowWidth > 700 && (
        <FilterFooter filter={filter} setFilter={setFilter} />
      )}
      <button className="clear-button" onClick={handleClearCompleted}>
        Clear Completed
      </button>
    </div>
  );
}

function FilterFooter({ filter, setFilter }) {
  return (
    <div className="filter-footer">
      <button
        className={`filter-button ${filter === "all" ? "active" : ""}`}
        onClick={() => setFilter("all")}
      >
        All
      </button>
      <button
        className={`filter-button ${filter === "active" ? "active" : ""}`}
        onClick={() => setFilter("active")}
      >
        Active
      </button>
      <button
        className={`filter-button ${filter === "completed" ? "active" : ""}`}
        onClick={() => setFilter("completed")}
      >
        Completed
      </button>
    </div>
  );
}

function Drag() {
  return <div className="drag">Drag and drop to reorder list</div>;
}
function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26">
      <path
        fill="#FFF"
        fillRule="evenodd"
        d="M13 0c.81 0 1.603.074 2.373.216C10.593 1.199 7 5.43 7 10.5 7 16.299 11.701 21 17.5 21c2.996 0 5.7-1.255 7.613-3.268C23.22 22.572 18.51 26 13 26 5.82 26 0 20.18 0 13S5.82 0 13 0z"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26">
      <path
        fill="#FFF"
        fillRule="evenodd"
        d="M13 21a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-5.657-2.343a1 1 0 010 1.414l-2.121 2.121a1 1 0 01-1.414-1.414l2.12-2.121a1 1 0 011.415 0zm12.728 0l2.121 2.121a1 1 0 01-1.414 1.414l-2.121-2.12a1 1 0 011.414-1.415zM13 8a5 5 0 110 10 5 5 0 010-10zm12 4a1 1 0 110 2h-3a1 1 0 110-2h3zM4 12a1 1 0 110 2H1a1 1 0 110-2h3zm18.192-8.192a1 1 0 010 1.414l-2.12 2.121a1 1 0 01-1.415-1.414l2.121-2.121a1 1 0 011.414 0zm-16.97 0l2.121 2.12A1 1 0 015.93 7.344L3.808 5.222a1 1 0 011.414-1.414zM13 0a1 1 0 011 1v3a1 1 0 11-2 0V1a1 1 0 011-1z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="9">
      <path
        fill="none"
        stroke="#FFF"
        strokeWidth="2"
        d="M1 4.304L3.696 7l6-6"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      className="cross"
    >
      <path
        fill="#494C6B"
        fillRule="evenodd"
        d="M16.97 0l.708.707L9.546 8.84l8.132 8.132-.707.707-8.132-8.132-8.132 8.132L0 16.97l8.132-8.132L0 .707.707 0 8.84 8.132 16.971 0z"
      />
    </svg>
  );
}
