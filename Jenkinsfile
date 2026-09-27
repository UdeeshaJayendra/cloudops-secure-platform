pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REGISTRY = '216453078762.dkr.ecr.ap-south-1.amazonaws.com'
        BACKEND_IMAGE = 'cloudops-backend'
        FRONTEND_IMAGE = 'cloudops-frontend'
    }

    stages {

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
                bat 'docker tag %BACKEND_IMAGE%:latest %ECR_REGISTRY%/%BACKEND_IMAGE%:%BUILD_NUMBER%'
                bat 'docker tag %FRONTEND_IMAGE%:latest %ECR_REGISTRY%/%FRONTEND_IMAGE%:%BUILD_NUMBER%'
            }
        }

        stage('Push Images to ECR') {
            steps {
                bat 'docker push %ECR_REGISTRY%/%BACKEND_IMAGE%:%BUILD_NUMBER%'
                bat 'docker push %ECR_REGISTRY%/%FRONTEND_IMAGE%:%BUILD_NUMBER%'
            }
        }
    }

    post {
        success {
            echo 'CloudOps Secure Platform pipeline completed successfully.'
        }

        failure {
            echo 'CloudOps Secure Platform pipeline failed.'
        }
    }
}