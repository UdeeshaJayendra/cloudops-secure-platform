import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "";

function App() {
    const [applications, setApplications] = useState([]);
    const [backendHealth, setBackendHealth] = useState("Checking...");
    const [lastChecked, setLastChecked] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const [showDeployForm, setShowDeployForm] = useState(false);
    const [deploying, setDeploying] = useState(false);
    const [deployError, setDeployError] = useState("");

    const [deployForm, setDeployForm] = useState({
        applicationId: "",
        version: "",
        environment: ""
    });

    const loadApplications = async () => {
        try {
            setError("");

            const response = await fetch(
                `${API_URL}/api/v1/applications`
            );

            if (!response.ok) {
                throw new Error("Failed to load applications");
            }

            const data = await response.json();

            setApplications(data.applications || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const checkHealth = async () => {
        try {
            const response = await fetch(`${API_URL}/health`);

            if (!response.ok) {
                throw new Error("Health check failed");
            }

            const data = await response.json();

            setBackendHealth(
                data.status === "healthy"
                    ? "Healthy"
                    : "Unhealthy"
            );

            setLastChecked(new Date());
        } catch {
            setBackendHealth("Unhealthy");
            setLastChecked(new Date());
        }
    };

    const viewApplication = async (applicationId) => {
        try {
            setError("");

            const response = await fetch(
                `${API_URL}/api/v1/applications/${applicationId}`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load application details"
                );
            }

            const data = await response.json();

            setSelectedApplication(data);
            setShowDetails(true);
        } catch (err) {
            setError(err.message);
        }
    };

    const openDeployForm = () => {
        setDeployError("");

        setDeployForm({
            applicationId:
                applications.length > 0
                    ? String(applications[0].id)
                    : "",
            version: "",
            environment:
                applications.length > 0
                    ? applications[0].environment
                    : ""
        });

        setShowDeployForm(true);
    };

    const submitDeployment = async (event) => {
        event.preventDefault();

        if (
            !deployForm.applicationId ||
            !deployForm.version ||
            !deployForm.environment
        ) {
            setDeployError(
                "Application, version and environment are required."
            );
            return;
        }

        try {
            setDeploying(true);
            setDeployError("");

            const response = await fetch(
                `${API_URL}/api/v1/applications/${deployForm.applicationId}/deploy`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        version: deployForm.version,
                        environment: deployForm.environment
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Deployment failed"
                );
            }

            setShowDeployForm(false);

            await loadApplications();

            await viewApplication(
                deployForm.applicationId
            );
        } catch (err) {
            setDeployError(err.message);
        } finally {
            setDeploying(false);
        }
    };

    useEffect(() => {
        loadApplications();
        checkHealth();

        const interval = setInterval(() => {
            loadApplications();
            checkHealth();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="app">
            <header className="topbar">
                <div>
                    <h1 className="brand-title">CloudOps</h1>
                    <span>Operations Portal</span>
                </div>

                <div className="system-status">
                    <span
                        className={`status-dot ${
                            backendHealth === "Healthy"
                                ? "healthy"
                                : "unhealthy"
                        }`}
                    />

                    API {backendHealth}
                </div>
            </header>

            <main className="content">
                <div className="page-header">
                    <div>
                        <h2>Applications</h2>
                        <p>
                            Applications managed by the
                            CloudOps platform.
                        </p>
                    </div>

                    <button
                        className="primary-button"
                        onClick={openDeployForm}
                        disabled={applications.length === 0}
                    >
                        Deploy application
                    </button>
                </div>

                {loading && (
                    <div className="info-panel">
                        Loading applications...
                    </div>
                )}

                {error && (
                    <div className="info-panel">
                        Failed to load applications: {error}
                    </div>
                )}

                {!loading && !error && (
                    <section className="application-list">
                        {applications.map((application) => (
                            <article
                                className="application-card"
                                key={application.id}
                            >
                                <div className="application-main">
                                    <div className="application-icon">
                                        APP
                                    </div>

                                    <div>
                                        <h3>
                                            {application.name}
                                        </h3>

                                        <p>
                                            {application.image}
                                        </p>
                                    </div>
                                </div>

                                <div className="application-details">
                                    <div>
                                        <span>
                                            Environment
                                        </span>

                                        <strong>
                                            {
                                                application.environment
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Current version
                                        </span>

                                        <strong>
                                            {
                                                application.current_version
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Desired version
                                        </span>

                                        <strong>
                                            {
                                                application.desired_version ||
                                                "—"
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Deployment
                                        </span>

                                        <strong className="running">
                                            <span className="small-dot" />

                                            {application.status}
                                        </strong>
                                    </div>
                                </div>

                                <button
                                    className="secondary-button"
                                    onClick={() =>
                                        viewApplication(
                                            application.id
                                        )
                                    }
                                >
                                    View
                                </button>
                            </article>
                        ))}
                    </section>
                )}

                <section className="info-panel">
                    <div>
                        <h3>Backend API</h3>

                        <p>
                            Application data is retrieved from
                            the CloudOps backend API.
                        </p>
                    </div>

                    <div className="last-checked">
                        Last checked

                        <strong>
                            {lastChecked
                                ? lastChecked.toLocaleTimeString()
                                : "—"}
                        </strong>
                    </div>
                </section>
            </main>

            {showDetails && selectedApplication && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <div className="modal-header">
                            <div>
                                <h2>
                                    {
                                        selectedApplication
                                            .application.name
                                    }
                                </h2>

                                <p>
                                    {
                                        selectedApplication
                                            .application.image
                                    }
                                </p>
                            </div>

                            <button
                                className="close-button"
                                onClick={() =>
                                    setShowDetails(false)
                                }
                            >
                                ×
                            </button>
                        </div>

                        <div className="detail-grid">
                            <div>
                                <span>Environment</span>

                                <strong>
                                    {
                                        selectedApplication
                                            .application
                                            .environment
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Current version</span>

                                <strong>
                                    {
                                        selectedApplication
                                            .application
                                            .current_version
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Desired version</span>

                                <strong>
                                    {
                                        selectedApplication
                                            .application
                                            .desired_version ||
                                        "—"
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Status</span>

                                <strong>
                                    {
                                        selectedApplication
                                            .application
                                            .status
                                    }
                                </strong>
                            </div>
                        </div>

                        <h3>Deployment history</h3>

                        <div className="deployment-history">
                            {selectedApplication.deployments
                                .length === 0 ? (
                                <p>
                                    No deployments found.
                                </p>
                            ) : (
                                selectedApplication.deployments.map(
                                    (deployment) => (
                                        <div
                                            className="deployment-row"
                                            key={deployment.id}
                                        >
                                            <div>
                                                <strong>
                                                    Version{" "}
                                                    {
                                                        deployment.version
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        deployment.environment
                                                    }
                                                </span>
                                            </div>

                                            <div>
                                                <strong>
                                                    {
                                                        deployment.status
                                                    }
                                                </strong>

                                                <span>
                                                    {new Date(
                                                        deployment.deployed_at
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showDeployForm && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <div className="modal-header">
                            <div>
                                <h2>
                                    Deploy application
                                </h2>

                                <p>
                                    Create a new deployment
                                    request.
                                </p>
                            </div>

                            <button
                                className="close-button"
                                onClick={() =>
                                    setShowDeployForm(false)
                                }
                            >
                                ×
                            </button>
                        </div>

                        <form
                            className="deploy-form"
                            onSubmit={submitDeployment}
                        >
                            <label>
                                Application

                                <select
                                    value={
                                        deployForm.applicationId
                                    }
                                    onChange={(event) =>
                                        setDeployForm({
                                            ...deployForm,
                                            applicationId:
                                                event.target
                                                    .value
                                        })
                                    }
                                    required
                                >
                                    {applications.map(
                                        (application) => (
                                            <option
                                                key={
                                                    application.id
                                                }
                                                value={
                                                    application.id
                                                }
                                            >
                                                {application.name}
                                            </option>
                                        )
                                    )}
                                </select>
                            </label>

                            <label>
                                Version

                                <input
                                    type="text"
                                    value={
                                        deployForm.version
                                    }
                                    onChange={(event) =>
                                        setDeployForm({
                                            ...deployForm,
                                            version:
                                                event.target
                                                    .value
                                        })
                                    }
                                    placeholder="e.g. 14"
                                    required
                                />
                            </label>

                            <label>
                                Environment

                                <input
                                    type="text"
                                    value={
                                        deployForm.environment
                                    }
                                    onChange={(event) =>
                                        setDeployForm({
                                            ...deployForm,
                                            environment:
                                                event.target
                                                    .value
                                        })
                                    }
                                    required
                                />
                            </label>

                            {deployError && (
                                <div className="form-error">
                                    {deployError}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        setShowDeployForm(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={deploying}
                                >
                                    {deploying
                                        ? "Deploying..."
                                        : "Deploy"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;