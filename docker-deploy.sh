#! /bin/bash

# Fetch the latest api-protos if NODE_ENV=production
if [[ $(echo $NODE_ENV) == "production" ]]; then
    echo "Pulling the latest api-protos branch"
    cd api-protos
    git checkout develop
    git pull origin develop
    cd ../
elif [[ $(echo $NODE_ENV) == "olx-uat" ]]; then
    echo "Pulling the latest api-protos branch"
    cd api-protos
    git checkout olx-transition
    git pull origin olx-transition
    cd ../
fi

# Retrieve the image tag
branch=$(git symbolic-ref --short -q HEAD)
if [[ ${branch} == feature* ]]; then
    image_tag=${branch/#feature\//}
elif [[ ${branch} == ot-feature* ]]; then
    image_tag=${branch/#ot-feature\//}
elif [[ ${branch} == hotfix* ]]; then
    image_tag=${branch/#hotfix\//}
elif [[ ${branch} == release* ]]; then
    image_tag=${branch/#release\//}
else
    image_tag=$branch
fi

# Retrieve the Google Cloud Project
if [[ $(echo $NODE_ENV) == "production" ]]; then
    project="aj-production-189718"
elif [[ $(echo $NODE_ENV) == "olx-uat" ]]; then
    project="aj-production-189718"
elif [[ $(echo $NODE_ENV) == "olx-staging" ]]; then
    project="olx-transition"
else
    project="aj-cloud-staging"
fi

echo "Building Docker Image"
image=gcr.io/${project}/employer-frontend:${image_tag}
docker build -t ${image} .
echo "Pushing the server image"
docker push ${image}
