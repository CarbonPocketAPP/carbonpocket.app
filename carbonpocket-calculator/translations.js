// Traduções do painel de compensação da calculadora.
// Mesmo mecanismo de translations.js da página inicial:
// objeto por idioma, chave em snake_case com prefixo, t() com fallback para inglês,
// e tokens entre colchetes substituídos em runtime por COMPENSATION_CONFIG.
// NUNCA traduza, reordene ou remova os tokens.

const translations = {
  en: {
    checkout_what_buying: 'What you are buying',
    checkout_buying_fixed: 'This compensates [KG] kg CO2e with Verra VCS-certified REDD+ credits, supporting local communities and conservation. Compensation, not reduction: your emissions still occur. Credits are retired in pooled retirements and published annually. Not an official inventory, not a CRVE, and not valid for SBCE compliance or NDC claims.',
    checkout_buying_monthly: 'This compensates [KG] kg CO2e of your estimated monthly footprint with Verra VCS-certified REDD+ credits, supporting local communities and conservation. Compensation, not reduction: your emissions still occur. Credits are retired in pooled retirements and published annually. Not an official inventory, not a CRVE, and not valid for SBCE compliance or NDC claims.',
    checkout_how_verified: 'How your compensation is verified',
    checkout_partner_info: 'Partner information',
    checkout_supplier: 'Credit supplier: BR Carbon',
    checkout_verra_label: 'Credits from Brazilian Amazon REDD+ APD Project',
    checkout_verified_title: 'Verified credits, fully disclosed',
    checkout_cycle_details: 'Carbon Pocket is not certified or endorsed by Verra.',
    checkout_cobenefit: 'Co-benefit information is that published by the project developer.',
    checkout_standard_supplier: 'Verra is the certification standard for the credits. BR Carbon is the credit supplier.',
    checkout_check_emissions: 'Estimated emissions: based on your input, using IEA 2025 electricity factors, DEFRA and EPA transport factors, ICAO aviation data, IPCC Guidelines for household energy, and Poore & Nemecek (2018) for food. GHG Protocol scope logic adapted to individuals. This is an estimate, not an official inventory.',
    checkout_check_credits: 'Credits: Brazilian Amazon REDD+ APD Project, Verra VCS project ID 2551.',
    checkout_check_retirement: 'Credits are retired in pooled batches and published annually after verification.',
    checkout_check_integrity: 'Integrity: each serial is retired once and cannot be resold. Carbon Pocket makes no claim over the credits for its own account. The credits carry no corresponding adjustment, so governments cannot count them toward their NDCs.',
    checkout_check_standard: 'Standard status: Verra is the certification standard for the credits. Carbon Pocket is not certified, endorsed or audited by Verra or BR Carbon.'
  },

  pt: {
    checkout_what_buying: 'O que você está comprando',
    checkout_buying_fixed: 'Isto compensa [KG] kg CO2e com créditos REDD+ certificados pelo padrão Verra VCS, apoiando comunidades locais e a conservação. É compensação, não redução: suas emissões continuam ocorrendo. Os créditos são aposentados em lotes e publicados anualmente. Não é inventário oficial, não é CRVE e não serve para cumprir obrigações do SBCE nem metas de NDC.',
    checkout_buying_monthly: 'Isto compensa [KG] kg CO2e da sua pegada mensal estimada com créditos REDD+ certificados pelo padrão Verra VCS, apoiando comunidades locais e a conservação. É compensação, não redução: suas emissões continuam ocorrendo. Os créditos são aposentados em lotes e publicados anualmente. Não é inventário oficial, não é CRVE e não serve para cumprir obrigações do SBCE nem metas de NDC.',
    checkout_how_verified: 'Como sua compensação é verificada',
    checkout_partner_info: 'Informações sobre parceiros',
    checkout_supplier: 'Fornecedor de créditos: BR Carbon',
    checkout_verra_label: 'Créditos do projeto Brazilian Amazon REDD+ APD',
    checkout_verified_title: 'Créditos verificados, com divulgação completa',
    checkout_cycle_details: 'O Carbon Pocket não é certificado nem endossado pela Verra.',
    checkout_cobenefit: 'As informações sobre cobenefícios são as publicadas pelo desenvolvedor do projeto.',
    checkout_standard_supplier: 'Verra é o padrão de certificação dos créditos. BR Carbon é o fornecedor de créditos.',
    checkout_check_emissions: 'Emissões estimadas: dados informados por você e fatores IEA 2025 para eletricidade, DEFRA e EPA para transporte, ICAO para aviação, Diretrizes do IPCC para energia doméstica e Poore & Nemecek (2018) para alimentos. Lógica de escopos do GHG Protocol adaptada a indivíduos. É uma estimativa, não um inventário oficial.',
    checkout_check_credits: 'Créditos: projeto Brazilian Amazon REDD+ APD, ID de projeto Verra VCS 2551.',
    checkout_check_retirement: 'Os créditos são aposentados em lotes coletivos e publicados anualmente após verificação.',
    checkout_check_integrity: 'Integridade: cada série é aposentada uma única vez e não pode ser revendida. O Carbon Pocket não reivindica os créditos para si. Os créditos não têm ajuste correspondente e não podem ser contabilizados por governos para suas NDCs.',
    checkout_check_standard: 'Status do padrão: Verra é o padrão de certificação dos créditos. Carbon Pocket não é certificado, endossado ou auditado pela Verra ou pela BR Carbon.'
  }
};

translations.es = {
  ...translations.en,
  checkout_what_buying: 'Qué estás comprando',
  checkout_buying_fixed: 'Esto compensa [KG] kg CO2e con créditos REDD+ certificados por el estándar Verra VCS, apoyando a las comunidades locales y la conservación. Es compensación, no reducción: tus emisiones siguen ocurriendo. Los créditos se retiran en lotes y se publican anualmente. No es un inventario oficial, no es un CRVE y no sirve para cumplir obligaciones del SBCE ni metas de NDC.',
  checkout_buying_monthly: 'Esto compensa [KG] kg CO2e de tu huella mensual estimada con créditos REDD+ certificados por el estándar Verra VCS, apoyando a las comunidades locales y la conservación. Es compensación, no reducción: tus emisiones siguen ocurriendo. Los créditos se retiran en lotes y se publican anualmente. No es un inventario oficial, no es un CRVE y no sirve para cumplir obligaciones del SBCE ni metas de NDC.',
  checkout_how_verified: 'Cómo se verifica tu compensación',
  checkout_partner_info: 'Información sobre el socio',
  checkout_supplier: 'Proveedor de créditos: BR Carbon',
  checkout_verra_label: 'Créditos del proyecto Brazilian Amazon REDD+ APD',
  checkout_verified_title: 'Créditos verificados, con divulgación completa',
  checkout_cycle_details: 'Carbon Pocket no está certificado ni respaldado por Verra.',
  checkout_cobenefit: 'La información sobre co-beneficios es la publicada por el desarrollador del proyecto.',
  checkout_standard_supplier: 'Verra es el estándar de certificación de los créditos. BR Carbon es el proveedor de los créditos.',
  checkout_check_emissions: 'Emisiones estimadas: según tus datos, con factores eléctricos IEA 2025, factores de transporte DEFRA y EPA, datos de aviación de ICAO, Directrices del IPCC para energía doméstica y Poore & Nemecek (2018) para alimentos. Lógica de alcances del GHG Protocol adaptada a individuos. Es una estimación, no un inventario oficial.',
  checkout_check_credits: 'Créditos: proyecto Brazilian Amazon REDD+ APD, ID de proyecto Verra VCS 2551.',
  checkout_check_retirement: 'Los créditos se retiran en lotes colectivos y se publican anualmente tras la verificación.',
  checkout_check_integrity: 'Integridad: cada serie se retira una sola vez y no puede revenderse. Carbon Pocket no reclama los créditos para sí. Los créditos no tienen ajuste correspondiente y los gobiernos no pueden contabilizarlos para sus NDC.',
  checkout_check_standard: 'Estado del estándar: Verra es el estándar de certificación de los créditos. Carbon Pocket no está certificado, respaldado ni auditado por Verra ni por BR Carbon.'
};

translations.fr = {
  ...translations.en,
  checkout_what_buying: 'Ce que vous achetez',
  checkout_buying_fixed: "Cette contribution compense [KG] kg CO2e avec des crédits REDD+ certifiés Verra VCS, en soutenant les communautés locales et la conservation. Compensation, pas réduction : vos émissions continuent. Les crédits sont retirés par lots et publiés chaque année. Ce n'est pas un inventaire officiel, ni un CRVE, et cela ne permet pas de respecter les obligations du SBCE ni les objectifs CDN.",
  checkout_buying_monthly: "Cette contribution compense [KG] kg CO2e de votre empreinte mensuelle estimée avec des crédits REDD+ certifiés Verra VCS, en soutenant les communautés locales et la conservation. Compensation, pas réduction : vos émissions continuent. Les crédits sont retirés par lots et publiés chaque année. Ce n'est pas un inventaire officiel, ni un CRVE, et cela ne permet pas de respecter les obligations du SBCE ni les objectifs CDN.",
  checkout_how_verified: 'Comment votre compensation est vérifiée',
  checkout_partner_info: 'Informations sur le partenaire',
  checkout_supplier: 'Fournisseur des crédits : BR Carbon',
  checkout_verra_label: 'Crédits du projet Brazilian Amazon REDD+ APD',
  checkout_verified_title: 'Crédits vérifiés, informations publiées',
  checkout_cycle_details: "Carbon Pocket n'est ni certifié ni approuvé par Verra.",
  checkout_cobenefit: 'Les informations sur les co-bénéfices sont celles publiées par le développeur du projet.',
  checkout_standard_supplier: 'Verra est le standard de certification des crédits. BR Carbon est le fournisseur des crédits.',
  checkout_check_emissions: "Émissions estimées : d'après vos réponses, avec les facteurs électriques IEA 2025, les facteurs de transport DEFRA et EPA, les données aéronautiques de l'ICAO, les lignes directrices de l'IPCC pour l'énergie domestique et Poore & Nemecek (2018) pour l'alimentation. Logique des scopes du GHG Protocol adaptée aux particuliers. Il s'agit d'une estimation, pas d'un inventaire officiel.",
  checkout_check_credits: 'Crédits : projet Brazilian Amazon REDD+ APD, ID de projet Verra VCS 2551.',
  checkout_check_retirement: 'Les crédits sont retirés par lots collectifs et publiés chaque année après vérification.',
  checkout_check_integrity: "Intégrité : chaque série est retirée une seule fois et ne peut pas être revendue. Carbon Pocket ne revendique pas les crédits pour son propre compte. Les crédits ne font l'objet d'aucun ajustement correspondant et ne peuvent pas être comptabilisés par les gouvernements au titre de leurs CDN.",
  checkout_check_standard: "Statut du standard : Verra est le standard de certification des crédits. Carbon Pocket n'est ni certifié, ni approuvé, ni audité par Verra ou BR Carbon."
};

translations.de = {
  ...translations.en,
  checkout_what_buying: 'Was Sie kaufen',
  checkout_buying_fixed: 'Dies kompensiert [KG] kg CO2e mit Verra-VCS-zertifizierten REDD+-Gutschriften und unterstützt lokale Gemeinschaften und den Naturschutz. Kompensation, keine Reduktion: Ihre Emissionen entstehen weiterhin. Die Gutschriften werden gebündelt stillgelegt und jährlich veröffentlicht. Kein offizielles Inventar, kein CRVE und nicht geeignet zur Erfüllung von SBCE-Pflichten oder NDC-Zielen.',
  checkout_buying_monthly: 'Dies kompensiert [KG] kg CO2e Ihres geschätzten Monatsfußabdrucks mit Verra-VCS-zertifizierten REDD+-Gutschriften und unterstützt lokale Gemeinschaften und den Naturschutz. Kompensation, keine Reduktion: Ihre Emissionen entstehen weiterhin. Die Gutschriften werden gebündelt stillgelegt und jährlich veröffentlicht. Kein offizielles Inventar, kein CRVE und nicht geeignet zur Erfüllung von SBCE-Pflichten oder NDC-Zielen.',
  checkout_how_verified: 'Wie Ihre Kompensation überprüft wird',
  checkout_partner_info: 'Informationen zum Partner',
  checkout_supplier: 'Gutschrift-Anbieter: BR Carbon',
  checkout_verra_label: 'Credits aus dem Projekt Brazilian Amazon REDD+ APD',
  checkout_verified_title: 'Verifizierte Gutschriften, vollständig offengelegt',
  checkout_cycle_details: 'Carbon Pocket ist nicht von Verra zertifiziert oder empfohlen.',
  checkout_cobenefit: 'Angaben zu Ko-Benefits sind die vom Projektentwickler veröffentlichten.',
  checkout_standard_supplier: 'Verra ist der Zertifizierungsstandard der Gutschriften. BR Carbon ist der Anbieter der Gutschriften.',
  checkout_check_emissions: 'Geschätzte Emissionen: auf Basis Ihrer Angaben, mit IEA-2025-Stromfaktoren, DEFRA- und EPA-Verkehrsfaktoren, ICAO-Luftfahrtdaten, IPCC-Leitlinien für Haushaltsenergie und Poore & Nemecek (2018) für Lebensmittel. Scope-Logik des GHG Protocol für Einzelpersonen angepasst. Dies ist eine Schätzung, kein offizielles Inventar.',
  checkout_check_credits: 'Gutschriften: Brazilian Amazon REDD+ APD-Projekt, Verra-VCS-Projekt-ID 2551.',
  checkout_check_retirement: 'Gutschriften werden nach Prüfung gebündelt stillgelegt und jährlich veröffentlicht.',
  checkout_check_integrity: 'Integrität: jede Serie wird einmal stillgelegt und kann nicht weiterverkauft werden. Carbon Pocket erhebt keinen Anspruch auf die Gutschriften für eigene Rechnung. Die Gutschriften weisen keine entsprechende Anpassung auf und können von Regierungen nicht auf ihre NDC-Ziele angerechnet werden.',
  checkout_check_standard: 'Standardstatus: Verra ist der Zertifizierungsstandard der Gutschriften. Carbon Pocket ist weder von Verra noch von BR Carbon zertifiziert, empfohlen oder geprüft.'
};

translations.it = {
  ...translations.en,
  checkout_what_buying: 'Che cosa stai acquistando',
  checkout_buying_fixed: 'Questo compensa [KG] kg CO2e con crediti REDD+ certificati Verra VCS, sostenendo le comunità locali e la conservazione. Compensazione, non riduzione: le tue emissioni continuano. I crediti vengono ritirati in lotti e pubblicati ogni anno. Non è un inventario ufficiale, non è un CRVE e non serve a rispettare gli obblighi del SBCE né gli obiettivi NDC.',
  checkout_buying_monthly: 'Questo compensa [KG] kg CO2e della tua impronta mensile stimata con crediti REDD+ certificati Verra VCS, sostenendo le comunità locali e la conservazione. Compensazione, non riduzione: le tue emissioni continuano. I crediti vengono ritirati in lotti e pubblicati ogni anno. Non è un inventario ufficiale, non è un CRVE e non serve a rispettare gli obblighi del SBCE né gli obiettivi NDC.',
  checkout_how_verified: 'Come viene verificata la tua compensazione',
  checkout_partner_info: 'Informazioni sul partner',
  checkout_supplier: 'Fornitore dei crediti: BR Carbon',
  checkout_verra_label: 'Crediti del progetto Brazilian Amazon REDD+ APD',
  checkout_verified_title: 'Crediti verificati, informazioni complete',
  checkout_cycle_details: 'Carbon Pocket non è certificato né approvato da Verra.',
  checkout_cobenefit: 'Le informazioni sui co-benefici sono quelle pubblicate dallo sviluppatore del progetto.',
  checkout_standard_supplier: 'Verra è lo standard di certificazione dei crediti. BR Carbon è il fornitore dei crediti.',
  checkout_check_emissions: "Emissioni stimate: in base ai tuoi dati, con fattori elettrici IEA 2025, fattori di trasporto DEFRA ed EPA, dati aeronautici ICAO, Linee guida IPCC per l'energia domestica e Poore & Nemecek (2018) per il cibo. Logica degli scope del GHG Protocol adattata agli individui. È una stima, non un inventario ufficiale.",
  checkout_check_credits: 'Crediti: progetto Brazilian Amazon REDD+ APD, ID progetto Verra VCS 2551.',
  checkout_check_retirement: 'I crediti vengono ritirati in lotti collettivi e pubblicati ogni anno dopo la verifica.',
  checkout_check_integrity: 'Integrità: ogni serie viene ritirata una sola volta e non può essere rivenduta. Carbon Pocket non rivendica i crediti per sé. I crediti non hanno una rettifica corrispondente e i governi non possono contabilizzarli per i loro NDC.',
  checkout_check_standard: 'Stato dello standard: Verra è lo standard di certificazione dei crediti. Carbon Pocket non è certificato, approvato o verificato da Verra o BR Carbon.'
};

translations.zh = {
  ...translations.en,
  checkout_what_buying: '您正在购买什么',
  checkout_buying_fixed: '本次使用经 Verra VCS 认证的 REDD+ 碳信用额补偿 [KG] kg CO2e，并支持当地社区和自然保护。补偿而非减排：排放仍会发生。碳信用额按批次注销并每年公布。这不是官方清单，不是 CRVE，也不适用于履行 SBCE 义务或 NDC 目标。',
  checkout_buying_monthly: '本次使用经 Verra VCS 认证的 REDD+ 碳信用额补偿您月度估算足迹中的 [KG] kg CO2e，并支持当地社区和自然保护。补偿而非减排：排放仍会发生。碳信用额按批次注销并每年公布。这不是官方清单，不是 CRVE，也不适用于履行 SBCE 义务或 NDC 目标。',
  checkout_how_verified: '您的补偿如何被核实',
  checkout_partner_info: '合作伙伴信息',
  checkout_supplier: '信用额供应商：BR Carbon',
  checkout_verra_label: 'Brazilian Amazon REDD+ APD 项目的碳信用',
  checkout_verified_title: '经核证的信用额，信息完整公开',
  checkout_cycle_details: 'Carbon Pocket 未获 Verra 认证或背书。',
  checkout_cobenefit: '共同效益信息以项目开发者公布的内容为准。',
  checkout_standard_supplier: 'Verra 是信用额的认证标准。BR Carbon 是信用额供应商。',
  checkout_check_emissions: '估算排放：基于您提供的数据，采用 IEA 2025 电力因子、DEFRA 和 EPA 交通因子、ICAO 航空数据、IPCC 家庭能源指南以及 Poore & Nemecek (2018) 食品数据。GHG Protocol 的范围逻辑已针对个人调整。这是估算，并非官方清单。',
  checkout_check_credits: '碳信用额：Brazilian Amazon REDD+ APD 项目，Verra VCS 项目编号 2551。',
  checkout_check_retirement: '碳信用额经核实后分批注销并每年公布。',
  checkout_check_integrity: '完整性：每个序列仅注销一次，不可转售。Carbon Pocket 不为自身主张这些信用额。这些信用额没有相应调整，政府不能将其计入 NDC。',
  checkout_check_standard: '标准状态：Verra 是信用额的认证标准。Carbon Pocket 未获 Verra 或 BR Carbon 的认证、背书或审计。'
};

translations.ja = {
  ...translations.en,
  checkout_what_buying: '購入内容',
  checkout_buying_fixed: 'Verra VCS 認証 REDD+ クレジットを使用して [KG] kg CO2e を補償し、地域社会と自然保護を支援します。削減ではなく補償です。排出は続きます。クレジットはまとめて償却され、毎年公開されます。公式インベントリではなく、CRVE でもなく、SBCE の義務や NDC 目標の達成には使用できません。',
  checkout_buying_monthly: '推定月間フットプリントのうち [KG] kg CO2e を Verra VCS 認証 REDD+ クレジットで補償し、地域社会と自然保護を支援します。削減ではなく補償です。排出は続きます。クレジットはまとめて償却され、毎年公開されます。公式インベントリではなく、CRVE でもなく、SBCE の義務や NDC 目標の達成には使用できません。',
  checkout_how_verified: '補償の検証方法',
  checkout_partner_info: 'パートナー情報',
  checkout_supplier: 'クレジット供給者：BR Carbon',
  checkout_verra_label: 'Brazilian Amazon REDD+ APD プロジェクトのクレジット',
  checkout_verified_title: '検証済みクレジットの情報を公開',
  checkout_cycle_details: 'Carbon Pocket は Verra による認証や推奨を受けていません。',
  checkout_cobenefit: 'コベネフィット情報はプロジェクト開発者が公表した内容です。',
  checkout_standard_supplier: 'Verra はクレジットの認証基準です。BR Carbon はクレジットの供給者です。',
  checkout_check_emissions: '推定排出量：入力内容に基づき、IEA 2025 の電力係数、DEFRA および EPA の交通係数、ICAO の航空データ、IPCC ガイドラインの家庭エネルギー、Poore & Nemecek (2018) の食品データを使用しています。GHG Protocol のスコープ論理を個人向けに適用。これは推定であり、公式インベントリではありません。',
  checkout_check_credits: 'クレジット：Brazilian Amazon REDD+ APD プロジェクト、Verra VCS プロジェクト ID 2551。',
  checkout_check_retirement: 'クレジットは検証後にまとめて償却され、毎年公開されます。',
  checkout_check_integrity: '完全性：各シリアルは 1 回だけ償却され、再販できません。Carbon Pocket は自己の勘定でクレジットを主張しません。クレジットには対応する調整がなく、政府が NDC に算入することはできません。',
  checkout_check_standard: '基準の状況：Verra はクレジットの認証基準です。Carbon Pocket は Verra または BR Carbon による認証、推奨、監査を受けていません。'
};

translations.ko = {
  ...translations.en,
  checkout_what_buying: '구매하시는 내용',
  checkout_buying_fixed: 'Verra VCS 인증 REDD+ 크레딧으로 [KG] kg CO2e를 보상하며 지역사회와 자연 보전을 지원합니다. 감축이 아닌 보상이며 배출은 계속 발생합니다. 크레딧은 묶음으로 소각되고 매년 공개됩니다. 공식 인벤토리나 CRVE가 아니며, SBCE 의무나 NDC 목표 이행에 사용할 수 없습니다.',
  checkout_buying_monthly: '추정 월간 발자국 중 [KG] kg CO2e를 Verra VCS 인증 REDD+ 크레딧으로 보상하며 지역사회와 자연 보전을 지원합니다. 감축이 아닌 보상이며 배출은 계속 발생합니다. 크레딧은 묶음으로 소각되고 매년 공개됩니다. 공식 인벤토리나 CRVE가 아니며, SBCE 의무나 NDC 목표 이행에 사용할 수 없습니다.',
  checkout_how_verified: '보상 검증 방법',
  checkout_partner_info: '파트너 정보',
  checkout_supplier: '크레딧 공급자: BR Carbon',
  checkout_verra_label: 'Brazilian Amazon REDD+ APD 프로젝트 크레딧',
  checkout_verified_title: '검증된 크레딧 정보 공개',
  checkout_cycle_details: 'Carbon Pocket은 Verra의 인증이나 보증을 받지 않았습니다.',
  checkout_cobenefit: '공편익 정보는 프로젝트 개발자가 공개한 내용입니다.',
  checkout_standard_supplier: 'Verra는 크레딧의 인증 기준입니다. BR Carbon은 크레딧 공급자입니다.',
  checkout_check_emissions: '추정 배출량: 입력값을 바탕으로 IEA 2025 전력 계수, DEFRA 및 EPA 교통 계수, ICAO 항공 데이터, IPCC 가정용 에너지 지침, Poore & Nemecek(2018) 식품 데이터를 사용했습니다. GHG Protocol 스코프 논리를 개인에 맞게 적용했습니다. 이는 추정치이며 공식 인벤토리가 아닙니다.',
  checkout_check_credits: '크레딧: Brazilian Amazon REDD+ APD 프로젝트, Verra VCS 프로젝트 ID 2551.',
  checkout_check_retirement: '크레딧은 검증 후 묶음으로 소각되며 매년 공개됩니다.',
  checkout_check_integrity: '무결성: 각 시리얼은 한 번만 소각되며 재판매할 수 없습니다. Carbon Pocket은 자체 계정으로 크레딧을 주장하지 않습니다. 크레딧에는 상응 조정이 없으므로 정부가 NDC에 계상할 수 없습니다.',
  checkout_check_standard: '기준 상태: Verra는 크레딧의 인증 기준입니다. Carbon Pocket은 Verra 또는 BR Carbon의 인증, 보증, 감사를 받지 않았습니다.'
};

translations.ru = {
  ...translations.en,
  checkout_what_buying: 'Что вы покупаете',
  checkout_buying_fixed: 'Это компенсирует [KG] кг CO2e кредитами REDD+, сертифицированными по стандарту Verra VCS, поддерживая местные сообщества и охрану природы. Компенсация, а не сокращение: ваши выбросы продолжаются. Кредиты списываются общими пулами и публикуются ежегодно. Это не официальная инвентаризация, не CRVE и не подходит для выполнения обязательств SBCE или целей NDC.',
  checkout_buying_monthly: 'Это компенсирует [KG] кг CO2e из вашего расчётного месячного следа кредитами REDD+, сертифицированными по стандарту Verra VCS, поддерживая местные сообщества и охрану природы. Компенсация, а не сокращение: ваши выбросы продолжаются. Кредиты списываются общими пулами и публикуются ежегодно. Это не официальная инвентаризация, не CRVE и не подходит для выполнения обязательств SBCE или целей NDC.',
  checkout_how_verified: 'Как проверяется ваша компенсация',
  checkout_partner_info: 'Информация о партнёре',
  checkout_supplier: 'Поставщик кредитов: BR Carbon',
  checkout_verra_label: 'Кредиты проекта Brazilian Amazon REDD+ APD',
  checkout_verified_title: 'Проверенные кредиты с полным раскрытием',
  checkout_cycle_details: 'Carbon Pocket не сертифицирован и не одобрен Verra.',
  checkout_cobenefit: 'Информация о сопутствующих выгодах — та, что опубликована разработчиком проекта.',
  checkout_standard_supplier: 'Verra — стандарт сертификации кредитов. BR Carbon — поставщик кредитов.',
  checkout_check_emissions: 'Расчётные выбросы: на основе ваших данных, с коэффициентами электроэнергии IEA 2025, транспортными коэффициентами DEFRA и EPA, авиационными данными ICAO, руководствами IPCC по энергии домохозяйств и Poore & Nemecek (2018) для продуктов питания. Логика областей GHG Protocol адаптирована для частных лиц. Это оценка, а не официальная инвентаризация.',
  checkout_check_credits: 'Кредиты: проект Brazilian Amazon REDD+ APD, ID проекта Verra VCS 2551.',
  checkout_check_retirement: 'Кредиты списываются общими пулами и публикуются ежегодно после проверки.',
  checkout_check_integrity: 'Целостность: каждый серийный номер списывается один раз и не может быть перепродан. Carbon Pocket не заявляет права на кредиты для себя. Кредиты не имеют соответствующей корректировки, поэтому правительства не могут учитывать их в своих NDC.',
  checkout_check_standard: 'Статус стандарта: Verra — стандарт сертификации кредитов. Carbon Pocket не сертифицирован, не одобрен и не проверен Verra или BR Carbon.'
};

translations.ar = {
  ...translations.en,
  checkout_what_buying: 'ما الذي تشتريه',
  checkout_buying_fixed: 'هذا يعوّض [KG] كجم CO2e بأرصدة REDD+ معتمدة من معيار Verra VCS، مع دعم المجتمعات المحلية والحفاظ على الطبيعة. تعويض لا تخفيض: انبعاثاتك مستمرة. تُلغى الأرصدة في دفعات جماعية وتُنشر سنويًا. ليس جردًا رسميًا، وليس CRVE، ولا يصلح للامتثال لالتزامات SBCE أو أهداف NDC.',
  checkout_buying_monthly: 'هذا يعوّض [KG] كجم CO2e من بصمتك الشهرية المقدرة بأرصدة REDD+ معتمدة من معيار Verra VCS، مع دعم المجتمعات المحلية والحفاظ على الطبيعة. تعويض لا تخفيض: انبعاثاتك مستمرة. تُلغى الأرصدة في دفعات جماعية وتُنشر سنويًا. ليس جردًا رسميًا، وليس CRVE، ولا يصلح للامتثال لالتزامات SBCE أو أهداف NDC.',
  checkout_how_verified: 'كيف يتم التحقق من تعويضك',
  checkout_partner_info: 'معلومات الشريك',
  checkout_supplier: 'مورّد الأرصدة: BR Carbon',
  checkout_verra_label: 'أرصدة مشروع Brazilian Amazon REDD+ APD',
  checkout_verified_title: 'أرصدة موثقة مع إفصاح كامل',
  checkout_cycle_details: 'Carbon Pocket غير معتمد ولا مُزكّى من Verra.',
  checkout_cobenefit: 'معلومات الفوائد المشتركة هي ما ينشره مطوّر المشروع.',
  checkout_standard_supplier: 'Verra هو معيار اعتماد الأرصدة. BR Carbon هو مورّد الأرصدة.',
  checkout_check_emissions: 'الانبعاثات المقدرة: بناءً على بياناتك، باستخدام عوامل الكهرباء IEA 2025، وعوامل النقل DEFRA وEPA، وبيانات الطيران ICAO، وإرشادات IPCC لطاقة المنازل، وPoore & Nemecek (2018) للأغذية. منطق النطاقات في GHG Protocol مكيّف للأفراد. هذا تقدير وليس جردًا رسميًا.',
  checkout_check_credits: 'الأرصدة: مشروع Brazilian Amazon REDD+ APD، معرّف مشروع Verra VCS 2551.',
  checkout_check_retirement: 'تُلغى الأرصدة في دفعات جماعية وتُنشر سنويًا بعد التحقق.',
  checkout_check_integrity: 'السلامة: كل تسلسل يُلغى مرة واحدة ولا يمكن إعادة بيعه. لا تطالب Carbon Pocket بالأرصدة لحسابها الخاص. لا تحمل الأرصدة تعديلًا مقابلًا، لذا لا يمكن للحكومات احتسابها ضمن NDC.',
  checkout_check_standard: 'حالة المعيار: Verra هو معيار اعتماد الأرصدة. Carbon Pocket غير معتمد ولا مُزكّى ولا مدقق من Verra أو BR Carbon.'
};

translations.sv = {
  ...translations.en,
  checkout_what_buying: 'Vad du köper',
  checkout_buying_fixed: 'Detta kompenserar [KG] kg CO2e med Verra VCS-certifierade REDD+-krediter och stöder lokalsamhällen och naturskydd. Kompensation, inte minskning: dina utsläpp fortsätter. Krediterna dras in i samlade omgångar och publiceras årligen. Inte ett officiellt inventarium, inte ett CRVE och gäller inte för att uppfylla SBCE-krav eller NDC-mål.',
  checkout_buying_monthly: 'Detta kompenserar [KG] kg CO2e av ditt beräknade månadsavtryck med Verra VCS-certifierade REDD+-krediter och stöder lokalsamhällen och naturskydd. Kompensation, inte minskning: dina utsläpp fortsätter. Krediterna dras in i samlade omgångar och publiceras årligen. Inte ett officiellt inventarium, inte ett CRVE och gäller inte för att uppfylla SBCE-krav eller NDC-mål.',
  checkout_how_verified: 'Hur din kompensation verifieras',
  checkout_partner_info: 'Partnerinformation',
  checkout_supplier: 'Kreditleverantör: BR Carbon',
  checkout_verra_label: 'Krediter från projektet Brazilian Amazon REDD+ APD',
  checkout_verified_title: 'Verifierade krediter, fullständigt redovisade',
  checkout_cycle_details: 'Carbon Pocket är inte certifierat eller rekommenderat av Verra.',
  checkout_cobenefit: 'Information om mednyttor är den som projektutvecklaren publicerar.',
  checkout_standard_supplier: 'Verra är certifieringsstandarden för krediterna. BR Carbon är kreditleverantören.',
  checkout_check_emissions: 'Beräknade utsläpp: baserat på dina uppgifter, med IEA 2025 el-faktorer, DEFRA- och EPA-transportfaktorer, ICAO-flygdata, IPCC:s riktlinjer för hushållsenergi och Poore & Nemecek (2018) för livsmedel. GHG Protocol-scopelogik anpassad för individer. Detta är en uppskattning, inte ett officiellt inventarium.',
  checkout_check_credits: 'Krediter: Brazilian Amazon REDD+ APD-projektet, Verra VCS-projekt-ID 2551.',
  checkout_check_retirement: 'Krediterna dras in i samlade omgångar och publiceras årligen efter verifiering.',
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