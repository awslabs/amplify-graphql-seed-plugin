#!/bin/bash
parameters=`cat`
data=$(jq -r '.data' <<< "$parameters")

if ! command -v jq &> /dev/null
then
    echo "Install or add jq CLI binary into your path to use the hooks."
    exit 1
fi

check_if_argument_exists() {
    ARG=$1
    echo $(jq -r '.amplify.argv' <<< "$data" | jq -e 'any(.[]; . == "--'$ARG'" or . == "-'$ARG'" or . == "--'$ARG'=true")')
}

seed=$(check_if_argument_exists "seed")

if [ "$seed" = true ]
then
    echo "INFO: Seeding database"
    amplify graphql-seed run --remote
    exit 0
else 
    echo "INFO: Not seeding database"
    exit 0
fi
