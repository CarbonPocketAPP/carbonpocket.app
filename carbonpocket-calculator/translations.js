// Traduções do painel de compensação da calculadora.
// Mesmo mecanismo de translations.js da página inicial:
// objeto por idioma, chave em snake_case com prefixo, t() com fallback para inglês,
// e tokens entre colchetes substituídos em runtime por COMPENSATION_CONFIG.
// NUNCA traduza, reordene ou remova os tokens.

const translations = {
  en: {
    checkout_notice_short: 'Compensation only, your emissions still occur. Credits are retired in a public registry.',
    checkout_what_buying: 'What you are buying',
    checkout_buying_fixed: 'This compensates [KG] kg CO2e with Verra VCS-certified REDD+ credits. Compensation, not reduction: your emissions still occur. Credits are retired in pooled retirements, published each cycle at [LEDGER_URL]. Not an official inventory, not a CRVE, and not valid for SBCE compliance or NDC claims.',
    checkout_buying_monthly: 'This compensates [KG] kg CO2e of your estimated monthly footprint with Verra VCS-certified REDD+ credits. Compensation, not reduction: your emissions still occur. Credits are retired in pooled retirements, published each cycle at [LEDGER_URL]. Not an official inventory, not a CRVE, and not valid for SBCE compliance or NDC claims.',
    checkout_how_verified: 'How your compensation is verified',
    checkout_partner_info: 'Partner information',
    checkout_supplier: 'Credit supplier: BR Carbon',
    checkout_verra_label: 'Verra VCS identifies the credit certification standard, not app approval.',
    checkout_verified_title: 'Verified credits, fully disclosed',
    checkout_cycle_details: 'Verra VCS-certified REDD+ credits. Cycle details will be published after verification: project [PROJECT_NAME], serial range [SERIAL_START]–[SERIAL_END], retirement ID [RETIREMENT_TX_ID], ledger [LEDGER_URL]. Carbon Pocket is not certified or endorsed by Verra.',
    checkout_cobenefit: 'Co-benefit information is that published by the project developer.',
    checkout_standard_supplier: 'Verra is the certification standard for the credits. BR Carbon is the credit supplier.',
    checkout_check_emissions: 'Estimated emissions: based on your input, using IEA 2025 electricity factors, DEFRA and EPA transport factors, ICAO aviation data, IPCC Guidelines for household energy, and Poore & Nemecek (2018) for food. GHG Protocol scope logic adapted to individuals. This is an estimate, not an official inventory.',
    checkout_check_credits: 'Credits: Verra VCS certified, REDD+ (avoided deforestation). Project: [PROJECT_NAME]; VCS project ID: [PROJECT_ID]; methodology: [METHODOLOGY_ID]; vintages: [VINTAGE_RANGE].',
    checkout_check_retirement: 'Retirement: one pooled retirement per cycle; transaction [RETIREMENT_TX_ID]; serial range [SERIAL_START] to [SERIAL_END]; date [DATE]; beneficiary: Carbon Pocket contributors, cycle [YYYY-MM].',
    checkout_check_integrity: 'Integrity: each serial is retired once and cannot be resold. Carbon Pocket makes no claim over the credits for its own account. The credits carry no corresponding adjustment, so governments cannot count them toward their NDCs.',
    checkout_check_standard: 'Standard status: Verra is the certification standard for the credits. Carbon Pocket is not certified, endorsed or audited by Verra or BR Carbon.'
  },

  pt: {
    checkout_notice_short: 'Apenas compensação: suas emissões continuam ocorrendo. Os créditos são aposentados em registro público.',
    checkout_what_buying: 'O que você está comprando',
    checkout_buying_fixed: 'Isto compensa [KG] kg CO2e com créditos REDD+ certificados pelo padrão Verra VCS. É compensação, não redução: suas emissões continuam ocorrendo. Os créditos são aposentados em lotes, publicados a cada ciclo em [LEDGER_URL]. Não é inventário oficial, não é CRVE e não serve para cumprir obrigações do SBCE nem metas de NDC.',
    checkout_buying_monthly: 'Isto compensa [KG] kg CO2e da sua pegada mensal estimada com créditos REDD+ certificados pelo padrão Verra VCS. É compensação, não redução: suas emissões continuam ocorrendo. Os créditos são aposentados em lotes, publicados a cada ciclo em [LEDGER_URL]. Não é inventário oficial, não é CRVE e não serve para cumprir obrigações do SBCE nem metas de NDC.',
    checkout_how_verified: 'Como sua compensação é verificada',
    checkout_partner_info: 'Informações sobre parceiros',
    checkout_supplier: 'Fornecedor de créditos: BR Carbon',
    checkout_verra_label: 'Verra VCS identifica o padrão de certificação dos créditos, não uma aprovação do aplicativo.',
    checkout_verified_title: 'Créditos verificados, com divulgação completa',
    checkout_cycle_details: 'Créditos REDD+ certificados pela Verra VCS. Detalhes do ciclo serão publicados após verificação: projeto [PROJECT_NAME], faixa de séries [SERIAL_START]–[SERIAL_END], ID de aposentadoria [RETIREMENT_TX_ID], registro [LEDGER_URL]. Carbon Pocket não é certificado nem endossado pela Verra.',
    checkout_cobenefit: 'As informações sobre cobenefícios são as publicadas pelo desenvolvedor do projeto.',
    checkout_standard_supplier: 'Verra é o padrão de certificação dos créditos. BR Carbon é o fornecedor de créditos.',
    checkout_check_emissions: 'Emissões estimadas: dados informados por você e fatores IEA 2025 para eletricidade, DEFRA e EPA para transporte, ICAO para aviação, Diretrizes do IPCC para energia doméstica e Poore & Nemecek (2018) para alimentos. Lógica de escopos do GHG Protocol adaptada a indivíduos. É uma estimativa, não um inventário oficial.',
    checkout_check_credits: 'Créditos: Verra VCS, REDD+ (evitação de desmatamento). Projeto: [PROJECT_NAME]; ID VCS: [PROJECT_ID]; metodologia: [METHODOLOGY_ID]; safras: [VINTAGE_RANGE].',
    checkout_check_retirement: 'Aposentadoria: um lote coletivo por ciclo; transação [RETIREMENT_TX_ID]; faixa de séries [SERIAL_START] a [SERIAL_END]; data [DATE]; beneficiário: contribuintes Carbon Pocket, ciclo [YYYY-MM].',
    checkout_check_integrity: 'Integridade: cada série é aposentada uma única vez e não pode ser revendida. O Carbon Pocket não reivindica os créditos para si. Os créditos não têm ajuste correspondente e não podem ser contabilizados por governos para suas NDCs.',
    checkout_check_standard: 'Status do padrão: Verra é o padrão de certificação dos créditos. Carbon Pocket não é certificado, endossado ou auditado pela Verra ou pela BR Carbon.'
  }
};

translations.es = {
  ...translations.en,
  checkout_notice_short: 'Solo compensación: tus emisiones siguen ocurriendo. Los créditos se retiran en un registro público.',
  checkout_what_buying: 'Qué estás comprando',
  checkout_buying_fixed: 'Esto compensa [KG] kg CO2e con créditos REDD+ certificados por el estándar Verra VCS. Es compensación, no reducción: tus emisiones siguen ocurriendo. Los créditos se retiran en lotes, publicados en cada ciclo en [LEDGER_URL]. No es un inventario oficial, no es un CRVE y no sirve para cumplir obligaciones del SBCE ni metas de NDC.',
  checkout_buying_monthly: 'Esto compensa [KG] kg CO2e de tu huella mensual estimada con créditos REDD+ certificados por el estándar Verra VCS. Es compensación, no reducción: tus emisiones siguen ocurriendo. Los créditos se retiran en lotes, publicados en cada ciclo en [LEDGER_URL]. No es un inventario oficial, no es un CRVE y no sirve para cumplir obligaciones del SBCE ni metas de NDC.',
  checkout_how_verified: 'Cómo se verifica tu compensación',
  checkout_partner_info: 'Información sobre el socio',
  checkout_supplier: 'Proveedor de créditos: BR Carbon',
  checkout_verra_label: 'Verra VCS identifica el estándar de certificación de los créditos, no una aprobación de esta aplicación.',
  checkout_verified_title: 'Créditos verificados, con divulgación completa',
  checkout_cycle_details: 'Créditos REDD+ certificados por Verra VCS. Los detalles del ciclo se publicarán tras la verificación: proyecto [PROJECT_NAME], rango de series [SERIAL_START]–[SERIAL_END], ID de retiro [RETIREMENT_TX_ID], registro [LEDGER_URL]. Carbon Pocket no está certificado ni respaldado por Verra.',
  checkout_cobenefit: 'La información sobre co-beneficios es la publicada por el desarrollador del proyecto.',
  checkout_standard_supplier: 'Verra es el estándar de certificación de los créditos. BR Carbon es el proveedor de los créditos.',
  checkout_check_emissions: 'Emisiones estimadas: según tus datos, con factores eléctricos IEA 2025, factores de transporte DEFRA y EPA, datos de aviación de ICAO, Directrices del IPCC para energía doméstica y Poore & Nemecek (2018) para alimentos. Lógica de alcances del GHG Protocol adaptada a individuos. Es una estimación, no un inventario oficial.',
  checkout_check_credits: 'Créditos: Verra VCS, REDD+ (evitación de deforestación). Proyecto: [PROJECT_NAME]; ID de proyecto VCS: [PROJECT_ID]; metodología: [METHODOLOGY_ID]; cosechas: [VINTAGE_RANGE].',
  checkout_check_retirement: 'Retiro: un lote colectivo por ciclo; transacción [RETIREMENT_TX_ID]; rango de series [SERIAL_START] a [SERIAL_END]; fecha [DATE]; beneficiario: contribuyentes de Carbon Pocket, ciclo [YYYY-MM].',
  checkout_check_integrity: 'Integridad: cada serie se retira una sola vez y no puede revenderse. Carbon Pocket no reclama los créditos para sí. Los créditos no tienen ajuste correspondiente y los gobiernos no pueden contabilizarlos para sus NDC.',
  checkout_check_standard: 'Estado del estándar: Verra es el estándar de certificación de los créditos. Carbon Pocket no está certificado, respaldado ni auditado por Verra ni por BR Carbon.'
};

translations.fr = {
  ...translations.en,
  checkout_notice_short: 'Compensation uniquement : vos émissions continuent. Les crédits sont retirés dans un registre public.',
  checkout_what_buying: 'Ce que vous achetez',
  checkout_buying_fixed: "Cette contribution compense [KG] kg CO2e avec des crédits REDD+ certifiés Verra VCS. Compensation, pas réduction : vos émissions continuent. Les crédits sont retirés par lots, publiés à chaque cycle sur [LEDGER_URL]. Ce n'est pas un inventaire officiel, ni un CRVE, et cela ne permet pas de respecter les obligations du SBCE ni les objectifs CDN.",
  checkout_buying_monthly: "Cette contribution compense [KG] kg CO2e de votre empreinte mensuelle estimée avec des crédits REDD+ certifiés Verra VCS. Compensation, pas réduction : vos émissions continuent. Les crédits sont retirés par lots, publiés à chaque cycle sur [LEDGER_URL]. Ce n'est pas un inventaire officiel, ni un CRVE, et cela ne permet pas de respecter les obligations du SBCE ni les objectifs CDN.",
  checkout_how_verified: 'Comment votre compensation est vérifiée',
  checkout_partner_info: 'Informations sur le partenaire',
  checkout_supplier: 'Fournisseur des crédits : BR Carbon',
  checkout_verra_label: "Verra VCS désigne le standard de certification des crédits, et non une approbation de cette application.",
  checkout_verified_title: 'Crédits vérifiés, informations publiées',
  checkout_cycle_details: "Crédits REDD+ certifiés Verra VCS. Les détails du cycle seront publiés après vérification : projet [PROJECT_NAME], plage de séries [SERIAL_START]–[SERIAL_END], ID de retrait [RETIREMENT_TX_ID], registre [LEDGER_URL]. Carbon Pocket n'est ni certifié ni approuvé par Verra.",
  checkout_cobenefit: 'Les informations sur les co-bénéfices sont celles publiées par le développeur du projet.',
  checkout_standard_supplier: 'Verra est le standard de certification des crédits. BR Carbon est le fournisseur des crédits.',
  checkout_check_emissions: "Émissions estimées : d'après vos réponses, avec les facteurs électriques IEA 2025, les facteurs de transport DEFRA et EPA, les données aéronautiques de l'ICAO, les lignes directrices de l'IPCC pour l'énergie domestique et Poore & Nemecek (2018) pour l'alimentation. Logique des scopes du GHG Protocol adaptée aux particuliers. Il s'agit d'une estimation, pas d'un inventaire officiel.",
  checkout_check_credits: 'Crédits : Verra VCS, REDD+ (évitement de la déforestation). Projet : [PROJECT_NAME] ; ID projet VCS : [PROJECT_ID] ; méthodologie : [METHODOLOGY_ID] ; millésimes : [VINTAGE_RANGE].',
  checkout_check_retirement: 'Retrait : un lot collectif par cycle ; transaction [RETIREMENT_TX_ID] ; plage de séries [SERIAL_START] à [SERIAL_END] ; date [DATE] ; bénéficiaires : contributeurs Carbon Pocket, cycle [YYYY-MM].',
  checkout_check_integrity: "Intégrité : chaque série est retirée une seule fois et ne peut pas être revendue. Carbon Pocket ne revendique pas les crédits pour son propre compte. Les crédits ne font l'objet d'aucun ajustement correspondant et ne peuvent pas être comptabilisés par les gouvernements au titre de leurs CDN.",
  checkout_check_standard: "Statut du standard : Verra est le standard de certification des crédits. Carbon Pocket n'est ni certifié, ni approuvé, ni audité par Verra ou BR Carbon."
};

translations.de = {
  ...translations.en,
  checkout_notice_short: 'Nur Kompensation: Ihre Emissionen entstehen weiterhin. Die Gutschriften werden in einem öffentlichen Register stillgelegt.',
  checkout_what_buying: 'Was Sie kaufen',
  checkout_buying_fixed: 'Dies kompensiert [KG] kg CO2e mit Verra-VCS-zertifizierten REDD+-Gutschriften. Kompensation, keine Reduktion: Ihre Emissionen entstehen weiterhin. Die Gutschriften werden in Sammelstilllegungen gebündelt und in jedem Zyklus unter [LEDGER_URL] veröffentlicht. Kein offizielles Inventar, kein CRVE und nicht geeignet zur Erfüllung von SBCE-Pflichten oder NDC-Zielen.',
  checkout_buying_monthly: 'Dies kompensiert [KG] kg CO2e Ihres geschätzten Monatsfußabdrucks mit Verra-VCS-zertifizierten REDD+-Gutschriften. Kompensation, keine Reduktion: Ihre Emissionen entstehen weiterhin. Die Gutschriften werden in Sammelstilllegungen gebündelt und in jedem Zyklus unter [LEDGER_URL] veröffentlicht. Kein offizielles Inventar, kein CRVE und nicht geeignet zur Erfüllung von SBCE-Pflichten oder NDC-Zielen.',
  checkout_how_verified: 'Wie Ihre Kompensation überprüft wird',
  checkout_partner_info: 'Informationen zum Partner',
  checkout_supplier: 'Gutschrift-Anbieter: BR Carbon',
  checkout_verra_label: 'Verra VCS bezeichnet den Zertifizierungsstandard der Gutschriften, nicht eine Zulassung dieser App.',
  checkout_verified_title: 'Verifizierte Gutschriften, vollständig offengelegt',
  checkout_cycle_details: 'Verra-VCS-zertifizierte REDD+-Gutschriften. Zyklusdetails werden nach der Verifizierung veröffentlicht: Projekt [PROJECT_NAME], Serienbereich [SERIAL_START]–[SERIAL_END], Stilllegungs-ID [RETIREMENT_TX_ID], Register [LEDGER_URL]. Carbon Pocket ist nicht von Verra zertifiziert oder empfohlen.',
  checkout_cobenefit: 'Angaben zu Ko-Benefits sind die vom Projektentwickler veröffentlichten.',
  checkout_standard_supplier: 'Verra ist der Zertifizierungsstandard der Gutschriften. BR Carbon ist der Anbieter der Gutschriften.',
  checkout_check_emissions: 'Geschätzte Emissionen: auf Basis Ihrer Angaben, mit IEA-2025-Stromfaktoren, DEFRA- und EPA-Verkehrsfaktoren, ICAO-Luftfahrtdaten, IPCC-Leitlinien für Haushaltsenergie und Poore & Nemecek (2018) für Lebensmittel. Scope-Logik des GHG Protocol für Einzelpersonen angepasst. Dies ist eine Schätzung, kein offizielles Inventar.',
  checkout_check_credits: 'Gutschriften: Verra VCS, REDD+ (Vermeidung von Entwaldung). Projekt: [PROJECT_NAME]; VCS-Projekt-ID: [PROJECT_ID]; Methodik: [METHODOLOGY_ID]; Jahrgänge: [VINTAGE_RANGE].',
  checkout_check_retirement: 'Stilllegung: eine Sammelstilllegung pro Zyklus; Transaktion [RETIREMENT_TX_ID]; Serienbereich [SERIAL_START] bis [SERIAL_END]; Datum [DATE]; Begünstigte: Carbon-Pocket-Beitragende, Zyklus [YYYY-MM].',
  checkout_check_integrity: 'Integrität: jede Serie wird einmal stillgelegt und kann nicht weiterverkauft werden. Carbon Pocket erhebt keinen Anspruch auf die Gutschriften für eigene Rechnung. Die Gutschriften weisen keine entsprechende Anpassung auf und können von Regierungen nicht auf ihre NDC-Ziele angerechnet werden.',
  checkout_check_standard: 'Standardstatus: Verra ist der Zertifizierungsstandard der Gutschriften. Carbon Pocket ist weder von Verra noch von BR Carbon zertifiziert, empfohlen oder geprüft.'
};

translations.it = {
  ...translations.en,
  checkout_notice_short: 'Solo compensazione: le tue emissioni continuano. I crediti vengono ritirati in un registro pubblico.',
  checkout_what_buying: 'Che cosa stai acquistando',
  checkout_buying_fixed: 'Questo compensa [KG] kg CO2e con crediti REDD+ certificati Verra VCS. Compensazione, non riduzione: le tue emissioni continuano. I crediti vengono ritirati in lotti, pubblicati a ogni ciclo su [LEDGER_URL]. Non è un inventario ufficiale, non è un CRVE e non serve a rispettare gli obblighi del SBCE né gli obiettivi NDC.',
  checkout_buying_monthly: 'Questo compensa [KG] kg CO2e della tua impronta mensile stimata con crediti REDD+ certificati Verra VCS. Compensazione, non riduzione: le tue emissioni continuano. I crediti vengono ritirati in lotti, pubblicati a ogni ciclo su [LEDGER_URL]. Non è un inventario ufficiale, non è un CRVE e non serve a rispettare gli obblighi del SBCE né gli obiettivi NDC.',
  checkout_how_verified: 'Come viene verificata la tua compensazione',
  checkout_partner_info: 'Informazioni sul partner',
  checkout_supplier: 'Fornitore dei crediti: BR Carbon',
  checkout_verra_label: "Verra VCS identifica lo standard di certificazione dei crediti, non un'approvazione di questa applicazione.",
  checkout_verified_title: 'Crediti verificati, informazioni complete',
  checkout_cycle_details: 'Crediti REDD+ certificati Verra VCS. I dettagli del ciclo saranno pubblicati dopo la verifica: progetto [PROJECT_NAME], intervallo di serie [SERIAL_START]–[SERIAL_END], ID di ritiro [RETIREMENT_TX_ID], registro [LEDGER_URL]. Carbon Pocket non è certificato né approvato da Verra.',
  checkout_cobenefit: 'Le informazioni sui co-benefici sono quelle pubblicate dallo sviluppatore del progetto.',
  checkout_standard_supplier: 'Verra è lo standard di certificazione dei crediti. BR Carbon è il fornitore dei crediti.',
  checkout_check_emissions: "Emissioni stimate: in base ai tuoi dati, con fattori elettrici IEA 2025, fattori di trasporto DEFRA ed EPA, dati aeronautici ICAO, Linee guida IPCC per l'energia domestica e Poore & Nemecek (2018) per il cibo. Logica degli scope del GHG Protocol adattata agli individui. È una stima, non un inventario ufficiale.",
  checkout_check_credits: 'Crediti: Verra VCS, REDD+ (evitamento della deforestazione). Progetto: [PROJECT_NAME]; ID progetto VCS: [PROJECT_ID]; metodologia: [METHODOLOGY_ID]; annate: [VINTAGE_RANGE].',
  checkout_check_retirement: 'Ritiro: un lotto collettivo per ciclo; transazione [RETIREMENT_TX_ID]; intervallo di serie [SERIAL_START] a [SERIAL_END]; data [DATE]; beneficiari: contribuenti Carbon Pocket, ciclo [YYYY-MM].',
  checkout_check_integrity: 'Integrità: ogni serie viene ritirata una sola volta e non può essere rivenduta. Carbon Pocket non rivendica i crediti per sé. I crediti non hanno una rettifica corrispondente e i governi non possono contabilizzarli per i loro NDC.',
  checkout_check_standard: 'Stato dello standard: Verra è lo standard di certificazione dei crediti. Carbon Pocket non è certificato, approvato o verificato da Verra o BR Carbon.'
};

translations.zh = {
  ...translations.en,
  checkout_notice_short: '仅为补偿：您的排放仍然发生。信用额在公共登记处注销。',
  checkout_what_buying: '您正在购买什么',
  checkout_buying_fixed: '本次补偿 [KG] kg CO2e，使用经 Verra VCS 认证的 REDD+ 信用额。补偿而非减排：您的排放仍然发生。信用额按批次注销，每个周期在 [LEDGER_URL] 公布。这不是官方清单，不是 CRVE，也不适用于履行 SBCE 义务或 NDC 目标。',
  checkout_buying_monthly: '本次补偿您月度估算足迹中的 [KG] kg CO2e，使用经 Verra VCS 认证的 REDD+ 信用额。补偿而非减排：您的排放仍然发生。信用额按批次注销，每个周期在 [LEDGER_URL] 公布。这不是官方清单，不是 CRVE，也不适用于履行 SBCE 义务或 NDC 目标。',
  checkout_how_verified: '您的补偿如何被核实',
  checkout_partner_info: '合作伙伴信息',
  checkout_supplier: '信用额供应商：BR Carbon',
  checkout_verra_label: 'Verra VCS 是信用额的认证标准，并不代表对本应用的认可。',
  checkout_verified_title: '经核证的信用额，信息完整公开',
  checkout_cycle_details: '经 Verra VCS 认证的 REDD+ 信用额。核实后将公布周期详情：项目 [PROJECT_NAME]，序列范围 [SERIAL_START]–[SERIAL_END]，注销编号 [RETIREMENT_TX_ID]，登记处 [LEDGER_URL]。Carbon Pocket 未获 Verra 认证或背书。',
  checkout_cobenefit: '共同效益信息以项目开发者公布的内容为准。',
  checkout_standard_supplier: 'Verra 是信用额的认证标准。BR Carbon 是信用额供应商。',
  checkout_check_emissions: '估算排放：基于您提供的数据，采用 IEA 2025 电力因子、DEFRA 和 EPA 交通因子、ICAO 航空数据、IPCC 家庭能源指南以及 Poore & Nemecek (2018) 食品数据。GHG Protocol 的范围逻辑已针对个人调整。这是估算，并非官方清单。',
  checkout_check_credits: '信用额：Verra VCS，REDD+（避免毁林）。项目：[PROJECT_NAME]；VCS 项目编号：[PROJECT_ID]；方法学：[METHODOLOGY_ID]；年份：[VINTAGE_RANGE]。',
  checkout_check_retirement: '注销：每个周期一次集体注销；交易 [RETIREMENT_TX_ID]；序列范围 [SERIAL_START] 至 [SERIAL_END]；日期 [DATE]；受益人：Carbon Pocket 贡献者，周期 [YYYY-MM]。',
  checkout_check_integrity: '完整性：每个序列仅注销一次，不可转售。Carbon Pocket 不为自身主张这些信用额。这些信用额没有相应调整，政府不能将其计入 NDC。',
  checkout_check_standard: '标准状态：Verra 是信用额的认证标准。Carbon Pocket 未获 Verra 或 BR Carbon 的认证、背书或审计。'
};

translations.ja = {
  ...translations.en,
  checkout_notice_short: '補償のみ：あなたの排出は続きます。クレジットは公開登録簿で償却されます。',
  checkout_what_buying: '購入内容',
  checkout_buying_fixed: 'これは [KG] kg CO2e を Verra VCS 認証 REDD+ クレジットで補償します。削減ではなく補償です。あなたの排出は続きます。クレジットはバッチで償却され、各サイクルごとに [LEDGER_URL] で公開されます。公式インベントリではなく、CRVE でもなく、SBCE の義務や NDC 目標の達成には使用できません。',
  checkout_buying_monthly: 'これは推定月間フットプリントのうち [KG] kg CO2e を Verra VCS 認証 REDD+ クレジットで補償します。削減ではなく補償です。あなたの排出は続きます。クレジットはバッチで償却され、各サイクルごとに [LEDGER_URL] で公開されます。公式インベントリではなく、CRVE でもなく、SBCE の義務や NDC 目標の達成には使用できません。',
  checkout_how_verified: '補償の検証方法',
  checkout_partner_info: 'パートナー情報',
  checkout_supplier: 'クレジット供給者：BR Carbon',
  checkout_verra_label: 'Verra VCS はクレジットの認証基準であり、本アプリの承認ではありません。',
  checkout_verified_title: '検証済みクレジットの情報を公開',
  checkout_cycle_details: 'Verra VCS 認証 REDD+ クレジット。サイクルの詳細は検証後に公開されます：プロジェクト [PROJECT_NAME]、シリアル範囲 [SERIAL_START]–[SERIAL_END]、償却 ID [RETIREMENT_TX_ID]、登録簿 [LEDGER_URL]。Carbon Pocket は Verra による認証や推奨を受けていません。',
  checkout_cobenefit: 'コベネフィット情報はプロジェクト開発者が公表した内容です。',
  checkout_standard_supplier: 'Verra はクレジットの認証基準です。BR Carbon はクレジットの供給者です。',
  checkout_check_emissions: '推定排出量：入力内容に基づき、IEA 2025 の電力係数、DEFRA および EPA の交通係数、ICAO の航空データ、IPCC ガイドラインの家庭エネルギー、Poore & Nemecek (2018) の食品データを使用しています。GHG Protocol のスコープ論理を個人向けに適用。これは推定であり、公式インベントリではありません。',
  checkout_check_credits: 'クレジット：Verra VCS、REDD+（森林減少の回避）。プロジェクト：[PROJECT_NAME]、VCS プロジェクト ID：[PROJECT_ID]、方法論：[METHODOLOGY_ID]、ヴィンテージ：[VINTAGE_RANGE]。',
  checkout_check_retirement: '償却：サイクルごとに 1 件の集合償却。取引 [RETIREMENT_TX_ID]、シリアル範囲 [SERIAL_START]〜[SERIAL_END]、日付 [DATE]、受益者：Carbon Pocket の貢献者、サイクル [YYYY-MM]。',
  checkout_check_integrity: '完全性：各シリアルは 1 回だけ償却され、再販できません。Carbon Pocket は自己の勘定でクレジットを主張しません。クレジットには対応する調整がなく、政府が NDC に算入することはできません。',
  checkout_check_standard: '基準の状況：Verra はクレジットの認証基準です。Carbon Pocket は Verra または BR Carbon による認証、推奨、監査を受けていません。'
};

translations.ko = {
  ...translations.en,
  checkout_notice_short: '보상만 해당: 배출은 계속 발생합니다. 크레딧은 공개 등록부에서 소각됩니다.',
  checkout_what_buying: '구매하시는 내용',
  checkout_buying_fixed: '이것은 [KG] kg CO2e를 Verra VCS 인증 REDD+ 크레딧으로 보상합니다. 감축이 아닌 보상입니다. 배출은 계속 발생합니다. 크레딧은 배치로 소각되며 각 주기마다 [LEDGER_URL]에 공개됩니다. 공식 인벤토리가 아니며, CRVE가 아니고, SBCE 의무나 NDC 목표 이행에 사용할 수 없습니다.',
  checkout_buying_monthly: '이것은 추정 월간 발자국의 [KG] kg CO2e를 Verra VCS 인증 REDD+ 크레딧으로 보상합니다. 감축이 아닌 보상입니다. 배출은 계속 발생합니다. 크레딧은 배치로 소각되며 각 주기마다 [LEDGER_URL]에 공개됩니다. 공식 인벤토리가 아니며, CRVE가 아니고, SBCE 의무나 NDC 목표 이행에 사용할 수 없습니다.',
  checkout_how_verified: '보상 검증 방법',
  checkout_partner_info: '파트너 정보',
  checkout_supplier: '크레딧 공급자: BR Carbon',
  checkout_verra_label: 'Verra VCS는 크레딧 인증 기준이며, 이 앱에 대한 승인이 아닙니다.',
  checkout_verified_title: '검증된 크레딧 정보 공개',
  checkout_cycle_details: 'Verra VCS 인증 REDD+ 크레딧. 주기 세부 정보는 검증 후 공개됩니다: 프로젝트 [PROJECT_NAME], 시리얼 범위 [SERIAL_START]–[SERIAL_END], 소각 ID [RETIREMENT_TX_ID], 등록부 [LEDGER_URL]. Carbon Pocket은 Verra의 인증이나 보증을 받지 않았습니다.',
  checkout_cobenefit: '공편익 정보는 프로젝트 개발자가 공개한 내용입니다.',
  checkout_standard_supplier: 'Verra는 크레딧의 인증 기준입니다. BR Carbon은 크레딧 공급자입니다.',
  checkout_check_emissions: '추정 배출량: 입력값을 바탕으로 IEA 2025 전력 계수, DEFRA 및 EPA 교통 계수, ICAO 항공 데이터, IPCC 가정용 에너지 지침, Poore & Nemecek(2018) 식품 데이터를 사용했습니다. GHG Protocol 스코프 논리를 개인에 맞게 적용했습니다. 이는 추정치이며 공식 인벤토리가 아닙니다.',
  checkout_check_credits: '크레딧: Verra VCS, REDD+(산림 파괴 방지). 프로젝트: [PROJECT_NAME]; VCS 프로젝트 ID: [PROJECT_ID]; 방법론: [METHODOLOGY_ID]; 빈티지: [VINTAGE_RANGE].',
  checkout_check_retirement: '소각: 주기당 1건의 집합 소각; 거래 [RETIREMENT_TX_ID]; 시리얼 범위 [SERIAL_START]~[SERIAL_END]; 날짜 [DATE]; 수혜자: Carbon Pocket 기여자, 주기 [YYYY-MM].',
  checkout_check_integrity: '무결성: 각 시리얼은 한 번만 소각되며 재판매할 수 없습니다. Carbon Pocket은 자체 계정으로 크레딧을 주장하지 않습니다. 크레딧에는 상응 조정이 없으므로 정부가 NDC에 계상할 수 없습니다.',
  checkout_check_standard: '기준 상태: Verra는 크레딧의 인증 기준입니다. Carbon Pocket은 Verra 또는 BR Carbon의 인증, 보증, 감사를 받지 않았습니다.'
};

translations.ru = {
  ...translations.en,
  checkout_notice_short: 'Только компенсация: ваши выбросы продолжаются. Кредиты списываются в публичном реестре.',
  checkout_what_buying: 'Что вы покупаете',
  checkout_buying_fixed: 'Это компенсирует [KG] кг CO2e кредитами REDD+, сертифицированными по стандарту Verra VCS. Компенсация, а не сокращение: ваши выбросы продолжаются. Кредиты списываются пулами и публикуются каждый цикл на [LEDGER_URL]. Это не официальная инвентаризация, не CRVE и не подходит для выполнения обязательств SBCE или целей NDC.',
  checkout_buying_monthly: 'Это компенсирует [KG] кг CO2e из вашего расчётного месячного следа кредитами REDD+, сертифицированными по стандарту Verra VCS. Компенсация, а не сокращение: ваши выбросы продолжаются. Кредиты списываются пулами и публикуются каждый цикл на [LEDGER_URL]. Это не официальная инвентаризация, не CRVE и не подходит для выполнения обязательств SBCE или целей NDC.',
  checkout_how_verified: 'Как проверяется ваша компенсация',
  checkout_partner_info: 'Информация о партнёре',
  checkout_supplier: 'Поставщик кредитов: BR Carbon',
  checkout_verra_label: 'Verra VCS обозначает стандарт сертификации кредитов, а не одобрение этого приложения.',
  checkout_verified_title: 'Проверенные кредиты с полным раскрытием',
  checkout_cycle_details: 'Кредиты REDD+, сертифицированные Verra VCS. Детали цикла будут опубликованы после верификации: проект [PROJECT_NAME], диапазон серийных номеров [SERIAL_START]–[SERIAL_END], ID списания [RETIREMENT_TX_ID], реестр [LEDGER_URL]. Carbon Pocket не сертифицирован и не одобрен Verra.',
  checkout_cobenefit: 'Информация о сопутствующих выгодах — та, что опубликована разработчиком проекта.',
  checkout_standard_supplier: 'Verra — стандарт сертификации кредитов. BR Carbon — поставщик кредитов.',
  checkout_check_emissions: 'Расчётные выбросы: на основе ваших данных, с коэффициентами электроэнергии IEA 2025, транспортными коэффициентами DEFRA и EPA, авиационными данными ICAO, руководствами IPCC по энергии домохозяйств и Poore & Nemecek (2018) для продуктов питания. Логика областей GHG Protocol адаптирована для частных лиц. Это оценка, а не официальная инвентаризация.',
  checkout_check_credits: 'Кредиты: Verra VCS, REDD+ (предотвращение обезлесения). Проект: [PROJECT_NAME]; ID проекта VCS: [PROJECT_ID]; методология: [METHODOLOGY_ID]; винтажи: [VINTAGE_RANGE].',
  checkout_check_retirement: 'Списание: один пул на цикл; транзакция [RETIREMENT_TX_ID]; диапазон серийных номеров [SERIAL_START]–[SERIAL_END]; дата [DATE]; бенефициар: участники Carbon Pocket, цикл [YYYY-MM].',
  checkout_check_integrity: 'Целостность: каждый серийный номер списывается один раз и не может быть перепродан. Carbon Pocket не заявляет права на кредиты для себя. Кредиты не имеют соответствующей корректировки, поэтому правительства не могут учитывать их в своих NDC.',
  checkout_check_standard: 'Статус стандарта: Verra — стандарт сертификации кредитов. Carbon Pocket не сертифицирован, не одобрен и не проверен Verra или BR Carbon.'
};

translations.ar = {
  ...translations.en,
  checkout_notice_short: 'تعويض فقط: انبعاثاتك مستمرة. تُلغى الأرصدة في سجل عام.',
  checkout_what_buying: 'ما الذي تشتريه',
  checkout_buying_fixed: 'هذا يعوّض [KG] كجم CO2e بأرصدة REDD+ معتمدة من معيار Verra VCS. تعويض لا تخفيض: انبعاثاتك مستمرة. تُلغى الأرصدة في دفعات وتُنشر كل دورة على [LEDGER_URL]. ليس جردًا رسميًا، وليس CRVE، ولا يصلح للامتثال لالتزامات SBCE أو أهداف NDC.',
  checkout_buying_monthly: 'هذا يعوّض [KG] كجم CO2e من بصمتك الشهرية المقدرة بأرصدة REDD+ معتمدة من معيار Verra VCS. تعويض لا تخفيض: انبعاثاتك مستمرة. تُلغى الأرصدة في دفعات وتُنشر كل دورة على [LEDGER_URL]. ليس جردًا رسميًا، وليس CRVE، ولا يصلح للامتثال لالتزامات SBCE أو أهداف NDC.',
  checkout_how_verified: 'كيف يتم التحقق من تعويضك',
  checkout_partner_info: 'معلومات الشريك',
  checkout_supplier: 'مورّد الأرصدة: BR Carbon',
  checkout_verra_label: 'Verra VCS يحدد معيار اعتماد الأرصدة، وليس موافقة على هذا التطبيق.',
  checkout_verified_title: 'أرصدة موثقة مع إفصاح كامل',
  checkout_cycle_details: 'أرصدة REDD+ معتمدة من Verra VCS. ستُنشر تفاصيل الدورة بعد التحقق: المشروع [PROJECT_NAME]، نطاق التسلسل [SERIAL_START]–[SERIAL_END]، معرّف الإلغاء [RETIREMENT_TX_ID]، السجل [LEDGER_URL]. Carbon Pocket غير معتمد ولا مُزكّى من Verra.',
  checkout_cobenefit: 'معلومات الفوائد المشتركة هي ما ينشره مطوّر المشروع.',
  checkout_standard_supplier: 'Verra هو معيار اعتماد الأرصدة. BR Carbon هو مورّد الأرصدة.',
  checkout_check_emissions: 'الانبعاثات المقدرة: بناءً على بياناتك، باستخدام عوامل الكهرباء IEA 2025، وعوامل النقل DEFRA وEPA، وبيانات الطيران ICAO، وإرشادات IPCC لطاقة المنازل، وPoore & Nemecek (2018) للأغذية. منطق النطاقات في GHG Protocol مكيّف للأفراد. هذا تقدير وليس جردًا رسميًا.',
  checkout_check_credits: 'الأرصدة: Verra VCS، REDD+ (تجنب إزالة الغابات). المشروع: [PROJECT_NAME]؛ معرّف مشروع VCS: [PROJECT_ID]؛ المنهجية: [METHODOLOGY_ID]؛ الأعوام: [VINTAGE_RANGE].',
  checkout_check_retirement: 'الإلغاء: دفعة جماعية واحدة لكل دورة؛ المعاملة [RETIREMENT_TX_ID]؛ نطاق التسلسل [SERIAL_START] إلى [SERIAL_END]؛ التاريخ [DATE]؛ المستفيد: مساهمو Carbon Pocket، الدورة [YYYY-MM].',
  checkout_check_integrity: 'السلامة: كل تسلسل يُلغى مرة واحدة ولا يمكن إعادة بيعه. لا تطالب Carbon Pocket بالأرصدة لحسابها الخاص. لا تحمل الأرصدة تعديلًا مقابلًا، لذا لا يمكن للحكومات احتسابها ضمن NDC.',
  checkout_check_standard: 'حالة المعيار: Verra هو معيار اعتماد الأرصدة. Carbon Pocket غير معتمد ولا مُزكّى ولا مدقق من Verra أو BR Carbon.'
};

translations.sv = {
  ...translations.en,
  checkout_notice_short: 'Endast kompensation: dina utsläpp fortsätter. Krediterna dras in i ett offentligt register.',
  checkout_what_buying: 'Vad du köper',
  checkout_buying_fixed: 'Detta kompenserar [KG] kg CO2e med Verra VCS-certifierade REDD+-krediter. Kompensation, inte minskning: dina utsläpp fortsätter. Krediterna dras in i samlade omgångar och publiceras varje cykel på [LEDGER_URL]. Inte ett officiellt inventarium, inte ett CRVE och gäller inte för att uppfylla SBCE-krav eller NDC-mål.',
  checkout_buying_monthly: 'Detta kompenserar [KG] kg CO2e av ditt beräknade månadsavtryck med Verra VCS-certifierade REDD+-krediter. Kompensation, inte minskning: dina utsläpp fortsätter. Krediterna dras in i samlade omgångar och publiceras varje cykel på [LEDGER_URL]. Inte ett officiellt inventarium, inte ett CRVE och gäller inte för att uppfylla SBCE-krav eller NDC-mål.',
  checkout_how_verified: 'Hur din kompensation verifieras',
  checkout_partner_info: 'Partnerinformation',
  checkout_supplier: 'Kreditleverantör: BR Carbon',
  checkout_verra_label: 'Verra VCS anger certifieringsstandarden för krediterna, inte ett godkännande av appen.',
  checkout_verified_title: 'Verifierade krediter, fullständigt redovisade',
  checkout_cycle_details: 'Verra VCS-certifierade REDD+-krediter. Cykelns detaljer publiceras efter verifiering: projekt [PROJECT_NAME], serienummerintervall [SERIAL_START]–[SERIAL_END], indragnings-ID [RETIREMENT_TX_ID], register [LEDGER_URL]. Carbon Pocket är inte certifierat eller rekommenderat av Verra.',
  checkout_cobenefit: 'Information om mednyttor är den som projektutvecklaren publicerar.',
  checkout_standard_supplier: 'Verra är certifieringsstandarden för krediterna. BR Carbon är kreditleverantören.',
  checkout_check_emissions: 'Beräknade utsläpp: baserat på dina uppgifter, med IEA 2025 el-faktorer, DEFRA- och EPA-transportfaktorer, ICAO-flygdata, IPCC:s riktlinjer för hushållsenergi och Poore & Nemecek (2018) för livsmedel. GHG Protocol-scopelogik anpassad för individer. Detta är en uppskattning, inte ett officiellt inventarium.',
  checkout_check_credits: 'Krediter: Verra VCS, REDD+ (undviken avskogning). Projekt: [PROJECT_NAME]; VCS-projekt-ID: [PROJECT_ID]; metodik: [METHODOLOGY_ID]; årgångar: [VINTAGE_RANGE].',
  checkout_check_retirement: 'Indragning: en samlad indragning per cykel; transaktion [RETIREMENT_TX_ID]; serienummerintervall [SERIAL_START] till [SERIAL_END]; datum [DATE]; förmånstagare: Carbon Pockets bidragsgivare, cykel [YYYY-MM].',
  checkout_check_integrity: 'Integritet: varje serienummer dras in en gång och kan inte säljas vidare. Carbon Pocket gör inget anspråk på krediterna för egen räkning. Krediterna har ingen motsvarande justering och kan inte räknas av regeringar mot deras NDC.',
  checkout_check_standard: 'Standardstatus: Verra är certifieringsstandarden för krediterna. Carbon Pocket är inte certifierat, rekommenderat eller granskat av Verra eller BR Carbon.'
};

// Mesmo helper da página inicial.
function t(key, lang) {
  if (translations[lang] && translations[lang][key] !== undefined) {
    return translations[lang][key];
  }
  if (translations['en'] && translations['en'][key] !== undefined) {
    return translations['en'][key];
  }
  return key;
}

// Traduz e substitui os tokens entre colchetes pelos valores configurados.
// Se o valor ainda não existir, o token permanece visível — comportamento
// idêntico ao atual, até COMPENSATION_CONFIG receber os dados reais.
function tTokens(key, lang, valores) {
  return t(key, lang).replace(/\[([A-Z][A-Z0-9_-]*)\]/g, function (token, nome) {
    return valores && valores[nome] !== undefined && valores[nome] !== ''
      ? valores[nome]
      : token;
  });
}