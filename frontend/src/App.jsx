import { useEffect, useMemo, useState } from "react";
import { checkHealth, createTask, deleteTask, getTasks, updateTask } from "./api";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [databaseOnline, setDatabaseOnline] = useState(false);

  async function loadTasks() {
    setLoading(true);
    setError("");
    try {
      const [taskData, health] = await Promise.all([getTasks(), checkHealth()]);
      setTasks(taskData);
      setDatabaseOnline(health.database === "connected");
    } catch (err) {
      setError(err.message);
      setDatabaseOnline(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError("");
    try {
      const newTask = await createTask({ title: title.trim(), description: description.trim() });
      setTasks((current) => [newTask, ...current]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    try {
      const updated = await updateTask(task.id, {
        status: task.status === "completed" ? "pending" : "completed",
      });
      setTasks((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeTask(id) {
    try {
      await deleteTask(id);
      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const visibleTasks = useMemo(() => {
    if (filter === "pending") return tasks.filter((task) => task.status === "pending");
    if (filter === "completed") return tasks.filter((task) => task.status === "completed");
    return tasks;
  }, [tasks, filter]);

  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const pendingCount = tasks.length - completedCount;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">S</span>
          <span>student<span className="brand-light">space</span></span>
        </a>
        <div className="api-status">
          <span className={`status-dot ${databaseOnline ? "online" : ""}`} />
          {databaseOnline ? "Database connected" : "Database disconnected"}
        </div>
      </header>

      <section className="hero">
        <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
        <h1>Make progress.<br /><span>One task at a time.</span></h1>
        <p className="hero-copy">Keep your academic goals and daily work in one simple place.</p>
      </section>

      <section className="stats-grid" aria-label="Task statistics">
        <article className="stat-card">
          <span className="stat-label">Total tasks</span>
          <strong>{tasks.length}</strong>
          <span className="stat-note">All your tasks</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">To do</span>
          <strong>{pendingCount}</strong>
          <span className="stat-note">Still in progress</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Completed</span>
          <strong>{completedCount}</strong>
          <span className="stat-note">Great work</span>
        </article>
      </section>

      <section className="workspace">
        <div className="panel create-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">GET STARTED</p>
              <h2>Add a task</h2>
            </div>
            <span className="heading-icon">＋</span>
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="task-title">Task title</label>
            <input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Practice React components"
              maxLength={160}
              required
            />
            <label htmlFor="task-description">Description <span className="optional">(optional)</span></label>
            <textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a little more detail..."
              rows="3"
            />
            <button className="primary-button" type="submit" disabled={saving || !title.trim()}>
              {saving ? "Adding..." : "Add task"} <span>↗</span>
            </button>
          </form>
        </div>

        <div className="panel task-panel">
          <div className="section-heading task-heading">
            <div>
              <p className="eyebrow">YOUR WORK</p>
              <h2>Task list</h2>
            </div>
            <span className="task-count">{tasks.length} tasks</span>
          </div>

          <div className="progress-wrap">
            <div className="progress-label"><span>Overall progress</span><strong>{progress}%</strong></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          </div>

          <div className="filters" role="group" aria-label="Filter tasks">
            {["all", "pending", "completed"].map((value) => (
              <button key={value} className={filter === value ? "filter active" : "filter"} onClick={() => setFilter(value)}>
                {value[0].toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}
          {loading ? (
            <div className="empty-state">Loading your tasks...</div>
          ) : visibleTasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">✦</span>
              <strong>{tasks.length === 0 ? "A clean slate." : "Nothing here yet."}</strong>
              <p>{tasks.length === 0 ? "Add your first task to get moving." : "Try another filter to see your tasks."}</p>
            </div>
          ) : (
            <ul className="task-list">
              {visibleTasks.map((task) => (
                <li className={`task-item ${task.status === "completed" ? "is-complete" : ""}`} key={task.id}>
                  <button className="check-button" onClick={() => toggleTask(task)} aria-label={`Mark ${task.title} ${task.status === "completed" ? "pending" : "completed"}`}>
                    {task.status === "completed" ? "✓" : ""}
                  </button>
                  <div className="task-content">
                    <strong>{task.title}</strong>
                    {task.description && <p>{task.description}</p>}
                    <span className="task-date">{new Date(task.created_at).toLocaleDateString()}</span>
                  </div>
                  <button className="delete-button" onClick={() => removeTask(task.id)} aria-label={`Delete ${task.title}`}>×</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <footer>Built with React, Flask & PostgreSQL <span>·</span> Keep showing up.</footer>
    </main>
  );
}
