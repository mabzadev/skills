---
name: note-mabza
description: "Capturer en cours de discussion un retour d'expérience dans le journal d'amélioration `.agents/feedback/` : évaluer si l'idée émergente est une fonctionnalité à implémenter, un concept à conserver, un ajustement de skill ou une piste écartée, puis laisser une entrée structurée. Silencieux : n'interrompt jamais la discussion."
---

# Noter pour Mabza

Une discussion produit des apprentissages qui ne seront pas mis en œuvre immédiatement : une friction avec un skill, une préférence d'expression de l'utilisateur, une fonctionnalité manquante, une piste envisagée puis écartée. Ce skill les capture dans le **journal d'amélioration** — `.agents/feedback/` à la racine du dépôt courant — au lieu de les laisser disparaître avec la conversation.

L'unité de capture est l'**entrée** : un fichier Markdown autonome, structuré, écrit en quelques secondes. Le journal alimente ensuite `/improve-mabza`, qui intègre récursivement son contenu dans les skills.

## Les trois propriétés d'un retour dense

Une entrée utile est :

- **Locale** — elle nomme le skill, le fichier ou la section précise concernée, jamais « les skills en général » ;
- **Rapide** — elle s'écrit sans quitter la discussion, sans outillage, sans poser de question à l'utilisateur ;
- **Vérifiable** — elle se termine par un critère observable : le comportement attendu la prochaine fois.

Une entrée qui ne satisfait pas les trois n'est pas prête : soit vous la précisez, soit vous ne la capturez pas.

## L'évaluation : quatre types

Avant d'écrire, classez l'idée émergente. C'est la décision centrale du skill :

| Type | Quand | Exemple |
| --- | --- | --- |
| `fonctionnalite` | Un comportement à construire : nouveau skill, nouvelle étape, nouvel artefact | « il faudrait que `/handoff` propose aussi… » |
| `concept` | Une notion à conserver sans construire : vocabulaire, préférence, nuance apprise | « quand je dis "zone", je veux dire… » |
| `amelioration` | Un ajustement d'un skill existant : formulation, processus, étape manquante | « la phase 2 devrait demander X d'abord » |
| `rejet` | Une piste évaluée puis écartée | « pas de suivi multi-contexte ici » |

Le type `rejet` mérite une entrée autant que les autres : une idée refusée mais non consignée sera reproposée dans trois semaines. La raison du refus est l'information.

**Quand ne rien capturer :** l'idée est mise en œuvre dans la conversation en cours ; une entrée existante la couvre déjà ; elle ne dit rien de réutilisable — une errance passagère de la conversation ne se journalise pas.

## Processus

### 1. Vérifier le journal

Lisez `.agents/feedback/` avant d'écrire :

- une entrée `ouvert` couvrant déjà l'idée est **enrichie** — complétez son Observation et son Contexte — pas dupliquée ;
- une entrée `rejet` couvrant l'idée signifie que la question est déjà tranchée : n'écrivez rien, et mentionnez-le en une ligne si c'est l'utilisateur qui vient de re-proposer l'idée.

### 2. Écrire l'entrée

Créez `.agents/feedback/AAAA-MM-JJ-<slug>.md` depuis le modèle [entry-template.md](./entry-template.md) :

```markdown
---
date: AAAA-MM-JJ
type: fonctionnalite | concept | amelioration | rejet
cible: <skill ou fichier concerné>
statut: ouvert
---

## Observation

La friction ou l'idée, dans les termes de la discussion — citez l'utilisateur
quand sa formulation est l'information.

## Contexte

Où l'idée est apparue : dépôt, skill en cours, moment du flux.

## Action proposée

Le changement précis — pour un `rejet`, la raison du refus et ce qui a été
tenté à la place.

## Critère de vérification

Le comportement observable la prochaine fois que la situation se représente.
```

Le frontmatter est lu par `/improve-mabza` ; les quatre sections sont pour l'humain qui relit.

### 3. Mentionner en une ligne

Terminez la réponse en cours par « Retour capturé : `<slug>` (`<type>`) » — rien de plus. La capture ne doit jamais devenir le sujet de la discussion.

## Amorçage

Si `.agents/feedback/` n'existe pas, créez-le en y copiant [journal-readme.md](./journal-readme.md), puis écrivez l'entrée. L'amorçage ne se demande pas : il se fait, et se mentionne dans la même ligne.

## Limites

- Ne capturez jamais à la place de l'utilisateur une décision qui lui appartient — une préférence non exprimée est une supposition, pas un retour.
- Le journal n'est pas un outil de suivi : une fonctionnalité déjà précise et volumineuse peut être capturée courte — `/improve-mabza` la routera vers le flux principal si elle dépasse le cadre d'une session.
- Une entrée n'est jamais supprimée ni modifiée dans son contenu après capture : `/improve-mabza` change son `statut` et ajoute une trace en fin de fichier.
