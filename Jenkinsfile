pipeline {
    agent any

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