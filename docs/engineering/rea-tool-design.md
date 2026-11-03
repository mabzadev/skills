## Ce qu’il fait

`rea-tool-design` audite, conçoit ou modifie les outils d’enquête de [REA](https://github.com/morluto/rea) : leurs contrats CLI et [MCP](https://www.aihero.dev/ai-coding-dictionary/mcp), les capacités des fournisseurs (Ghidra, IDA, Kuna, navigateur…) et la sémantique de l’**Evidence** qu’ils renvoient. C’est un skill de contributeur : il s’utilise dans un clone de `morluto/rea`, pas pour analyser une cible.

Il part toujours de la **question de l’analyste**, pas de l’API du fournisseur. Un outil se justifie par la tâche qu’il permet de terminer ; la parité avec l’API d’un moteur n’est pas un objectif. Le skill exerce donc le flux réel à travers REA, le compare aux observations natives ou indépendantes de l’artefact lorsqu’elles existent, et dit ce qui n’a pas été exercé.

## Quand l’utiliser

Appelez `/rea-tool-design`, ou laissez Codex le sélectionner lorsqu’une tâche correspond.

Utilisez ce skill lorsque le travail porte sur la frontière d’un outil REA : son entrée, son résultat, ses échecs ou son Evidence.

| Demande | Ce qu’il rend |
| --- | --- |
| Audit d’outils existants | Bogues reproduits, limites assumées, pistes de conception et affirmations non vérifiées, avec les alternatives qui fonctionnent |
| Conception d’un outil | La frontière proposée, la forme d’entrée et de résultat, la sémantique d’Evidence, l’alternative la plus proche et la méthode de vérification |
| Implémentation | Le changement demandé, dans le périmètre et l’autorisation existants |

Pour un goulot de performance dans l’analyse, utilisez plutôt [rea-analysis-optimization](https://aihero.dev/skills-rea-analysis-optimization) ; pour la CI ou les suites de tests, [rea-ci-tests-audit](https://aihero.dev/skills-rea-ci-tests-audit).

## Prérequis

Un clone de [`morluto/rea`](https://github.com/morluto/rea). Le guide de conception d’outils, le guide de tests et les règles de contribution que le skill suit sont embarqués sous `references/rea/` : c’est une copie figée, que la version du clone remplace lorsqu’elle diffère. Le source, la documentation et le catalogue en ligne peuvent décrire des versions différentes ; le skill inspecte le contrat actuel avant de conclure.

## Questions fréquentes

**Faut-il reproduire toutes les fonctions du moteur sous-jacent ?**

Non. La vérification choisit les preuves utiles au contrat proposé, à partir de la tâche de l’analyste. Une fonction du moteur qui ne sert aucune question d’enquête n’a pas à devenir un outil.

## Indicateurs de réussite

- Chaque constat est classé : bogue reproduit, limite assumée, piste de conception ou affirmation non vérifiée.
- Une proposition nomme l’outil existant le plus proche et explique pourquoi il ne suffit pas.
- Le compte rendu dit quels chemins — résultats partiels, reprise, frontières de session — n’ont pas été exercés.
- Le guidage d’échec indique une voie de reprise plutôt qu’un simple message d’erreur.

## Où il s’inscrit

`rea-tool-design` est l’un des quatre skills de maintenance de REA, aux côtés de [rea-analysis-optimization](https://aihero.dev/skills-rea-analysis-optimization), [rea-ci-tests-audit](https://aihero.dev/skills-rea-ci-tests-audit) et [rea-changelog-update](https://aihero.dev/skills-rea-changelog-update). Les outils qu’il façonne sont ceux qu’utilise [reverse-engineer-anything](https://aihero.dev/skills-reverse-engineer-anything). Pour le reste de la collection, consultez [ask-mabza](https://aihero.dev/skills-ask-mabza).
