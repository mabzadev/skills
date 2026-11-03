---
name: reverse-engineer-anything
description: "Faites la rétro-ingénierie de cibles natives (binaires natifs), managées, Electron/JavaScript, empaquetées, firmware et navigateur avec REA, et construisez des environnements d'agent (bundles AgentEnv) d'applications web à partir d'une instance en ligne ou d'une capture. Appuyez-vous sur l'artefact livré ou sur des preuves d'exécution demandées pour expliquer des fonctionnalités, comparer des versions, décompiler du code ou guider une reconstruction. N'utilisez pas REA pour l'analyse d'architecture d'un dépôt de sources ordinaire."
metadata:
  version: "59"
---

# REA

Utilisez REA lorsqu’une affirmation dépend d’un binaire ou d’un paquet livré, d’une décompilation,
de preuves d’exécution demandées, ou d’une comparaison avec un
comportement que les sources disponibles n’établissent pas. Pour l’analyse ordinaire d’un
dépôt de sources complet, utilisez les outils habituels du dépôt et n’exécutez pas les commandes
de disponibilité (readiness) ou de fournisseur (provider) de REA.

## Ne vous connectez qu’en cas de besoin

Installer ce skill fournit des instructions ; cela n’enregistre pas le serveur MCP REA,
n’installe pas de moteurs d’analyse et n’ajoute pas d’outils à un agent déjà en cours d’exécution.
L’exception est une installation sous forme de plugin Claude Code ou Codex : le plugin embarque
ce skill et enregistre son propre serveur `rea`, en dehors de l’état que
`rea setup` et `rea doctor` gèrent.

Si les outils REA sont disponibles et que leur enregistrement n’est pas connu pour être obsolète,
passez directement à la cible. N’exécutez pas de diagnostic ni de setup avant chaque
investigation. Utilisez la liste d’outils et les schémas d’entrée réels du serveur connecté ;
un skill installé depuis la branche main du dépôt peut décrire des capacités absentes d’une
version npm plus ancienne. Conservez l’Evidence complète en ligne (inline) lorsque ce serveur
n’annonce pas de références conservées (retained).

Si les outils sont absents, qu’un appel est bloqué par le client ou qu’un fournisseur requis est
indisponible, lisez [connexion et récupération](references/connection-and-recovery.md).
Diagnostiquez le blocage observé, poursuivez le travail utile pris en charge, et reprenez la
tâche initiale après réparation. L’approbation du client, le PATH du shell, l’enregistrement et la
disponibilité des moteurs ont des remèdes différents ; évitez de répéter le setup pour tous.
Si l’hôte expire (timeout) sans résultat REA, ne répétez pas l’appel inchangé et ne
supposez pas que le travail s’est arrêté. Lisez la distinction sur les délais (deadline) du guide de récupération avant de réessayer.
Si la connexion MCP tombe, réessayez cet appel une seule fois, uniquement s’il peut être
répété sans risque ou s’il est connu pour ne pas avoir démarré. S’il a pu déjà modifier la
cible, ou s’il échoue de nouveau, informez l’utilisateur et demandez-lui de redémarrer le
client MCP. Si REA n’a pas pu établir sa connexion, réessayez une fois, puis informez l’utilisateur
et demandez-lui de redémarrer le client MCP. Ne réessayez pas un échec de démarrage qui
renvoie le même résultat inchangé. Pour les installations sous forme de plugin, suivez
[la récupération du plugin](references/connection-and-recovery.md#rea-installed-as-a-client-plugin).
Pour les enregistrements gérés par le setup, exécutez `rea doctor` lorsque REA n’a pas pu démarrer
ou que les outils restent absents après ce redémarrage. Pour `cleanup_incomplete`, une limite de
capacité réessayable, ou `configuration_invalid`, suivez l’échelle de récupération du guide
avant de demander un redémarrage. Lisez ce guide avant une seconde tentative de réparation.

Déterminez le propriétaire de l’installation avant de réparer l’enregistrement. Les installations sous forme de plugin utilisent
[la récupération du plugin](references/connection-and-recovery.md#rea-installed-as-a-client-plugin) ;
seuls les enregistrements gérés par le setup utilisent le
[plan de réparation de l’enregistrement](references/connection-and-recovery.md#repair-registration-when-needed) du guide.
Un résultat doctor `missing` concernant uniquement le plugin n’appelle pas `rea setup`.

Le setup de REA n’installe ni ne met jamais à jour Node.js, npm, Homebrew, Java, Ghidra, IDA,
JADX, Kuna, Binwalk ou Unblob. Utilisez les prérequis existants ; n’installez pas de logiciel
sans rapport pour réparer l’enregistrement MCP. Pour un client non pris en charge, utilisez un
enregistrement stdio manuel avec le runtime absolu et le script d’entrée d’une installation existante, ou poursuivez via la CLI.

Un repli CLI concret pour une arborescence JavaScript ou un ASAR fourni par l’opérateur est :

```bash
npx -y rea-agents@latest analyze-javascript-application /absolute/path/to/app --json
```

Aucun enregistrement MCP ni moteur natif n’est requis. Lisez l’Evidence, le
graphe, les limitations et les inconnues renvoyés avec le même soin qu’un résultat MCP ; la CLI
renvoie directement l’enregistrement Evidence. Ce repli n’établit pas que
MCP est configuré. Les tâches CLI natives requièrent toujours le moteur sélectionné.
Privilégiez une CLI `rea` existante. Lorsqu’aucune n’est installée et que l’acquisition du paquet REA
entre dans le périmètre autorisé, utilisez `npx -y rea-agents@latest` à sa place depuis un
répertoire de confiance hors du projet cible, avec des chemins de cible absolus. Le setup
géré lie directement l’installation courante ; conservez son runtime et son entrée de cache
de paquets, ou restaurez cette installation avant de réparer son enregistrement.
Pour un enregistrement géré par le setup, la réparation de configuration commence par un plan de setup en lecture seule ; montrez les chemins, les sauvegardes et
le remplacement du skill avant d’appliquer les changements autorisés. Préservez les limites existantes
d’approbation et d’exécution de la cible.

## Aiguillez d’abord selon la cible

Choisissez le premier outil d’après la cible fournie par l’utilisateur. Utilisez `open_binary` pour
les workflows natifs ou d’archive à cible active ; les outils sans cible (target-free) prennent leur propre
chemin ou point de terminaison explicite et n’en ont pas besoin.

- ASAR ou arborescence JavaScript/Electron extraite :
  `analyze_javascript_application`.
- Inventaire des membres d’une archive ou d’un paquet (ZIP/APK/IPA/MSIX/AppX, DMG ou un
  exécutable PyInstaller) : `open_binary` avec le chemin local fourni ; utilisez `inspect_artifact`
  lorsque son graphe et ses constats aident à répondre à la question. Une CArchive PyInstaller
  constitue la couche applicative ; le bootloader n’est que le préfixe natif. Commencez par
  `detail: "summary"` pour les gros inventaires, puis utilisez les vues d’inventaire conservées
  pour des champs ou pages de membres sélectionnés. Un petit inventaire complet peut coûter moins
  que des appels et schémas supplémentaires. Les options d’exécution sont des métadonnées, pas des fichiers.
  La livraison compacte inventorie et hache tout de même les membres. Voir le
  [guide des applications Python empaquetées](https://github.com/morluto/rea/blob/main/docs/python-packaged-applications.md).
- Exécutable Bun `--compile` : `open_binary`, puis `inspect_artifact` ; le graphe de modules
  Bun constitue la couche applicative. Extrayez les modules stockés et analysez le
  JavaScript. Voir [Exécutables Bun autonomes](https://github.com/morluto/rea/blob/main/docs/bun-standalone.md).
- Plist d’application Apple, Interface Builder, catalogue d’assets ou ressources d’archive à clés (keyed archive) :
  `open_bundle_resources`, puis l’outil de ressource sélectionné. Cela ne
  requiert ni `CFBundleExecutable` ni fournisseur d’analyse profonde. Les sessions de ressources n’ont ni
  digest d’exécutable ni instantané binaire ; utilisez `open_binary` pour le code natif.
- Code, classes, méthodes ou références entrantes d’un APK Android :
  `inspect_android_package`, puis les outils Android ciblés lorsqu’ils sont annoncés.
  L’inventaire des membres d’archive passe toujours par la route d’archive ci-dessus.
- Assembly PE/CLI managée : `inspect_managed_artifact`.
- Image firmware : `inspect_firmware_regions` lorsqu’il est annoncé. Utilisez
  `extract_firmware` lorsque l’extraction est demandée, avec un nouveau répertoire de sortie
  absolu choisi par l’appelant. Ces outils utilisent Binwalk/Unblob fournis par l’appelant sous
  Linux ; voir le [guide firmware](https://github.com/morluto/rea/blob/main/docs/firmware-analysis.md).
- Image d’application ou de bootloader de la famille ESP32 (magic `0xE9`) : `inspect_artifact`
  sans fournisseur ; voir la section ESP de `references/native-and-artifacts.md`.
- PE/ELF .NET NativeAOT : analyse native Ghidra. Le code natif peut produire du pseudocode ;
  consultez le workflow NativeAOT dans `references/native-and-artifacts.md` pour la
  récupération optionnelle des métadonnées et ses limites d’hôte et de disposition (layout) prises en charge.
- Comportement d’un programme natif, appels en direct, instrumentation ou effets d’exécution de commandes :
  choisissez le [workflow d’exécution native](references/runtime-observation.md#native-runtime-questions) correspondant.
  `open_binary` et `trace_native_values` établissent des faits statiques ; ils n’observent pas
  l’exécution. Les outils d’exécution ont des effets distincts de lancement, d’attachement, de mutation et
  de nettoyage, et ne requièrent pas de session statique préalable sauf si leur
  propre contrat le précise.
- Page de navigateur appartenant à l’utilisateur déjà ouverte : `list_browser_targets`.
- Action de navigateur que l’agent doit effectuer (cliquer, saisir, naviguer) :
  `capture_browser_scenario` avec des actions déclarées. Voir
  [observation à l’exécution](references/runtime-observation.md) pour la connexion/le lancement
  et les outils de navigateur ciblés de suivi.
- Environnement d’agent (bundle AgentEnv) d’une application web : lisez
  [environnements](references/environments.md) avant d’enregistrer ; il enregistre avec
  `capture_browser_scenario` et écrit le bundle avec `export_environment_bundle`.
- Trafic Fiddler Everywhere ou capture native `.saz` : lisez le
  [workflow Fiddler](references/runtime-observation.md#fiddler-everywhere-traffic-debugging).
  Inspectez un SAZ enregistré avec `inspect_web_network_capture` et `format: "saz"` ;
  connectez le serveur MCP distinct d’Everywhere pour le trafic en direct.
- Capture conservée HAR/SAZ/mitmproxy natif/qlog aioquic : `inspect_web_network_capture`. Sélectionnez
  les ordinaux d’enregistrement d’origine lorsque c’est utile ; inspectez les champs du producteur et les
  sidecars d’octets/nombres sans récupérer les URLs enregistrées ni revendiquer d’attribution en direct. Le tas
  old-generation HAR/SAZ/qlog est `REA_CAPTURE_DECODER_OLD_GENERATION_MIB` (192 MiB par défaut,
  minimum 8, maximum 16384), défini là où REA démarre. La mémoire de l’hôte et `NODE_OPTIONS` ne
  l’augmentent pas. Voir
  [captures historiques](https://github.com/morluto/rea/blob/main/docs/web-network-captures.md) pour le profil
  amont exact et les exclusions d’identifiants. La prise en charge de qlog commence avec aioquic 1.5.0
  JSON 0.3 ; la couverture des flux et les déclarations de perte aux extrémités ne récupèrent pas les corps
  et n’établissent pas de perte réseau. Préférez le détail summary, puis les pages de type qlog trace/stream ;
  sélectionnez une trace, un ID de flux et une direction pour les pages de contribution/plage.
  Les faits conservent la portée « tous les événements enregistrés avant la sélection ». Les autres dispositions qlog
  et la corrélation PCAP ne sont pas prises en charge.
- Runtime Electron appartenant à l’utilisateur déjà ouvert : `list_electron_targets`. Avant une tentative d’Inspector sur electron-main, vérifiez les fuses empaquetés avec `inspect_electron_fuses` ; un `EnableNodeCliInspectArguments` désactivé signifie que l’application ignore `--inspect`.
- Découverte de champs de paquets : `inspect_packet_fields` recherche dans les protocoles installés
  et les noms/types de champs avant de choisir les champs pour `inspect_packet_capture`.
  Interrogez/paginez les enregistrements pertinents ; les enregistrements de protocoles n’établissent pas de trafic observé.
- Captures de paquets enregistrées : `inspect_packet_capture` avec des champs TShark sélectionnés,
  des filtres d’affichage et des règles decode-as. Requiert Linux, prlimit d’util-linux et
  TShark 4.x sur une entrée absolue du `PATH` ou via la surcharge absolue optionnelle
  `REA_TSHARK_COMMAND` ; voir le
  [guide des captures](https://github.com/morluto/rea/blob/main/docs/packet-captures.md).
  Les limites de paquets comptent les paquets d’entrée avant filtrage. La sortie renvoie par défaut 50 trames
  correspondantes ; utilisez `match_offset` / `match_limit` pour les pages suivantes, ou une limite null
  explicite pour la sortie correspondante complète. Préservez le digest de la source d’une page à l’autre.
  Cela n’effectue pas de capture en direct.
  Pour des résumés d’adresses/DNS/SNI/protocoles, utilisez `inspect_pcap_capture` avec le détail MCP
  summary, puis les pages conservées de type pcap. Requiert tshark et capinfos de Wireshark 4.x,
  avec prlimit sous Linux ou les Job Objects sous Windows ; voir les
  [résumés de paquets](https://github.com/morluto/rea/blob/main/docs/pcap-analysis.md).
  Sélectionnez une question DNS exacte pour les pages d’adresses ; l’épuisement des pages ne prouve pas
  l’exhaustivité du réseau. Cela lit des enregistrements et n’acquiert pas de trafic.
- Découverte de décodeurs : `inspect_signal_decoders` recherche parmi les ID de décodeurs installés
  ou l’aide d’un décodeur sélectionné, y compris canaux et options. Interrogez et paginez les
  détails pertinents avant de choisir les réglages ; cela ne scanne pas le matériel.
- Traces logiques/de signal enregistrées : `decode_signal_recording` avec des réglages explicites de décodeur,
  de canal et de protocole. Sous Linux avec prlimit d’util-linux, fournissez sigrok-cli 0.7.2 via
  `REA_SIGROK_COMMAND` ; voir le [guide des enregistrements](https://github.com/morluto/rea/blob/main/docs/signal-recordings.md).
  La sortie renvoie par défaut 50 lignes littérales ; sélectionnez des classes d’annotations et paginez avec
  `line_offset` / `line_limit`, ou null explicite pour toute la sortie restante.
  Les comptes de fenêtre sont des lignes d’affichage, pas des annotations ni des échantillons. Préservez les digests des sources d’une page à l’autre.
  Cela lit des fichiers existants ; cela n’acquiert pas de signaux matériels.
- Artefact WebAssembly local explicite : `inspect_wasm_artifact`. Fournissez WABT 1.0.42
  via `REA_WABT_BIN_DIRECTORY` ; conservez l’identité exacte des octets/de l’outil et le WAT décodé.
  Sélectionnez explicitement le code de liaison (glue) JavaScript et les chemins candidats, et préservez l’ambiguïté
  URL/chemin. Aucune récupération implicite ni exécution de la cible ; le WAT n’est pas le source d’origine.
  Voir le [guide WASM](https://github.com/morluto/rea/blob/main/docs/wasm-artifacts.md).
- Signature d’un APK Android local explicite (ou ZIP/AAB) : `inspect_apk_signature`.
  Préférez son résumé ou une page de signataire/digest/lignée sélectionnée ; conservez l’Evidence
  complète et utilisez `inspect_analysis_view` de type `apk-signature` pour les suivis.
  Indique quels schémas sont présents (v1 JAR, v2, v3, v3.1), l’empreinte SHA-256 du certificat
  de chaque signataire (v1 incluse, depuis son bloc PKCS#7), la lignée de rotation de clés v3, le source stamp, et
  si chaque digest signé correspond toujours aux octets (cohérence interne). Il s’agit
  d’identité et d’intégrité, pas d’un verdict de confiance ou d’authenticité.
  Voir le [guide des signatures APK](https://github.com/morluto/rea/blob/main/docs/apk-signature.md).
- Support de bytecode EVM local explicite : `inspect_evm_interface` avec l’encodage
  `raw` ou `hex` choisi par l’appelant. Le délai du worker propriétaire est `timeout_ms` (par défaut
  30000 ms, plage 1..2147483647, appel suivant). Il n’augmente pas les allocations fixes d’octets,
  d’espace d’adressage ou de CPU. Préservez les digests du support et du décodé, et traitez les sélecteurs,
  les chaînes d’arguments et la mutabilité comme des candidats inférés ; cela n’effectue aucune consultation
  de chaîne ni exécution de la cible. Pour l’interface inférée complète sans hex ni
  stdout dupliqué, découvrez la prise en charge et sélectionnez `detail: "summary"` ; l’Evidence
  complète reste conservée sous son identité d’origine. Utilisez le
  `parent_evidence_id` renvoyé pour les pages exactes de fonction ou de `bytecode_hex`/stdout/stderr.
  La couverture des candidats n’établit pas l’exhaustivité de l’interface. Voir le
  [guide du bytecode EVM](https://github.com/morluto/rea/blob/main/docs/evm-bytecode.md).
- Métadonnées embarquées de compilateur, de module ou de paramètres de build Go : `inspect_go_binary`
  avec le fichier local explicite. Cette inspection intégrée sans cible ne requiert ni
  installation de Go ni désassembleur. Préservez les octets bruts des modules et les plages de source ;
  l’absence de métadonnées ne prouve pas qu’un binaire n’est pas en Go, et les enregistrements texte non analysés
  restent explicites. Voir le
  [guide des binaires Go](https://github.com/morluto/rea/blob/main/docs/go-binaries.md).
- Objets de code CUDA/HIP embarqués : `inspect_gpu_code_objects` ; inventoriez d’abord les cibles,
  puis décodez les charges utiles sélectionnées et interrogez l’Evidence GPU conservée.
- Déclarations de modèles GGUF ou safetensors embarqués : `inspect_model_artifact`
  avec le fichier local explicite. Le hachage d’en-tête par défaut laisse inconnue l’identité
  du fichier complet ; `hash: "full"` lit en plus tous les poids pour le SHA-256. MCP renvoie
  des résumés conservés ; un `view` optionnel sélectionne une page dans l’appel initial. Utilisez
  `inspect_analysis_view` de type `model-artifact` pour des
  clés de métadonnées groupées, des noms de tenseurs ou des totaux par type, des champs et pages sélectionnés.
  Préservez les indices relatifs à l’en-tête et les omissions d’aperçu de tableaux ; n’inférez pas le comportement
  du modèle à partir de l’architecture déclarée ou des types de tenseurs. Voir le
  [guide des fichiers de modèle](https://github.com/morluto/rea/blob/main/docs/model-artifacts.md).
- Noms, propriétaires de membres et littéraux de chaîne Unity IL2CPP issus de `global-metadata.dat` :
  `inspect_il2cpp_metadata` avec le fichier local explicite ; MCP renvoie par défaut des comptes
  compacts. Interrogez sections, images, types, méthodes, champs, propriétés, événements,
  paramètres ou string_literals via `inspect_analysis_view`
  avec le `parent_evidence_id` renvoyé, en utilisant des filtres exacts, des indices groupés et des
  champs sélectionnés. Les paramètres acceptent `method_indices`, ce qui évite de parcourir toutes les
  pages de paramètres. Les collections absentes d’une Evidence historique restent inconnues.
  Versions 24, 27, 29, 31 et 39 ; aucun Unity, binaire IL2CPP
  ni désassembleur n’est exécuté. Une magic non reconnue (éventuellement chiffrée) et les
  autres versions ne sont pas prises en charge. Un `binary_path` correspondant optionnel active les adresses natives statiques et les références de types ; interrogez `method_addresses` avec des indices ou des adresses/états, en préservant chaque méthode à corps partagé et les deux identités d’artefact. Sans binaire lié, les comptes natifs restent inconnus. Le repli par motif d’octets est inféré ; aucun comportement à l’exécution ni appariement de même build n’est prouvé. Voir le
  [guide des métadonnées IL2CPP](https://github.com/morluto/rea/blob/main/docs/il2cpp-metadata.md).
- Métadonnées de dépendances Rust cargo-auditable embarquées : `inspect_rust_binary`
  avec le fichier local explicite ELF, PE ou Mach-O mince (thin). Cette inspection intégrée
  sans cible ne requiert ni installation de Rust ni désassembleur. Préservez
  l’ordre des paquets, les indices de dépendances et la plage de fichier de la section. Une section
  `.dep-v0` absente correspond à des métadonnées null, pas à la preuve que le binaire n’a pas de dépendances.
  Un hash de commit rustc est une inférence à partir d’un chemin en lecture seule `/rustc/<40-hex>/`.
  Pour des crates sélectionnées, utilisez `view: {collection: "packages", names: [...],
  fields: ["name", "version", "source"]}` dès le premier appel ; incluez explicitement
  `dependencies` pour les références d’indices directes. Utilisez `detail: "summary"` pour les comptes
  et les plages, ou les pages conservées de paquets/arêtes Rust de `inspect_analysis_view` pour
  les filtres ultérieurs. Gardez l’Evidence parente complète accessible ; la livraison compacte
  de la CLI requiert `--evidence_output`.
  Voir le
  [guide des binaires Rust](https://github.com/morluto/rea/blob/main/docs/rust-binaries.md).
- Table de certificats Authenticode PE : `inspect_pe_certificates` avec le fichier local explicite
  PE32/PE32+. Cette inspection intégrée sans cible ne requiert pas de
  Windows SDK. Préservez les plages WIN_CERTIFICATE, les types, le SHA-256 de la charge utile et les
  champs d’identité du signataire PKCS#7/X.509, y compris `subject_key_identifier_hex`
  lorsque le signataire utilise cette forme. Un répertoire de sécurité absent est une absence observée
  de cette table, pas la preuve que l’image n’est signée dans aucun sens du catalogue.
  Les signatures ne sont pas vérifiées. Voir le
  [guide des certificats PE](https://github.com/morluto/rea/blob/main/docs/pe-certificates.md).
- Tables d’import et de chargement différé (delay-load) PE : `inspect_pe_imports` avec le fichier local explicite
  PE32/PE32+. Cette inspection intégrée sans cible ne requiert pas de
  Windows SDK. Préservez les noms de DLL, les fonctions nommées et par ordinal, les RVA ILT/IAT,
  les descripteurs de chargement différé et le hash d’import pefile de la table d’import
  standard. Un répertoire d’import absent est une absence observée de cette table, pas
  la preuve que l’image n’a jamais importé d’API via une autre table. Les instantanés liés (bound)
  et le contenu de l’IAT chargée restent non observés. Voir le
  [guide des imports PE](https://github.com/morluto/rea/blob/main/docs/pe-imports.md).
- Callbacks TLS et configuration de chargement PE : `inspect_pe_load_config` avec le
  fichier local explicite PE32/PE32+. Cette inspection intégrée sans cible ne requiert
  pas de Windows SDK. Préservez les VA des callbacks sous forme de chaînes avec leur RVA, leur offset de fichier
  et leur section, ainsi que les champs couverts par la taille : security cookie, SafeSEH, CFG,
  EH-continuation et XFG. Les affirmations de mitigation fondées sur les guard flags sont des
  déclarations de l’éditeur de liens inférées, pas une preuve d’application. Un répertoire absent est une absence
  observée de cette déclaration. Voir le
  [guide de configuration de chargement PE](https://github.com/morluto/rea/blob/main/docs/pe-load-config.md).
- Tables de notes ELF : `inspect_elf_notes` avec le fichier local explicite ELF32/ELF64.
  Cette inspection intégrée sans cible ne requiert pas de désassembleur. Préservez
  les plages PT_NOTE et SHT_NOTE, les propriétaires, les types, le SHA-256 des descripteurs, et les champs GNU
  build-id ou ABI-tag. Une table absente est une absence observée de ces
  déclarations, pas la preuve que l’image n’a jamais porté de notes. Voir le
  [guide des notes ELF](https://github.com/morluto/rea/blob/main/docs/elf-notes.md).
- Rapports de crash Apple `.ips` : `inspect_apple_ips` avec le fichier local
  explicite. Cette inspection intégrée sans cible ne requiert ni Xcode, ni atos, ni
  pwntools. Préservez les métadonnées de la première ligne, `bug_type` sous forme de chaîne, les faits de processus et
  d’exception, les registres entiers sans perte, les UUID de usedImages, et les
  correspondances de classification documentées. Seul le `bug_type` `"309"` produit un corps
  de crash ; les autres types, y compris les stackshots `"288"`, ne renvoient aucun résultat de crash.
  Les jointures d’UUID avec des Mach-O et dSYM ouverts restent non observées. Voir le
  [guide Apple IPS](https://github.com/morluto/rea/blob/main/docs/apple-ips.md).
- Métadonnées de module noyau Linux : `inspect_kernel_module` avec le fichier local explicite
  relocatable ELF32/ELF64. Cette inspection intégrée sans cible ne requiert
  ni hôte Linux ni `modinfo`. Préservez l’ordre des clés `.modinfo` et les clés dupliquées,
  le CRC hexadécimal de `__versions`, les plages de fichier des sections, et le SHA-256 PKCS#7 du
  bloc de signature final (trailer). Une section absente est une absence observée lorsque les noms de section
  sont connus, pas la preuve que le module n’a jamais porté ces métadonnées.
  `struct module` n’est pas décodée. La signature n’est pas validée. Les conteneurs gzip, xz et
  zstd ne sont pas pris en charge ; décompressez dans un fichier séparé avec un
  utilitaire de codec externe, puis inspectez l’image `ET_REL` décompressée. Voir le
  [guide des modules noyau](https://github.com/morluto/rea/blob/main/docs/kernel-modules.md).
- En-tête `.pyc` CPython 3.7–3.13, objets de code marshal imbriqués et identité du bytecode :
  `inspect_python_pyc` avec le fichier local explicite. Cette inspection intégrée
  sans cible ne requiert pas d’installation de Python. Préservez la magic,
  le hash PEP 552 ou mtime/taille, les noms imbriqués et le SHA-256 du bytecode. Le bytecode n’est
  pas décompilé, et un en-tête décodé ne prouve pas que le `.py` correspondant est
  présent. Voir le
  [guide CPython pyc](https://github.com/morluto/rea/blob/main/docs/python-pyc.md).
- Conteneur IFF Erlang BEAM : `inspect_erlang_beam` avec le fichier local explicite
  `.beam`. Cette inspection intégrée sans cible ne requiert pas d’installation
  d’Erlang. Préservez les noms de chunks, l’ordre des atomes, les tables d’export/import/lambda,
  et l’en-tête Code. Pour des faits sélectionnés, préférez `detail: "summary"` plus une
  vue `beam` (collection, noms/indices, champs et pagination), en conservant l’Evidence
  complète. Le résumé en CLI requiert `--evidence_output`. Les comptes de tables absentes restent
  null ; les tables vides décodées comptent zéro. Le bytecode n’est pas exécuté. Voir le
  [guide Erlang BEAM](https://github.com/morluto/rea/blob/main/docs/erlang-beam.md).

- Instantané de base de données SQLite local explicite : `inspect_sqlite_database`. Inspectez
  avec Node.js 24.x >=24.15 ou 26+ fournissant les limites SQLite natives. Lisez d’abord le schéma
  (inventaire compact par défaut), ou sélectionnez une table ordinaire exacte
  et des `columns` lorsque des lignes sont nécessaires. Les valeurs par défaut sont le schéma de la table sélectionnée et
  20 lignes ; demandez `schema_scope: "database"` pour le schéma stocké complet. Préservez l’identité de la base de données et celle du WAL voisin existant ; les échantillons de lignes
  signalent la troncature et ont un ordre non spécifié. Utilisez un instantané au repos (quiescent) plutôt
  que de supposer qu’une paire base de données/WAL vivante a été copiée de façon atomique. Voir le
  [guide SQLite](https://github.com/morluto/rea/blob/main/docs/sqlite-databases.md).
- Fichier ELF Linux explicite pour la disposition hors ligne, les symboles, les relocations ou les preuves
  statiques de mitigation : `inspect_binary_layout`. Cette opération sans cible utilise
  pwntools fourni par l’appelant sans ouvrir de base de données de désassembleur. Préservez ses
  emplacements bruts et ses limites d’inférence/de couverture ; voir le
  [guide des binaires hors ligne](https://github.com/morluto/rea/blob/main/docs/binary-diagnostics.md).
- Core ELF Linux x86-64 fourni : `inspect_recorded_crash`. Lisez chaque thread
  enregistré, note brute et registre lié à la source sans ouvrir de cible en direct.
  Les PID historiques ne sélectionnent pas de processus vivants. Demandez `include_debugger_context`
  uniquement lorsque des candidats de mappage issus du seul core sont utiles ; voir le
  [guide des crashs enregistrés](https://github.com/morluto/rea/blob/main/docs/recorded-crashes.md).
- Arbres type/nom/langue des ressources PE et références statiques de groupes d’icônes :
  `inspect_pe_resources` avec un chemin explicite. Cette opération portable ne requiert
  ni cible active ni moteur ; les charges utiles opaques conservent leurs plages de fichier et leur SHA-256.
- Répertoires d’export PE et exports de symboles dynamiques ELF : `inspect_native_exports`
  avec un chemin explicite ; portable, sans cible active ni moteur.
- Exécutable natif, bibliothèque ou base de données d’analyse : `open_binary`, puis
  utilisez directement les outils d’analyse ciblés ; appelez `binary_overview` lorsque le contexte de métadonnées ou
  d’inventaire est utile et disponible auprès du fournisseur sélectionné.

Pour une configuration IDA MCP existante, utilisez `open_binary` avec le binaire d’entrée
d’origine et `provider_id: "ida"` ; ne passez pas de base de données `.idb` ou `.i64`.
L’ancien profil attaché (legacy attached) lie l’entrée déjà ouverte dans l’interface graphique par SHA-256 et
laisse sa base de données ouverte. Le profil headless moderne crée puis ferme une
base de données privée dont il est propriétaire, sans l’enregistrer. L’installation et l’enregistrement réutilisent
[mrexodia/ida-pro-mcp](https://github.com/mrexodia/ida-pro-mcp) ; voir le
[guide du fournisseur IDA](https://github.com/morluto/rea/blob/main/docs/ida-provider.md).
Pour migrer vers le plugin IDA MCP natif distinct, suivez la
[migration de l’ancien profil attaché](https://github.com/morluto/rea/blob/main/docs/ida-provider.md#migrate-a-legacy-attached-registration) du guide.
Remplacez explicitement l’enregistrement amont ; les outils mrexodia modernes ne constituent pas le
profil natif. L’attachement natif préserve la base de données mais ne fournit pas
les appelants directs ; vérifiez la disponibilité de la session et les limites de vérification du guide.
Passez directement à `analyze_function`, au pseudocode ou aux recherches de fonctions/chaînes
après l’ouverture ; IDA ne fournit pas `binary_overview`. Consultez la disponibilité de la session
lorsque vous composez des workflows plus larges. Les appelants directs modernes et les facettes de dossier non prises en charge
restent inconnus ; les résultats IDA en direct ne sont pas rejoués depuis des instantanés.

Avec `REA_KUNA_COMMAND` configuré, `provider_id: "kuna"` répond aux listes de procédures,
aux recherches, au pseudocode, à l’assembleur et à `analyze_function` à partir de l’export
mis en cache du programme entier par Kuna. Appelants/appelés utilisent un graphe séparé sans corps partagé par
la session ; `xrefs` renvoie les sites entrants à adresse exacte et filtre les alias
de redirection. Ces requêtes et recherches d’inventaire ne déclenchent pas d’export C. Les cibles
indirectes restent inconnues et peuvent rendre la couverture des relations partielle. Les caches de références
expirent à la fermeture ; un nouveau processus CLI refait le parcours natif des références.
Les références typées, le CFG, les outils de mémoire brute et les annotations restent non pris en charge. Une première
réponse à froid peut provenir d’une exécution sur une seule fonction (ses limitations l’indiquent) ; l’assembleur
attend l’export. Pour le pseudocode et l’assembleur, `raw_result.source` nomme le
fichier `.c`/`.asm` mis en cache et la plage d’octets, dans lesquels vous pouvez chercher directement au lieu
d’appeler fonction par fonction. Voir le
[guide du fournisseur Kuna](https://github.com/morluto/rea/blob/main/docs/kuna-provider.md).

Si l’utilisateur dit seulement « mon app » sans nom, chemin ou cible déjà sélectionnée
pour cette tâche, demandez de quelle app il s’agit avant de chercher des artefacts. Les chemins figurant dans des
rapports enregistrés sans rapport et dans des fixtures de test voisines ne sélectionnent pas la cible de l’utilisateur. Résolvez
un véritable nom d’application lisible par un humain vers un artefact installé clairement identifié lorsque c’est possible ;
demandez lorsque les correspondances sont ambiguës. Ne choisissez jamais une app d’exemple à la place de l’utilisateur.

Dans une session sans cible, utilisez `open_binary` pour lier toute archive/tout paquet ou
cible native dont l’outil d’analyse opère sur la cible active. N’appelez pas un
outil non annoncé ; inspectez `binary_session` avec `{}` et son
`result.tool_availability` pour connaître les raisons de disponibilité et les remèdes. Développez les `names` de chaque
groupe en entrées, en héritant des exigences client au niveau de l’inventaire
sauf si le groupe les surcharge. L’union des noms groupés constitue l’inventaire complet
des outils ; utilisez `tools/list` pour les schémas canoniques des outils. Le résumé par défaut conserve
pour chaque fournisseur candidat sa disponibilité et son statut de prise en charge de la cible, son code et
sa raison ; `omitted_fields` liste ce qu’il laisse de côté. Demandez `{"detail": "complete"}`
uniquement lorsque vous avez besoin du remède d’un candidat indisponible, des diagnostics du fournisseur,
des ensembles de capacités des candidats, ou de la surface, des effets et des drapeaux d’annotation des outils ;
dans ces vocabulaires de drapeaux fermés, les drapeaux
listés sont vrais et les drapeaux connus omis sont faux. Les faits sur les fournisseurs candidats
décrivent des fournisseurs possibles, tandis que les capacités de session de premier niveau décrivent la
route courante et `analysis_provider_binding` nomme le fournisseur sélectionné. Ne
traitez pas ces portées comme interchangeables.

Pour un timeout de démarrage de Ghidra sur une grosse cible native, suivez
[la récupération après dépassement de délai](references/native-and-artifacts.md#ghidra-startup-deadline-recovery)
avant d’abandonner l’analyse profonde ou de répéter le même import à froid. La valeur par défaut de
330 secondes peut être modifiée pour les nouvelles tentatives de démarrage via
`update_analysis_settings` avec `ghidra.startup_timeout_ms`. Modifier plutôt
l’environnement de lancement du serveur requiert un nouveau processus REA.

## Travaillez d’abord en résumé

Commencez par le résultat par défaut et utilisez son Evidence inline et le contexte de son graphe.
Pour une application JavaScript ou une disposition ELF de taille inconnue ou importante,
appelez `analyze_javascript_application` ou `inspect_binary_layout` avec
`"detail": "summary"`, puis inspectez le `parent_evidence_id` conservé avec
`inspect_analysis_view`. Via MCP, `analyze_function` fonctionne d’abord en résumé sans
option : sa réponse par défaut est le résumé, et le dossier complet reste
conservé sous `parent_evidence_id` pour la pagination par facettes. Passez cet ID comme
référence `retained-evidence` à `compare_functions`, ou dans
`left_observations`/`right_observations` de `match_native_functions`, ou dans
`build_call_path.functions` ; demandez `"detail": "complete"` uniquement lorsque le
dossier doit voyager inline.
Utilisez la même forme de référence exacte dans les autres entrées Evidence logiques annoncées,
y compris les sources optionnelles, les tableaux et les sources imbriquées entre domaines. Chaque
source peut indépendamment être inline ou conservée ; préservez son identité de source,
sa couverture, ses faits partiels et ses inconnues. Une page de résumé ou d’inspection a son propre
ID d’Evidence : utilisez `normalized_result.parent_evidence_id` lorsque le consommateur a besoin
de la source complète. Pour les suivis portables en CLI, les commandes annonçant
`--evidence-bundle` résolvent les références à partir de ce bundle exporté sélectionné.
Voir [Composition de l’Evidence](references/evidence-workflows.md) pour la portée et la
récupération ; les sélecteurs de fichiers ne sont pris en charge que là où ils sont explicitement annoncés.
Paginez les identités de modules et sélectionnez le `node_id` renvoyé avant de demander un
élément ; un même chemin de fichier peut représenter plusieurs rôles dans le graphe. Ne répétez pas
une analyse identique ou un appel rejeté sans entrée modifiée ou blocage résolu.
Revérifiez l’état de la session lorsqu’un changement de cycle de vie rend ce statut utile.
Ne faites un suivi ciblé que lorsque le
résultat renvoyé laisse une question précise sans réponse.

Si MCP signale `resource_constraint` avec `details.resource: "transport"`, appelez
`inspect_analysis_view` avec la référence d’Evidence de même session qu’il indique pour obtenir un
résumé, une section/un module, ou une page stable. Utilisez `trace_application_feature`
une fois une graine (seed) connue, ou appelez `export_evidence_bundle` pour écrire la
session complète vers un chemin choisi. L’analyse reste complète dans le registre (ledger) ; évitez
de la répéter simplement pour redemander la même réponse surdimensionnée. La sortie JSON
complète de la CLI est aussi diffusée en flux, sans trame MCP unique.

Lorsque l’ID parent conservé est inconnu, utilisez `get_evidence_bundle` avec
`detail: "summary"` et des filtres exacts sur l’opération, le SHA-256 de la cible,
le digest du profil d’analyse ou l’adresse canonique de procédure. Sélectionnez l’ID
d’Evidence renvoyé pour la vue suivante au lieu de demander le bundle complet. Lorsque
cet enregistrement n’a pas de vue prise en charge (par exemple une annotation), lisez-le avec
`detail: "records"` et un filtre `evidence_id` ; `missing_evidence_links`
nomme les sources liées que cette session ne conserve pas.
`retention: "complete-record"` signifie que l’enregistrement entier est stocké ; la troncature
du flux de valeurs natif et les métadonnées inconnues restent distinctes. Pour un bundle
portable exporté, utilisez `rea inspect-evidence-bundle` avec un JSON contenant `path`,
`detail: "summary"` et les mêmes `filters`. Lire ce fichier exige toujours de
valider l’intégralité de son contenu dans le budget mémoire local.

Un client peut aussi tronquer un résultat d’outil réussi sans erreur de transport REA.
Traitez cet aperçu comme incomplet ; utilisez l’ID parent conservé pour des vues plus petites
ou exportez lorsque l’enregistrement complet est nécessaire. N’analysez pas l’aperçu comme du
JSON canonique et ne relancez pas le producteur. Pour JavaScript, lisez les
[recettes de vue de modules et de trace](references/javascript-applications.md) avant
de creuser dans un gros graphe ; une trace bidirectionnelle large peut étendre des relations
de contenance sans rapport, même après une analyse en résumé.

Chaque conclusion doit distinguer observations, inférences et inconnues. Citez les
ID d’Evidence, préservez les limitations et la couverture incomplète, et ne laissez jamais entendre
que l’analyse statique a observé l’exécution. Les requêtes d’exécution exécutent la cible
et le cycle de vie déclarés ; n’élargissez pas la cible ni l’action au-delà de ces champs.

Dans le cadre de l’investigation demandée par l’utilisateur, appelez directement les outils d’analyse disponibles.
REA ne requiert ni octroi de permissions ni drapeau d’approbation par appel.
Le client de l’agent peut exiger une approbation de manière indépendante. Suivez le périmètre de la requête
déclarée et les exigences d’accès réelles de l’hôte ; utilisez le guide de récupération en cas de
rejet observé dû à une politique du client.

## Planifiez les investigations plus larges

Pour les requêtes couvrant plusieurs fonctionnalités ou sous-systèmes, utilisez un workflow par étapes :

1. Transformez la requête en une checklist de questions et des preuves dont chaque réponse
   a besoin. Résolvez l’identité de la cible et les contraintes à partir de la conversation et
   de l’espace de travail avant de redemander des informations.
2. Inspectez la session REA courante, l’identité de l’artefact, la base de données d’analyse enregistrée,
   les signets et les preuves antérieures. Réutilisez l’état correspondant ; n’ouvrez pas de sessions
   en double et ne répétez pas d’analyse identique.
3. Commencez par la plus petite vue d’ensemble ou le plus petit inventaire utile. Suivez chaque question
   depuis son point d’entrée, à travers les données et changements d’état pertinents, jusqu’à son résultat.
   Groupez les opérations liées autour d’une hypothèse précise, puis élargissez uniquement lorsque
   les preuves renvoyées laissent une lacune concrète.
4. Inspectez les ressources empaquetées et la configuration pertinentes en parallèle du code lorsqu’elles
   affectent la question. Utilisez des inventaires et analyseurs conscients du format ; n’inférez
   pas le comportement à partir des seuls noms de fichiers, chaînes ou dispositions.
5. Corroborez une conclusion avec le type de preuve qu’elle requiert. N’utilisez l’observation
   à l’exécution que lorsque les preuves statiques ne peuvent pas répondre à la question et que le
   runtime hôte et l’accès au système d’exploitation requis sont disponibles. Pour le comportement JavaScript,
   exécutez des sondes contre l’application réelle via le workflow de capture navigateur, Electron
   ou processus disponible.
6. Décomposez le travail en questions indépendantes. Lorsque des workers parallèles sont
   disponibles et que les questions ne dépendent pas les unes des autres, attribuez des
   périmètres distincts, orientez les workers vers les preuves existantes, et demandez-leur de renvoyer les sources,
   les conclusions et les lacunes non résolues. Sinon, travaillez séquentiellement.
7. Tenez un registre de constats concis reliant chaque conclusion aux ID d’Evidence,
   au niveau de confiance/type de preuve, à la frontière de recherche et aux inconnues restantes. Mettez à jour
   l’index partagé ou le rapport d’investigation pour que les passes ultérieures puissent réutiliser les résultats.

Avant de terminer, revenez à la checklist initiale. Marquez chaque question comme
répondue, partiellement répondue ou non résolue selon ses preuves ; gardez
bornées les recherches négatives bornées, et ne décrivez pas une investigation large
comme terminée tant que des questions requises restent ouvertes.

## Ne lisez que le guide pertinent

- Binaires natifs, assemblies managées, archives et extraction :
  [references/native-and-artifacts.md](references/native-and-artifacts.md)
- ASAR, JavaScript extrait, traçage de fonctionnalités et comparaison de versions :
  [references/javascript-applications.md](references/javascript-applications.md)
- Déclarations, classes, méthodes et références statiques d’APK Android :
  [references/android-applications.md](references/android-applications.md)
- Instrumentation native, débogueur et capture de processus ; observation
  navigateur/Electron ; comparaison statique/exécution :
  [references/runtime-observation.md](references/runtime-observation.md)
- Pagination de l’Evidence, comparaisons, inconnues résiduelles et vérification :
  [references/evidence-workflows.md](references/evidence-workflows.md)
- Environnements d’agent (bundles AgentEnv) d’une application web, enregistrés à partir
  d’une instance en ligne ou d’un HAR :
  [references/environments.md](references/environments.md)

## Terminez la tâche

Expliquez les constats en langage clair et rattachez-les aux preuves renvoyées. Lorsque
l’utilisateur demande de construire quelque chose, utilisez les outils de développement habituels et séparez le comportement
observé des choix de conception. Fermez une session native ouverte avec
`close_binary` lorsque son moteur n’est plus nécessaire. Les références d’Evidence et l’historique
des Unknown restent en mémoire sur la même connexion MCP. Terminez l’investigation avec
`reset_investigation` ; fournissez `save_path` pour enregistrer un point de contrôle du bundle complet avant
l’effacement. Importez le bundle enregistré pour restaurer les références d’origine et l’historique des Unknown
dans un nouveau processus. La rétention est bornée et ne constitue pas une persistance automatique.
