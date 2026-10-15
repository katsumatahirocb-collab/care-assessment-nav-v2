/* ケアマネアセスメントナビ 質問マスタ v2
 * 元Excel「居宅 アセスメントシートR6～」4シートの構成を基準に作成。
 * easy: 利用者に自然に聞く主質問 / example: 「聞き方の例」で表示する補助質問。
 */
window.CAN = window.CAN || {};
(() => {
  const yesNoNA = ['あり','なし','該当なし'];
  const issueOptions = ['課題あり','課題なし','判断保留'];
  const ability3 = ['できる','要介助','できない','該当なし'];
  const assist4 = ['自立','見守り','一部介助','全介助','該当なし'];
  const judgmentHoldReasons = ['情報不足','本人から確認困難','家族確認待ち','他職種確認待ち','その他'];
  const unconfirmedReasons = ['本人から確認困難','家族不在','時間不足','情報なし','その他'];
  const sections = [];
  const add = (x) => sections.push(x);
  const q = (key,label,easy,type='text',extra={}) => ({key,label,easy,type,...extra});

  add({id:'p1_reception',page:1,title:'受付・計画作成の状況',questions:[
    q('planStatus','計画の作成の状況','今回のアセスメントは初回ですか、更新ですか？','radio',{options:['初回','更新'],important:true}),
    q('assessmentReason','アセスメント理由','今回はどのような理由でアセスメントを行いますか？','select',{options:['初回','更新','状態変化','退院後','その他'],important:true}),
    q('assessmentReasonNote','アセスメント理由（補足）','その理由について、補足することはありますか？','textarea',{showIf:{key:'assessmentReason',equals:'その他'}}),
    q('receptionDate','初回受付日','最初に相談を受けた日はいつですか？','date'),
    q('receptionist','対応者','最初に対応した方を記録してください。'),
    q('receptionMethod','受付方法','相談はどのような方法で受けましたか？','select',{options:['電話','来訪','訪問','文書','メール・オンライン','その他']}),
    q('consultationReason','相談理由','今回の相談のきっかけや理由を教えてください。','textarea',{important:true,example:'誰から、どのような困りごと・きっかけで相談があったかを確認します。'})
  ]});

  add({id:'p1_basic',page:1,title:'基本情報',userScope:true,questions:[
    q('kana','フリガナ','お名前のフリガナを確認します。'),
    q('name','利用者氏名','お名前を確認します。','text',{important:true}),
    q('sex','性別','性別を確認します。','select',{options:['男','女','その他','回答しない']}),
    q('dob','生年月日','生年月日を確認します。','date',{important:true}),
    q('address','住所','現在のお住まいを確認します。','textarea',{important:true}),
    q('phone','電話番号','連絡先の電話番号を確認します。','text'),
    q('careLevel','介護度','現在の要介護・要支援度を確認します。','select',{options:['申請中','支援１','支援２','介護１','介護２','介護３','介護４','介護５','非該当','未申請'],important:true})
  ]});

  add({id:'p1_family',page:1,title:'家族構成・緊急連絡先',special:'family'});

  add({id:'p1_life',page:1,title:'これまでの生活と現在の生活',questions:[
    q('pastLife','これまでの生活','これまで、どのような生活をしてこられましたか？','textarea',{important:true,example:'お仕事、家庭での役割、趣味、習慣、地域との関わりなど、本人らしさが分かることを伺います。'}),
    q('currentLife','現在の生活','今は普段、どのように過ごされていますか？','textarea',{important:true,example:'起きている時間、過ごす場所、介護を受けている場面などを確認します。'})
  ]});

  add({id:'p1_intent',page:1,title:'本人・家族等の主訴・意向',questions:[
    q('userIntent','利用者の主訴・意向','これから、どのように暮らしていきたいですか？','textarea',{important:true,example:'今の生活で続けたいこと、できるようになりたいこと、困っていることなどを伺います。'}),
    q('familyIntent','家族等の主訴・意向','ご家族として、これからどのようにしていきたいと考えていますか？','textarea',{important:true,example:'本人にどう過ごしてほしいか、ご家族が困っていることや希望を伺います。'})
  ]});

  add({id:'p1_insurance',page:1,title:'保険・認定・社会保障制度',userScope:true,questions:[
    q('insuredNo','介護保険 被保険者番号','介護保険の被保険者番号を確認します。'),
    q('limitAmount','限度額','支給限度額を記録します。'),
    q('burdenRatio','介護保険 負担割合','介護保険の負担割合を確認します。','select',{options:['1割','2割','3割','不明']}),
    q('certDate','認定年月日','認定年月日を確認します。','date'),
    q('validFrom','認定有効期間（開始）','認定の有効期間の開始日を確認します。','date'),
    q('validTo','認定有効期間（終了）','認定の有効期間の終了日を確認します。','date'),
    q('committeeOpinion','審査会の意見','審査会の意見があれば記録します。','textarea'),
    q('medicalInsurance','医療保険','加入している医療保険を確認します。','select',{options:['後期高齢者','社会保険','国民健康保険','その他','不明']}),
    q('medicalBurden','医療保険 負担割合','医療費の負担割合を確認します。','select',{options:['1割','2割','3割','その他','不明']}),
    q('medicalId','医療保険 記号・番号','必要に応じて医療保険の記号・番号を記録します。'),
    q('pension','年金','年金等の社会保障制度の利用状況を確認します。','multiselect',{options:['国民年金','厚生年金','共済年金','老齢基礎','遺族基礎','障害基礎','恩給','その他']}),
    q('publicAssistance','生活保護','生活保護の利用状況を確認します。','select',{options:['あり','なし','不明']}),
    q('disabilitySystems','障害福祉等','障害者手帳などの利用状況を確認します。','multiselect',{options:['身体障害者手帳','療育手帳','精神障害者保健福祉手帳','その他']})
  ]});

  add({id:'p1_resources',page:1,title:'現在利用している支援・社会資源',special:'resources'});

  add({id:'p1_independence',page:1,title:'日常生活自立度',questions:[
    q('independenceDisability','障害高齢者の日常生活自立度','障害高齢者の日常生活自立度を選択してください。','select',{options:['自立','J1','J2','A1','A2','B1','B2','C1','C2','不明'],important:true,descriptions:{'J1':'何らかの障害等があるが日常生活はほぼ自立し、交通機関等を利用して外出する。','J2':'何らかの障害等があるが日常生活はほぼ自立し、隣近所へなら外出する。','A1':'屋内生活は概ね自立だが介助なしには外出せず、介助により外出し日中はほとんどベッドから離れて生活する。','A2':'外出頻度が少なく、日中も寝たり起きたりの生活。','B1':'屋内生活に何らかの介助を要し、車いすに移乗して食事・排泄はベッドから離れて行う。','B2':'介助により車いすに移乗する。','C1':'1日中ベッド上で過ごし、自力で寝返りをうつ。','C2':'1日中ベッド上で過ごし、自力では寝返りもうたない。'}}),
    q('independenceDementia','認知症高齢者の日常生活自立度','認知症高齢者の日常生活自立度を選択してください。','select',{options:['自立','Ⅰ','Ⅱa','Ⅱb','Ⅲa','Ⅲb','Ⅳ','M','不明'],important:true,descriptions:{'Ⅰ':'何らかの認知症を有するが、日常生活は家庭内・社会的にほぼ自立。','Ⅱa':'家庭外で日常生活に支障を来す症状・行動や意思疎通の困難さが多少みられる。','Ⅱb':'家庭内でも日常生活に支障を来す症状・行動や意思疎通の困難さが多少みられる。','Ⅲa':'日中を中心に、日常生活に支障を来す症状・行動や意思疎通の困難さがみられ介護を必要とする。','Ⅲb':'夜間を中心に同様の状態がみられ介護を必要とする。','Ⅳ':'日常生活に支障を来す症状・行動や意思疎通の困難さが頻繁にみられ、常に介護を必要とする。','M':'著しい精神症状や問題行動等がみられ、専門医療を必要とする。'}}),
    q('independenceSource','判定した書類','自立度の判定に参照した書類を選択してください。','select',{options:['認定調査票','主治医意見書','その他','なし']}),
    q('independenceDate','認定日','参照した認定日等を記録します。','date'),
    q('independenceCM','CMから見た自立度','ケアマネジャーから見た自立度を記録します。','textarea')
  ]});

  add({id:'p2_health',page:2,title:'健康状態',judgment:true,questions:[
    q('conditionNow','最近の体調','最近、体調はいかがですか？','textarea',{important:true,example:'以前と比べて変わったこと、疲れやすさ、息苦しさ、発熱などがないか伺います。'}),
    q('symptoms','気になる症状','今、体のことで気になっている症状はありますか？','textarea',{important:true}),
    q('history','既往歴・傷病名・症状等','これまでにかかった病気や、現在治療している病気を教えてください。','textarea',{important:true}),
    q('height','身長（cm）','身長を確認します。','number',{min:0,max:250}),
    q('weight','体重（kg）','体重を確認します。','number',{min:0,max:400}),
    q('bmi','BMI','BMIは身長と体重から自動計算します。','computed'),
    q('bloodPressure','血圧','最近の血圧が分かれば記録します。'),
    q('pain','痛み','痛いところはありますか？','select',{options:yesNoNA}),
    q('painNote','痛み（詳細）','どこが、どのように痛みますか？','textarea',{showIf:{key:'pain',equals:'あり'}}),
    q('skin','皮膚状況','皮膚のことで気になることはありますか？','textarea'),
    q('pressureSore','褥瘡','床ずれ（褥瘡）はありますか？','select',{options:yesNoNA}),
    q('healthNotes','特記事項','健康状態について、ほかに留意することを記録します。','textarea')
  ]});

  add({id:'p2_visit',page:2,title:'受診状況（歯科医含む）',judgment:true,special:'medical'});

  add({id:'p2_medication',page:2,title:'服薬に関する状況',judgment:false,special:'medications',afterQuestions:[
    q('healthUnderstanding','自身の健康に対する理解や意識の状況','ご自身の病気や体の状態について、どのように理解されていますか？','textarea',{important:true,example:'医師からどのように説明を受けているか、治療や健康管理を本人がどう考えているかを確認します。'})
  ]});

  const adlItems = [
    ['paralysis','麻痺','体に動かしにくいところや麻痺はありますか？',['なし','あり','該当なし']],
    ['contracture','拘縮','関節が固く、動かしにくいところはありますか？',['なし','あり','該当なし']],
    ['rolling','寝返り','ベッドや布団で寝返りはご自身でできますか？',ability3],
    ['situp','起き上がり','ベッドや布団から起き上がるときは、お一人でできますか？',ability3],
    ['standup','立ち上がり','椅子やベッドから立ち上がるときは、お一人でできますか？',ability3],
    ['sitting','座位保持','座った姿勢を保つことはできますか？',ability3],
    ['standing','立位保持','立った姿勢を保つことはできますか？',ability3],
    ['stairs','階段昇降','階段の上り下りはできますか？',ability3],
    ['transfer','移乗','ベッドから椅子や車いすへ移るときは、どのようにされていますか？',ability3],
    ['walking','歩行','普段、歩くことはできますか？',ability3],
    ['grooming','整容','洗顔や歯磨き、身だしなみを整えることはできますか？',ability3],
    ['dressing','更衣','服の着替えはどのようにされていますか？',assist4],
    ['bathing','入浴','普段、お風呂はどのようにされていますか？',assist4],
    ['eating','食事','食事を食べる動作はどのようにされていますか？',assist4],
    ['toilet','トイレ動作','トイレでの一連の動作はどのようにされていますか？',assist4]
  ];
  const adlQs=[];
  adlItems.forEach(([key,label,easy,opts])=>{
    adlQs.push(q(`adl_${key}`,label,easy,'select',{options:opts,important:['walking','bathing','eating','toilet'].includes(key)}));
    adlQs.push(q(`adl_${key}_part`,`${label}：介助が必要な動作`,`${label}について、どの動作に手伝いが必要ですか？`,'text',{showIf:{key:`adl_${key}`,notIn:['できる','自立','なし','該当なし','']}}));
    adlQs.push(q(`adl_${key}_degree`,`${label}：介助の程度`,`${label}について、どの程度の手伝いが必要ですか？`,'select',{options:['見守り','一部介助','全介助','その他'],showIf:{key:`adl_${key}`,notIn:['できる','自立','なし','該当なし','']}}));
  });
  adlQs.push(q('adl_moveMethod','移動方法','普段はどの方法で移動していますか？','multiselect',{options:['独歩','杖','歩行器','車いす','その他'],important:true}));
  adlQs.push(q('adl_bathingParts','入浴：介助が必要な動作','お風呂では、どの動作に手伝いが必要ですか？','multiselect',{options:['浴室までの移動','脱衣','浴室への出入り','浴槽またぎ','洗身','洗髪','立ち上がり','着衣','その他'],showIf:{key:'adl_bathing',notIn:['自立','該当なし','']}}));
  adlQs.push(q('adl_bathingFall','入浴：転倒歴・不安','浴槽の出入りなどで転んだことや、転びそうで怖いことはありますか？','select',{options:['あり','なし','不明'],important:true,showIf:{key:'adl_bathingParts',contains:'浴槽またぎ'}}));
  add({id:'p2_adl',page:2,title:'ADL',judgment:true,questions:adlQs});

  const iadlItems=[
    ['cooking','調理','食事の準備や調理は、普段どのようにされていますか？'],
    ['cleaning','掃除','お部屋の掃除は、普段どのようにされていますか？'],
    ['laundry','洗濯','洗濯は、普段どのようにされていますか？'],
    ['shopping','買い物','普段のお買い物は、どのようにされていますか？'],
    ['medManagement','服薬管理','お薬の準備や管理は、ご自身でされていますか？'],
    ['money','金銭管理','お金の出し入れや支払いは、ご自身でされていますか？'],
    ['phone','電話','電話をかけたり受けたりすることはできますか？'],
    ['transport','交通機関の利用','電車やバス、タクシーなどは利用されていますか？'],
    ['driving','車の運転','車の運転はされていますか？']
  ];
  const iadlQs=[];
  iadlItems.forEach(([key,label,easy])=>{
    const opts = key==='transport' ? ['している','一部支援','要介助','していない','該当なし'] : key==='driving' ? ['している','していない','できない','該当なし'] : ['できる','一部介助','要介助','できない','該当なし'];
    iadlQs.push(q(`iadl_${key}`,label,easy,'select',{options:opts,important:['medManagement','money'].includes(key)}));
    iadlQs.push(q(`iadl_${key}_supporter`,`${label}：支援者`,`${label}について、主に誰が支援していますか？`,'text',{showIf:{key:`iadl_${key}`,notIn:['できる','している','該当なし','']}}));
    iadlQs.push(q(`iadl_${key}_part`,`${label}：支援している部分`,`${label}について、どの部分を支援していますか？`,'text',{showIf:{key:`iadl_${key}`,notIn:['できる','している','該当なし','']}}));
  });
  add({id:'p2_iadl',page:2,title:'IADL',judgment:true,questions:iadlQs});

  add({id:'p3_cognition',page:3,title:'認知機能や判断能力',judgment:true,questions:[
    q('cog_memory','記憶障害','最近、物忘れで困ることはありますか？','select',{options:['なし','時々','あり','不明'],important:true,example:'同じ話を繰り返す、約束や服薬を忘れる、物を置いた場所が分からなくなる等がないか確認します。'}),
    q('cog_orientation','見当識','時間や場所が分からなくなることはありますか？','select',{options:['なし','時々','あり','不明'],important:true}),
    q('cog_decision','意思決定・判断能力','普段の生活の中で、ご自身で決めたり判断したりすることはできますか？','select',{options:['できる','限定でできる','できない','不明'],important:true}),
    q('cog_scene','困る場面','物忘れや判断のことで、どのような場面で困ることがありますか？','textarea',{showIfAny:[{key:'cog_memory',in:['時々','あり']},{key:'cog_orientation',in:['時々','あり']},{key:'cog_decision',in:['限定でできる','できない','不明']}]}) ,
    q('cog_frequency','頻度','そのようなことは、どのくらいの頻度でありますか？','select',{options:['ほぼ毎日','週に数回','週1回程度','月に数回','まれ','不明'],showIfAny:[{key:'cog_memory',in:['時々','あり']},{key:'cog_orientation',in:['時々','あり']},{key:'cog_decision',in:['限定でできる','できない','不明']}]}),
    q('cog_diagnosis','認知症の診断','認知症の診断はありますか？','select',{options:['あり','なし','不明']}),
    q('cog_aphasia','失語','言葉を話したり理解したりすることに障害はありますか？','select',{options:yesNoNA}),
    q('cog_agnosia','失認','物や人を認識することに障害はありますか？','select',{options:yesNoNA}),
    q('cog_apraxia','失行','目的に合った動作を行うことに障害はありますか？','select',{options:yesNoNA}),
    q('cog_bpsd','行動・心理症状','気になる行動や心理症状はありますか？','multiselect',{options:['被害的','作話','感情が不安定','暴力・攻撃性','大声を出す','介護に抵抗','1人で出たがる','収集癖','物や衣類を壊す','不潔行為','話がまとまらない','徘徊','昼夜逆転','独り言・一人笑い','危険行為','なし']}),
    q('cog_cause','原因疾患等','認知機能・判断能力に影響していると考えられる疾患や状況があれば記録します。','textarea'),
    q('cog_other','その他','認知機能や判断能力について、ほかに気になることを記録します。','textarea')
  ]});

  add({id:'p3_communication',page:3,title:'コミュニケーションにおける理解と表出',judgment:true,questions:[
    q('comm_hearing','聴力','普段の会話は聞き取れていますか？','select',{options:['支障ない','聞き取りにくい','殆ど聞こえない','不明'],important:true}),
    q('comm_understanding','理解','話しかけた内容は理解できていますか？','select',{options:['できる','限定でできる','できない','不明'],important:true}),
    q('comm_expression','表出・意思伝達','ご自身の希望や考えを相手に伝えることはできますか？','select',{options:['できる','限定でできる','できない','不明'],important:true}),
    q('comm_vision','視力','普段、見ることに支障はありますか？','select',{options:['支障ない','よく見えない','殆ど見えない','不明']}),
    q('comm_glasses','眼鏡','眼鏡を使用していますか？','select',{options:['使用','不使用','該当なし']}),
    q('comm_hearingAid','補聴器','補聴器を使用していますか？','select',{options:['使用','不使用','該当なし'],showIf:{key:'comm_hearing',notIn:['支障ない','']}}),
    q('comm_method','意思疎通の方法','普段、どのような方法だと意思疎通しやすいですか？','multiselect',{options:['通常の会話','大きな声','筆談','ジェスチャー','コミュニケーション機器','その他']}),
    q('comm_other','その他','コミュニケーションについて、ほかに留意することを記録します。','textarea')
  ]});

  add({id:'p3_rhythm',page:3,title:'生活リズム',judgment:true,questions:[
    q('rhythm_day','1日の過ごし方','普段、1日をどのように過ごしていますか？','textarea',{important:true,example:'まず自由に話してもらい、下の起床・就寝・食事・昼寝・外出など、抜けている時間帯だけ補足確認します。'}),
    q('rhythm_wake','起床時間','普段は何時ごろ起きますか？','time'),
    q('rhythm_sleep','就寝時間','普段は何時ごろ寝ますか？','time'),
    q('rhythm_meals','食事時間','食事は何時ごろとっていますか？'),
    q('rhythm_nap','昼寝・休息','日中、昼寝や休息をとりますか？'),
    q('rhythm_outing','外出時間・頻度','外出する日は、どのくらいの時間・頻度ですか？'),
    q('rhythm_rest','休息・睡眠の状況等','睡眠や休息について気になることはありますか？','textarea'),
    q('rhythm_other','その他','生活リズムについて、ほかに記録することがありますか？','textarea')
  ]});

  add({id:'p3_elimination',page:3,title:'排泄の状況',judgment:true,questions:[
    q('elim_place','排泄場所','普段、排泄はどこでされていますか？','select',{options:['トイレ','ポータブルトイレ','尿器','紙パンツ・おむつ等','その他'],important:true}),
    q('elim_method','排泄方法','排泄時の介助は必要ですか？','select',{options:['自立','見守り','一部介助','全介助','該当なし'],important:true}),
    q('elim_urineUrge','尿意','尿意は分かりますか？','select',{options:['あり','なし','不明']}),
    q('elim_urineLeak','尿失禁','尿失禁はありますか？','select',{options:['あり','なし','不明'],important:true}),
    q('elim_stoolUrge','便意','便意は分かりますか？','select',{options:['あり','なし','不明']}),
    q('elim_stoolLeak','便失禁','便失禁はありますか？','select',{options:['あり','なし','不明'],important:true}),
    q('elim_night','夜間の排泄','夜間にトイレへ行くことはありますか？','select',{options:['なし','1回','2回','3回以上','不明'],important:true}),
    q('elim_aftercare','後始末の状況等','排泄後の衣類操作や後始末はどのようにされていますか？','textarea'),
    q('elim_devices','使用しているもの','排泄で使用しているものを選択してください。','multiselect',{options:['尿器','紙パンツ','紙おむつ','パッド','カテーテル','ストマ','ポータブルトイレ','その他']}),
    q('elim_other','その他（排泄リズム・内容等）','排泄のリズムや内容について、ほかに気になることはありますか？','textarea')
  ]});

  add({id:'p3_hygiene',page:3,title:'清潔の保持に関する状況',judgment:true,questions:[
    q('hyg_bathing','入浴','入浴はどのようにされていますか？','textarea',{important:true}),
    q('hyg_hair','洗髪','洗髪はどのようにされていますか？','textarea'),
    q('hyg_grooming','整容','身だしなみを整えることはどのようにされていますか？','textarea'),
    q('hyg_dressing','更衣','着替えはどのようにされていますか？','textarea'),
    q('hyg_assistPart','介助が必要な動作','清潔保持について、どの動作に介助が必要ですか？','text',{showIf:{key:'hyg_bathing',notIn:['','自立','問題なし']}}),
    q('hyg_assistDegree','介助の程度','どの程度の介助が必要ですか？','select',{options:['見守り','一部介助','全介助','その他'],showIf:{key:'hyg_assistPart',notIn:['']}}),
    q('hyg_skinNails','皮膚や爪の状況','皮膚や爪の清潔状態や異常について記録します。','textarea'),
    q('hyg_bedding','寝具や衣類の状況','寝具や衣類の汚れ、交換頻度などを記録します。','textarea'),
    q('hyg_other','その他','清潔保持について、ほかに留意することを記録します。','textarea')
  ]});

  add({id:'p4_oral',page:4,title:'口腔内の状況',judgment:true,questions:[
    q('oral_teeth','歯の状態','歯の状態で気になることはありますか？','textarea',{important:true}),
    q('oral_remaining','残歯（本）','残っている歯の本数が分かれば記録します。','number',{min:0,max:40}),
    q('oral_missing','欠損（本）','欠損している歯の本数が分かれば記録します。','number',{min:0,max:40}),
    q('oral_denture','義歯の状況','入れ歯を使っていますか？状態はいかがですか？','textarea',{important:true}),
    q('oral_dry','口の乾燥','口の中が乾くことはありますか？','select',{options:yesNoNA,important:true}),
    q('oral_pain','痛み・違和感','口の中に痛みや違和感はありますか？','select',{options:yesNoNA,important:true}),
    q('oral_dirt','汚れ','口の中の汚れはありますか？','select',{options:yesNoNA}),
    q('oral_tongue','舌苔','舌苔はありますか？','select',{options:yesNoNA}),
    q('oral_odor','口臭','口臭はありますか？','select',{options:yesNoNA}),
    q('oral_swelling','腫れ','腫れはありますか？','select',{options:yesNoNA}),
    q('oral_bleeding','出血','出血はありますか？','select',{options:yesNoNA}),
    q('oral_bite','かみ合わせ','かみ合わせについて気になることはありますか？','textarea'),
    q('oral_care','口腔ケアの状況','歯磨きなどの口腔ケアはどのようにされていますか？','textarea')
  ]});

  add({id:'p4_diet',page:4,title:'食事摂取の状況',judgment:true,questions:[
    q('diet_appetite','食欲','食欲はいかがですか？','select',{options:['良好','普通','低下','不明'],important:true}),
    q('diet_amount','食事量','普段、どのくらい食べられていますか？','text',{important:true}),
    q('diet_form','食形態','普段、どのような食事形態ですか？','select',{options:['常食','普通食','軟飯','粥','きざみ','ミキサー','治療食','経管','PEG','その他'],important:true}),
    q('diet_times','回数','食事は1日何回ですか？','select',{options:['1回/日','2回/日','3回/日','その他']}),
    q('diet_content','内容','食事内容について記録します。'),
    q('diet_choke','むせの有無','食事や水分でむせることはありますか？','select',{options:['むせあり','むせなし','不明'],important:true}),
    q('diet_chokeFreq','むせの頻度','むせはどのくらいの頻度でありますか？','select',{options:['毎回','1日数回','週に数回','まれ','不明'],showIf:{key:'diet_choke',equals:'むせあり'}}),
    q('diet_water','水分量','水分は十分にとれていますか？','select',{options:['確保できている','やや少ない','不足','不明']}),
    q('diet_restriction','食事制限','食事制限はありますか？','textarea'),
    q('diet_needed','必要な食事の量（栄養・水分等）','必要な栄養・水分量について分かることを記録します。','textarea'),
    q('diet_preparer','その他（準備する人等）','食事を準備する方や食事時の支援について記録します。','textarea')
  ]});

  add({id:'p4_social',page:4,title:'社会とのかかわり',judgment:true,questions:[
    q('social_outing','外出頻度','普段、どのくらい外出されていますか？','select',{options:['ほぼ毎日','週に数回','週1回程度','月に数回','ほとんど外出しない','不明'],important:true}),
    q('social_people','交流相手','普段、どなたと交流がありますか？','multiselect',{options:['同居家族','別居家族','友人','近隣住民','地域の人','サービス利用時の人','その他','特になし'],important:true}),
    q('social_activities','参加している活動','参加している活動はありますか？','multiselect',{options:['地域活動','趣味活動','仕事','ボランティア','デイサービス等','その他','特になし']}),
    q('social_family','家族等との関わり','家庭内での役割や、別居家族との関わりについて記録します。','textarea'),
    q('social_region','地域との関わり','地域での役割や活動、参加意欲について記録します。','textarea'),
    q('social_work','仕事との関わり','仕事との関わりについて記録します。','textarea')
  ]});

  add({id:'p4_family',page:4,title:'家族等の状況',judgment:true,questions:[
    q('fam_main','主な支援者','日常生活や意思決定に主に関わる方はどなたですか？','text',{important:true}),
    q('fam_relation','続柄','その方との続柄を記録します。'),
    q('fam_cohabit','同居の有無','その方は同居されていますか？','select',{options:['同居','別居','その他']}),
    q('fam_relationship','関係性','本人との関係はいかがですか？','select',{options:['良好','普通','険悪','不明']}),
    q('fam_involvement','関わり方','普段、どのような支援・関わりがありますか？','textarea',{important:true}),
    q('fam_info','情報共有方法','家族等との情報共有方法を記録します。','textarea'),
    q('fam_participation','支援への参加状況','家族等の支援への参加状況を記録します。','textarea'),
    q('fam_special','特に配慮すべき事項','家族等の状況について、特に配慮すべきことを記録します。','textarea')
  ]});

  add({id:'p4_environment',page:4,title:'居住環境',judgment:true,questions:[
    q('env_house','家屋の形態','お住まいは戸建てですか、集合住宅ですか？','select',{options:['戸建て','集合住宅','その他'],important:true}),
    q('env_steps','段差','生活動線に気になる段差はありますか？','select',{options:yesNoNA,important:true}),
    q('env_stairs','階段','階段を使う場所はありますか？','select',{options:yesNoNA}),
    q('env_handrail','手すり','必要な場所に手すりはありますか？','select',{options:['あり','なし','不要','不明']}),
    q('env_bath','浴室','浴室の使いにくさや危険なところはありますか？','textarea',{important:true}),
    q('env_toilet','トイレ','トイレの使いにくさや危険なところはありますか？','textarea',{important:true}),
    q('env_bedroom','寝室','寝室の環境について気になることはありますか？','textarea'),
    q('env_route','生活動線','家の中の移動経路で危険・不便なところはありますか？','textarea',{important:true}),
    q('env_risk','居住環境においてリスクになりうる状況','転倒などのリスクにつながる環境があれば記録します。','textarea'),
    q('env_clean','整理や清掃','整理整頓や清掃の状況を記録します.','select',{options:['良','普通','不良','不明']}),
    q('env_temp','室温の保持','室温は適切に保てていますか？','select',{options:['できている','できていない','不明']}),
    q('env_equipment','機器等','生活を支える機器・福祉用具等の設置状況を記録します.','textarea'),
    q('env_surround','自宅周辺の環境や利便性等','自宅周辺の買い物・交通・坂道など、生活上の環境について記録します。','textarea'),
    q('env_other','その他','住環境について、ほかに留意することを記録します。','textarea')
  ]});

  add({id:'p4_other',page:4,title:'その他留意すべき事項・状況',judgment:true,questions:[
    q('other_notes','その他生活に何らかの影響を及ぼす事項','これまでの項目以外で、生活に影響することや留意すべきことを自由に記録してください。','textarea')
  ]});


  // v2: 面談中の自由記述を減らし、選択式・条件分岐を強化
  const byKey = key => sections.flatMap(s=>[...(s.questions||[]),...(s.afterQuestions||[])]).find(x=>x.key===key);
  const setField = (key, type, options) => { const x=byKey(key); if(!x)return; x.type=type; if(options)x.options=options; };
  setField('conditionNow','select',['良好','普段と変わらない','やや不調','不調','不明']);
  setField('symptoms','multiselect',['特になし','痛み','だるさ・疲れ','息苦しさ','発熱','めまい','食欲低下','睡眠の問題','むくみ','その他']);
  setField('skin','multiselect',['問題なし','乾燥','発赤','かゆみ','傷・びらん','浮腫','その他','不明']);
  setField('healthUnderstanding','select',['十分理解している','概ね理解している','一部理解している','理解が難しい','不明']);
  setField('cog_scene','multiselect',['服薬','金銭管理','予定・約束','買い物','調理','外出・道順','火の管理','電話・連絡','その他']);
  setField('rhythm_day','multiselect',['自宅で過ごす','家事','テレビ・読書','散歩・外出','通所サービス','趣味活動','昼寝・休息','その他']);
  setField('rhythm_nap','select',['なし','午前','午後','午前・午後','不規則','不明']);
  setField('rhythm_outing','select',['ほぼ毎日','週に数回','週1回程度','月に数回','ほとんどなし','不明']);
  setField('elim_aftercare','select',['自立','見守り','一部介助','全介助','不明']);
  setField('hyg_bathing','select',assist4);
  setField('hyg_hair','select',assist4);
  setField('hyg_grooming','select',assist4);
  setField('hyg_dressing','select',assist4);
  setField('hyg_assistPart','multiselect',['入浴','洗髪','洗顔','口腔ケア','整髪','髭剃り・化粧','更衣','その他']);
  setField('hyg_skinNails','multiselect',['問題なし','皮膚の汚れ','爪が長い','乾燥','発赤','傷','その他','不明']);
  setField('hyg_bedding','select',['清潔を保てている','やや汚れあり','交換・洗濯が必要','不明']);
  setField('oral_teeth','multiselect',['問題なし','残歯が少ない','欠損あり','ぐらつき','う蝕が疑われる','その他','不明']);
  setField('oral_denture','select',['使用なし','使用・問題なし','使用・合わない','使用・破損','使用していない','不明']);
  setField('oral_bite','select',['問題なし','気になる','問題あり','不明']);
  setField('oral_care','select',['自立','見守り','一部介助','全介助','実施できていない','不明']);
  setField('diet_amount','select',['ほぼ全量','7〜8割程度','半量程度','半量未満','日による','不明']);
  setField('diet_content','multiselect',['主食・副食とも摂取','主食中心','副食中心','間食あり','栄養補助食品あり','その他']);
  setField('diet_restriction','multiselect',['なし','塩分','糖質','脂質','たんぱく','水分','アレルギー','その他','不明']);
  setField('diet_preparer','select',['本人','同居家族','別居家族','ヘルパー','配食サービス','施設・通所先','その他']);
  setField('social_family','select',['十分ある','ある','少ない','ほとんどない','不明']);
  setField('social_region','select',['参加している','時々参加','以前は参加','参加していない','不明']);
  setField('social_work','select',['就労中','休職中','退職','就労なし','その他']);
  setField('fam_involvement','multiselect',['見守り','食事準備','買い物','掃除・洗濯','服薬','通院','金銭管理','排泄','入浴','意思決定支援','その他']);
  setField('fam_info','select',['対面','電話','メール・SNS','連絡帳','サービス事業所経由','その他','特になし']);
  setField('fam_participation','select',['積極的','必要時','限定的','困難','なし','不明']);
  setField('env_bath','multiselect',['問題なし','段差','浴槽またぎ','滑りやすい','手すり不足','狭い','寒暖差','その他']);
  setField('env_toilet','multiselect',['問題なし','段差','手すり不足','狭い','便座が低い','動線が長い','夜間暗い','その他']);
  setField('env_bedroom','multiselect',['問題なし','ベッド','布団','立ち上がりにくい','動線が狭い','夜間暗い','その他']);
  setField('env_route','multiselect',['問題なし','段差','敷物','コード類','家具・物が多い','照明不足','手すり不足','その他']);
  setField('env_risk','multiselect',['特になし','転倒','火災','温度管理','衛生','防犯','災害時避難','その他']);
  setField('env_equipment','multiselect',['なし','杖','歩行器','車いす','特殊寝台','手すり','ポータブルトイレ','入浴用具','その他']);
  setField('env_surround','multiselect',['買い物便利','公共交通あり','坂道あり','交通量多い','医療機関が近い','近隣支援あり','その他']);
  // IADLの深掘りも選択中心に
  for(const sec of sections){for(const x of [...(sec.questions||[]),...(sec.afterQuestions||[])]){
    if(/^iadl_.*_supporter$/.test(x.key)){x.type='select';x.options=['同居家族','別居家族','ヘルパー等','サービス事業所','友人・近隣','その他'];}
    if(/^iadl_.*_part$/.test(x.key)){x.type='multiselect';x.options=['準備','実施','確認・見守り','同行','一部代行','全て代行','その他'];}
    if(/^adl_.*_part$/.test(x.key)&&x.key!=='adl_bathing_part'){x.type='multiselect';x.options=['動作開始','動作途中','動作終了','姿勢保持','安全確認・見守り','環境調整','その他'];}
  }}

  CAN.sections = sections;
  CAN.issueOptions = issueOptions;
  CAN.judgmentHoldReasons = judgmentHoldReasons;
  CAN.unconfirmedReasons = unconfirmedReasons;
  CAN.pageTitles = {1:'№1 基本情報',2:'№2 健康・ADL/IADL',3:'№3 認知・生活・排泄',4:'№4 口腔・食事・環境'};
  CAN.getSection = id => sections.find(s=>s.id===id);
  CAN.getQuestions = () => sections.flatMap(s => [...(s.questions||[]),...(s.afterQuestions||[])]);
})();
