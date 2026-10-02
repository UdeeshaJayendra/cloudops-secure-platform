# CloudOps Secure Platform

A production-oriented **DevSecOps platform** that demonstrates the complete software delivery lifecycle from source code and automated testing to container security, Amazon ECR, Kubernetes deployment on Amazon EKS, monitoring, alerting, and deployment status tracking.

The platform provides a web interface where a user can select an application version and environment, trigger a deployment, monitor the CI/CD process, and receive the final deployment status.

---

## Project Overview
CloudOps Secure Platform was developed to demonstrate how modern DevSecOps practices can be integrated into a cloud-native application.

The project combines:

* Application development
* Automated CI
* Docker containerization
* Container security scanning
* Jenkins CI/CD
* Amazon ECR
* Amazon EKS
* Kubernetes
* Infrastructure as Code with Terraform
* PostgreSQL
* Prometheus
* Grafana
* Alertmanager
* Deployment status tracking
* Kubernetes secrets and AWS IAM

The main objective is to create a complete and reproducible pipeline where application code can move from development to a running Kubernetes workload with automated testing and security validation.

---

## Architecture

<img width="1536" height="1024" alt="k" src="https://github.com/user-attachments/assets/f8451736-4690-48c3-9e8c-da28006a8909" />


```
```

This provides an end-to-end deployment workflow from source code to a running Kubernetes application.

---

# Deployment Demo

https://github.com/user-attachments/assets/c14ae008-ad57-45d4-b721-9f29405a25b4

The recording demonstrates the complete deployment workflow:

```text
CloudOps UI
    ↓
Deploy Button
    ↓
Jenkins Pipeline
    ↓
Security Scan
    ↓
Amazon ECR
    ↓
Amazon EKS
    ↓
Deployment Callback
    ↓
Successful Deployment
```

# Features

## Application Management

The platform provides a web interface for managing application deployments.

Users can select:

* Application
* Version
* Environment

The current implementation supports:

* CloudOps Backend
* CloudOps Frontend
* AWS EKS deployment environment

---

## Backend API

The backend is implemented using:

* Node.js
* Express
* PostgreSQL
* Jest
* REST API

The backend handles:

* Application information
* Deployment creation
* Deployment status updates
* Database operations
* Jenkins pipeline triggering
* Health checks

---

## Frontend

The frontend provides the deployment interface used by the operator.

It allows the user to:

1. Select an application.
2. Select a version.
3. Select an environment.
4. Trigger a deployment.
5. View deployment status.

The frontend is served through Nginx and exposed through an AWS Load Balancer.

---

# Technology Stack

| Category               | Technology        |
| ---------------------- | ----------------- |
| Frontend               | HTML / JavaScript |
| Web Server             | Nginx             |
| Backend                | Node.js / Express |
| Database               | PostgreSQL        |
| Testing                | Jest              |
| Containers             | Docker            |
| Container Registry     | Amazon ECR        |
| Orchestration          | Kubernetes        |
| Cloud Kubernetes       | Amazon EKS        |
| CI/CD                  | Jenkins           |
| CI                     | GitHub Actions    |
| Security               | Trivy             |
| Infrastructure as Code | Terraform         |
| Monitoring             | Prometheus        |
| Visualization          | Grafana           |
| Alerting               | Alertmanager      |
| Cloud                  | AWS               |
| Source Control         | Git / GitHub      |

---

# DevSecOps Pipeline

## 1. Source Code

The project source code is maintained in GitHub.
Development changes are tracked using Git commits and branches.

---

## 2. Continuous Integration

GitHub Actions performs automated CI workflows.
The workflows validate application code before deployment.

The CI process includes:

* Dependency installation
* Linting
* Testing
* Application build
* Docker-related validation

### Backend CI

<img width="1917" height="585" alt="02-backend-ci-workflow png" src="https://github.com/user-attachments/assets/d722424e-8a12-44ff-b2bb-b5ef497532b9" />

### GitHub Actions Workflow

<img width="1907" height="908" alt="02-github-actions-workflow png" src="https://github.com/user-attachments/assets/c2abd932-b9b2-4d70-9180-0dba44158c17" />

### Frontend CI

<img width="1917" height="526" alt="03-frontend-ci-workflow png" src="https://github.com/user-attachments/assets/1ba40916-ee70-4660-a762-e1860c1e132f" />

---

# Docker

The backend and frontend applications are containerized using Docker.
Docker provides consistent application environments between development and deployment.

## Docker Images

<img width="1597" height="748" alt="10-docker-images png" src="https://github.com/user-attachments/assets/9622a167-976e-4859-851a-75c89acd0dc9" />

## Running Containers

<img width="1606" height="397" alt="11-docker-containers png" src="https://github.com/user-attachments/assets/db159902-ba4b-49bf-b866-99f85ce4469b" />

---

# Container Security

Trivy is integrated into the CI/CD pipeline to scan container images for known vulnerabilities.

The security pipeline prevents deployment from being treated as complete without performing the container security validation.

## Trivy Security Scan

<img width="1917" height="962" alt="12-trivy-security-scan png" src="https://github.com/user-attachments/assets/09c9d476-7457-4569-b326-4492535b51a2" />

The project also maintains a documented `.trivyignore` file for vulnerabilities that were explicitly reviewed and accepted for the current project environment.

---

# Jenkins CI/CD

Jenkins is responsible for the deployment pipeline.


## Jenkins Project

<img width="1917" height="495" alt="25-jenkins-project png" src="https://github.com/user-attachments/assets/3b62b262-d57b-4246-a55e-b3042f34e49f" />

## Jenkins Pipeline

<img width="1917" height="958" alt="25-jenkins-pipeline png" src="https://github.com/user-attachments/assets/ea72137c-7e92-473e-a2fc-de896d26596c" />

## Build History

<img width="1916" height="897" alt="26-jenkins-build-history png" src="https://github.com/user-attachments/assets/4031c1bf-1053-4bc4-ae30-7a20d8305946" />

## Successful Build

<img width="1917" height="821" alt="26-jenkins-build-success png" src="https://github.com/user-attachments/assets/3ac6ea1d-556a-4b7b-a342-a286cb8d64c8" />

## Deployment Build

<img width="1917" height="480" alt="27-jenkins-build-31-success png" src="https://github.com/user-attachments/assets/c6b89cbf-6c5c-420a-b872-b63b324dffb9" />

---

# Amazon ECR

Amazon Elastic Container Registry is used to store the container images produced by the CI/CD pipeline.

The project uses separate repositories for the backend and frontend.

## Backend ECR

<img width="1892" height="351" alt="21-aws-ecr-backend png" src="https://github.com/user-attachments/assets/27c8cd5e-d39d-4c35-b018-556e7aa82339" />

## Frontend ECR

<img width="1895" height="352" alt="22-aws-ecr-frontend png" src="https://github.com/user-attachments/assets/3c7bbaa7-90a5-42b5-acde-3845533c1309" />

---

# Kubernetes and Amazon EKS

The application is deployed to Amazon EKS using Kubernetes manifests.

The Kubernetes environment contains:


The frontend is exposed externally through an AWS Load Balancer.

The backend and PostgreSQL services remain internal to the Kubernetes cluster.

---

## Kubernetes Pods

The deployed workloads include:

* Frontend
* Backend
* PostgreSQL

All production workloads were verified as running successfully.

---

## Kubernetes Services

<img width="1601" height="285" alt="16-kubernetes-services png" src="https://github.com/user-attachments/assets/032e0497-2564-409d-9b19-10c07adedd27" />

The frontend uses a Kubernetes `LoadBalancer` service to expose the application externally.

---

## Kubernetes Deployments

<img width="1605" height="318" alt="17-kubernetes-deployments png" src="https://github.com/user-attachments/assets/6e1b8ca6-93d2-4ca4-8577-cda3669638d8" />

---

## Persistent Storage

PostgreSQL uses persistent Kubernetes storage backed by AWS infrastructure.

<img width="1597" height="205" alt="18-kubernetes-storage png" src="https://github.com/user-attachments/assets/052ddf48-45e4-4ae6-93d5-0e53f4587598" />

---

# Amazon EKS

The application is deployed to an Amazon EKS cluster.

<img width="1890" height="446" alt="19-aws-eks-cluster png" src="https://github.com/user-attachments/assets/3e81c0f9-86c1-467c-a538-71ffab0bdc39" />

The EKS environment provides Kubernetes orchestration for the application workloads.

---

# AWS Load Balancer

The frontend is exposed using a Kubernetes `LoadBalancer` service.

AWS automatically provisions the external load balancer for the service.

<img width="1907" height="438" alt="23-aws-loadbalancer png" src="https://github.com/user-attachments/assets/2a39be68-f056-449d-be9d-ddf63ed691c4" />

---

# AWS Networking

The infrastructure is deployed inside an AWS VPC with dedicated networking resources.

<img width="1907" height="673" alt="24-aws-eks-networking png" src="https://github.com/user-attachments/assets/9a9f3104-6e5f-47d1-983c-3369b4b781ae" />

Terraform is used to define and provision the infrastructure.

---

---

# Database

PostgreSQL is used as the application's relational database.

The database stores application and deployment information.

The PostgreSQL workload runs inside the Kubernetes cluster and uses persistent storage.

## PostgreSQL Pod

<img width="1606" height="333" alt="09-postgres-pod png" src="https://github.com/user-attachments/assets/0841e6d3-28ba-466c-820e-94ed32e64c56" />

---

# API Health and Validation

The backend provides a health endpoint for service validation.


## Backend Health Check

<img width="1610" height="387" alt="07-backend-health-check png" src="https://github.com/user-attachments/assets/5e91eeb7-352c-4f2c-9787-de768f671481" />

---

# Applications API

The application API exposes deployment/application information.

<img width="1607" height="380" alt="08-applications-api png" src="https://github.com/user-attachments/assets/f2f836a1-38a2-4dc3-8154-8c98b2e84762" />

The production deployment was successfully verified with:

---

# Monitoring

Prometheus is used to collect application and infrastructure metrics.

The backend exposes metrics that can be collected by Prometheus.

## Prometheus Backend Target

<img width="1917" height="450" alt="3-prometheus-backend-target-up png" src="https://github.com/user-attachments/assets/57893218-d297-4d7d-a504-b4d80eca652c" />

The backend target is monitored to verify service availability.

---

# Grafana

Grafana provides dashboards for visualizing application metrics.
The project monitors HTTP traffic and application behavior.

## HTTP Request Rate

<img width="1917" height="921" alt="13-grafana-http-request-rate png" src="https://github.com/user-attachments/assets/64f6a89f-41ba-4d7e-95ec-bc7b73da5301" />

## HTTP Status Codes

<img width="1917" height="830" alt="13-grafana-http-status-codes png" src="https://github.com/user-attachments/assets/75c16b14-474e-4ff9-85da-d24a14aa3f18" />

## Total HTTP Requests

<img width="1916" height="917" alt="13-grafana-total-http-requests png" src="https://github.com/user-attachments/assets/a2f4d251-8361-4132-9ed1-6e40e65064db" />

---

# Alerting

Alertmanager is used to handle Prometheus alerts.

The platform includes an alert for backend availability.

Example monitoring scenario:


## Backend Down Alert

<img width="1917" height="906" alt="14-cloudops-backend-down-alert png" src="https://github.com/user-attachments/assets/4b8ab4db-b248-4a00-8838-ddfb776f382d" />

---

# Deployment Status Tracking

A deployment is not considered complete simply because Jenkins starts successfully.

The platform tracks the deployment lifecycle:

```

```

The Jenkins pipeline sends the final deployment status back to the backend API.

This allows the CloudOps UI to display the actual deployment result.

---

# Security

Security was considered throughout the deployment lifecycle.

Security mechanisms include:

* Trivy container scanning
* Kubernetes Secrets
* AWS IAM
* ECR authentication
* Kubernetes service isolation
* Internal PostgreSQL service
* Private backend service
* Deployment callback authentication
* Documented vulnerability exceptions
* CI/CD security validation

Sensitive credentials are not stored directly in the source code.

---
# Application Screenshots

## CloudOps Frontend

<img width="1917" height="965" alt="04-cloudops-frontend png" src="https://github.com/user-attachments/assets/6976415f-acd1-483c-af23-b18b00759ade" />

## Deployment Configuration

<img width="1917" height="962" alt="05-deployment-configuration png" src="https://github.com/user-attachments/assets/87417a9e-bd83-4fda-bfd4-04cd280e5d0f" />

---

# Project Results

The completed platform successfully demonstrates:

* Automated application testing
* Docker containerization
* Container vulnerability scanning
* Jenkins-based CI/CD
* Amazon ECR image management
* Kubernetes deployment
* Amazon EKS orchestration
* PostgreSQL persistence
* Infrastructure as Code
* Application monitoring
* Grafana dashboards
* Prometheus alerting
* Deployment status tracking
* Public application access through AWS Load Balancing

The final deployment was verified with the CloudOps Backend running as version **13** on Amazon EKS.

---
---

# Author

**Udeesha Jayendra**


