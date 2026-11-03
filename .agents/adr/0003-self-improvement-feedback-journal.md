# Boucle d'auto-amélioration par journal de retours denses

Les skills s'usent par l'usage : chaque discussion révèle des frictions, des préférences et des fonctionnalités manquantes qui disparaissent avec la conversation. Le dépôt doit conserver ces apprentissages et les réintégrer dans les skills au lieu de les perdre.

## Décision

La boucle d'auto-amélioration s'appuie sur trois éléments :

- un **journal d'amélioration** `.agents/feedback/` — une entrée par retour, fichier Markdown nommé `AAAA-MM-JJ-<slug>.md`, avec un frontmatter lisible par machine (`type`, `cible`, `statut`) et quatre sections : Observation, Contexte, Action proposée, Critère de vérification ;
- le skill **`note-mabza`**, invocable par le modèle : il évalue l'idée émergente pendant la discussion (fonctionnalité à implémenter, concept à conserver, amélioration d'un skill, piste écartée) et laisse une entrée, sans interrompre le fil ;
- le skill **`improve-mabza`**, réservé à l'utilisateur : il intègre récursivement les entrées ouvertes — évaluation, confirmation du plan, cascade complète des consignes du dépôt, trace — et jamais sans validation humaine.

Une entrée n'est jamais supprimée : `/improve-mabza` change son `statut` (`integre`, `rejete`) et ajoute une trace. Les entrées intégrées expliquent pourquoi un skill a changé ; les rejetées empêchent de re-proposer l'écarté.

Le format est inspiré du principe de **retour dense** décrit par Z.ai dans [Toward Recursive Self-Improvement](https://z.ai/blog/glm-built-its-inference-infrastructure) : ce qui limite un agent n'est pas tant sa capacité à écrire le changement que la qualité du retour dont il dispose. Un retour utile est **local** (attribué à un skill précis), **rapide** (écrit en cours de discussion) et **vérifiable** (un critère observable). La différence assumée avec l'article : l'humain reste la porte de chaque intégration — la boucle est récursive dans son application, pas dans son autorisation.

## Invariants

- Le journal vit sous `.agents/feedback/` ; `note-mabza` l'amorce depuis ses propres modèles embarqués (`entry-template.md`, `journal-readme.md`) pour rester autonome dans tout dépôt où il est installé.
- Les types sont au nombre de quatre — `fonctionnalite`, `concept`, `amelioration`, `rejet` — et les statuts au nombre de trois — `ouvert`, `integre`, `rejete` ; les deux vocabulaires restent en ASCII dans le frontmatter.
- `improve-mabza` suit la cascade complète des consignes du dépôt : `SKILL.md`, routeur `ask-mabza`, `catalog/`, `README.md` racine, `docs/`, `CHANGELOG.md`, `scripts/link-skills.sh`, validateur `plugin-creator`.
- Aucune entrée n'est modifiée dans son contenu après capture ; seule la trace s'ajoute en fin de fichier.
- Une idée refusée se consigne autant qu'une idée retenue : la raison du refus est l'information.
