#!groovy

node {

    load "$JENKINS_HOME/jobvars.env"

    dir('src/github.com/reportportal/service-ui') {

        stage('Checkout') {
            checkout scm
        }


        stage('Build Docker Image') {
            withEnv(["NODE_OPTIONS=--max_old_space_size=4096"]) {
                sh """
                MAJOR_VER=\$(cat VERSION)
                BUILD_VER="\${MAJOR_VER}-${env.BUILD_NUMBER}"
                IMAGE_NAME='reportportal-dev/service-ui'
                COMMIT_SHA=\$(git rev-parse HEAD | git hash-object --stdin)
                BUILD_DATE=\$(date +%FT%T%z)
                docker build -t \$IMAGE_NAME --build-arg version=\$BUILD_VER --build-arg build_date=\$BUILD_DATE --build-arg branch=\$BRANCH-\$COMMIT_SHA -f Dockerfile-full .
                """
            }
        }

        stage('Push to registries') {
            withEnv(["AWS_URI=${AWS_URI}", "AWS_REGION=${AWS_REGION}"]) {
                sh 'docker tag reportportal-dev/service-ui $AWS_URI/service-ui:SNAPSHOT-$BUILD_NUMBER'
                def image = env.AWS_URI + '/service-ui' + ':SNAPSHOT-' + env.BUILD_NUMBER
                def url = 'https://' + env.AWS_URI
                def credentials = 'ecr:' + env.AWS_REGION + ':aws_credentials'
                docker.withRegistry(url, credentials) {
                    docker.image(image).push()
                }
            }
        }

        stage('Cleanup') {
            withEnv(["AWS_URI=${AWS_URI}"]) {
                sh 'docker rmi $AWS_URI/service-ui:SNAPSHOT-$BUILD_NUMBER'
                sh 'docker rmi reportportal-dev/service-ui:latest'
                sh 'docker image prune -f'
            }
        }
    }
}
