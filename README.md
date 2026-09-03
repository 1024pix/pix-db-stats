# pix-db-stats

Collecte de métriques et de statistiques sur les applications [Scalingo][] de Pix et sur leurs bases de données,
et publication de ces informations sur la sortie standard au format JSON.
Les logs sont ensuite récupérés par le log drain Scalingo puis envoyés à Datadog (voir `docs/overview.puml`).

Le périmètre couvert est double :

- **les bases de données** (PostgreSQL, et métriques d'addon pour Redis) des applications listées dans `SCALINGO_APPS` ;
- **les conteneurs** (mémoire et swap) de ces mêmes applications, ainsi que ceux des applications listées dans
  `SCALINGO_ADDITIONAL_APPS`, qui n'ont pas forcément de base de données (applications front, par exemple).

## Tâches disponibles

| Tâche                     | Feature toggle               | Périodicité                        | Description                                                                                                    |
| ------------------------- | ---------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `metrics`                 | `FT_METRICS`                 | `METRICS_SCHEDULE`                 | Métriques des addons base de données (CPU, RAM, disque, IO, stats PostgreSQL) du nœud leader                   |
| `app-metrics`             | `FT_APP_METRICS`             | `APP_METRICS_SCHEDULE`             | Mémoire et swap des conteneurs des applications (y compris `SCALINGO_ADDITIONAL_APPS`)                         |
| `statements`              | `FT_STATEMENTS`              | `STATEMENTS_SCHEDULE`              | Statistiques de requêtes issues de `pg_stat_statements` (puis remise à zéro des compteurs)                     |
| `response-time`           | `FT_RESPONSE_TIME`           | `RESPONSE_TIME_SCHEDULE`           | Temps de réponse d'une requête témoin (`RESPONSE_TIME_QUERY`), jouée en transaction lecture seule              |
| `progress`                | `FT_PROGRESS`                | `PROGRESS_SCHEDULE`                | Opérations longues en cours, via les vues `pg_stat_progress_*` (vacuum, création d'index…)                     |
| `queries-metric`          | `FT_QUERIES_METRIC`          | `QUERIES_METRIC_SCHEDULE`          | Nombre de requêtes actives et détail des requêtes lentes (`SLOW_QUERY_DURATION_SECONDS_THRESHOLD`)             |
| `blocking-queries`        | `FT_BLOCKING_QUERIES`        | `BLOCKING_QUERIES_SCHEDULE`        | Requêtes bloquées / bloquantes depuis plus de `BLOCKING_QUERIES_MINUTES_THRESHOLD` minutes                     |
| `cache-hit-ratio`         | `FT_CACHE_HIT_RATIO`         | `CACHE_HIT_RATIO_SCHEDULE`         | Ratio de cache hit calculé depuis `pg_stat_database`                                                           |
| `pg-connections-activity` | `FT_PG_CONNECTIONS_ACTIVITY` | `PG_CONNECTIONS_ACTIVITY_SCHEDULE` | Répartition des connexions PostgreSQL par `application_name` et par état (uniquement sur `pix-api-production`) |

Un feature toggle est actif quand sa variable d'environnement vaut `yes`.
Les périodicités suivent le format cron à six champs de la librairie [cron][] (la seconde est la plus fine granularité).

## Installation

Étapes :

- créer `.env` à partir de `sample.env`
- installer les dépendances `npm ci`

## Usage sur Scalingo

Ce dépôt est déployable directement sur Scalingo sans modifications.

1. Créer une application Scalingo
1. Configurer en regardant les variables d'environnement du `sample.env`
1. Pousser ce dépôt sur l'application Scalingo

Le `Procfile` déclare un conteneur `clock` qui exécute `npm run schedule-tasks` (le conteneur `web` n'est qu'un
serveur statique vide, présent pour satisfaire Scalingo).

## Exécution planifiée

`npm run schedule-tasks`

Toutes les tâches dont le feature toggle est actif sont planifiées (fuseau `Europe/Paris`).
Si aucun feature toggle n'est actif, l'application s'arrête en erreur.

## Exécution ponctuelle

Chaque tâche peut être lancée une seule fois, indépendamment de son feature toggle :

- métriques des bases de données : `npm run metrics`
- métriques des conteneurs d'applications : `npm run app-metrics`
- statistiques de requêtes : `npm run statements`
- temps de réponse : `npm run response-time`
- opérations longues en cours : `npm run progress`
- requêtes actives et lentes : `npm run queries-metric`
- requêtes bloquantes : `npm run blocking-queries`
- activité des connexions PostgreSQL : `npm run pg-connections-activity`
- ratio de cache hit : `node ./lib/application/run-cache-hit.js`

## Tests

Certains tests ont besoin d'une base PostgreSQL, fournie par `docker-compose.yaml` :

```shell
docker compose up -d
npm test
```

L'URL de cette base est configurée par `TEST_DATABASE_URL` dans le `.env`.

Lint : `npm run lint` (et `npm run lint:fix` pour corriger).

[Scalingo]: https://scalingo.com/
[cron]: https://github.com/kelektiv/node-cron#available-cron-patterns
