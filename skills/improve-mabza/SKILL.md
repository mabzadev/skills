---
name: improve-mabza
description: "Intégrez récursivement le journal d'amélioration dans les skills : évaluez chaque entrée ouverte de `.agents/feedback/`, appliquez les changements aux skills concernés, répercutez la cascade complète (routeur, catalogues, documentation, validation), puis tracez chaque décision dans le journal."
---

# Améliorer Mabza

Le journal d'amélioration `.agents/feedback/` accumule des entrées capturées pendant les discussions par `note-mabza`. Ce skill les intègre : c'est le maillon qui transforme des retours épars en meilleurs skills. La boucle complète est l'auto-amélioration — les skills captent ce que leur usage révèle, puis se réécrivent à partir de ces retours — et l'humain garde la décision finale.

Il s'agit d'un skill piloté par la confirmation, et non d'un script déterministe : aucun changement ne s'écrit avant que le plan n'ait été présenté et approuvé.

## Processus

### 1. Collecter

Lisez toutes les entrées de `.agents/feedback/` et regroupez-les par `cible` : les entrées visant le même skill se traitent ensemble. S'il n'y a aucune entrée `ouvert`, dites-le et arrêtez-vous — un journal vide est un succès, pas un échec.

### 2. Évaluer

Pour chaque entrée ouverte, décidez et notez la justification :

- **intégrer** — l'entrée devient un changement, maintenant ;
- **rejeter** — l'idée ne tient pas : elle contredit une décision existante (ADR ou entrée `rejet` antérieure), elle reste trop vague pour agir, ou elle est déjà couverte ;
- **reporter** — valable mais prématurée : elle dépend d'un autre changement ou mérite d'être rediscutée avec l'utilisateur. Le report s'écrit dans la trace de l'entrée, pas dans un nouveau fichier.

Deux entrées contradictoires se tranchent ensemble, pas séparément.

### 3. Présenter le plan

Présentez un tableau — une ligne par entrée :

| Entrée | Type | Décision | Action et fichiers touchés |
| --- | --- | --- | --- |

L'utilisateur confirme ou ajuste avant toute écriture. C'est la porte humaine de la boucle : aucune auto-modification sans validation.

### 4. Appliquer la cascade

Une intégration n'est jamais un simple edit de `SKILL.md` : chaque changement suit les consignes du dépôt jusqu'au bout. **La cascade est la récursion** — traiter une entrée révèle ses conséquences, et on les suit toutes.

Dans le dépôt des skills :

1. Modifiez le `SKILL.md` visé. Une `fonctionnalite` qui réclame un nouveau skill crée `skills/<nom>/SKILL.md` et son `agents/openai.yaml` — avec la politique d'invocation adéquate : `policy.allow_implicit_invocation: false` pour un skill réservé à l'utilisateur, bloc `policy` omis pour un skill invocable par le modèle.
2. Répercutez sur tous les index concernés :
   - `skills/ask-mabza/SKILL.md` — le routeur doit refléter tout ajout, renommage ou suppression d'un skill invoqué par l'utilisateur ;
   - `catalog/<catégorie>/README.md` et `README.md` racine — une ligne par skill promu, sous le bon mode d'invocation ; les catégories non promues n'apparaissent jamais dans la liste publique ;
   - `docs/<catégorie>/<nom-du-skill>.md` — créez ou resynchronisez la page publique d'un skill promu ajouté, renommé ou modifié ;
   - `CHANGELOG.md` — une entrée sous « Non publié ».
3. Exécutez `scripts/link-skills.sh` si un skill a été ajouté, renommé ou supprimé.
4. Exécutez l'**oracle du dépôt** : `node scripts/validate-skills.mjs` — c'est lui, et non le modèle, qui définit « le dépôt est correct ». Lisez chaque ligne signalée (`chemin : problème`), corrigez, relancez — pour un changement ciblé, `--skill <nom>` après une modification de skill, `--feedback` après une écriture dans le journal. Terminez par `node --test` (`tests/`, organisé à la convention superboard). La cascade n'est terminée que lorsque l'oracle sort **exit 0** et les tests passent. Le validateur du skill système `plugin-creator` reste requis avant publication du plugin.
5. Itérez : si l'intégration fait émerger une nouvelle amélioration, capturez-la comme nouvelle entrée via `note-mabza` plutôt que de la corriger en silence — le journal doit refléter tout ce que la boucle apprend d'elle-même.

Dans un autre dépôt :

- un `concept` s'intègre au vocabulaire partagé du dépôt (`CONTEXT.md`, `AGENTS.md`) ;
- une `fonctionnalite` qui concerne le code du dépôt se route vers le flux principal : proposez à l'utilisateur de lancer `/to-spec` puis `/to-tickets` plutôt que de coder directement depuis le journal ;
- les entrées visant les skills eux-mêmes restent ouvertes : elles ne se traitent que dans le dépôt des skills. Signalez-les dans le bilan.

### 5. Tracer

Pour chaque entrée traitée, changez le `statut` dans le frontmatter et ajoutez une section en fin de fichier :

```markdown
## Trace

- statut : integre | rejete
- décision : <une ligne>
- changements : <fichiers modifiés ou créés>
```

Une entrée n'est jamais supprimée : le journal est la mémoire de la boucle — les entrées intégrées disent *pourquoi* un skill a changé, les rejetées empêchent de re-proposer l'écarté.

### 6. Boucler

Terminez par le bilan : N intégrées, M rejetées, K reportées, et la liste des changements effectués. Rappelez la cadence — ce skill se lance à intervalle régulier, comme l'entretien d'une base de code : quelques jours entre deux exécutions suffisent, un journal qui s'accumule depuis des semaines est un journal qu'on a cessé d'écouter.

## Limites

- Ne contournez jamais la confirmation du plan ; si l'utilisateur n'est pas disponible, arrêtez-vous à l'étape 3.
- **La boucle de correction est bornée** : si l'oracle signale la même erreur après trois corrections consécutives, arrêtez-vous et présentez le blocage à l'utilisateur — trois fois la même erreur signifie que l'hypothèse de cause est fausse, pas qu'il faut une quatrième tentative.
- Une `fonctionnalite` trop grande pour une session ne se code pas ici : routez-la vers le flux principal et marquez-la reportée en attendant ses tickets.
- Ce skill est réservé à l'utilisateur et n'invoque jamais un autre skill qui l'est aussi ; il peut s'appuyer sur `note-mabza`, invocable par le modèle.
