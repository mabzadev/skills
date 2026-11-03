## Ce qu’il fait

`rea-ci-tests-audit` audite la CI et les suites de tests de [REA](https://github.com/morluto/rea) pour savoir quelles vérifications attrapent encore de vraies régressions et quels coûts peuvent disparaître sans perdre cette protection. Il traque la dérive des fixtures, les **faux verts** — un test qui ne fait que répéter son mock ou masque l’échec d’un sous-processus — et les lenteurs mesurées.

Un test vert n’est jamais cru sur parole. Le skill perturbe le comportement visé dans une copie isolée, ou injecte un échec contrôlé, et vérifie que l’assertion ou la barrière existante le détecte. Une exécution plus rapide qui saute un cas ou affaiblit son oracle n’est pas une amélioration.

## Quand l’utiliser

Appelez `/rea-ci-tests-audit`, ou laissez Codex le sélectionner lorsqu’une tâche correspond.

Utilisez ce skill pour une enquête sur une suite ou un workflow de CI, ou pour un changement d’efficacité de la CI. Il ne sert ni à écrire les tests d’une nouvelle fonctionnalité — utilisez plutôt [tdd](https://aihero.dev/skills-tdd) — ni à corriger un seul test en échec — [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs). Pour la performance de l’analyse elle-même, utilisez [rea-analysis-optimization](https://aihero.dev/skills-rea-analysis-optimization).

## Prérequis

Un clone de [`morluto/rea`](https://github.com/morluto/rea), avec la chaîne d’outils épinglée du dépôt. Le guide de tests et les règles de contribution sont embarqués sous `references/rea/` (copie figée) ; les commandes du clone font foi. Les notes et résultats bruts de l’audit restent hors de l’arbre suivi, normalement dans un répertoire `/tmp` propre à la tâche.

## Classer chaque constat

| Classe | Ce qu’elle exige |
| --- | --- |
| Défaut reproduit | Révision exacte, reproduction minimale, conséquence, correction proposée |
| Coût étayé | Charge de travail et mesures, pas seulement un pourcentage |
| Hypothèse | L’explication concurrente et ce qui permettrait de trancher |
| Preuve indisponible | Ce qui manque — un vrai moteur Ghidra, LLDB ou navigateur, par exemple |

Les fixtures n’établissent pas le comportement d’un vrai fournisseur. Une relance qui passe n’établit ni une cause ni un correctif.

## Indicateurs de réussite

- Le compte rendu épingle la révision de base, la commande, l’hôte et les tests sélectionnés.
- Chaque faux vert signalé s’accompagne de la perturbation qui l’a démasqué.
- Aucun échec n’est masqué par une relance générale, un délai rallongé ou une assertion supprimée.
- Un correctif autorisé arrive avec un test de régression qui échoue sur la base pour la bonne raison.
- L’audit s’arrête lorsque le travail autorisé est vérifié ou que les gains restants ne sont pas prouvés.

## Où il s’inscrit

`rea-ci-tests-audit` est un skill de maintenance périodique de REA. Il partage le terrain avec [rea-analysis-optimization](https://aihero.dev/skills-rea-analysis-optimization), qui lui renvoie tout ce qui touche à la CI, et précède souvent [rea-changelog-update](https://aihero.dev/skills-rea-changelog-update) avant une publication. Pour le reste de la collection, consultez [ask-mabza](https://aihero.dev/skills-ask-mabza).
