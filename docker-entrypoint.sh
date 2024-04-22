#!/bin/sh

STARTUP_COMMAND="node daemon.js"
LOG_TRANSFORMER="node transform_logs.js"

# enable prod logging if NODE_ENV is production
if [ "$NODE_ENV" = "production" ]; then
  LOG_TRANSFORMER="$LOG_TRANSFORMER --production"
fi

if [ -z "$ALTERNATE_PORT" ]; then
  echo "Environment variable not defined: ALTERNATE_PORT"
  exit 1
fi

$STARTUP_COMMAND
