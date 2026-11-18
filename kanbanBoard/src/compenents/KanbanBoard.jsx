import { useState } from 'react'
import './KanbanBoard.css'

const columns = [
  { id: 'todo', title: 'Todo' },
  { id: 'progress', title: 'Progress' },
  { id: 'completed', title: 'Completed' },
]

const initialTasks = [
  { id: 1, title: 'Sketch project ideas', status: 'todo' },
  { id: 2, title: 'Plan the next sprint', status: 'todo' },
  { id: 3, title: 'Review design concepts', status: 'todo' },
  { id: 4, title: 'Build the dashboard', status: 'progress' },
  { id: 5, title: 'Update the components', status: 'progress' },
  { id: 6, title: 'Set up the workspace', status: 'completed' },
  { id: 7, title: 'Create the first wireframes', status: 'completed' },
]

function KanbanBoard() {
  const [tasks, setTasks] = useState(initialTasks)
  const [draggedTaskId, setDraggedTaskId] = useState(null)
  const [activeColumn, setActiveColumn] = useState(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  function handleAddTask(event) {
    event.preventDefault()
    const title = newTaskTitle.trim()

    if (!title) return

    setTasks((currentTasks) => {
      const nextId = currentTasks.reduce(
        (highestId, task) => Math.max(highestId, task.id),
        0,
      ) + 1

      return [...currentTasks, { id: nextId, title, status: 'todo' }]
    })
    setNewTaskTitle('')
  }

  function handleDeleteTask(taskId) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
  }

  function handleDrop(event, status) {
    event.preventDefault()
    const taskId = Number(event.dataTransfer.getData('text/plain'))

    if (!taskId) return

    setTasks((currentTasks) => {
      const task = currentTasks.find((item) => item.id === taskId)
      if (!task || task.status === status) return currentTasks

      return [
        ...currentTasks.filter((item) => item.id !== taskId),
        { ...task, status },
      ]
    })
    setActiveColumn(null)
  }

  return (
    <main className="board-page">
      <header className="board-header">
        <div className="board-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h1>Kanban Board</h1>
      </header>

      <form className="task-entry" onSubmit={handleAddTask} aria-label="Add a task">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(event) => setNewTaskTitle(event.target.value)}
          placeholder="Enter a task..."
          aria-label="Task name"
        />
        <button type="submit">Add task</button>
      </form>

      <section className="board" aria-label="Task board">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id)

          return (
            <section
              className={`board-column${activeColumn === column.id ? ' is-over' : ''}`}
              key={column.id}
              onDragOver={(event) => {
                event.preventDefault()
                setActiveColumn(column.id)
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setActiveColumn(null)
                }
              }}
              onDrop={(event) => handleDrop(event, column.id)}
              aria-label={`${column.title} tasks`}
            >
              <div className="column-heading">
                <div className={`column-dot dot-${column.id}`} />
                <h2>{column.title}</h2>
                <span className="task-count">{columnTasks.length}</span>
              </div>

              <div className="task-list">
                {columnTasks.map((task) => (
                  <article
                    className={`task-card${draggedTaskId === task.id ? ' is-dragging' : ''}`}
                    key={task.id}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = 'move'
                      event.dataTransfer.setData('text/plain', String(task.id))
                      setDraggedTaskId(task.id)
                    }}
                    onDragEnd={() => {
                      setDraggedTaskId(null)
                      setActiveColumn(null)
                    }}
                  >
                    <span className="task-grip" aria-hidden="true">⠿</span>
                    <span className="task-title">{task.title}</span>
                    <button
                      className="task-delete"
                      type="button"
                      aria-label={`Delete ${task.title}`}
                      onClick={() => handleDeleteTask(task.id)}
                      onDragStart={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                      }}
                    >
                      ×
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )
        })}
      </section>
    </main>
  )
}

export default KanbanBoard
