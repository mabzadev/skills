## Ce qu’il fait

`note-mabza` capture un retour d’expérience dans le journal d’amélioration — `.agents/feedback/` à la racine du dépôt — pendant que la discussion qui l’a fait naître est encore en cours. Sa contrainte définissante : il est silencieux. Aucune question à poser, aucune interruption du fil ; une seule ligne en fin de réponse — « Retour capturé : … » — signale la capture, et la discussion continue.

Avant d’écrire, le skill évalue l’idée émergente et la classe en quatre types : `fonctionnalite` (un comportement à construire), `concept` (une notion à conserver sans construire — vocabulaire, préférence, nuance apprise), `amelioration` (un ajustement d’un skill existant) ou `rejet` (une piste évaluée puis écartée). Chaque entrée est un fichier Markdown autonome, nommé `AAAA-MM-JJ-<slug>.md`, avec un frontmatter lisible par machine et quatre sections : Observation, Contexte, Action proposée, Critère de vérification. [improve-mabza](https://aihero.dev/skills-improve-mabza) intègre ensuite ces entrées dans les skills.

## Quand l’utiliser

Codex le sélectionne automatiquement lorsqu’une discussion fait émerger une idée qui ne sera pas mise en œuvre immédiatement ; vous pouvez aussi l’appeler avec `/note-mabza` pour forcer une capture. Utilisez-le chaque fois qu’une friction avec un skill, une préférence d’expression ou une fonctionnalité manquante apparaît en plein travail — le moment où l’information est la plus riche et la plus périssable.

Ne l’utilisez pas lorsque l’idée est mise en œuvre dans la conversation en cours, ou lorsqu’une fonctionnalité déjà précise et volumineuse demande un vrai découpage : pour cela, utilisez plutôt [to-tickets](https://aihero.dev/skills-to-tickets). Une errance passagère de conversation ne se journalise pas non plus.

## Le retour dense

Une entrée utile satisfait trois propriétés, reprises de la notion de *dense feedback* décrite par Z.ai dans sa rétro-ingénierie de la boucle GLM — ce qui limite un agent n’est pas tant sa capacité à écrire le changement que la qualité du retour dont il dispose :

- **Locale** — l’entrée nomme le skill, le fichier ou la section précise concernée, jamais « les skills en général » ;
- **Rapide** — elle s’écrit en quelques secondes, sans quitter la discussion ;
- **Vérifiable** — elle se termine par un critère observable : le comportement attendu la prochaine fois.

Le type `rejet` mérite une entrée autant que les autres : une idée refusée mais non consignée sera reproposée dans trois semaines, et la raison du refus est l’information.

## Prérequis

Aucun. Si `.agents/feedback/` n’existe pas, le skill l’amorce à la première capture depuis ses modèles embarqués. [setup-mabza-skills](https://aihero.dev/skills-setup-mabza-skills) peut aussi activer le journal à la configuration du dépôt — c’est recommandé pour que la convention soit posée avant la première discussion.

## Questions fréquentes

**Est-ce que ça interrompt la discussion ?**

Non, et c’est sa contrainte définissante. La capture s’écrit sans poser de question, et se signale par une seule ligne en fin de réponse. Si un point mérite vraiment l’avis de l’utilisateur, c’est le flux principal qui le traitera — pas la capture.

**Une idée déjà rejetée sera-t-elle reproposée ?**

Non. Les pistes écartées se capturent avec le type `rejet`, et la raison du refus vit dans l’entrée. Quand la même idée revient trois semaines plus tard, la réponse est déjà écrite — et [improve-mabza](https://aihero.dev/skills-improve-mabza) la voit sans rouvrir le débat.

**Où vivent les entrées ?**

Sous `.agents/feedback/` dans le dépôt courant, un fichier par retour. Elles ne sont jamais supprimées : une fois intégrées ou rejetées, leur `statut` change et une trace s’ajoute, mais le contenu capturé reste intact.

## Indicateurs de réussite

- Une ligne « Retour capturé : `<slug>` (`<type>`) » apparaît en fin de réponse, et rien d’autre ne change dans le fil de la discussion.
- Le fichier créé sous `.agents/feedback/` nomme un skill précis dans sa `cible` et se termine par un critère observable.
- Aucune question n’a été posée pour capturer.
- Une idée déjà couverte par une entrée existante enrichit cette entrée au lieu d’en créer une nouvelle.

## Où il s’inscrit

`note-mabza` est le maillon de capture de la boucle d’auto-amélioration : [improve-mabza](https://aihero.dev/skills-improve-mabza) intègre ce qu’il collecte, et [setup-mabza-skills](https://aihero.dev/skills-setup-mabza-skills) active le journal à la configuration. La décision d’architecture complète est dans [l’ADR 0003 du dépôt](https://github.com/mbzadev/skills/blob/main/.agents/adr/0003-self-improvement-feedback-journal.md). Pour choisir le prochain skill, utilisez [ask-mabza](https://aihero.dev/skills-ask-mabza).
