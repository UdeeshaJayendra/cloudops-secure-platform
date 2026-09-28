pipeline {
    agent any

    parameters {
        choice(
            name: 'APPLICATION',
            choices: ['cloudops-backend', 'cloudops-frontend'],
            description: 'Application to deploy'
        )

        string(
            name: 'VERSION',
            defaultValue: '',
            description: 'Application version to deploy'
        )

        choice(
            name: 'ENVIRONMENT',
            choices: ['Kubernetes'],
            description: 'Deployment environment'
        )

        string(
            name: 'DEPLOYMENT_ID',
            defaultValue: '',
            description: 'Database deployment ID'
        )
    }

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REGISTRY = '216453078762.dkr.ecr.ap-south-1.amazonaws.com'
        BACKEND_IMAGE = 'cloudops-backend'
        FRONTEND_IMAGE = 'cloudops-frontend'
    }

    stages {

        stage('Validate Parameters') {
            steps {
                script {
                    if (!params.VERSION?.trim()) {
                        error('VERSION is required.')
                    }

                    if (!(params.VERSION ==~ /^[0-9]+$/)) {
                        error('VERSION must contain numbers only.')
                    }

                    if (!params.DEPLOYMENT_ID?.trim()) {
                        error('DEPLOYMENT_ID is required.')
                    }

                    if (!(params.DEPLOYMENT_ID ==~ /^[0-9]+$/)) {
                        error('DEPLOYMENT_ID must contain numbers only.')
                    }

                    echo "Application: ${params.APPLICATION}"
                    echo "Version: ${params.VERSION}"
                    echo "Environment: ${params.ENVIRONMENT}"
                    echo "Deployment ID: ${params.DEPLOYMENT_ID}"
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Install') {
            steps {
                dir('backend') {
                    bat 'npm ci'
                }
            }
        }

        stage('Backend Lint') {
            steps {
                dir('backend') {
                    bat 'npm run lint'
                }
            }
        }

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    bat 'npm test -- --runInBand'
                }
            }
        }

        stage('Frontend Install') {
            steps {
                dir('frontend') {
                    bat 'npm ci'
                }
            }
        }

        stage('Frontend Lint') {
            steps {
                dir('frontend') {
                    bat 'npm run lint'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Docker Check') {
            steps {
                bat 'docker version'
            }
        }

        stage('AWS Check') {
            steps {
                withCredentials([
                    [$class: 'AmazonWebServicesCredentialsBinding',
                     credentialsId: 'aws-terraform-admin']
                ]) {
                    bat 'aws --version'
                    bat 'aws sts get-caller-identity'
                }
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker compose build'
            }
        }

        stage('Trivy Scan') {
            steps {
                bat 'set TRIVY_CACHE_DIR=C:\\Jenkins\\trivy-cache && "%TRIVY_HOME%\\trivy.exe" image --cache-dir C:\\Jenkins\\trivy-cache --timeout 20m --severity HIGH,CRITICAL --exit-code 1 --ignore-unfixed cloudops-backend:latest'

                bat 'set TRIVY_CACHE_DIR=C:\\Jenkins\\trivy-cache && "%TRIVY_HOME%\\trivy.exe" image --cache-dir C:\\Jenkins\\trivy-cache --timeout 20m --severity HIGH,CRITICAL --exit-code 1 --ignore-unfixed cloudops-frontend:latest'
            }
        }

        stage('ECR Login') {
            steps {
                withCredentials([
                    [$class: 'AmazonWebServicesCredentialsBinding',
                     credentialsId: 'aws-terraform-admin']
                ]) {
                    bat 'aws ecr get-login-password --region %AWS_REGION% | docker login --username AWS --password-stdin %ECR_REGISTRY%'
                }
            }
        }

        stage('Tag Images') {
            steps {
                bat 'docker tag %BACKEND_IMAGE%:latest %ECR_REGISTRY%/%BACKEND_IMAGE%:%VERSION%'
                bat 'docker tag %FRONTEND_IMAGE%:latest %ECR_REGISTRY%/%FRONTEND_IMAGE%:%VERSION%'
            }
        }

        stage('Push Images to ECR') {
            steps {
                bat 'docker push %ECR_REGISTRY%/%BACKEND_IMAGE%:%VERSION%'
                bat 'docker push %ECR_REGISTRY%/%FRONTEND_IMAGE%:%VERSION%'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    def imageName = params.APPLICATION == 'cloudops-backend'
                        ? env.BACKEND_IMAGE
                        : env.FRONTEND_IMAGE

                    def deploymentName = params.APPLICATION == 'cloudops-backend'
                        ? 'cloudops-backend'
                        : 'cloudops-frontend'

                    def containerName = params.APPLICATION == 'cloudops-backend'
                        ? 'backend'
                        : 'frontend'

                    withEnv([
                        'KUBECONFIG=C:\\ProgramData\\Jenkins\\.kube\\config'
                    ]) {
                        bat "kubectl set image deployment/${deploymentName} ${containerName}=%ECR_REGISTRY%/${imageName}:${params.VERSION} -n cloudops"

                        bat "kubectl rollout status deployment/${deploymentName} -n cloudops --timeout=5m"
                    }
                }
            }
        }
    }

    post {
        success {
            echo "CloudOps deployment pipeline completed successfully for ${params.APPLICATION}:${params.VERSION}."
        }

        failure {
            echo 'CloudOps deployment pipeline failed.'
        }
    }
}