## Ce qu’il fait

`reverse-engineer-anything` mène une enquête de rétro-ingénierie avec [REA](https://github.com/morluto/rea), un serveur [MCP](https://www.aihero.dev/ai-coding-dictionary/mcp) qui inspecte ce qui est livré plutôt que le code source : binaires natifs, assemblages .NET, applications Electron et JavaScript, paquets Android, images de firmware, pages et captures réseau du navigateur. Il sert à expliquer une fonctionnalité, comparer deux versions, décompiler du code ou guider une reconstruction dans votre propre projet. Il sait aussi enregistrer l’environnement d’agent (bundle AgentEnv) d’une application web à partir d’une instance en ligne ou d’une capture.

Chaque conclusion repose sur une **Evidence** : un enregistrement identifié qui sépare ce qui a été observé, ce qui est déduit et ce qui reste inconnu. Le skill ne laisse jamais une analyse statique passer pour une observation de l’exécution, et il ne lance REA que lorsque la réponse dépend réellement d’un artefact livré ; une base de code complète s’analyse avec les outils ordinaires du dépôt.

## Quand l’utiliser

Appelez `/reverse-engineer-anything`, ou laissez Codex le sélectionner lorsqu’une tâche correspond.

Utilisez ce skill lorsqu’une affirmation dépend d’un binaire ou d’un paquet livré, d’une décompilation ou d’un comportement à l’exécution que le code disponible n’établit pas.

| Votre situation | Où aller |
| --- | --- |
| « Comment cette application fait-elle X ? », sans son code source | `reverse-engineer-anything` |
| Comparer deux versions d’un exécutable ou d’une ASAR | `reverse-engineer-anything` |
| Comprendre l’architecture d’un dépôt dont vous avez tout le code | Les outils habituels du dépôt, sans REA |
| Lire la documentation officielle d’une API tierce | [research](https://aihero.dev/skills-research) |
| Un bogue dans votre propre code | [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs) |

## Prérequis

- **Le serveur MCP REA**, qui tourne sous Node.js. Il est enregistré par le plugin Codex de cette collection ; ailleurs, `npx rea-agents setup` configure l’outil pour votre agent. Le skill seul n’apporte que des instructions : sans serveur connecté, il bascule sur la CLI `rea` ou vous guide vers la réparation.
- **Un moteur d’analyse pour le natif** : Hopper, Ghidra, IDA ou Kuna, déjà installé. REA n’installe ni ne met à jour ces moteurs. L’analyse JavaScript statique (ASAR, arborescence Electron extraite) n’en a pas besoin.

Certaines cibles demandent leur propre outil externe — TShark pour les captures de paquets, Binwalk ou Unblob pour le firmware sous Linux. Le [site de REA](https://rea.tools/) détaille chaque configuration.

## Aiguiller la cible, puis lire le résumé

Le premier outil se choisit d’après la **cible** fournie, pas d’après la question : une ASAR part vers l’analyse JavaScript, un APK vers l’inspection Android, un exécutable natif vers `open_binary`, une page déjà ouverte vers la liste des onglets du navigateur. Si vous dites seulement « mon application », le skill vous demande laquelle au lieu d’en choisir une.

Le travail se fait ensuite **résumé d’abord**. Le premier résultat est compact ; l’Evidence complète reste conservée côté serveur et se consulte page par page, ce qui protège la [fenêtre de contexte](https://www.aihero.dev/ai-coding-dictionary/context-window). Pour une enquête large, il découpe la demande en questions, tient un registre des constats liés aux identifiants d’Evidence et marque à la fin chaque question comme répondue, partielle ou ouverte.

## Questions fréquentes

**Les outils REA n’apparaissent pas dans ma session. Faut-il relancer l’installation ?**

Pas d’emblée. L’approbation du client, le `PATH`, l’enregistrement MCP et la disponibilité d’un moteur ont des remèdes différents ; le skill diagnostique le blocage observé, poursuit le travail possible (la CLI suffit pour du JavaScript statique) et demande un redémarrage du client MCP plutôt que de répéter la configuration. Une installation par plugin ne se répare pas avec `rea setup`.

**L’analyse native a expiré au démarrage de Ghidra sur un gros binaire.**

Ne relancez pas le même import à froid. Le délai de démarrage est réglable pour les tentatives suivantes ; le skill suit cette procédure de reprise avant d’abandonner l’analyse profonde.

## Indicateurs de réussite

- Chaque conclusion cite un identifiant d’Evidence et dit si elle est observée, déduite ou inconnue.
- Aucune analyse statique n’est présentée comme une observation de l’exécution.
- Une analyse identique n’est pas relancée ; les suites passent par des vues paginées de l’Evidence conservée.
- Une enquête large se termine sur sa liste de questions, chacune marquée répondue, partielle ou ouverte.
- Les sessions natives sont fermées lorsque le moteur n’est plus utile.

## Où il s’inscrit

`reverse-engineer-anything` est un outil autonome, utilisable dès qu’une réponse se trouve dans un artefact livré plutôt que dans du code source. [research](https://aihero.dev/skills-research) couvre le versant documentaire, et [prototype](https://aihero.dev/skills-prototype) prend le relais pour reconstruire la fonctionnalité comprise. Les contributeurs de REA disposent de quatre skills de maintenance, dont [rea-tool-design](https://aihero.dev/skills-rea-tool-design). La carte complète se trouve dans [ask-mabza](https://aihero.dev/skills-ask-mabza).
