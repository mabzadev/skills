---
name: rea-analysis-optimization
description: "Optimisez les providers REA et les workflows d'analyse partagés pour le contexte de l'agent, la latence, le CPU et la mémoire, tout en préservant l'exactitude et l'Evidence. À utiliser pour les goulots d'étranglement d'analyse et la conception de caches ou de requêtes ; l'optimisation de la CI et des suites de tests relève de rea-ci-tests-audit."
---

# Optimisation des analyses REA

Utilisez ce skill dans un clone du dépôt REA (`morluto/rea`) ; les guides cités sont embarqués sous `references/rea/` (copie figée du commit importé ; dans un clone, la version du clone fait foi).

Trouvez une source concrète de travail inutile, corrigez-la chez son propriétaire et vérifiez que les investigations menées à terme restent équivalentes. Une décision mesurée de laisser une implémentation telle quelle constitue aussi un résultat utile.

Suivez les [priorités de performance](references/rea/AGENTS.md#performance), le guide de [conception des outils](references/rea/docs/tool-design.md) et le [guide de test](references/rea/docs/testing.md) du clone. Ce skill fournit un workflow d'optimisation, pas une permission supplémentaire d'exécuter des cibles, de publier ou de fusionner. Appuyez-vous sur les contrats en vigueur, les prérequis des providers et l'autorisation de l'utilisateur.

Réservez les mesures de performance aux changements qui visent la performance ou qui soulèvent un risque concret de régression. Le nettoyage courant repose sur des vérifications d'exactitude : il n'exige ni ce workflow d'optimisation ni des benchmarks synthétiques du seul fait que des appels de helpers, des imports ou des représentations changent.

Lisez [l'étude de cas Kuna](references/kuna-case-study.md) lorsque vous choisissez une stratégie de réutilisation ou interprétez un benchmark. Ses observations figées illustrent des compromis ; elles ne garantissent rien sur les providers actuels et ne constituent pas des gains de vitesse universels.

## Fixez la question et l'oracle d'exactitude

Décrivez la tâche menée à terme par l'analyste : les faits et relations nécessaires pour y répondre, le niveau de détail demandé, l'accès aux sources et les inconnues significatives. Choisissez un artefact réel représentatif ainsi qu'un cas petit ou vide. Consignez la révision de référence, le digest de la cible, l'identité du moteur, les options, l'hôte et le point d'entrée. Travaillez dans un clone séparé pour ne pas perturber d'autres travaux.

Établissez un oracle indépendant de l'implémentation modifiée : attentes de fixtures construites depuis les sources, octets de fichier mappés indépendamment, ou producteur natif accompagné de vérifications de son interprétation. Comparer deux wrappers autour du même décodeur défectueux n'établit pas l'exactitude. Préservez les largeurs d'adresse, les alternatives à même adresse, les extrémités non résolues, la couverture et le lien avec les sources. Un résultat vide ne prouve l'absence que dans le périmètre réellement examiné.

## Localisez le premier travail inutile

Suivez une tâche publique CLI ou MCP à travers le code applicatif partagé jusqu'à son producteur. Mesurez les phases pertinentes : admission et vérifications d'identité, analyse native, décodage, recherche, projection, sérialisation, conservation de l'Evidence et nettoyage. Incluez la découverte du catalogue et les appels supplémentaires lorsqu'ils pèsent sur la tâche menée à terme.

Servez-vous de ces éléments pour choisir la plus petite correction structurelle :

| Coût observé                                        | Correction candidate                                                  | Condition à établir                                                                                          |
| --------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Parcours répétés de faits déjà validés              | Réutiliser l'ordre ou la structure de recherche existants             | Le propriétaire établit l'ordre et l'identité ; chaque alternative correspondante est conservée              |
| Travail moteur équivalent répété                    | Partager un résultat validé ou un producteur en cours                 | Les entrées, la fraîcheur, la durée de vie et les issues propres à chaque appelant restent explicites        |
| Rapports complets pour des faits sélectionnés       | Déplacer la sélection ou la projection vers le premier propriétaire capable | Les faits et preuves requis restent accessibles ; la couverture examinée est signalée                  |
| Grands tampons de transport temporaires             | Décoder de façon incrémentale ou utiliser des lectures bornées de la source | Valider l'intégralité du document admis ; les faits conservés et les copies consomment toujours de la mémoire |
| Nombreuses lectures homogènes répétées              | Partager l'admission, le décodage ou le travail par lots              | Préserver l'identité des éléments, l'ordre lorsqu'il est requis et les échecs individuels                    |

N'introduisez pas d'index, de cache générique, d'endpoint par lots ou de couche d'orchestration sans identifier le travail qu'il supprime et son coût de maintenance et de ressources. Une projection effectuée après la matérialisation d'un rapport complet peut réduire la sortie sans changer le temps d'analyse ni le pic de mémoire. Corrigez les faits manquants ou incorrects avant de comparer par benchmark une composition alternative à un workflow mieux couvert.

## Gardez une interprétation unique et une durée de réutilisation définie

Laissez la frontière du producteur valider et normaliser les faits une seule fois. Les consommateurs interrogent cette représentation via l'implémentation CLI/MCP partagée ; les adaptateurs ne doivent ni reconstruire les relations ni réinterpréter indépendamment les rapports bruts. Séparez l'identité de recherche du formatage d'affichage. Réutilisez les contrats lorsque leur intention correspond, en respectant le niveau de détail demandé et l'accès complet à l'Evidence.

Pour chaque cache ou producteur partagé, précisez sa clé, son propriétaire, son invalidation, sa taille retenue et sa durée de vie. Tenez compte des octets de cible qui influent sur le résultat, du contenu du moteur, des options d'analyse, de l'architecture et du mapping de chargement, et des versions de parseur et de schéma lorsqu'elles affectent la réutilisation. Validez l'état réel avant de présenter une observation en cache comme actuelle. Ne mettez un refus en cache que s'il est déterministe pour cette clé validée ; les tentatives malformées, partielles, transitoires ou annulées nécessitent une politique de nouvelle tentative explicite.

L'annulation d'un appelant en attente ne doit pas invalider le succès d'un pair. Préservez le contexte d'échec du producteur et le motif d'annulation de chaque appelant. Conservez la propriété et les charges de capacité jusqu'à ce que le travail partagé et le nettoyage soient terminés ; préservez les observations menées à terme lorsque le nettoyage échoue. Exercez l'invalidation, les consommateurs concurrents, l'annulation du dernier appelant en attente, la fermeture et la reprise du nettoyage lorsque ces chemins changent.

Bornez la famille de processus et l'état retenu, pas seulement le tas d'un parent ou le nombre de workers. Tenez compte de l'expansion due au décodage et à la sérialisation avant l'allocation. Choisissez les limites de CPU, de mémoire, de concurrence et de disque d'après l'hôte et la charge de travail ; arrêtez-vous avant l'OOM et vérifiez le nettoyage de ce qui vous appartient. Une tâche stoppée par un garde-fou est incomplète. Ne remplacez pas un plafond de tampon de transport par un inventaire retenu non borné, et ne masquez pas des résultats partiels derrière un statut de succès.

## Comparez des tâches menées à terme et limitez l'affirmation

Exécutez le workflow public réel concerné avant et après, avec des entrées, des résultats, une couverture et une sémantique d'Evidence équivalents. Incluez de petites entrées pour rendre visibles les coûts d'initialisation et les régressions. Distinguez les sessions neuves, les caches d'exécution chauds et les caches de fichiers de l'OS. Alternez ou répétez les exécutions lorsque la variance influe sur la décision. Choisissez des régressions de frontière significatives pour les cas que le moteur réel ne peut pas reproduire de façon fiable ; un faux moteur ne qualifie pas un provider réel.

Rapportez l'issue de la tâche, les durées des phases pertinentes, le temps écoulé et le temps CPU totaux, le pic de mémoire de la famille de processus et sa méthode de comptabilisation, les arrêts sur ressources et le nettoyage. Vérifiez le code de sortie de la charge utile autant que celui du profileur. Conservez les tentatives échouées et identifiez les coûts non mesurés ; une nouvelle tentative réussie n'explique pas un échec.

Pour toute affirmation sur les tokens, comptez les schémas et la découverte, les arguments, les réponses, les nouvelles tentatives et les continuations nécessaires pour terminer la tâche. Étiquetez séparément les estimations du tokenizer et l'usage réel du modèle, et consignez le comportement du client et du catalogue. Un JSON plus petit n'établit à lui seul ni moins de tokens consommés par le modèle ni une meilleure qualité d'investigation. N'affirmez pas un avantage sur des logiciels complexes sans investigations représentatives menées à terme et à exactitude et couverture comparables.

Terminez par le goulot d'étranglement, le changement chez son propriétaire, la sémantique préservée, les vérifications exécutées, les mesures avant/après et les limites restantes. Maintenez tout registre d'intégration à jour avec sa révision testée et distinguez le travail fusionné en production du code purement expérimental. Arrêtez-vous lorsque le goulot démontré est résolu ou que tout bénéfice supplémentaire reste spéculatif.
