pipeline {
    agent any

    stages {
        stage('Set Environment Variables') {
            steps {
                script {
                    // Set environment file path and target path based on the branch
                    if (env.BRANCH_NAME == 'dev') {
                        env.ENV_FILE_PATH = "C:\\ProgramData\\Jenkins\\.jenkins\\jenkinsEnv\\slic_pos\\dev\\.env"
                        env.TARGET_PROJECT_PATH = "C:\\Users\\Administrator\\Desktop\\JENKINS_PROJECTS\\slic_pos_dev"
                        env.APP_NAME = 'slic_dev_backend'
                        env.BACKEND_PORT = '1100'
                        echo '📁 Environment set for DEV branch'
                    } else if (env.BRANCH_NAME == 'master') {
                        env.ENV_FILE_PATH = "C:\\ProgramData\\Jenkins\\.jenkins\\jenkinsEnv\\slic_pos\\prod\\.env"
                        env.TARGET_PROJECT_PATH = "C:\\Users\\Administrator\\Desktop\\JENKINS_PROJECTS\\slic_pos_prod"
                        env.APP_NAME = 'slic_prod_backend'
                        env.BACKEND_PORT = '1101'
                        echo '📁 Environment set for PROD branch'
                    } else {
                        error "❌ Unsupported branch: ${env.BRANCH_NAME}"
                    }
                    echo "✅ Using environment file: ${env.ENV_FILE_PATH}"
                    echo "✅ Target project path: ${env.TARGET_PROJECT_PATH}"
                    echo "✅ PM2 App Name: ${env.APP_NAME}"
                    echo "✅ Backend Port: ${env.BACKEND_PORT}"
                }
            }
        }

        stage('📦 Checkout') {
            steps {
                echo "📦 Checking out branch: ${env.BRANCH_NAME}"
                checkout scmGit(
                    branches: [[name: "*/${env.BRANCH_NAME}"]],
                    extensions: [
                        [$class: 'CleanBeforeCheckout'],
                        [$class: 'CleanCheckout'],
                        [$class: 'PruneStaleBranch']
                    ],
                    userRemoteConfigs: [[
                        credentialsId: 'dev_majid_new_github_credentials',
                        url: 'https://github.com/AbdulMajid1m1/slic_fullstack_nartec.git'
                    ]]
                )
                echo '✅ Current commit:'
                bat 'git log -1 --oneline'
            }
        }

        stage('📂 Copy to Target Directory') {
            steps {
                script {
                    echo "📂 Copying workspace to ${env.TARGET_PROJECT_PATH}..."
                    bat """
                        if exist "${env.TARGET_PROJECT_PATH}" rmdir /s /q "${env.TARGET_PROJECT_PATH}"
                        mkdir "${env.TARGET_PROJECT_PATH}"
                        xcopy /E /I /H /Y "%WORKSPACE%\\*" "${env.TARGET_PROJECT_PATH}"
                    """
                    echo "✅ Workspace copied successfully to ${env.TARGET_PROJECT_PATH}"
                }
            }
        }

        stage('📁 Install Dependencies - Frontend') {
            steps {
                script {
                    dir("${env.TARGET_PROJECT_PATH}\\frontend") {
                        echo '📥 Installing frontend dependencies...'
                        bat 'if exist "node_modules" rmdir /s /q node_modules'
                        bat 'npm install'
                        echo '✅ Frontend dependencies installed'
                    }
                }
            }
        }

        stage('⚙️ Build - Frontend') {
            steps {
                script {
                    dir("${env.TARGET_PROJECT_PATH}\\frontend") {
                        echo '🗑️ Cleaning previous build artifacts...'
                        bat 'if exist "dist" rmdir /s /q dist'

                        echo '🔨 Building frontend application...'
                        bat 'npm run build'
                        echo '✅ Frontend built successfully'
                    }
                }
            }
        }

        stage('📝 Create web.config - Frontend') {
            steps {
                script {
                    dir("${env.TARGET_PROJECT_PATH}\\frontend\\dist") {
                        echo '📝 Creating web.config for frontend SPA...'
                        def frontendWebConfig = '''<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>'''
                        writeFile file: 'web.config', text: frontendWebConfig
                        echo '✅ Frontend web.config created successfully'
                    }
                }
            }
        }

        stage('📁 Install Dependencies - Backend') {
            steps {
                script {
                    dir("${env.TARGET_PROJECT_PATH}\\backend") {
                        echo '📥 Installing backend dependencies...'
                        bat 'if exist "node_modules" rmdir /s /q node_modules'
                        bat 'npm install'
                        echo '✅ Backend dependencies installed'
                    }
                }
            }
        }

        stage('📋 Setup Environment File - Backend') {
            steps {
                script {
                    dir("${env.TARGET_PROJECT_PATH}\\backend") {
                        echo "📁 Copying .env file from ${env.ENV_FILE_PATH}..."
                        bat """
                            if not exist "${env.ENV_FILE_PATH}" (
                                echo ❌ Environment file not found at ${env.ENV_FILE_PATH}
                                exit /b 1
                            )
                            copy "${env.ENV_FILE_PATH}" ".env"
                        """
                        echo '✅ Environment file copied successfully'
                    }
                }
            }
        }

        stage('📝 Create web.config - Backend') {
            steps {
                script {
                    dir("${env.TARGET_PROJECT_PATH}\\backend") {
                        echo "📝 Creating web.config for backend reverse proxy (Port: ${env.BACKEND_PORT})..."
                        def backendWebConfig = """<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="ReverseProxyInboundRule1" stopProcessing="true">
                    <match url="(.*)" />
                    <!-- ${env.BRANCH_NAME == 'dev' ? 'Development' : 'Production'} URL PORT -->
                    <!-- 1101 is for the production port and 1100 for the dev -->
                    <action type="Rewrite" url="http://localhost:${env.BACKEND_PORT}/{R:1}" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>"""
                        writeFile file: 'web.config', text: backendWebConfig
                        echo "✅ Backend web.config created successfully with port ${env.BACKEND_PORT}"
                    }
                }
            }
        }

        stage('🗂️ Update Prisma Schema') {
            steps {
                script {
                    dir("${env.TARGET_PROJECT_PATH}\\backend") {
                        echo '🔄 Generating Prisma client...'
                        bat 'npx prisma generate'
                        echo '✅ Prisma client generated successfully'
                    }
                }
            }
        }

        stage('🛑 Stop Existing Backend') {
            steps {
                script {
                    echo "🛑 Stopping existing PM2 process: ${env.APP_NAME}"
                    bat """
                        pm2 stop ${env.APP_NAME} 2>nul
                        pm2 delete ${env.APP_NAME} 2>nul
                        exit /b 0
                    """
                    echo '✅ Ready for deployment'
                }
            }
        }

        stage('🚀 Start Backend') {
            steps {
                script {
                    dir("${env.TARGET_PROJECT_PATH}\\backend") {
                        echo "🚀 Starting PM2 process: ${env.APP_NAME}"
                        bat "pm2 start app.js --name ${env.APP_NAME}"
                        bat 'pm2 save'
                        echo '✅ Backend started successfully'
                    }
                }
            }
        }

        stage('✅ Verify Deployment') {
            steps {
                script {
                    echo '🔍 Verifying PM2 process...'
                    bat 'pm2 list'
                    bat "pm2 info ${env.APP_NAME}"
                    echo '✅ Deployment verified'
                }
            }
        }
    }

    post {
        success {
            script {
                echo """
                ✅ ========================================
                ✅ SLIC POS DEPLOYMENT SUCCESSFUL
                ✅ Branch: ${env.BRANCH_NAME}
                ✅ App Name: ${env.APP_NAME}
                ✅ Backend Port: ${env.BACKEND_PORT}
                ✅ Project Path: ${env.TARGET_PROJECT_PATH}
                ✅ Time: ${new Date()}
                ✅ ========================================
                """
            }
        }
        failure {
            script {
                echo """
                ❌ ========================================
                ❌ SLIC POS DEPLOYMENT FAILED
                ❌ Branch: ${env.BRANCH_NAME}
                ❌ Please check logs for details
                ❌ Time: ${new Date()}
                ❌ ========================================
                """
            }
        }
        always {
            echo "📊 Pipeline finished at: ${new Date()}"
        }
    }
}