## Ce qu’il fait

`improve-mabza` intègre récursivement le journal d’amélioration dans les skills. Il lit chaque entrée ouverte de `.agents/feedback/` — celles que [note-mabza](https://aihero.dev/skills-note-mabza) a capturées pendant les discussions —, les évalue une par une, applique les changements aux skills concernés en suivant toutes les consignes du dépôt, puis trace chaque décision dans le journal.

Sa contrainte définissante : rien ne s’écrit avant que le plan n’ait été présenté et approuvé. La boucle est récursive dans son application, pas dans son autorisation — c’est la porte humaine de l’auto-amélioration.

## Quand l’utiliser

Vous l’invoquez en tapant `/improve-mabza` : l’agent ne le déclenchera pas seul. Lancez-le à intervalle régulier, quelques jours entre deux exécutions suffisent — la même cadence que [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) pour l’entretien d’une base de code. Un journal vide est un succès : le skill le dit et s’arrête.

La distinction avec son voisin : improve-codebase-architecture approfondit **le code du projet**, improve-mabza améliore **les skills eux-mêmes** à partir de ce que leur usage révèle. Pour capturer de nouvelles idées, c’est [note-mabza](https://aihero.dev/skills-note-mabza) qui s’en charge, en cours de discussion.

## Prérequis

Il lit le journal `.agents/feedback/` du dépôt courant — créé par [setup-mabza-skills](https://aihero.dev/skills-setup-mabza-skills) à la configuration, ou amorcé par note-mabza à la première capture. Les entrées visant les skills eux-mêmes ne se traitent que dans le dépôt des skills ; ailleurs, elles restent ouvertes et le bilan vous les signale.

## La cascade est la récursion

Une intégration n’est jamais un simple edit de `SKILL.md`. Traiter une entrée révèle ses conséquences, et on les suit toutes :

1. le `SKILL.md` visé — ou la création complète d’un nouveau skill (`SKILL.md` + `agents/openai.yaml` avec sa politique d’invocation) lorsqu’une `fonctionnalite` le réclame ;
2. le routeur [ask-mabza](https://aihero.dev/skills-ask-mabza), qui doit refléter tout ajout, renommage ou suppression de skill invoqué par l’utilisateur ;
3. le catalogue `catalog/<catégorie>/README.md`, le `README.md` racine et la page publique `docs/<catégorie>/<nom-du-skill>.md` ;
4. le `CHANGELOG.md`, le script de liaison locale, puis le validateur du plugin.

Si l’intégration fait émerger une nouvelle amélioration, elle devient une nouvelle entrée via note-mabza plutôt qu’une correction silencieuse — le journal doit refléter tout ce que la boucle apprend d’elle-même.

## Le journal est la mémoire

Chaque entrée traitée change de `statut` — `integre` ou `rejete` — et reçoit une trace : la décision en une ligne, les fichiers modifiés. Les entrées ne sont jamais supprimées : les intégrées expliquent *pourquoi* un skill a changé, les rejetées empêchent de re-proposer l’écarté.

## Questions fréquentes

**Que devient une entrée rejetée ?**

Elle reste dans le journal, marquée `rejete`, avec la raison du refus dans sa trace : contradiction avec une ADR ou une entrée `rejet` antérieure, idée trop vague pour agir, ou déjà couverte. C’est précisément ce qui empêche de re-débattre la même piste au cycle suivant.

**Faut-il le lancer dans le dépôt des skills ?**

Pour tout ce qui touche les skills, oui : les entrées visant les skills ne s’intègrent que là. Dans un autre dépôt, le skill intègre les `concept` au vocabulaire partagé (`CONTEXT.md`, `AGENTS.md`) et route les fonctionnalités du code vers le flux principal — [to-spec](https://aihero.dev/skills-to-spec) puis [to-tickets](https://aihero.dev/skills-to-tickets).

**Une `fonctionnalite` trop grande se code-t-elle ici ?**

Non. Elle se route vers le flux principal et reste reportée en attendant ses tickets. improve-mabza ajuste des skills et suit la cascade ; il ne remplace pas une session d’implémentation.

## Indicateurs de réussite

- Le bilan final énonce : N intégrées, M rejetées, K reportées, avec les changements effectués.
- Chaque entrée traitée porte un `statut` mis à jour et une trace datée, sans que son contenu capturé ait changé.
- Pour un nouveau skill : le routeur, le catalogue, le README racine et la page de documentation le référencent tous, et l'oracle `node scripts/validate-skills.mjs` sort exit 0 (le validateur du plugin reste requis avant publication).
- Deux entrées contradictoires ont été tranchées ensemble, dans une seule décision.

## Où il s’inscrit

improve-mabza referme la boucle d’auto-amélioration ouverte par [note-mabza](https://aihero.dev/skills-note-mabza) : les skills captent ce que leur usage révèle, puis se réécrivent à partir de ces retours. [setup-mabza-skills](https://aihero.dev/skills-setup-mabza-skills) active le journal à la configuration ; la décision d’architecture est dans [l’ADR 0003 du dépôt](https://github.com/mbzadev/skills/blob/main/.agents/adr/0003-self-improvement-feedback-journal.md). Pour choisir le prochain skill, utilisez [ask-mabza](https://aihero.dev/skills-ask-mabza).
