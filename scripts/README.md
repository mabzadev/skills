# Scripts

Les commandes d'exploitation du dépôt. La source de vérité des règles
exécutées vit dans [`tests/lints/`](../tests/README.md) ; ce dossier ne
contient que des commandes.

## Règles

1. Chaque script shell du dépôt passe `bash -n` sans erreur.
2. Les scripts peuvent être exécutés depuis la racine du dépôt.
3. Les scripts restent idempotents et peuvent être relancés sans risque.
   `build.sh` reconstruit toujours `./dist` depuis la source ; le résultat
   n'est jamais versionné.

## Catégories

| Catégorie | Critère | Exemples |
| --- | --- | --- |
| Construire | exécutés pour produire `./dist` depuis la source | `build.sh` |
| Développer | installent l'environnement de travail local | `dev.sh`, `link-skills.sh`, `list-skills.sh` |
| Vérifier | exécutés par la CI pour valider le dépôt | `prepare-dist.sh`, `validate-skills.mjs` |
| Utilitaires | invoqués par d'autres scripts ou `package.json` | `sync-plugin-version.mjs` |

N'ajoutez pas ici de scripts qui exécutent le code du dépôt, lient des tests
ou de la configuration — la source de vérité reste `tests/`.
