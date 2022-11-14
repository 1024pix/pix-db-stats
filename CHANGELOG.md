# pix-db-stats Changelog

## v3.9.1 (14/11/2022)


### :bug: Correction
- [#36](https://github.com/1024pix/pix-db-stats/pull/36) [BUGFIX] Corrige le crash en cas d'erreurs lors de la récupération des metrics

## v3.9.0 (09/11/2022)


### :bug: Correction
- [#34](https://github.com/1024pix/pix-db-stats/pull/34) [BUGFIX] Ne crashe pas si l'erreur n'a pas le format attendu

## v3.8.0 (07/11/2022)


### :rocket: Amélioration
- [#32](https://github.com/1024pix/pix-db-stats/pull/32) [FEATURE] Ajout du monitoring redis

### :coffee: Autre
- [#29](https://github.com/1024pix/pix-db-stats/pull/29) [CLEANUP] Refactoring de l'ordonnancement des taches

## v3.7.0 (07/11/2022)


### :rocket: Amélioration
- [#33](https://github.com/1024pix/pix-db-stats/pull/33) [FEATURE] Monitorer les métriques du leader BDD

### :coffee: Autre
- [#31](https://github.com/1024pix/pix-db-stats/pull/31) Revert "Suppression de l'évènement leader-cpu"
- [#30](https://github.com/1024pix/pix-db-stats/pull/30) Suppression de l'évènement leader-cpu

## v3.6.0 (13/10/2022)


### :bug: Correction
- [#26](https://github.com/1024pix/pix-db-stats/pull/26) [BUGFIX] Le conteneur s'arrête si Scalingo renvoie une erreur

## v3.5.0 (11/10/2022)


### :rocket: Amélioration
- [#27](https://github.com/1024pix/pix-db-stats/pull/27) [FEATURE] Renomme la tache running-queries en queries-metric

### :coffee: Autre
- [#28](https://github.com/1024pix/pix-db-stats/pull/28) [CLEANUP] Simplifie la config circleci

## v3.4.0 (07/10/2022)


### :coffee: Autre
- [#18](https://github.com/1024pix/pix-db-stats/pull/18) Utiliser la version de node 16.14
- [#19](https://github.com/1024pix/pix-db-stats/pull/19) Formater automatiquement le code

## v3.3.2 (07/10/2022)


### :bug: Correction
- [#25](https://github.com/1024pix/pix-db-stats/pull/25) [BUGFIX] Les requêtes en cours ne sont pas extraites périodiquement

## v3.3.1 (04/10/2022)


### :coffee: Autre
- [#23](https://github.com/1024pix/pix-db-stats/pull/23) :bug: Les statistiques de requêtes ne sont plus tracées

## v3.3.0 (03/10/2022)


### :coffee: Autre
- [#21](https://github.com/1024pix/pix-db-stats/pull/21) Suivre les requêtes SQL en cours

## v3.2.0 (13/09/2022)


### :rocket: Amélioration
- [#15](https://github.com/1024pix/pix-db-stats/pull/15) [FEATURE] Ajout d'une licence et ajout d'une description dans le README

### :coffee: Autre
- [#17](https://github.com/1024pix/pix-db-stats/pull/17) Monitorer le cache hit ratio
- [#16](https://github.com/1024pix/pix-db-stats/pull/16) [CLEANUP] Utilise l'action commune d'automerge

## v3.1.0 (07/07/2022)


### :rocket: Amélioration
- [#14](https://github.com/1024pix/pix-db-stats/pull/14) [FEATURE] Ajout des stats d'IO et disk

## v3.0.0 (20/06/2022)


### :rocket: Amélioration
- [#13](https://github.com/1024pix/pix-db-stats/pull/13) [FEATURE] Monitore plusieurs applications



## v1.0.0 (31/05/2022)


### :rocket: Amélioration
- [#11](https://github.com/1024pix/pix-db-stats/pull/11) [FEATURE] Ajouter le nom de l'application dans les logs
- [#12](https://github.com/1024pix/pix-db-stats/pull/12) [FEATURE] Ajout de l'action github d'auto merge
- [#10](https://github.com/1024pix/pix-db-stats/pull/10) [FEATURE] Récupère la chaine de connexion postgres via Scalingo

### :building_construction: Tech
- [#2](https://github.com/1024pix/pix-db-stats/pull/2) [TECH] Ajouter les statistiques des requêtes
- [#3](https://github.com/1024pix/pix-db-stats/pull/3) [TECH] Remettre à zéro les statistiques des requêtes après les avoir récupérées.

### :coffee: Autre
- [#9](https://github.com/1024pix/pix-db-stats/pull/9) Ajout de l'enregistrement de l'avancement des opérations longues
- [#7](https://github.com/1024pix/pix-db-stats/pull/7) Fournir la requête de temps de réponse depuis l'environnement
- [#6](https://github.com/1024pix/pix-db-stats/pull/6) [BUFGIX] Journaliser le temps de réponse au format JSON
- [#5](https://github.com/1024pix/pix-db-stats/pull/5) Monitorer le temps de réponse BDD
- [#1](https://github.com/1024pix/pix-db-stats/pull/1) Tracer la consommation CPU du leader BDD
- [#4](https://github.com/1024pix/pix-db-stats/pull/4) Permettre l'exécution sur n'importe quelle région Scalingo
