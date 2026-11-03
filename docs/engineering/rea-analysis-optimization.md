## Ce qu’il fait

`rea-analysis-optimization` réduit le coût des analyses de [REA](https://github.com/morluto/rea) — contexte consommé par l’agent, latence, CPU, mémoire — sans perdre ni la justesse ni l’**Evidence**. Il trouve la première source de **travail inutile** sur le trajet d’une tâche publique, la corrige chez le propriétaire de ce travail, puis compare des enquêtes terminées équivalentes avant et après.

Une décision mesurée de ne rien changer est un résultat valable. Le skill n’ajoute ni index, ni cache générique, ni couche d’orchestration sans nommer le travail qu’ils suppriment et leur coût d’entretien, et il ne mesure les performances que lorsqu’un changement les vise ou qu’une régression concrète est à craindre.

## Quand l’utiliser

Appelez `/rea-analysis-optimization`, ou laissez Codex le sélectionner lorsqu’une tâche correspond.

Utilisez ce skill lorsqu’une analyse REA est lente, gourmande en mémoire ou bavarde, ou lorsqu’il faut concevoir un cache ou une requête partagée. Pour optimiser la CI ou les suites de tests, utilisez plutôt [rea-ci-tests-audit](https://aihero.dev/skills-rea-ci-tests-audit) ; pour redessiner le contrat d’un outil, [rea-tool-design](https://aihero.dev/skills-rea-tool-design).

## Prérequis

Un clone de [`morluto/rea`](https://github.com/morluto/rea) et le moteur concerné par la mesure. Les priorités de performance, le guide de conception d’outils et le guide de tests sont embarqués sous `references/rea/` (copie figée) ; une étude de cas sur le fournisseur Kuna illustre les compromis, sans valoir garantie pour les versions actuelles.

## L’oracle avant la mesure

Avant tout chronomètre, le skill fixe un **oracle de justesse** indépendant de l’implémentation modifiée : attentes issues de fixtures construites depuis le source, octets du fichier cartographiés indépendamment, ou producteur natif vérifié. Comparer deux enveloppes autour du même décodeur fautif ne prouve rien.

| Coût observé | Correction candidate |
| --- | --- |
| Faits validés rebalayés à chaque requête | Réutiliser l’ordre ou la structure de recherche existante |
| Travail moteur équivalent répété | Partager un résultat validé ou un producteur en cours |
| Rapport complet pour quelques faits | Pousser la sélection vers le premier propriétaire capable |
| Gros tampons de transport temporaires | Décoder par morceaux ou lire la source de façon bornée |

Chaque cache déclare sa clé, son propriétaire, son invalidation, sa taille retenue et sa durée de vie.

## Indicateurs de réussite

- Le compte rendu nomme le goulot, le changement chez son propriétaire, la sémantique préservée, les vérifications exécutées, les mesures avant/après et les limites restantes.
- Les mesures comparent des tâches terminées équivalentes, petits cas compris, et distinguent session fraîche, cache chaud et cache du système.
- Une affirmation sur les [jetons](https://www.aihero.dev/ai-coding-dictionary/token) compte schémas, arguments, réponses et relances, pas seulement la taille du JSON.
- Le travail s’arrête quand le goulot démontré est résolu ou que le gain restant devient spéculatif.

## Où il s’inscrit

`rea-analysis-optimization` est un skill de maintenance de REA, à utiliser ponctuellement. Il renvoie l’optimisation de la CI vers [rea-ci-tests-audit](https://aihero.dev/skills-rea-ci-tests-audit) et les questions de contrat vers [rea-tool-design](https://aihero.dev/skills-rea-tool-design). Pour le reste de la collection, consultez [ask-mabza](https://aihero.dev/skills-ask-mabza).
