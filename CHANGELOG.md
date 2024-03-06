# pix-db-stats Changelog

## v3.14.2 (06/03/2024)


### :building_construction: Tech
- [#84](https://github.com/1024pix/pix-db-stats/pull/84) [TECH] Monter les versions des images postgresql.

### :arrow_up: Montée de version
- [#89](https://github.com/1024pix/pix-db-stats/pull/89) [BUMP] Lock file maintenance (dossier racine).
- [#71](https://github.com/1024pix/pix-db-stats/pull/71) [BUMP] Update dependency cron to v3 (dossier racine).
- [#86](https://github.com/1024pix/pix-db-stats/pull/86) [BUMP] Lock file maintenance (dossier racine).
- [#83](https://github.com/1024pix/pix-db-stats/pull/83) [BUMP] Lock file maintenance (dossier racine).

## v3.14.1 (13/12/2023)


### :building_construction: Tech
- [#82](https://github.com/1024pix/pix-db-stats/pull/82) [TECH] Ajout d'informations sur les queries bloquées et bloquantes.

## v3.14.0 (13/12/2023)


### :arrow_up: Montée de version
- [#78](https://github.com/1024pix/pix-db-stats/pull/78) [BUMP] Lock file maintenance (dossier racine).
- [#79](https://github.com/1024pix/pix-db-stats/pull/79) [BUMP] Update dependency axios to v1.6.0 [SECURITY].
- [#77](https://github.com/1024pix/pix-db-stats/pull/77) [BUMP] Update dependency sinon to v17 (dossier racine).

### :coffee: Autre
- [#81](https://github.com/1024pix/pix-db-stats/pull/81) Monitor locked queries.

## v3.13.0 (27/10/2023)


### :building_construction: Tech
- [#75](https://github.com/1024pix/pix-db-stats/pull/75) [TECH] 🔊 Log long running queries.

### :arrow_up: Montée de version
- [#76](https://github.com/1024pix/pix-db-stats/pull/76) [BUMP] Update node to v20 (major).
- [#73](https://github.com/1024pix/pix-db-stats/pull/73) [BUMP] Lock file maintenance (dossier racine).
- [#72](https://github.com/1024pix/pix-db-stats/pull/72) [BUMP] Lock file maintenance (dossier racine).
- [#68](https://github.com/1024pix/pix-db-stats/pull/68) [BUMP] Update dependency sinon to v16 (dossier racine).
- [#66](https://github.com/1024pix/pix-db-stats/pull/66) [BUMP] Lock file maintenance (dossier racine).
- [#65](https://github.com/1024pix/pix-db-stats/pull/65) [BUMP] Update dependency eslint-config-prettier to v9 (dossier racine).
- [#63](https://github.com/1024pix/pix-db-stats/pull/63) [BUMP] Update node to v18.17.1.

## v3.12.0 (08/08/2023)


### :building_construction: Tech
- [#39](https://github.com/1024pix/pix-db-stats/pull/39) [TECH] Mettre à jour les dépendances automatiquement.

### :arrow_up: Montée de version
- [#56](https://github.com/1024pix/pix-db-stats/pull/56) [BUMP] Update node.
- [#62](https://github.com/1024pix/pix-db-stats/pull/62) [BUMP] Lock file maintenance (dossier racine).
- [#61](https://github.com/1024pix/pix-db-stats/pull/61) [BUMP] Update postgres Docker tag to v14.8.
- [#60](https://github.com/1024pix/pix-db-stats/pull/60) [BUMP] Lock file maintenance (dossier racine).
- [#55](https://github.com/1024pix/pix-db-stats/pull/55) [BUMP] Lock file maintenance (dossier racine).
- [#54](https://github.com/1024pix/pix-db-stats/pull/54) [BUMP] Update dependency prettier to v3 (dossier racine).
- [#53](https://github.com/1024pix/pix-db-stats/pull/53) [BUMP] Update dependency node to v18.16.1.
- [#48](https://github.com/1024pix/pix-db-stats/pull/48) [BUMP] Update Node.js to v18.16.1.
- [#47](https://github.com/1024pix/pix-db-stats/pull/47) [BUMP] Lock file maintenance (dossier racine).
- [#46](https://github.com/1024pix/pix-db-stats/pull/46) [BUMP] Lock file maintenance (dossier racine).
- [#43](https://github.com/1024pix/pix-db-stats/pull/43) [BUMP] Update node (major).

## v3.11.0 (24/04/2023)


### :building_construction: Tech
- [#38](https://github.com/1024pix/pix-db-stats/pull/38) [TECH] Mise à jour vers node 18

## v3.10.0 (05/12/2022)


### :rocket: Amélioration
- [#35](https://github.com/1024pix/pix-db-stats/pull/35) [FEATURE] Envoi un seul événement db-metrics avec les informations du leader, son disque et les IO
- [#37](https://github.com/1024pix/pix-db-stats/pull/37) [FEATURE] Ajout de l'attribut database sur tous les logs

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
