const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

export const getTasks = () => request("/tasks");

export const createTask = (task) =>
  request("/tasks", {
    method: "POST",
    body: JSON.stringify(task),
  });

export const updateTask = (id, changes) =>
  request(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });

export const deleteTask = (id) =>
  request(`/tasks/${id}`, { method: "DELETE" });

export const checkHealth = () => request("/health");
