pipeline {
    agent any

    environment {
        HOMEPATH = 'C:/Users/yourUserName'  // Replace with your Windows user directory

        // Development environment variables
        slic_dev_DATABASE_URL = 'sqlserver://173.249.56.16:1433;database=SLICDB;user=sa;password=its2514LOVE!;encrypt=true;trustServerCertificate=true;connectTimeout=30000;'
        slic_dev_PORT = '1100'
        slic_dev_JWT_SECRET = 'com.nartec.slic'

        // Production environment variables
        slic_prod_DATABASE_URL = 'sqlserver://173.249.56.16:1433;database=SLICDB;user=sa;password=its2514LOVE!;encrypt=true;trustServerCertificate=true;connectTimeout=30000;'
        slic_prod_PORT = '1101'
        slic_prod_JWT_SECRET = 'com.nartec.slic'
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    // Log the branch name in the console
                    echo "Current branch: ${env.BRANCH_NAME}"
                    
                    // Checkout based on the branch Jenkins is building
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

        // List backend directory contents for debugging
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
                        // Create environment-specific .env file based on branch
                        if (env.BRANCH_NAME == 'dev') {
                            writeFile file: '.env', text: """
                                NODE_ENV=development
                                DATABASE_URL=${slic_dev_DATABASE_URL}
                                PORT=${slic_dev_PORT}
                                JWT_SECRET=${slic_dev_JWT_SECRET}
                            """
                        } else if (env.BRANCH_NAME == 'production') {
                            writeFile file: '.env', text: """
                                NODE_ENV=production
                                DATABASE_URL=${slic_prod_DATABASE_URL}
                                PORT=${slic_prod_PORT}
                                JWT_SECRET=${slic_prod_JWT_SECRET}
                            """
                        }
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
                        def port = env.BRANCH_NAME == 'dev' ? env.slic_dev_PORT : env.slic_prod_PORT
                        bat "pm2 start app.js --name ${appName} --env ${env.BRANCH_NAME} -- -p ${port}"
                    }
                }
            }
        }
    }
}
