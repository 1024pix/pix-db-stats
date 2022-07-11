# pix-db-stats

Récupération des statistiques des bases de données PostgreSQL de [Scalingo][] et sortie des informations via la console (et récupération par datadog de notre coté chez Pix).

## Installation
Etapes:
- créer `.env` à partir de `sample.env`
- installer les dépendances `npm ci`

## Usage sur Scalingo
Ce dépot est déployable directement sur Scalingo sans modifications.

1. Créer une application Scalingo
1. Configurer en regardant les variables d'environnement du sample.env
1. Pousser ce dépot sur l'application Scalingo

## Exécution ponctuelle
Exécuter:
- métriques: `npm run metrics`
- statistiques de requetes: `npm run statements`
- temps réponse: `npm run response-time`

## Exécution planifiée
`npm run schedule-tasks`

[Scalingo]: https://scalingo.com/
