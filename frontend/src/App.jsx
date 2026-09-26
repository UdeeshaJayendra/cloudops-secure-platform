import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [health, setHealth] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [healthResponse, tasksResponse] = await Promise.all([
          fetch(`${API_URL}/health`),
          fetch(`${API_URL}/api/v1/tasks`)
        ]);

        if (!healthResponse.ok || !tasksResponse.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const healthData = await healthResponse.json();
        const tasksData = await tasksResponse.json();

        setHealth(healthData);
        setTasks(tasksData.tasks);
      } catch (err) {
        setError(err.message);
      }
    }

    loadDashboard();
  }, []);

  return (
    <main>
      <h1>CloudOps Secure Platform</h1>

      <section>
        <h2>Backend Status</h2>

        {error ? (
          <p>{error}</p>
        ) : health ? (
          <p>Service: {health.status}</p>
        ) : (
          <p>Loading...</p>
        )}
      </section>

      <section>
        <h2>Tasks</h2>

        {tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                <strong>{task.title}</strong> — {task.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;