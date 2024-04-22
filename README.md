# bullitor

[![Maintainability](https://api.codeclimate.com/v1/badges/9ca0eb7b9c6191ab30e9/maintainability)](https://codeclimate.com/github/ejhayes/bullitor/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/9ca0eb7b9c6191ab30e9/test_coverage)](https://codeclimate.com/github/ejhayes/bullitor/test_coverage) [![Dockerhub](https://img.shields.io/docker/pulls/ejhayes/nodejs-bullitor.svg)](https://hub.docker.com/r/ejhayes/nodejs-bullitor) <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

![](https://github.com/ejhayes/bullitor/releases/download/v2.0.0/bull_monitor.gif)

This is an all-in-one tool to help you visualize and report on BullMQ! It runs as a docker container that you can spin up with local development or host wherever you see fit. The core goal of this project is to provide realtime integration of your BullMQ queues with existing BullMQ tooling...without needing to run write any custom code. The following is automatically included:

- Automatic discovery of your BullMQ queues (just point this at your redis instance)
- Automatic configuration of prometheus metrics for each discovered queue
- [Elastic ECS](https://www.elastic.co/what-is/ecs) logging when `NODE_ENV` is set to `production`

You can test it out with docker by running (if you want to access something running on your host machine and not within the docker network you can use the special hostname [`host.docker.internal`](https://docs.docker.com/docker-for-mac/networking/#use-cases-and-workarounds)):

```sh
docker run -d --rm \
  --name bullitor \
  -e "NODE_ENV=development" \
  -e "REDIS_HOST=host.docker.internal" \
  -e "REDIS_PORT=6379" \
  -e "PORT=3000" \
  -e "BULL_WATCH_QUEUE_PREFIXES=bull" \
  -p 3000:3000 \
  ejhayes/nodejs-bullitor:latest
```

To use with docker compose, add the following to `docker-compose.yml`:

```yml
bullitor:
  image: ejhayes/nodejs-bullitor:latest
  ports:
    - 3000:3000
  environment:
    REDIS_HOST: <your redis host>
    REDIS_PORT: <your redis port>
    BULL_WATCH_QUEUE_PREFIXES: bull
    PORT: 3000
```

Then run `docker-compose up bullitor`. Assuming no issues, the following paths are available:

| Path                                  | Description                                                                                                                         |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [`/metrics`](localhos:3000/metrics)   | Prometheus metrics                                                                                                                  |
| [`/healthcheck`](localhos:3000/metrics)    | Health endpoint (always returns `HTTP 200` with `OK` text)                                                                          |
| [`/docs`](localhos:3000/metrics)      | Swagger UI                                                                                                                          |
| [`/docs-json`](localhos:3000/metrics) | Swagger JSON definition                                                                                                             |

## configuration

The following environment variables are supported:

| Environment Variable                     | Required | Default Value  | Description                                                                                                                                                              |
| ---------------------------------------- | -------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `REDIS_HOST`                             | x        | `null`         | Redis host (**IMPORTANT** must be same redis instance that stores BullMQ jobs!)                                                                                            |
| `REDIS_PORT`                             | x        | `null`         | Redis port                                                                                                                                                               |
| `REDIS_PASSWORD`                         |          | `null`         | Redis password                                                                                                                                                           |
| `REDIS_DB`                               |          | `0`            | Redis database index to use (see `options.db` from [docs](https://ioredis.readthedocs.io/en/latest/API/#new-redisport-host-options))                                     |
| `BULL_WATCH_QUEUE_PREFIXES`              |          | `bull`         | BullMQ prefixes to monitor (globs like `prefix*` are supported)                                                                                                            |
| `BULL_COLLECT_QUEUE_METRICS_INTERVAL_MS` |          | `60000`        | How often queue metrics are gathered                                                                                                                                     |
| `COLLECT_NODEJS_METRICS`                 |          | `false`        | Collect NodeJS metrics and expose via prometheus                                                                                                                         |
| `COLLECT_NODEJS_METRICS_INTERVAL_MS`     |          | `60000`        | How often to calculate NodeJS metrics (if enabled)                                                                                                                       |
| `REDIS_CONFIGURE_KEYSPACE_NOTIFICATIONS` |          | `true`         | Automatically configures redis keyspace notifications (typically not enabled by default). **IMPORTANT**: This will _NOT_ work without keyspace notifications configured. |
| `LOG_LABEL`                              |          | `bullitor` | Log label to use                                                                                                                                                         |
| `LOG_LEVEL`                              |          | `info`         | Log level to use (supported: `debug`, `error`, `info`, `warn`)                                                                                                           |
| `NODE_ENV`                               |          | `production`   | Node environment (use `development` for colorized logging)                                                                                                               |
| `PORT`                                   |          | `3000`         | Port to use                                                                                                                                                              |

## getting started

To get started:

```
npm install
npm run services:start
npm run start:dev
```

If you want to run the tests:

```
npm run test
npm run test:e2e
```

To build the container (will be built/tagged as `ejhayes/nodejs-bullitor`):

```
npm run ci:build
```

## generating quues/workers

A test script is included so you can try creating and/or processing BullMQ jobs. Examples:

```
# create a queue and add jobs to it (no processing)
npm run generate:create

# process queue jobs only
npm run generate:process

# create and process jobs
npm run generate
```

The default behavior of `npm run generate` is to:

- Create `MyBullQueue` queue if it doesn't exist.
- Add a dummy job every `10` milliseconds.
- Add a worker that with concurrency `15` that processes up to `200` jobs per `1` second (jobs retried up to `4` times).
- Configure each job to take up to `200` milliseconds. Jobs can fail randomly.

See `./test.ts` for more details.

## prometheus metrics

_NOTE:_ metrics are available at the `/metrics` endpoint

For each queue that is created the following metrics are automatically tracked.

| Metric                 | type      | description                                         |
| ---------------------- | --------- | --------------------------------------------------- |
| `jobs_completed_total` | `gauge`   | Total number of completed jobs                      |
| `jobs_failed_total`    | `gauge`   | Total number of failed jobs                         |
| `jobs_delayed_total`   | `gauge`   | Total number of delayed jobs                        |
| `jobs_active_total`    | `gauge`   | Total number of active jobs                         |
| `jobs_waiting_total`   | `gauge`   | Total number of waiting jobs                        |
| `jobs_active`          | `counter` | Jobs active                                         |
| `jobs_waiting`         | `counter` | Jobs waiting                                        |
| `jobs_stalled`         | `counter` | Jobs stalled                                        |
| `jobs_failed`          | `counter` | Jobs failed                                         |
| `jobs_completed`       | `counter` | Jobs completed                                      |
| `jobs_delayed`         | `counter` | Jobs delayed                                        |
| `job_duration`         | `summary` | Processing time for completed/failed jobs           |
| `job_wait_duration`    | `summary` | Durating spent waiting for job to start             |
| `job_attempts`         | `summary` | Number of attempts made before job completed/failed |

The following labels are available:

| Label Name     | Description                                 |
| -------------- | ------------------------------------------- |
| `queue_prefix` | Queue Prefix                                |
| `queue_name`   | Queue Name                                  |
| `job_name`     | Job name                                    |
| `status`       | Job status (choiced: `completed`, `failed`) |
| `error_type`   | Error type (uses error class name)          |

Things to note about these metrics:

- Queue metrics are GLOBAL not worker specific
- Gauge metrics (`*_total`) are refreshed every 60 seconds. To change this you'll need to set environment variable `BULL_COLLECT_QUEUE_METRICS_INTERVAL_MS` to another value.

## grafana support

You can visualize your queue metrics in Grafana! There are several pieces that need to be running for this to work:

- `bullitor` - this utility must be running (and the `/metrics` endpoint should be accessible)
- `prometheus` - you need to be running prometheus and have it configured to scrape `bullitor`
- `grafana` - grafana needs to be setup and configured to scrape data from prometheus

If you want to play around with a local setup of this:

```
# start services
npm run services:start
npm run start:dev

# generate/process dummy data
npm run generate
```

You can now go to: http://localhost:3001/dashboard/import and load dashboards:

| Grafana Dashboard Name | Grafana ID                                            | Description                                      | Screenshot                                  |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------ | ------------------------------------------- |
| Queue Overview         | [14538](https://grafana.com/grafana/dashboards/14538) | High level overview of all monitored BullMQ queues | ![](screenshots/grafana-all-queues.png)     |
| Queue Specific         | [14537](https://grafana.com/grafana/dashboards/14537) | Queue specific details                           | ![](screenshots/grafana-queue-specific.png) |

## Local Development

You can spin up a full local development environment by running:

```
# start services
npm run services:start
npm run start:dev
```

The following services are available (and automatically configured) at these locations:

- Grafana UI: http://localhost:3001
- Prometheus: http://localhost:3002
- SMTP (Mailhog): http:localhost: http://localhost:3003 (username: `test`, password: `test`)
- Redis: `localhost:6379`
- SMTP Server (used by Grafana Alerts): `localhost:6002` (no auth required, no encryption)

When you are done you can get rid of everything with:

```
npm run services:remove

# OR if you want to stop without removing
npm run services:stop
```

## Roadmap

See the [roadmap](https://github.com/ejhayes/bullitor/projects/1) for idas on how to improve this project.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/ejhayes"><img src="https://avatars.githubusercontent.com/u/310233?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Eric Hayes</b></sub></a><br /><a href="https://github.com/ejhayes/bullitor/commits?author=ejhayes" title="Documentation">📖</a> <a href="#infra-ejhayes" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/ejhayes/bullitor/commits?author=ejhayes" title="Tests">⚠️</a> <a href="https://github.com/ejhayes/bullitor/commits?author=ejhayes" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
