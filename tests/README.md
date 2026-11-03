# Tests

Tous les tests du code maintenu de ce dépôt sont regroupés dans ce dossier `tests/`. La structure reprend la convention du monorepo superboard : quatre dossiers à rôle fixe, des fichiers nommés `*.test.mjs`, rangés par propriétaire.

## Structure

| Dossier | Rôle |
| --- | --- |
| `checks/` | Les vérifications : tests unitaires et d'intégration, et les tests des linters. Le chemin indique le propriétaire — `checks/repository/` regroupe les règles générales du dépôt. |
| `lints/` | Les règles d'analyse partagées. Aucune commande ici : uniquement des règles pures, importées à la fois par l'oracle (`scripts/validate-skills.mjs`) et par les tests (`checks/`). |
| `fixtures/` | Les données partagées entre tests : entrées de journal valides et cassées, échantillons. |
| `e2e/` | Les parcours complets, de bout en bout : la boucle d'auto-amélioration entière, jouée en bac à sable. |

Le dépôt n'ayant pas d'application, il n'y a ni `checks/apps/` ni `checks/packages/` : tout vit pour l'instant sous `checks/repository/`. Un nouveau domaine (par exemple les scripts de `scripts/`) ouvrira son propre dossier propriétaire.

## Conventions

- Un fichier de test s'appelle `*.test.mjs` et décrit le comportement vérifié — pas la fonction qu'il appelle.
- Les règles réutilisées par l'oracle et par les tests vivent dans `lints/` ; leurs tests vivent dans `checks/repository/`.
- Une donnée partagée par plusieurs tests vit dans `fixtures/` ; une donnée propre à un test reste dans le test.
- Les commandes d'exploitation restent dans `scripts/` : l'oracle `validate-skills.mjs` y est la commande « le dépôt est correct », et il importe ses règles depuis `lints/`.

## Commandes

```bash
npm test              # tous les tests (node --test)
npm run validate      # l'oracle complet : journal, skills, index, docs, versions
```

La CI rejoue les deux à chaque push.
