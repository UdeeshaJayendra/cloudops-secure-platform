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
            choices: ['AWS EKS'],
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
        EKS_CLUSTER_NAME = 'cloudops-secure-platform-eks'
        ECR_REGISTRY = '216453078762.dkr.ecr.ap-south-1.amazonaws.com'

        BACKEND_IMAGE = 'cloudops-backend'
        FRONTEND_IMAGE = 'cloudops-frontend'

        KUBECONFIG = 'C:\\ProgramData\\Jenkins\\.kube\\config'
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

        stage('Configure AWS EKS') {
            steps {
                withCredentials([
                    [$class: 'AmazonWebServicesCredentialsBinding',
                     credentialsId: 'aws-terraform-admin']
                ]) {
                    bat '''
                        if not exist "C:\\ProgramData\\Jenkins\\.kube" mkdir "C:\\ProgramData\\Jenkins\\.kube"

                        aws eks update-kubeconfig ^
                          --region %AWS_REGION% ^
                          --name %EKS_CLUSTER_NAME% ^
                          --kubeconfig "%KUBECONFIG%"

                        kubectl config current-context
                    '''
                }
            }
        }

        stage('Verify EKS') {
            steps {
                withCredentials([
                    [$class: 'AmazonWebServicesCredentialsBinding',
                     credentialsId: 'aws-terraform-admin']
                ]) {
                    bat 'kubectl get nodes -o wide'
                    bat 'kubectl get namespace cloudops'
                }
            }
        }

        stage('Deploy to EKS') {
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

                    withCredentials([
                        [$class: 'AmazonWebServicesCredentialsBinding',
                         credentialsId: 'aws-terraform-admin'],

                        string(
                            credentialsId: 'deployment-callback-token',
                            variable: 'DEPLOYMENT_CALLBACK_TOKEN'
                        )
                    ]) {

                        try {

                            echo "Synchronizing deployment callback authentication..."

                            /*
                             * IMPORTANT:
                             * The secret must be created/updated
                             * inside the cloudops namespace.
                             */
                            bat '''
                                kubectl create secret generic cloudops-backend-secret ^
                                  -n cloudops ^
                                  --from-literal=DB_USER=cloudops_app ^
                                  --from-literal=DB_PASSWORD=cloudops_app_dev_password ^
                                  --from-literal=DEPLOYMENT_CALLBACK_TOKEN="%DEPLOYMENT_CALLBACK_TOKEN%" ^
                                  --dry-run=client -o yaml ^
                                  | kubectl apply -f -
                            '''

                            echo "Restarting backend to load callback authentication..."

                            bat '''
                                kubectl rollout restart deployment/cloudops-backend -n cloudops
                                kubectl rollout status deployment/cloudops-backend -n cloudops --timeout=5m
                            '''

                            echo "Backend authentication configuration updated."

                            echo "Deploying ${imageName}:${params.VERSION} to AWS EKS..."

                            bat "kubectl set image deployment/${deploymentName} ${containerName}=%ECR_REGISTRY%/${imageName}:${params.VERSION} -n cloudops"

                            bat "kubectl rollout status deployment/${deploymentName} -n cloudops --timeout=5m"

                            echo "AWS EKS rollout completed successfully."

                        } catch (err) {

                            echo "AWS EKS deployment failed."
                            echo "Sending deployment failure callback..."

                            bat """
                                kubectl exec -n cloudops deployment/cloudops-backend -- env DEPLOYMENT_CALLBACK_TOKEN="%DEPLOYMENT_CALLBACK_TOKEN%" node -e "const http=require('http');const token=process.env.DEPLOYMENT_CALLBACK_TOKEN;const data=JSON.stringify({status:'failed'});const req=http.request({hostname:'127.0.0.1',port:3000,path:'/api/v1/deployments/${params.DEPLOYMENT_ID}/status',method:'POST',headers:{'Content-Type':'application/json','x-deployment-token':token,'Content-Length':Buffer.byteLength(data)}},r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{console.log('Callback status:',r.statusCode);console.log(d)})});req.on('error',e=>console.error(e));req.write(data);req.end();"
                            """

                            echo "Deployment failure callback sent."

                            throw err
                        }

                        echo "Sending deployment success callback..."

                        bat """
                            kubectl exec -n cloudops deployment/cloudops-backend -- env DEPLOYMENT_CALLBACK_TOKEN="%DEPLOYMENT_CALLBACK_TOKEN%" node -e "const http=require('http');const token=process.env.DEPLOYMENT_CALLBACK_TOKEN;const data=JSON.stringify({status:'successful',version:'${params.VERSION}'});const req=http.request({hostname:'127.0.0.1',port:3000,path:'/api/v1/deployments/${params.DEPLOYMENT_ID}/status',method:'POST',headers:{'Content-Type':'application/json','x-deployment-token':token,'Content-Length':Buffer.byteLength(data)}},r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{console.log('Callback status:',r.statusCode);console.log(d);if(r.statusCode!==200)process.exit(1)})});req.on('error',e=>{console.error(e);process.exit(1)});req.write(data);req.end();"
                        """

                        echo "Deployment success callback completed."
                    }
                }
            }
        }
    }

    post {
        success {
            echo "CloudOps deployment pipeline completed successfully for ${params.APPLICATION}:${params.VERSION} on AWS EKS."
        }

        failure {
            echo "CloudOps deployment pipeline failed for ${params.APPLICATION}:${params.VERSION}."
        }
    }
}