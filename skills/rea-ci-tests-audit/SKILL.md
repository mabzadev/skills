---
name: rea-ci-tests-audit
description: "Auditez la CI et les suites de tests REA pour l'exactitude, la dérive des fixtures, les faux succès et la performance mesurée ; à utiliser pour les investigations sur des suites ou des workflows et les changements d'efficacité, plutôt que pour les tests ordinaires d'une fonctionnalité ou un échec de test isolé."
---

# Audit de la CI et des tests REA

Utilisez ce skill dans un clone du dépôt REA (`morluto/rea`) ; les guides cités sont embarqués sous `references/rea/` (copie figée du commit importé ; dans un clone, la version du clone fait foi).

Établissez quelles vérifications détectent encore de vraies régressions et quels coûts peuvent être supprimés sans perdre cette protection. Le résultat peut être un correctif vérifié, une recommandation étayée par des preuves ou une décision explicite d'arrêter.

Suivez le `AGENTS.md` du clone, le [guide de test](references/rea/docs/testing.md) et les [règles de contribution](references/rea/CONTRIBUTING.md). Utilisez leurs commandes actuelles et la toolchain figée, plutôt que des commandes retenues d'un audit précédent. Respectez le périmètre demandé : une investigation seule n'autorise pas de modifications ; ce skill n'accorde pas la permission de publier des issues, de pousser ou de fusionner. L'autorisation existante de l'utilisateur continue de s'appliquer. Conservez les notes d'audit et les résultats bruts hors de l'arborescence suivie, normalement dans un répertoire `/tmp` dédié à la tâche.

## Établissez la référence exécutée

Faites un fetch lorsque l'utilisateur demande le dernier main. Figez le SHA de référence et la révision de workflow inspectée ; utilisez un worktree isolé pour modifier ou comparer du code. Ne modifiez pas le clone d'une autre tâche. Consignez les changements non commités ainsi que la commande exacte, la toolchain, l'hôte, les tests sélectionnés, l'instrumentation et les prérequis. Une ancienne exécution fait foi pour la révision qu'elle a exécutée, même si main avance.

Suivez les déclencheurs de workflow, la sélection par chemins modifiés, les dépendances entre jobs, les actions réutilisables, les scripts de package, la découverte des tests, les producteurs d'artefacts et les gates de rapport jusqu'aux commandes réellement exécutées. Incluez les scripts, les données générées, l'enregistrement à l'exécution et les frontières de sous-processus absentes des graphes d'imports. Vérifiez les chemins de sélection positifs et négatifs : les fichiers requis doivent être découverts une fois par configuration de test prévue ; les répétitions délibérées par plateforme ou configuration constituent une couverture distincte. Un test explicite manquant ou un rapport requis manquant ne doit pas passer au vert. Les voies optionnelles peuvent être ignorées ; préservez leurs prérequis déclarés.

Servez-vous des artefacts de durée et d'échec existants pour sélectionner les familles suspectes. Exécutez les vérifications pertinentes pour établir une référence ; réservez une suite locale complète au diagnostic CI large ou à une incertitude que des vérifications ciblées ne peuvent lever. Ne reconstruisez pas et ne relancez pas une suite complète inchangée après chaque modification de documentation.

## Prouvez l'échec ou la protection

Pour chaque candidat, énoncez le comportement observable attendu et son propriétaire, puis construisez la plus petite reproduction contre le comportement de production. Suivez le producteur et les consommateurs affectés avant de décider où corriger.

- Pour la dérive, comparez les fixtures aux exigences d'admission actuelles, aux réponses du protocole, aux contrats nommés, aux versions des outils et aux points d'entrée publics réels. Un mock d'apparence plausible peut échouer avant le comportement que son test prétend couvrir. Fouillez toute la famille de fixtures concernée, y compris les autres chaînes de version. Préservez les fixtures volontairement malformées et testez le rejet qu'elles doivent provoquer.
- Pour un test vert suspect, perturbez le comportement concerné dans une copie isolée ou injectez un échec contrôlé. Vérifiez que l'assertion ou la gate existante le détecte. Un test peut se contenter de répéter son mock, importer du code abandonné ou masquer un échec de sous-processus ou de checker. Annulez les mutations après l'expérience.
- Pour l'initialisation partagée ou l'élagage, associez les assertions distinctes aux scénarios conservés. Préservez les entrées malformées, l'annulation, l'échec du nettoyage, les permissions, la capacité, l'identité et les interactions de concurrence significatives. Une exécution plus rapide qui saute un cas ou affaiblit son oracle n'est pas une amélioration.
- Pour la couverture des providers, séparez les preuves issues d'un faux producteur, de la frontière et du moteur réel. Inspectez les skips nommés et les prérequis ; les fixtures n'établissent pas le comportement réel de Ghidra, de LLDB, d'un navigateur ou d'un autre provider.

Classez les constats en défauts reproduits, coûts étayés, hypothèses ou preuves indisponibles. Consignez la commande de référence, la sortie et le code de sortie observés, le résultat attendu, le périmètre affecté et l'explication concurrente. Un échec sur main peut être préexistant ; cela ne le rend pas pour autant hors sujet pour un audit CI. Attribuez les échecs de PR en vous fondant sur la révision exécutée et une référence propre, pas seulement sur leur ressemblance avec un échec antérieur. Ne relancez que pour tester une explication transitoire précise ; conservez l'échec d'origine et arrêtez-vous lorsque la répétition n'apporte plus de preuve. Une nouvelle tentative réussie n'établit ni une cause racine ni un correctif.

## Évaluez l'efficacité sans perdre la gate

Lisez [mesure et vérifications CI](references/measurement-and-ci.md) lorsque vous enquêtez sur la lenteur, le cache, les attentes de runners, les artefacts partagés ou le bruit dans les logs. Comparez des travaux menés à terme équivalents avant d'annoncer une accélération. Distinguez le temps d'initialisation et de build, l'exécution des tests, l'instrumentation de couverture, les attentes de dépendances et l'ordonnancement des runners ; indiquez quels coûts restent non mesurés.

Privilégiez la suppression des préparations dupliquées avérées, la réutilisation d'une initialisation immuable et la réduction du travail de sous-processus répété avant de réduire la couverture d'exactitude. Préservez les sessions indépendantes lorsque le cycle de vie ou la concurrence constitue l'oracle. Gardez les tests live frais : un succès précédent mis en cache ne peut valider l'hôte actuel, le contenu du provider installé, les permissions ou l'état externe.

## Corrigez, vérifiez et transmettez dans le périmètre

Si l'implémentation est autorisée, apportez le plus petit changement structurel à la frontière propriétaire et ajoutez une régression qui échoue sur la référence pour la bonne raison. Retestez les consommateurs affectés et les chemins négatifs significatifs ; vérifiez l'invalidation du cache ou la découverte lorsque ces mécanismes changent. Lisez la documentation Turbo installée avant de modifier sa configuration ou ses commandes.

Exécutez les vérifications applicables du dépôt et inspectez les résultats CI complets de la tête actuelle avant toute fusion autorisée. Préservez la couverture requise et les gates de découverte. Ne supprimez pas un échec, n'ajoutez pas de nouvelles tentatives générales, n'augmentez pas les timeouts et ne retirez pas d'assertions distinctes dans le seul but de faire passer la CI au vert. Toute modification de ces contrôles exige sa propre justification démontrée et le maintien de la détection des échecs.

Rapportez chaque problème confirmé avec la révision exacte, la reproduction, la conséquence, la correction proposée et les limites de la validation. Rapportez la performance avec la charge de travail et les mesures, pas seulement un pourcentage. Rédigez les issues et PR en anglais lorsque c'est demandé ; suivez les préférences de l'utilisateur en matière d'assignation, d'identité de commit, de revue et de fusion sans les supposer pour d'autres utilisateurs. N'ouvrez de PR prêtes pour la revue que lorsque ce cycle de vie est autorisé. Traitez les constats de revue nécessaires et, après la fusion, comparez le main final à l'arbre testé.

Arrêtez-vous lorsque le travail autorisé est vérifié, que les bénéfices restants ne sont pas prouvés ou que d'autres changements échangeraient l'exactitude contre une vitesse spéculative. Listez les incertitudes réelles sans les transformer en cycles d'optimisation supplémentaires.
