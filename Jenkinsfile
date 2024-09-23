pipeline {
    agent any

    stages {
        stage('Set Environment Variables') {
            steps {
                script {
                    // Set environment variables based on the branch.
                    if (env.BRANCH_NAME == 'dev') {
                        // Use Jenkins environment variables for development
                        env.NODE_ENV = 'development'
                        env.DATABASE_URL = "${env.slic_dev_DATABASE_URL}"
                        env.PORT = "${env.slic_dev_PORT}"
                        env.JWT_SECRET = "${env.slic_dev_JWT_SECRET}"
                        env.SLIC_ERP_URL = 'https://slicuat05api.oneerpcloud.com'
                    } else if (env.BRANCH_NAME == 'production') {
                        // Use Jenkins environment variables for production
                        env.NODE_ENV = 'production'
                        env.DATABASE_URL = "${env.slic_prod_DATABASE_URL}"
                        env.PORT = "${env.slic_prod_PORT}"
                        env.JWT_SECRET = "${env.slic_prod_JWT_SECRET}"
                        env.SLIC_ERP_URL = 'https://slicapi.oneerpcloud.com'
                
                    } else {
                        error "Unsupported branch: ${env.BRANCH_NAME}"
                    }
                    echo "Environment set for ${env.BRANCH_NAME} branch"
                    echo "DATABASE_URL=${env.DATABASE_URL}"  // Print the database URL to check if it's correctly set
                }
            }
        }

        stage('Checkout') {
            steps {
                script {
                    echo "Checking out the branch: ${env.BRANCH_NAME}"
                    checkout scmGit(branches: [[name: "*/${env.BRANCH_NAME}"]], extensions: [], userRemoteConfigs: [[credentialsId: 'usernameCredentials', url: 'https://github.com/AbdulMajid1m1/slic_fullstack_nartec.git']])
                }
            }
        }

        stage('Install Dependencies - Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                }
            }
        }

        stage('Build - Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Install Dependencies - Backend') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('List Backend Files') {
            steps {
                dir('backend') {
                    bat 'dir'  // Lists the contents of the backend directory
                }
            }
        }

        stage('Create Environment File - Backend') {
            steps {
                dir('backend') {
                    script {
                        writeFile file: '.env', text: """
                            NODE_ENV=${env.NODE_ENV}
                            DATABASE_URL=${env.DATABASE_URL}
                            PORT=${env.PORT}
                            JWT_SECRET=${env.JWT_SECRET}
                        """
                    }
                }
            }
        }

        stage('Stop Existing Backend') {
            steps {
                script {
                    def appName = env.BRANCH_NAME == 'dev' ? 'slic_dev_backend' : 'slic_prod_backend'
                    def processStatus = bat(script: 'pm2 list', returnStdout: true).trim()
                    if (processStatus.contains(appName)) {
                        bat "pm2 stop ${appName} || exit 0"
                        bat "pm2 delete ${appName} || exit 0"
                    }
                }
            }
        }

        stage('Start Backend') {
            steps {
                dir('backend') {
                    script {
                        def appName = env.BRANCH_NAME == 'dev' ? 'slic_dev_backend' : 'slic_prod_backend'
                        def port = env.PORT
                        bat "pm2 start app.js --name ${appName} --env ${env.BRANCH_NAME} -- -p ${port}"
                    }
                }
            }
        }
    }
}
