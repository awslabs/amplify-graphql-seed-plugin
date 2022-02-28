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

refresh=$(check_if_argument_exists "refresh")
delete=$(check_if_argument_exists "delete")

if [ "$refresh" = true ] || [ "$delete" = true ]
then
    echo "INFO: Deleting mock database"
    amplify graphql-seed delete-mock
    exit 0
else 
    echo "INFO: No pre-mock action required" 
    exit 0
fi
