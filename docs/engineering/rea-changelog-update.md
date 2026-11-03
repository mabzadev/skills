## Ce qu’il fait

`rea-changelog-update` prépare ou réécrit les notes de version de [REA](https://github.com/morluto/rea) — la section la plus récente de `CHANGELOG.md` et le corps de la release GitHub — à partir d’un historique Git épinglé, avec des remerciements vérifiés et une synchronisation avec Release Please.

Il écrit **l’inventaire avant la prose**. Un script du dépôt recense d’abord chaque PR, commit direct, coauteur et auteur de ticket fermé dans l’intervalle publié ; les notes ne remercient que les contributeurs humains vérifiés de cet inventaire. Un identifiant inconnu reste inconnu : le skill ne devine jamais un pseudonyme et ne remercie pas la personne qui a fusionné à la place de l’auteur. Il prépare les notes ; il n’autorise ni fusion, ni tag, ni publication.

## Quand l’utiliser

Appelez `/rea-changelog-update`, ou laissez Codex le sélectionner lorsqu’une tâche correspond.

Utilisez ce skill lorsqu’une version de REA approche et que le brouillon du bot doit devenir des notes lisibles par les utilisateurs.

## Prérequis

Un clone de [`morluto/rea`](https://github.com/morluto/rea) avec l’historique et les tags complets, et un accès GitHub pour l’inventaire. Le guide de publication est embarqué sous `references/rea/` (copie figée). Modifier la PR de release en ligne demande une autorisation explicite ; la préparation et la validation locales n’en ont pas besoin.

## Ce que deviennent les notes

| Section | Contenu |
| --- | --- |
| Highlights | Quelques résultats qui définissent la version, sans quota pour une petite version |
| Changes | Capacités et changements de comportement notables |
| Fixes | Fiabilité, justesse, compatibilité et sécurité |
| BREAKING CHANGES | Conservée si nécessaire, avec les migrations |

Le nettoyage interne, les tests et la CI restent dans le fichier de provenance, versionné avec la release, qui recense toutes les contributions, y compris celles absentes de la prose.

## Questions fréquentes

**Le bot Release Please va-t-il écraser les notes finalisées ?**

Non, tant que l’étiquette de finalisation est posée sur la PR de release avant toute modification. Elle gèle les rafraîchissements du bot, pas `main` : un nouveau changement produit après la cible de l’inventaire impose de refaire l’inventaire. Retirer l’étiquette relance les propositions automatiques et remplace les retouches éditoriales.

## Indicateurs de réussite

- Chaque contribution représentée est remerciée une seule fois, avec son lien.
- Aucun bot ni compte d’agent n’apparaît dans les remerciements.
- Les notes se terminent par le lien de provenance généré, et le vérificateur du dépôt passe sur le corps de PR relu.
- Les entrées décrivent un comportement utilisateur, pas un titre de PR recopié.

## Où il s’inscrit

`rea-changelog-update` est la dernière étape de maintenance avant une publication de REA, souvent après [rea-ci-tests-audit](https://aihero.dev/skills-rea-ci-tests-audit). Ses voisins sont [rea-tool-design](https://aihero.dev/skills-rea-tool-design) et [rea-analysis-optimization](https://aihero.dev/skills-rea-analysis-optimization). Pour le reste de la collection, consultez [ask-mabza](https://aihero.dev/skills-ask-mabza).
