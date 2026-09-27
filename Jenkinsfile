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

        stage('Docker Build') {
            steps {
                bat 'docker compose build'
            }
        }
    }

stage('Docker Check') {
    steps {
        bat 'docker version'
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