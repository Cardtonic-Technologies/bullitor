#!/bin/bash
set -euo pipefail

LOG_TRANSFORMER="node transform_logs.js"
#ENV_ARR=([1]=REDIS_USERNAME [2]=REDIS_PASSWORD [3]=REDIS_HOST [4]=REDIS_PORT)

file_env() {
  local var="$1"
  local fileVar="${var}_FILE"
  local def="${2:-}"
  if [ "${!var:-}" ] && [ "${!fileVar:-}" ]; then
    echo >&2 "error: both $var and $fileVar are set (but are exclusive)"
    exit 1
  fi
  local val="$def"
  if [ "${!var:-}" ]; then
    val="${!var}"
  elif [ "${!fileVar:-}" ]; then
    val="$(<"${!fileVar}")"
  fi
  export "$var"="$val"
  unset "$fileVar"
}

# all secrets of the application
file_env 'REDIS_HOST'
file_env 'REDIS_USERNAME'
file_env 'REDIS_PASSWORD'
file_env 'REDIS_CONN_STRING'

# if $REDIS_CONN_STRING exists split the env out and make the connection a secure one (TLS)
echo $REDIS_CONN_STRING >conn_string
cat conn_string
if [ -s conn_string ]; then
#  i=0
#  sed 's/[://@]/\n/g' <<<"$REDIS_CONN_STRING" | tail -n +4 | while IFS= read -r line; do echo $line; done
#  sed 's/[://@]/\n/g' <<<"$REDIS_CONN_STRING" | tail -n +4 | while ((i++)); IFS= read -r line; do export ${ENV_ARR[i]}=$line; done
#  REDIS_USERNAME=$(sed 's/[://@]/\n/g' <<<"$REDIS_CONN_STRING" | tail -n +4 | awk 'NR==1')
#  REDIS_PASSWORD=$(sed 's/[://@]/\n/g' <<<"$REDIS_CONN_STRING" | tail -n +4 | awk 'NR==2')
#  REDIS_HOST=$(sed 's/[://@]/\n/g' <<<"$REDIS_CONN_STRING" | tail -n +4 | awk 'NR==3')
#  REDIS_PORT=$(sed 's/[://@]/\n/g' <<<"$REDIS_CONN_STRING" | tail -n +4 | awk 'NR==4')
#
#  echo $REDIS_USERNAME
#  echo $REDIS_PASSWORD
#  echo $REDIS_HOST
#  echo $REDIS_PORT

  export REDIS_TLS=true
  export REDIS_USERNAME=$(sed 's/[://@]/\n/g' <<<"$REDIS_CONN_STRING" | tail -n +4 | awk 'NR==1')
  export REDIS_PASSWORD=$(sed 's/[://@]/\n/g' <<<"$REDIS_CONN_STRING" | tail -n +4 | awk 'NR==2')
  export REDIS_HOST=$(sed 's/[://@]/\n/g' <<<"$REDIS_CONN_STRING" | tail -n +4 | awk 'NR==3')
  export REDIS_PORT=$(sed 's/[://@]/\n/g' <<<"$REDIS_CONN_STRING" | tail -n +4 | awk 'NR==4')

  rm conn_string
fi

# enable prod logging if NODE_ENV is production
if [ "$NODE_ENV" = "production" ]; then
  LOG_TRANSFORMER="$LOG_TRANSFORMER --production"
fi

exec "$@"
