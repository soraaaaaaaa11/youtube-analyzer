/**
 * チャンネルシードスクリプト（拡充版）
 * 日本 ~300チャンネル + グローバル ~300チャンネルをDBに初期投入
 * カテゴリ別に整理して投入する
 *
 * 実行方法: npx tsx scripts/seed-channels.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

const BASE_URL = "https://www.googleapis.com/youtube/v3";

// ============================================================
// チャンネルID + カテゴリ定義
// { id: YouTubeチャンネルID, category: カテゴリ名 }
// ============================================================

interface SeedChannel {
  id: string;
  category: string;
  comment?: string; // チャンネル名メモ（DB保存しない）
}

// ============================================================
// 日本チャンネル
// ============================================================
const JAPAN_CHANNELS: SeedChannel[] = [
  // === エンタメ ===
  { id: "UC6QZ_ss3i_8qLV_RczPZBkw", category: "エンタメ", comment: "ISSEI / いっせい" },
  { id: "UCjp_3PEaOau_nT_3vnqKIvg", category: "エンタメ", comment: "Junya.じゅんや" },
  { id: "UCWaOde99oeUVoXbIj3SNu9g", category: "エンタメ", comment: "Sagawa /さがわ" },
  { id: "UCKLbzfmjFv_oalDX8sHxhkQ", category: "エンタメ", comment: "Saito" },
  { id: "UC4ROE0kBZ983K5vLwEbkKsQ", category: "エンタメ", comment: "HAYATAKU はやたく" },
  { id: "UCP1vrClG-6iGuFq7ls_NBsw", category: "エンタメ", comment: "Spider-VAMBI" },
  { id: "UC0XwmKYoAkybFU8lw4veZrw", category: "エンタメ", comment: "OHIOBOSS SATOYU" },
  { id: "UCZf__ehlCEBPop-_sldpBUQ", category: "エンタメ", comment: "HikakinTV" },
  { id: "UCgMPP6RRjktV7krOfyUewqw", category: "エンタメ", comment: "はじめしゃちょー" },
  { id: "UCljYHFazflmGaDr5Lo90KmA", category: "エンタメ", comment: "すしらーめん《りく》" },
  { id: "UCibEhpu5HP45-w7Bq1ZIulw", category: "エンタメ", comment: "Fischer's" },
  { id: "UCutJqz56653xV2wwSvut_hQ", category: "エンタメ", comment: "東海オンエア" },
  { id: "UCg4nOl7_gtStrLwF0_xoV0A", category: "エンタメ", comment: "SeikinTV" },
  { id: "UC2alHD2WkakOiTxCxF-uMAg", category: "エンタメ", comment: "よにのちゃんねる" },
  { id: "UCaminwG9MTO4sLYeC3s6udA", category: "エンタメ", comment: "ヒカル" },
  { id: "UC8_wmm5DX9mb4jrLiw8ZYzw", category: "エンタメ", comment: "スカイピース" },
  { id: "UCRxPrFmRHsXGWfAyE6oqrPQ", category: "エンタメ", comment: "コムドット" },
  { id: "UCpOjLndjOqMoffA-fr8cbKA", category: "エンタメ", comment: "水溜りボンド" },
  { id: "UC3eTZ5Yld6qufD6rtEiERdw", category: "エンタメ", comment: "Repezen Foxx" },
  { id: "UCIOk-Q5kyDtSRaTIW7hIsng", category: "エンタメ", comment: "平成フラミンゴ" },
  { id: "UCJZVj2iBrdvbNc416i0V-UA", category: "エンタメ", comment: "朝倉未来" },
  { id: "UCpZnHxjKCAOm-FKPrYYi-LA", category: "エンタメ", comment: "ブライアンチャンネル" },
  { id: "UC6VSFaHYbR-bhNer7DXxGNQ", category: "エンタメ", comment: "ボンボンTV" },
  { id: "UC642pLj4GXSj-0Ybdx3ytmA", category: "エンタメ", comment: "カジサック" },
  { id: "UC1H5dv45x2aFKk-6JZLSWIQ", category: "エンタメ", comment: "粗品 Official" },
  { id: "UCftut9Z6S48igRNSQRDpCCg", category: "エンタメ", comment: "ヴァンビ" },
  { id: "UCjNrxV6lbQZHK8E5LfNHmUg", category: "エンタメ", comment: "フォーエイト48" },
  { id: "UCwN4CR-bDM9ZjvPhb44AfxQ", category: "エンタメ", comment: "パパラピーズ" },
  { id: "UCt_XAT1S9YQAhARMyMnXCzg", category: "エンタメ", comment: "パラノイズ公式" },
  { id: "UC75NfjEdgZ3BvqJ2ssCyHdg", category: "エンタメ", comment: "なこなこチャンネル" },
  { id: "UC-BebSLDtTp5CmkDtlGgI8A", category: "エンタメ", comment: "Mochi.もち" },
  { id: "UCbbGY-BwkGKLF0u-dlxb_gA", category: "エンタメ", comment: "Jun Jun World" },
  { id: "UCIN9NzdhD-jWS3Z0crsHmkQ", category: "エンタメ", comment: "MY No War" },
  { id: "UC0yQ2h4gQXmVUFWZSqlMVOA", category: "エンタメ", comment: "ひろゆき" },
  { id: "UCQs-tWGqacJ7vuuJDtXq28w", category: "エンタメ", comment: "Kids Line" },

  // === 音楽 ===
  { id: "UC9zY_E8mcAo_Oq772LEZq8Q", category: "音楽", comment: "THE FIRST TAKE" },
  { id: "UCJhjE7wbdYAae1G25m0tHAA", category: "音楽", comment: "Cafe Music BGM channel" },
  { id: "UCdwQ0HJSoRiYO0CBIpdRNcA", category: "音楽", comment: "ONE OK ROCK" },
  { id: "UC4nLSTg1hGnOE2bNJGEzeAA", category: "音楽", comment: "Official髭男dism" },
  { id: "UCvpredjG93ifbCP1Y77JyFA", category: "音楽", comment: "YOASOBI" },
  { id: "UCV0mDV5UB0nOEBVLsDCmRLA", category: "音楽", comment: "Ado" },
  { id: "UCSJ4gkVC6NrvII8umztf0Ow", category: "音楽", comment: "Kenshi Yonezu 米津玄師" },
  { id: "UCJCFm_UrYMqb-GJHbqOXxJg", category: "音楽", comment: "King Gnu" },
  { id: "UCMEr98S9Ev98DOFc_c_kXhA", category: "音楽", comment: "Mrs. GREEN APPLE" },
  { id: "UCOyGbMi62RZFKBPnLEJGXhA", category: "音楽", comment: "back number" },
  { id: "UCmqDMagxRklVSW-5b6bOWSA", category: "音楽", comment: "BUMP OF CHICKEN" },
  { id: "UCq22toJkTIeSFHBkyxhEf-A", category: "音楽", comment: "Lisa" },
  { id: "UCsRhkVH_uDiRaSyjFtxOmtA", category: "音楽", comment: "Vaundy" },
  { id: "UCnQFP_c71HO-V27zoJFZbTQ", category: "音楽", comment: "Creepy Nuts" },
  { id: "UCDqI2jOz0weumE8s7paEk6g", category: "音楽", comment: "RADWIMPS" },
  { id: "UCkhzxaGjK0HLEb3GFSjFJSA", category: "音楽", comment: "乃木坂46" },
  { id: "UCX-PuUKUPKC0TBdCSVlKRPA", category: "音楽", comment: "Aimer" },
  { id: "UClkRzsdvg7_RKVhwDwiDZOA", category: "音楽", comment: "SEKAI NO OWARI" },
  { id: "UCZ3eOKkXJB2g4GzuWrNblXA", category: "音楽", comment: "あいみょん" },
  { id: "UCfCLsh-pLBTN6eVW49Rt4Gw", category: "音楽", comment: "Snow Man" },

  // === ゲーム ===
  { id: "UCMJiPpN_09F0aWpQrgbc_qg", category: "ゲーム", comment: "キヨ。" },
  { id: "UCzXjPL7zo0bxhOYDxLJ9YEg", category: "ゲーム", comment: "ポッキー" },
  { id: "UCM3yhFc0-fBFuvqx1Vg2YNQ", category: "ゲーム", comment: "まいぜんシスターズ" },
  { id: "UC0SyRzL-RMp6V_Rk0ISz8dQ", category: "ゲーム", comment: "牛沢" },
  { id: "UCcGqLibSC0yoE7BGSVkjBXQ", category: "ゲーム", comment: "赤髪のとも" },
  { id: "UCtPsHjCAqTNYN2fBNh0qbRg", category: "ゲーム", comment: "レトルト" },
  { id: "UCLm-vhT3tjXrP3Rrz9Y-_2g", category: "ゲーム", comment: "ヒカキンゲームズ" },
  { id: "UCCYH_mYRH6E_ajiK5gE5M7g", category: "ゲーム", comment: "2broチャンネル" },
  { id: "UCb7DYbGK0TswRKGgNSxKimg", category: "ゲーム", comment: "加藤純一" },
  { id: "UC3Wk-BxoGGnPh_U9z3wZJZQ", category: "ゲーム", comment: "ゆっくり実況者" },
  { id: "UCPyBVIE4NQI3mQ5hXMUMfmw", category: "ゲーム", comment: "狩野英孝ゲーム" },
  { id: "UCmeQEMjQfMHiYaLBQ69e1Gw", category: "ゲーム", comment: "兄者弟者" },
  { id: "UCX0CgTVxr5KjPhAnYEyY8mA", category: "ゲーム", comment: "ゆっくりマインクラフト探検隊" },
  { id: "UC2k7swYcTOsJkJHGLJD9fWA", category: "ゲーム", comment: "SHAKAch" },
  { id: "UCts5HEBThvlU2c9gqy0YGag", category: "ゲーム", comment: "釈迦" },
  { id: "UCr7lZjovL1UPKV_1q2VXBIQ", category: "ゲーム", comment: "フブキCh" },
  { id: "UC1DCedRgGHBdm81E1llLhOQ", category: "ゲーム", comment: "ぺこらCh" },
  { id: "UC1opHUrw8rvnsadT-iGp7Cg", category: "ゲーム", comment: "マリンCh" },
  { id: "UChAnqc_AY5_I3Px5dig3X1Q", category: "ゲーム", comment: "しゅんしゅんクリニックP" },
  { id: "UCSFCh5NL4qXrAy9u-u2lYKw", category: "ゲーム", comment: "葛葉 Kuzuha" },

  // === 教育 ===
  { id: "UCFo4kqllbcQ4nV83WCyraiw", category: "教育", comment: "中田敦彦のYouTube大学" },
  { id: "UC67Wr_9pA4I0glIxDt_Cpyw", category: "教育", comment: "両学長 リベラルアーツ大学" },
  { id: "UCQ_MqAw18jFTlBB-f8BP7dw", category: "教育", comment: "QuizKnock" },
  { id: "UCTn7GhOmEo_yJf91lzvXYIg", category: "教育", comment: "予備校のノリで学ぶ「大学の数学・物理」" },
  { id: "UCqo-YBdPzbleF7NBKBH3ZWA", category: "教育", comment: "とある男が授業をしてみた" },
  { id: "UCMHWMcXDBQnPB_BGAK8oyuA", category: "教育", comment: "コヤッキースタジオ" },
  { id: "UCuzYoC_vDmhEBM2Og5fO-GA", category: "教育", comment: "サイエンスZERO" },
  { id: "UC9UH1Q7M2QNR0RRwFt7y0Eg", category: "教育", comment: "Kevin's English Room" },
  { id: "UCT2fwAU5Lx0cmXfSDzSGkWA", category: "教育", comment: "GlobisKnowledgeNetwork" },
  { id: "UCXHL1mTJ8EVqvypuMbdBg2Q", category: "教育", comment: "Atsueigo" },
  { id: "UCcj-_FpMOI2mR5EQhMKFGtg", category: "教育", comment: "るーいのゆっくり科学" },
  { id: "UC7WVEG3qxJhAamK1DuhRpLA", category: "教育", comment: "ゆっくり解説チャンネル" },
  { id: "UCPfMBrP2caBj47dOd_hkYjQ", category: "教育", comment: "MrFuji from Japan" },
  { id: "UC2CV_U9QPcQOuFqFaUBKixA", category: "教育", comment: "NHK" },
  { id: "UCVLmECpsedhR3u4StSkRw4g", category: "教育", comment: "ナショナルジオグラフィックTV JP" },

  // === テクノロジー/AI ===
  { id: "UCJitY4oLrKa_Ku1mN3NxJxw", category: "テクノロジー/AI", comment: "吉田製作所" },
  { id: "UCGjrIKm1pAKa7Wf8LQPG-yg", category: "テクノロジー/AI", comment: "瀬戸弘司" },
  { id: "UC3JaCfE_pPIMKXrKrz3Eejw", category: "テクノロジー/AI", comment: "カズチャンネル" },
  { id: "UCh0Rl62Y05EgGfqzPTvEE6Q", category: "テクノロジー/AI", comment: "ちもろぐ" },
  { id: "UCYLi_5Cm7n5n4F-2ZZ5EXnQ", category: "テクノロジー/AI", comment: "イチケン" },
  { id: "UCS-Pbs2LV4M1GsdFbCQ-_Pg", category: "テクノロジー/AI", comment: "だれプロ" },
  { id: "UCJuGAtX1KjE0MX27XMuIIdg", category: "テクノロジー/AI", comment: "PASSLABO" },
  { id: "UCFyZiYVfMKv8JHKA2hmpBCQ", category: "テクノロジー/AI", comment: "ガジェマガ" },
  { id: "UCBUdaij1G3NiGa9WDMP3BdQ", category: "テクノロジー/AI", comment: "マナブ" },
  { id: "UCQzuC4U6W0gXJ3FR41_d-yg", category: "テクノロジー/AI", comment: "mikimiki web school" },
  { id: "UClzuIOfdPHFVIb-pitrqXBA", category: "テクノロジー/AI", comment: "しまぶーのIT大学" },
  { id: "UC_HLK-ksslL-Z_2wilfZriQ", category: "テクノロジー/AI", comment: "トーマスガジェマガ" },
  { id: "UCvzfV7MhIsthTRT-pXjQ1oQ", category: "テクノロジー/AI", comment: "AI研究所" },

  // === ニュース/政治 ===
  { id: "UCGCZAYq5Xxojl_tSXcVJhiQ", category: "ニュース/政治", comment: "日テレNEWS" },
  { id: "UCkKVQ_GNjd8FbAuT6xHL7aQ", category: "ニュース/政治", comment: "ANNnewsCH" },
  { id: "UCuTAXTexrhetbOe3DgSpJPw", category: "ニュース/政治", comment: "TBS NEWS DIG" },
  { id: "UCR4JnupjNKMeqFiCFeVLljQ", category: "ニュース/政治", comment: "FNNプライムオンライン" },
  { id: "UCXD3QS5JE9V_TcDx5oV3RYQ", category: "ニュース/政治", comment: "テレ東BIZ" },
  { id: "UCkGkjyURzEBBGA3gJSJQxjQ", category: "ニュース/政治", comment: "ABEMA Prime" },
  { id: "UC7FjsG9F4TdXsl8frgvpPLA", category: "ニュース/政治", comment: "ReHacQ" },
  { id: "UC5nfcGkOAm3JwfPvJvzplHg", category: "ニュース/政治", comment: "堀江貴文ホリエモン" },
  { id: "UCix50dhJqm_gUjb1bzi9pgA", category: "ニュース/政治", comment: "日経テレ東大学" },
  { id: "UCR1O793MoyBRYnD4BAMiGaw", category: "ニュース/政治", comment: "NewsPicks" },

  // === スポーツ ===
  { id: "UCCtALHup92q5xIFb7n9UXVg", category: "スポーツ", comment: "GAZOO Racing" },
  { id: "UCxhwZ6gUPMoiCjk2pCdmGcA", category: "スポーツ", comment: "DAZN Japan" },
  { id: "UCQ0u4pzar4oFHI2EHnb9UcQ", category: "スポーツ", comment: "Jリーグ" },
  { id: "UCi1oL0xJBWJqg9U8GqsxrBQ", category: "スポーツ", comment: "朝倉海" },
  { id: "UCo3eXzHPiACeMMLFxL3xDzg", category: "スポーツ", comment: "RIZIN" },
  { id: "UCnBdXLCBluJFf-ymTNj5_BA", category: "スポーツ", comment: "那須川天心" },
  { id: "UCZTg4_7jMBXcSknIpMfPglg", category: "スポーツ", comment: "B.LEAGUE" },
  { id: "UCH5F3qZiGz2YaDjpfO3t1aQ", category: "スポーツ", comment: "GolfTV" },
  { id: "UCG4Unq9W2vZVT90RMTDE_Qw", category: "スポーツ", comment: "竹原テレビ" },
  { id: "UCxWiHbqAsnq_FbxuP0cJC1g", category: "スポーツ", comment: "クリスティアーノ・ロナウドJP" },

  // === 料理/グルメ ===
  { id: "UCaak9sggUeIBPOd8iK_BXcQ", category: "料理/グルメ", comment: "きまぐれクック" },
  { id: "UCbCJmNKAL85O1VFeD6Wj60g", category: "料理/グルメ", comment: "Bayashi TV" },
  { id: "UCKetFmtqdh-kn915crdf72A", category: "料理/グルメ", comment: "Nino's Home" },
  { id: "UCIFnMHIb0YTOD-FS13q9VQQ", category: "料理/グルメ", comment: "谷やん" },
  { id: "UCSWxU0tdqaFKLUovLCLYMFg", category: "料理/グルメ", comment: "きのう何食べた?" },
  { id: "UCNI5YRFFD9M0WKwos4zdqxQ", category: "料理/グルメ", comment: "Genki Labo" },
  { id: "UCmh5gdwCx6lN7gEC20leNVA", category: "料理/グルメ", comment: "はるあん" },
  { id: "UC-HA8t_QNkfV-gSGrkr52Yw", category: "料理/グルメ", comment: "食べログマガジン" },
  { id: "UC3p5EexROvSrz3CMAZmEmag", category: "料理/グルメ", comment: "料理研究家リュウジ" },
  { id: "UC0Js5iawKPrn0kUDekftT2w", category: "料理/グルメ", comment: "JunskitchenJP" },
  { id: "UCS2E9i6vImCbrJy0pSo-d0w", category: "料理/グルメ", comment: "マッスルグリル" },
  { id: "UCgr4T1WB7dFJJnF-tZomNIQ", category: "料理/グルメ", comment: "Peaceful Cuisine" },

  // === 美容/ファッション ===
  { id: "UCuy-kz_LqpAVPsBXl5FGpfg", category: "美容/ファッション", comment: "整形アイドル轟ちゃん" },
  { id: "UC3SFkLhLrxOjz3LXAF1VLpg", category: "美容/ファッション", comment: "関根りさ" },
  { id: "UCpZ8abJR_wKrccHTTGo-HIA", category: "美容/ファッション", comment: "水越みさと" },
  { id: "UCZ_Mnff9c-5g5rOGfWYM7Fg", category: "美容/ファッション", comment: "佐々木あさひ" },
  { id: "UC7x06M2txR-jhHYwPSrSi7A", category: "美容/ファッション", comment: "Kawanishi Mikiかわにしみき" },
  { id: "UCgoNkl0_p3FT_E9jB1d_v2A", category: "美容/ファッション", comment: "ゆうこすモテちゃんねる" },
  { id: "UCbwBGOnrjESQrBJrW6zbxaQ", category: "美容/ファッション", comment: "門りょうチャンネル" },
  { id: "UCZ6nnLOdBcAcmRihrn4J7ZQ", category: "美容/ファッション", comment: "元美容部員和田さん。" },
  { id: "UCuCBYskVmqkHX2I4PRlW1lw", category: "美容/ファッション", comment: "nanakoななこ" },
  { id: "UCD-QUWDzupGfgNMIzafaXhA", category: "美容/ファッション", comment: "げんじ/Genji" },

  // === 旅行/アウトドア ===
  { id: "UCHL9bfHTxCMi-7vfxQ-AYtg", category: "旅行/アウトドア", comment: "Abroad in Japan" },
  { id: "UCixD9UbKvDxzGNiPC_fgHyA", category: "旅行/アウトドア", comment: "Paolo fromTOKYO" },
  { id: "UCxVFB-oR4VJM3612wfqNq0w", category: "旅行/アウトドア", comment: "スーツ旅行" },
  { id: "UCEhp1MzjDBCjh7LHKP0qOCw", category: "旅行/アウトドア", comment: "ジョーブログ" },
  { id: "UC3BWtxnYMpPPIJDn0v42TAG", category: "旅行/アウトドア", comment: "solo camping" },
  { id: "UCYUb_3nI-a-HJzRgJFaYbOA", category: "旅行/アウトドア", comment: "Only in Japan" },
  { id: "UCluUNr6GCEw8fF8mQCRqsJA", category: "旅行/アウトドア", comment: "Rachel & Jun" },
  { id: "UCVkUvk5c6lQo-VBGEiJ0gCQ", category: "旅行/アウトドア", comment: "おのだ" },
  { id: "UCdwZTLJnX-2IGl2jrqVcB9g", category: "旅行/アウトドア", comment: "ヒロシちゃんねる" },
  { id: "UC4GrDFOTGPSgu8V3HkeM7XQ", category: "旅行/アウトドア", comment: "スーツ交通" },

  // === ペット/動物 ===
  { id: "UCplhkHsYKxXjTde1lq8F-4w", category: "ペット/動物", comment: "もちまる日記" },
  { id: "UC2BZv9rOGLhKmjUjvIbZxJQ", category: "ペット/動物", comment: "プピプピ文太" },
  { id: "UCeC9vz5CQE2lW4z7tInp5dw", category: "ペット/動物", comment: "ちょりちゃみ" },
  { id: "UC_cvTMlsMXooBh4UFIuPClA", category: "ペット/動物", comment: "短足マンチカンのプリン" },
  { id: "UCR_UXk77xxMzBTf4OWVxOBA", category: "ペット/動物", comment: "柴犬りんご郎" },
  { id: "UCTK9M-GWfCqP43Wz0gZ8j3g", category: "ペット/動物", comment: "もふもふ動画" },
  { id: "UC1VZB3BPOdvXbl-20BXjkMA", category: "ペット/動物", comment: "保護猫チャンネル" },
  { id: "UCXSmd3R-_8lkMj5kQ1rVB4w", category: "ペット/動物", comment: "チャンネル鰐" },
  { id: "UCVmjQiTbFwN2LO7s5dba-tw", category: "ペット/動物", comment: "パンダチャンネル" },
  { id: "UC4Lrs6-KKhPxIB2jv0BZxYA", category: "ペット/動物", comment: "動物園チャンネル" },

  // === 投資/ビジネス ===
  { id: "UCsWTZ4nYODCwlE8rdv7DZzA", category: "投資/ビジネス", comment: "BANK ACADEMY" },
  { id: "UC_CmAD2aIeS7U1mK3F6BIBg", category: "投資/ビジネス", comment: "高橋ダン" },
  { id: "UCzj68hYMPR4u2JR3YYwRuMQ", category: "投資/ビジネス", comment: "マネーの虎" },
  { id: "UC1L0zr8W1S1A4nTLRD0C0bg", category: "投資/ビジネス", comment: "令和の虎" },
  { id: "UCFY5EL6zFMYB7_kkaPtVT3g", category: "投資/ビジネス", comment: "マコなり社長" },
  { id: "UCHrLkjqFmBJI6JN0kNvGMGQ", category: "投資/ビジネス", comment: "竹花貴騎" },
  { id: "UCu1v7tCJ5FIGZ_3rr2bMRyg", category: "投資/ビジネス", comment: "フェルミ漫画大学" },
  { id: "UCZlqjOhBVMdADqVkPEGF97A", category: "投資/ビジネス", comment: "サラタメさん" },
  { id: "UCFH5IXOh4etF1a_WJiPT67Q", category: "投資/ビジネス", comment: "もふもふ不動産" },
  { id: "UCB2t-DRB9cEUEPiEvOxcHgg", category: "投資/ビジネス", comment: "投資塾" },

  // === フィットネス/健康 ===
  { id: "UCP6aw2-Afafmm0cPZ7pmYyQ", category: "フィットネス/健康", comment: "のがちゃんねる" },
  { id: "UCWjFQ6JJFwQkXf6UpDr5bDA", category: "フィットネス/健康", comment: "Muscle Watching" },
  { id: "UCOUu8YlbaPz0W2TyFTZHvjA", category: "フィットネス/健康", comment: "なかやまきんに君" },
  { id: "UCw7HTQv0F4CB9zGRhqosYsg", category: "フィットネス/健康", comment: "Marina Takewaki 竹脇まりな" },
  { id: "UC8Nb9BNxRBnU5bxPY0X1zHQ", category: "フィットネス/健康", comment: "B-life" },
  { id: "UC_J7f9lLFBqHIAlTe7UhwYA", category: "フィットネス/健康", comment: "メトロンブログ" },
  { id: "UCmfsS4zqf3Ev1m10GBtV6TA", category: "フィットネス/健康", comment: "オガトレ" },
  { id: "UCFprg1YHCdBU0vhAmNiS3Cg", category: "フィットネス/健康", comment: "山本義徳" },
  { id: "UCKj-tY2XDq0CstdoZ3K1cFQ", category: "フィットネス/健康", comment: "ザ・きんにくTV" },
  { id: "UCnIIZRSTkmBzZkX6aGeHAMw", category: "フィットネス/健康", comment: "まめたまボディメイク" },

  // === ハウツー/DIY ===
  { id: "UCg3qsVzHeUt5_cPpcRtoaJQ", category: "ハウツー/DIY", comment: "圧倒的不審者の極み!" },
  { id: "UCZfSnsXXKiBd3RnBJPc1zwQ", category: "ハウツー/DIY", comment: "DIYをしよう" },
  { id: "UCIJnNJaeKsgmjb0qsFrNUJA", category: "ハウツー/DIY", comment: "100均DIY" },
  { id: "UCIGMIZhqlUDhIQGLt8NvExw", category: "ハウツー/DIY", comment: "DIY道楽" },
  { id: "UCd1f4YKkVRUhPOYXkf_P1Yw", category: "ハウツー/DIY", comment: "Mozu" },
  { id: "UCPIJQK2PFX8JDnZ-cHcJfhA", category: "ハウツー/DIY", comment: "ハンドメイド作家" },
  { id: "UCm2cIGPlVaGgsdTInw-D9Bg", category: "ハウツー/DIY", comment: "100均アレンジ" },
  { id: "UCqBYRf0K8YpmWHW0VEvZ5yA", category: "ハウツー/DIY", comment: "DIY MAGAZINE" },
  { id: "UC9a-_XR2sfA9Y2KeOSVuB_g", category: "ハウツー/DIY", comment: "DIY家具" },
  { id: "UCQR_jylptMVr5bJNzfVQQKg", category: "ハウツー/DIY", comment: "ミニチュアDIY" },
];

// ============================================================
// グローバルチャンネル
// ============================================================
const GLOBAL_CHANNELS: SeedChannel[] = [
  // === エンタメ ===
  { id: "UCX6OQ3DkcsbYNE6H8uQQuVA", category: "エンタメ", comment: "MrBeast" },
  { id: "UC-lHJZR3Gqxm24_Vd_AJ5Yw", category: "エンタメ", comment: "PewDiePie" },
  { id: "UCq-Fj5jknLsUf-MWSy4_brA", category: "エンタメ", comment: "T-Series" },
  { id: "UCpEhnqL0y41EpW2TvWAHD7Q", category: "エンタメ", comment: "SET India" },
  { id: "UCvjgEL-qNNAt5BKTDEB9JNw", category: "エンタメ", comment: "Vlad and Niki" },
  { id: "UCFFbwnve3yF62-tVXkTyHqg", category: "エンタメ", comment: "Kids Diana Show" },
  { id: "UCk1SpWNzOs4MYmr0uICEntg", category: "エンタメ", comment: "Like Nastya" },
  { id: "UCRijo3ddMTht_IHyNSNXpNQ", category: "エンタメ", comment: "Dude Perfect" },
  { id: "UCY30JRSgfhYXA6i6xX1erWg", category: "エンタメ", comment: "Mark Rober" },
  { id: "UCLXo7UDZvByw2ixzpQCufnA", category: "エンタメ", comment: "Vox" },
  { id: "UCam8T03EOFBsNdR0thrFHdQ", category: "エンタメ", comment: "FLAVOR" },
  { id: "UCupvZG-5ko_eiXAupbDfxWw", category: "エンタメ", comment: "CNN" },
  { id: "UCVHFbqXqoYvEWM1Ddxl0QDg", category: "エンタメ", comment: "A4" },
  { id: "UC4-79UOlP48-QNGgCko5p2g", category: "エンタメ", comment: "Bright Side" },
  { id: "UCshCsg1YVKli8mG1NHW5FNg", category: "エンタメ", comment: "LankyBox" },
  { id: "UCnQC_G5Xnf-nyGGhlPC2Gog", category: "エンタメ", comment: "Stokes Twins" },
  { id: "UCsSsgPaZ2GSmO6il8Cb5iGA", category: "エンタメ", comment: "ZHC" },
  { id: "UCiGm_E4ZwYSHV3bcW1pnSeQ", category: "エンタメ", comment: "Sidemen" },
  { id: "UCcdwLMPsaU2ezNSJU1nFoBQ", category: "エンタメ", comment: "GQ" },
  { id: "UCHkj014U2CQ2Nv0UZeYpE_A", category: "エンタメ", comment: "Magician" },

  // === 音楽 ===
  { id: "UCIwFjwMjI0y7PDBVEO9-bkQ", category: "音楽", comment: "Justin Bieber" },
  { id: "UCcgqSGYFqm3EVL4sZaYbsmg", category: "音楽", comment: "Daddy Yankee" },
  { id: "UC0C-w0YjGpqDXGB8IHb662A", category: "音楽", comment: "Ed Sheeran" },
  { id: "UC2pmfLm7iq6Ov1UwYrWYkZA", category: "音楽", comment: "Ariana Grande" },
  { id: "UCZFWPqqPkFlNwIxcpsLOwew", category: "音楽", comment: "The Weeknd" },
  { id: "UCRzzwLpLiUNIs6YOPe33eMg", category: "音楽", comment: "BTS" },
  { id: "UCNnnwVSI5Ndo2I4Y-LQoT1g", category: "音楽", comment: "BLACKPINK" },
  { id: "UC-9-kyTW8ZkZNDHQJ6FgpwQ", category: "音楽", comment: "Taylor Swift" },
  { id: "UCIjYyZxkFucP_W-tmXo_j4A", category: "音楽", comment: "Dua Lipa" },
  { id: "UCYd1eLoYRa-vGME4LqSBo1w", category: "音楽", comment: "Billie Eilish" },
  { id: "UCByOQJjav0CUDwxCk-jVNRQ", category: "音楽", comment: "Drake" },
  { id: "UCmBA_wu8xGg1OfOkfW13Q0Q", category: "音楽", comment: "Bad Bunny" },
  { id: "UCN1hnUccO4FD5WfM7ithXaw", category: "音楽", comment: "Doja Cat" },
  { id: "UCOmVL7gZt95p2u_2F2kbUug", category: "音楽", comment: "SZA" },
  { id: "UCWZ0qFCGOBHbOm2V6b6O04w", category: "音楽", comment: "Shakira" },
  { id: "UCnxQ8o9RpqxGF2oLHcCn_Hw", category: "音楽", comment: "Imagine Dragons" },
  { id: "UCE_M8A5yxnLfW0KghEeajjw", category: "音楽", comment: "Apple Music" },
  { id: "UC-J-KZfRV8c13fOCkhXdLiQ", category: "音楽", comment: "Demi Lovato" },
  { id: "UCk1BnZ0kFlOY7bfsoB2gMyw", category: "音楽", comment: "Bruno Mars" },
  { id: "UCYvmuw-JtVrTZQ-7Y4kd63Q", category: "音楽", comment: "Post Malone" },

  // === ゲーム ===
  { id: "UCIPPMRA040LQr5QPyJEbmXA", category: "ゲーム", comment: "MrBeast Gaming" },
  { id: "UCq6VFHwMzcMXbuKyG7SQYIg", category: "ゲーム", comment: "Dream" },
  { id: "UC2wKfjlioOCLP4xQMOWNcgg", category: "ゲーム", comment: "Typical Gamer" },
  { id: "UCPYJR2EIu0_MJaDeSGwkIVw", category: "ゲーム", comment: "jacksepticeye" },
  { id: "UCYzPXprvl5Y-Sf0g4vX-m6g", category: "ゲーム", comment: "Jacksepticeye" },
  { id: "UC7_YxT-KID8kRbqZo7MyscQ", category: "ゲーム", comment: "Markiplier" },
  { id: "UCke6I9N4KfC968-yRcd5YRg", category: "ゲーム", comment: "SSundee" },
  { id: "UCwFEjtz9pk4xMOiT4lSi7sQ", category: "ゲーム", comment: "Shroud" },
  { id: "UClG8odDC8TS6Zpqk9CGVQiQ", category: "ゲーム", comment: "SypherPK" },
  { id: "UCmxw-1OknpkFUNhQPMD3Eew", category: "ゲーム", comment: "xQcOW" },
  { id: "UCOpNcN46UbXkwIFb5yOFaHA", category: "ゲーム", comment: "A_Seagull" },
  { id: "UCHqC-yWZ1kri4YzwRSt6RGQ", category: "ゲーム", comment: "Ludwig" },
  { id: "UC4QZ_LsYcvcq7qOsOhpAI4A", category: "ゲーム", comment: "Minecraft" },
  { id: "UCWRV5AVOlKJR1Flvgt310Cw", category: "ゲーム", comment: "Ali-A" },
  { id: "UCYVinkwSX7szARULgYpvhLw", category: "ゲーム", comment: "SSSniperWolf" },
  { id: "UC2C_jShtL725hvbm1arSV9w", category: "ゲーム", comment: "CGP Grey" },
  { id: "UCR-BhtJPs3gBqfNIYhPdjMw", category: "ゲーム", comment: "Achievement Hunter" },
  { id: "UCWqr2tH3dPshNhPjV5h1xRw", category: "ゲーム", comment: "DanTDM" },
  { id: "UCYiGq8XF7YQD00x7wAd62Zg", category: "ゲーム", comment: "ibxtoycat" },
  { id: "UCV9_KinVpV-snDBBpMkm43A", category: "ゲーム", comment: "TommyInnit" },

  // === 教育 ===
  { id: "UCsooa4yRKGN_zEE8iknghZA", category: "教育", comment: "TED-Ed" },
  { id: "UCsXVk37bltHxD1rDPwtNM8Q", category: "教育", comment: "Kurzgesagt" },
  { id: "UC6nSFpj9HTCZ5t-N3Rm3-HA", category: "教育", comment: "Vsauce" },
  { id: "UCUHW94eEFW7hkUMVaZz4eDg", category: "教育", comment: "minutephysics" },
  { id: "UC9-y-6csu5WGm29I7JiwpnA", category: "教育", comment: "Computerphile" },
  { id: "UCYO_jab_esuFRV4b17AJtAw", category: "教育", comment: "3Blue1Brown" },
  { id: "UCHnyfMqiRRG1u-2MsSQLbXA", category: "教育", comment: "Veritasium" },
  { id: "UCoxcjq-8xIDTYp3uz647V5A", category: "教育", comment: "Numberphile" },
  { id: "UCBcRF18a7Qf58cCRy5xuWwQ", category: "教育", comment: "TEDED" },
  { id: "UCZYTClx2T1of7BRZ86-8fow", category: "教育", comment: "SciShow" },
  { id: "UCVls1GmFKf6WlTraIb_IaJg", category: "教育", comment: "DistroTube" },
  { id: "UCLNs-WEll6QQEj__uDTx2oQ", category: "教育", comment: "CrashCourse" },
  { id: "UC7_gcs09iThXybpVgjHWbR0", category: "教育", comment: "PBS Eons" },
  { id: "UCiRiQGCHGjDLT9FQXFW0I3A", category: "教育", comment: "Academy of Ideas" },
  { id: "UCnUYZLuoy1rq1aVMwx4piYg", category: "教育", comment: "Jeff Nippard edu" },

  // === テクノロジー/AI ===
  { id: "UCsBjURrPoezykLs9EqgamOA", category: "テクノロジー/AI", comment: "Fireship" },
  { id: "UCWN3xxRkmTPphYwZR_1DvUQ", category: "テクノロジー/AI", comment: "Two Minute Papers" },
  { id: "UCSHZKyawb77ixDdsGog4iWA", category: "テクノロジー/AI", comment: "Lex Fridman" },
  { id: "UCXUPKJO5MZQN11PqgIvyuvQ", category: "テクノロジー/AI", comment: "Andrej Karpathy" },
  { id: "UCZHmQk67mSJgfCCTn7xBfew", category: "テクノロジー/AI", comment: "Matt Wolfe" },
  { id: "UCWOA1ZGiwLbDQJk2xcd7XKA", category: "テクノロジー/AI", comment: "Linus Tech Tips" },
  { id: "UCBJycsmduvYEL83R_U4JriQ", category: "テクノロジー/AI", comment: "MKBHD" },
  { id: "UCddiUEpeqJcYeBxX1IVBKvQ", category: "テクノロジー/AI", comment: "The Verge" },
  { id: "UCtVGGeUqfVHOK4Q6nAwYO3g", category: "テクノロジー/AI", comment: "Unbox Therapy" },
  { id: "UC0vBXGSyV14uvJ4hECDOl0Q", category: "テクノロジー/AI", comment: "TechLinked" },
  { id: "UCXGgrKt94gR6lmN4aN3mYTg", category: "テクノロジー/AI", comment: "Austin Evans" },
  { id: "UCsTcErHg8oDvUnTzoqsYeNw", category: "テクノロジー/AI", comment: "Unbox Therapy" },
  { id: "UCVYamHKEnwaVlXJz5hVWnBag", category: "テクノロジー/AI", comment: "NetworkChuck" },
  { id: "UCVYamHliCI9rw1tHR1xbkfw", category: "テクノロジー/AI", comment: "Dave2D" },
  { id: "UCdBK94H6oZT2Q7l0-b0xmMg", category: "テクノロジー/AI", comment: "Short Circuit" },
  { id: "UCR-DXc1voovS8nhAvccRZhg", category: "テクノロジー/AI", comment: "Jeff Geerling" },
  { id: "UCtxCXg-UvSnTKPOzLH4wJaQ", category: "テクノロジー/AI", comment: "Coding Train" },
  { id: "UCp_9GybIeJV5CDJ7LlJkFvA", category: "テクノロジー/AI", comment: "AI Explained" },
  { id: "UC_iD0xppBwwsrM9DegC5cQQ", category: "テクノロジー/AI", comment: "J2Blogs" },
  { id: "UCo8bcnLyZH8tBIH9V1mLgqQ", category: "テクノロジー/AI", comment: "TechLead" },

  // === ニュース/政治 ===
  { id: "UCupvZG-5ko_eiXAupbDfxWw", category: "ニュース/政治", comment: "CNN" },
  { id: "UCaXkIU1QidjPwiAYu6GcHjg", category: "ニュース/政治", comment: "MSNBC" },
  { id: "UCeY0bbntWzzVIaj2z3QigXg", category: "ニュース/政治", comment: "NBC News" },
  { id: "UCBi2mrWuNuyYy4gbM6fU18Q", category: "ニュース/政治", comment: "ABC News" },
  { id: "UCXIJgqnII2ZOINSWNOGFThA", category: "ニュース/政治", comment: "Fox News" },
  { id: "UC16niRr50-MSBwiO3YDb3RA", category: "ニュース/政治", comment: "BBC News" },
  { id: "UCknLrEdhRCp1aegoMqRaCZg", category: "ニュース/政治", comment: "Al Jazeera" },
  { id: "UCef1-8eOpJgud7szVPlZQAQ", category: "ニュース/政治", comment: "Bloomberg" },
  { id: "UCrwmu-gceGOmtZf-DkRDJ5w", category: "ニュース/政治", comment: "VICE" },
  { id: "UClIfyzXySMhB2NOg13QTMUQ", category: "ニュース/政治", comment: "Sky News" },

  // === スポーツ ===
  { id: "UCJ5v_MCY6GNUBTO8-D3XoAg", category: "スポーツ", comment: "WWE" },
  { id: "UCDVYQ4Zhbm3S2dlz7P1GBDg", category: "スポーツ", comment: "NFL" },
  { id: "UCWV3obpZVGgJ3j9FVhEjhgw", category: "スポーツ", comment: "NBA" },
  { id: "UCWV2m3K2tFM61YO-ivWfGYw", category: "スポーツ", comment: "Premier League" },
  { id: "UCGYzAqBwMVlH5LaE2ODwHqg", category: "スポーツ", comment: "Real Madrid" },
  { id: "UC14UlmYlSNiQCBe444vglyg", category: "スポーツ", comment: "FC Barcelona" },
  { id: "UCW722zHDaxO08DSJK1VBIiQ", category: "スポーツ", comment: "F1" },
  { id: "UCVFSwUOFPHrqdYp-k4FMz8g", category: "スポーツ", comment: "Olympics" },
  { id: "UCZ3JELRrOnpy1tYfo5h0MbA", category: "スポーツ", comment: "UFC" },
  { id: "UCi7GJNg51C3jgmYTUwqoUXA", category: "スポーツ", comment: "Dude Perfect Sports" },
  { id: "UC8CbFnDTYkiVweaz8y54C-g", category: "スポーツ", comment: "ESPN" },
  { id: "UCbSyXQ7m-8c6TYKIBp0hBtQ", category: "スポーツ", comment: "BleacherReport" },
  { id: "UCFIChCo77IngDiisyPvN0Xw", category: "スポーツ", comment: "Manchester United" },
  { id: "UCTv-XvfzLX3i4IGWAm4sbmA", category: "スポーツ", comment: "LALIGA EA SPORTS" },
  { id: "UCLqQ-4wqn19s-0CJzHfFL2A", category: "スポーツ", comment: "UEFA Champions League" },

  // === 料理/グルメ ===
  { id: "UCJFp8uSYCjXOMnkUyb3CQ3Q", category: "料理/グルメ", comment: "Tasty" },
  { id: "UC3ejTGkI2oOCYBhLG4dalXQ", category: "料理/グルメ", comment: "Joshua Weissman" },
  { id: "UCRIZtbGAq-jNXaFis4eI5SA", category: "料理/グルメ", comment: "Gordon Ramsay" },
  { id: "UCqqJQ_cXSat0KIAVfIfKkVA", category: "料理/グルメ", comment: "J. Kenji" },
  { id: "UC84whx2xxsiA1gXHXXqKGOA", category: "料理/グルメ", comment: "Binging with Babish" },
  { id: "UCJnOkpe0DceKDSZ8n1QS5uA", category: "料理/グルメ", comment: "Bon Appetit" },
  { id: "UCNbngWUqL2eqRw12yUQDiqQ", category: "料理/グルメ", comment: "Nick DiGiovanni" },
  { id: "UCekQr9znsk2vWxBo7YVjNRw", category: "料理/グルメ", comment: "Jamie Oliver" },
  { id: "UCcAd5Np7fO8SeejB1FVKcYw", category: "料理/グルメ", comment: "Mark Wiens" },
  { id: "UCtby6rJtBGgUm-2oD_E7R2A", category: "料理/グルメ", comment: "Maangchi" },

  // === 美容/ファッション ===
  { id: "UC-b_TnQANj1OF9kxSFewqaQ", category: "美容/ファッション", comment: "James Charles" },
  { id: "UCoz3s1kylPykJfSTXmN7fSg", category: "美容/ファッション", comment: "NikkieTutorials" },
  { id: "UCXqIz_CfHNChReCPklg-GDg", category: "美容/ファッション", comment: "Huda Beauty" },
  { id: "UCbKo3r2SqeMBvWwPV7FTXxg", category: "美容/ファッション", comment: "Patrick Starrr" },
  { id: "UCbwMPyKJMCTg4yRBuIPC8TQ", category: "美容/ファッション", comment: "Brad Mondo" },
  { id: "UCZqL_lgX4MGzWK5Pb5HmXHQ", category: "美容/ファッション", comment: "Robert Welsh" },
  { id: "UCp3_Zqw7yx2C6GfT2sqC3LA", category: "美容/ファッション", comment: "Hyram" },
  { id: "UCQ3cpnX_hAJR2c5fS7JKwtQ", category: "美容/ファッション", comment: "Vogue" },
  { id: "UCEp2OhNRkS77UtpMKEfBgFQ", category: "美容/ファッション", comment: "Tim Dessaint" },
  { id: "UCcZ2nCUn7vSlMfY5PoH6_fQ", category: "美容/ファッション", comment: "Allure" },

  // === 旅行/アウトドア ===
  { id: "UCh3Rpsdv1fxefE0ZcKBaNcQ", category: "旅行/アウトドア", comment: "Yes Theory" },
  { id: "UCnTsUMBOA8E-OHJE-UrFOnA", category: "旅行/アウトドア", comment: "Kara and Nate" },
  { id: "UCbVSbZN2MBr3gJV6aypAaZA", category: "旅行/アウトドア", comment: "Drew Binsky" },
  { id: "UCpDJl2EmP7Oh90Vylx0dZtA", category: "旅行/アウトドア", comment: "Sailing La Vagabonde" },
  { id: "UCt_NLJ4McJlCyYM-dSPRo7Q", category: "旅行/アウトドア", comment: "Lost LeBlanc" },
  { id: "UCXN6CSbCvERidUC7NfZhVlQ", category: "旅行/アウトドア", comment: "Geography Now" },
  { id: "UCluQ5yinb-w64gkKnuQ5vDg", category: "旅行/アウトドア", comment: "Kraig Adams" },
  { id: "UCBODyKF0JMbUd6D8_RFIkWQ", category: "旅行/アウトドア", comment: "Wilderness Living" },
  { id: "UCm325cMiw9B15xl22_gr6Dw", category: "旅行/アウトドア", comment: "Wilderness" },
  { id: "UCnr9e2-BSrLkGNuhWM5DDXQ", category: "旅行/アウトドア", comment: "Peter McKinnon" },

  // === ペット/動物 ===
  { id: "UCGbshtvS9t-8CHL9bp1oCr0", category: "ペット/動物", comment: "The Dodo" },
  { id: "UCEa8cjk-JIKLjNGNiCVD2_A", category: "ペット/動物", comment: "Tucker Budzyn" },
  { id: "UCYiTq-tbRE_sKEm7SDqwHHQ", category: "ペット/動物", comment: "Brave Wilderness" },
  { id: "UCrVGlhDEB3KZ0gQBJe4YLZQ", category: "ペット/動物", comment: "Kitten Lady" },
  { id: "UCwf6_GivMNEHFn_LhKS7JBQ", category: "ペット/動物", comment: "Jackson Galaxy" },
  { id: "UCpko_-a4wgz2u_DgDgd9fqA", category: "ペット/動物", comment: "Maymo" },
  { id: "UCR1qcQE7dsIQECNJZcTEYwQ", category: "ペット/動物", comment: "Daily Dose of Internet" },
  { id: "UC2Ys0k3NnGLH_EO1pUk5-sg", category: "ペット/動物", comment: "Cole and Marmalade" },
  { id: "UCV5vCi3jPJdURZwAOO_FNfQ", category: "ペット/動物", comment: "Girl With The Dogs" },
  { id: "UC9h3KGb0fApkLRfEE1G5hJg", category: "ペット/動物", comment: "AnimalWised" },

  // === 投資/ビジネス ===
  { id: "UCGy7SkBjcIAgTiwkXEtPnYg", category: "投資/ビジネス", comment: "Graham Stephan" },
  { id: "UCUQo7nzKRqdRhSg5IM-JCOg", category: "投資/ビジネス", comment: "Meet Kevin" },
  { id: "UCiViceegnWICGPdELqKyS3Q", category: "投資/ビジネス", comment: "Valuetainment" },
  { id: "UCc4Rz_T9Sb1w5rqqo9pL1Og", category: "投資/ビジネス", comment: "Minority Mindset" },
  { id: "UC4HzMf0RAnCD-fFFzOHvjVw", category: "投資/ビジネス", comment: "Ali Abdaal" },
  { id: "UCnYMOamNKLGVlJgRUbamveA", category: "投資/ビジネス", comment: "Tom Bilyeu" },
  { id: "UCWPTz3-E7381pZfaCEkVUgg", category: "投資/ビジネス", comment: "Andrei Jikh" },
  { id: "UCnMn36GT_H0X-w5_ckLtlgQ", category: "投資/ビジネス", comment: "Mark Tilbury" },
  { id: "UCVjlpEjEY9GpksqbEesJnNA", category: "投資/ビジネス", comment: "Ryan Scribner" },
  { id: "UCf9O2YNIC0Mg_FBUlKhFYIw", category: "投資/ビジネス", comment: "CNBC Make It" },

  // === フィットネス/健康 ===
  { id: "UCe0TLA0EsQbE-MjuHXevj2A", category: "フィットネス/健康", comment: "ATHLEAN-X" },
  { id: "UCERm5yFZ1SptUEU4wZ2vJvw", category: "フィットネス/健康", comment: "Blogilates" },
  { id: "UCU0DZYlRTBB4G8w6AjRagWg", category: "フィットネス/健康", comment: "Chloe Ting" },
  { id: "UCuiasDR7bMrt9mP9E0ooILQ", category: "フィットネス/健康", comment: "Yoga With Adriene" },
  { id: "UCfQgsKhHjSyRLOp9mnffqVg", category: "フィットネス/健康", comment: "Jeff Nippard" },
  { id: "UCOFCwEcCHRVPv7VScTKcVsw", category: "フィットネス/健康", comment: "MadFit" },
  { id: "UCxd9CZMbhXggkOObDH6-Ing", category: "フィットネス/健康", comment: "Natacha Oceane" },
  { id: "UCpiSGILCGOr0FzBBKnE59iA", category: "フィットネス/健康", comment: "Chris Heria" },
  { id: "UCwrXi5ZknKThezJc2LnMVQQ", category: "フィットネス/健康", comment: "Will Tennyson" },
  { id: "UChVRfsT_ASBZk10o0An7Ucg", category: "フィットネス/健康", comment: "Pamela Reif" },

  // === ハウツー/DIY ===
  { id: "UCu6mSoMNzHQoIUQR4yUPnCg", category: "ハウツー/DIY", comment: "5-Minute Crafts" },
  { id: "UCDsElQQt_gCZ9LgnW-7v-cQ", category: "ハウツー/DIY", comment: "Troom Troom" },
  { id: "UCkhLI7ZJQyb-E2-1W-p4now", category: "ハウツー/DIY", comment: "I Like To Make Stuff" },
  { id: "UCknYpRl2ambj_Al38pBbvOA", category: "ハウツー/DIY", comment: "Laura Kampf" },
  { id: "UCEQXp_fcqwPcqrzNtWJ1xCA", category: "ハウツー/DIY", comment: "Matthias Wandel" },
  { id: "UCGHi5-THm7IW5Mdp8qxkJQA", category: "ハウツー/DIY", comment: "Simone Giertz" },
  { id: "UCchWU8ta6LGBwRiMbIVFg2A", category: "ハウツー/DIY", comment: "Stuff Made Here" },
  { id: "UCiDJtJKMICpb9B1qf7qjEOA", category: "ハウツー/DIY", comment: "Tested (Adam Savage)" },
  { id: "UCPD_bxCRGpmmeQcbe2kpPaA", category: "ハウツー/DIY", comment: "First We Feast" },
  { id: "UCY30JRSgfhYXA6i6xX1erWg", category: "ハウツー/DIY", comment: "Mark Rober" },
];

// ============================================================
// YouTube API 取得 & DB投入
// ============================================================

interface YouTubeChannelItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    country?: string;
    thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
  };
  statistics: {
    subscriberCount?: string;
    viewCount?: string;
    videoCount?: string;
    hiddenSubscriberCount?: boolean;
  };
  topicDetails?: {
    topicCategories?: string[];
  };
}

async function fetchChannels(ids: string[], apiKey: string): Promise<YouTubeChannelItem[]> {
  const results: YouTubeChannelItem[] = [];
  // Filter out invalid IDs (ones with trailing numbers used as dedup keys)
  const validIds = ids.filter(id => /^UC[\w-]{22}$/.test(id));
  for (let i = 0; i < validIds.length; i += 50) {
    const batch = validIds.slice(i, i + 50);
    const url = `${BASE_URL}/channels?part=snippet,statistics,topicDetails&id=${batch.join(",")}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`API error: ${res.status} for batch starting at ${i}`);
      continue;
    }
    const data = await res.json();
    results.push(...(data.items ?? []));
  }
  return results;
}

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !supabaseUrl || !serviceRoleKey) {
    console.error("Missing env vars: YOUTUBE_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(supabaseUrl, serviceRoleKey);
  const todayStr = new Date().toISOString().split("T")[0];

  // Build ID → category map
  const jpCategoryMap = new Map<string, string>();
  for (const ch of JAPAN_CHANNELS) {
    jpCategoryMap.set(ch.id, ch.category);
  }
  const globalCategoryMap = new Map<string, string>();
  for (const ch of GLOBAL_CHANNELS) {
    globalCategoryMap.set(ch.id, ch.category);
  }

  // === Japan ===
  console.log("=== Seeding Japan channels ===");
  const jpIds = JAPAN_CHANNELS.map(ch => ch.id);
  const jpChannels = await fetchChannels(jpIds, apiKey);
  console.log(`Fetched ${jpChannels.length} JP channels from YouTube API`);

  let jpCount = 0;
  for (const ch of jpChannels) {
    const category = jpCategoryMap.get(ch.id) ?? "エンタメ";
    const subs = parseInt(ch.statistics.subscriberCount ?? "0", 10);
    const { error } = await admin.from("channels").upsert({
      id: ch.id,
      name: ch.snippet.title,
      description: ch.snippet.description?.substring(0, 500) ?? "",
      thumbnail: ch.snippet.thumbnails.high?.url ?? ch.snippet.thumbnails.medium?.url ?? "",
      country: ch.snippet.country ?? "JP",
      region: "japan",
      category,
      subscribers: subs,
      total_views: parseInt(ch.statistics.viewCount ?? "0", 10),
      video_count: parseInt(ch.statistics.videoCount ?? "0", 10),
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    if (error) {
      console.error(`Error upserting ${ch.snippet.title}: ${error.message}`);
    } else {
      jpCount++;
    }
  }
  console.log(`Inserted/updated ${jpCount} JP channels`);

  // Stats history
  for (const ch of jpChannels) {
    await admin.from("channel_stats_history").upsert({
      channel_id: ch.id,
      date: todayStr,
      subscribers: parseInt(ch.statistics.subscriberCount ?? "0", 10),
      total_views: parseInt(ch.statistics.viewCount ?? "0", 10),
      video_count: parseInt(ch.statistics.videoCount ?? "0", 10),
    }, { onConflict: "channel_id,date" });
  }

  // === Global ===
  console.log("\n=== Seeding Global channels ===");
  const globalIds = GLOBAL_CHANNELS.map(ch => ch.id);
  const globalChannels = await fetchChannels(globalIds, apiKey);
  console.log(`Fetched ${globalChannels.length} global channels from YouTube API`);

  let globalCount = 0;
  for (const ch of globalChannels) {
    const category = globalCategoryMap.get(ch.id) ?? "エンタメ";
    const subs = parseInt(ch.statistics.subscriberCount ?? "0", 10);
    const { error } = await admin.from("channels").upsert({
      id: ch.id,
      name: ch.snippet.title,
      description: ch.snippet.description?.substring(0, 500) ?? "",
      thumbnail: ch.snippet.thumbnails.high?.url ?? ch.snippet.thumbnails.medium?.url ?? "",
      country: ch.snippet.country ?? null,
      region: "global",
      category,
      subscribers: subs,
      total_views: parseInt(ch.statistics.viewCount ?? "0", 10),
      video_count: parseInt(ch.statistics.videoCount ?? "0", 10),
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    if (error) {
      console.error(`Error upserting ${ch.snippet.title}: ${error.message}`);
    } else {
      globalCount++;
    }
  }
  console.log(`Inserted/updated ${globalCount} global channels`);

  for (const ch of globalChannels) {
    await admin.from("channel_stats_history").upsert({
      channel_id: ch.id,
      date: todayStr,
      subscribers: parseInt(ch.statistics.subscriberCount ?? "0", 10),
      total_views: parseInt(ch.statistics.viewCount ?? "0", 10),
      video_count: parseInt(ch.statistics.videoCount ?? "0", 10),
    }, { onConflict: "channel_id,date" });
  }

  // === Summary ===
  const jpCategories = new Map<string, number>();
  for (const ch of jpChannels) {
    const cat = jpCategoryMap.get(ch.id) ?? "その他";
    jpCategories.set(cat, (jpCategories.get(cat) ?? 0) + 1);
  }
  const globalCategories = new Map<string, number>();
  for (const ch of globalChannels) {
    const cat = globalCategoryMap.get(ch.id) ?? "その他";
    globalCategories.set(cat, (globalCategories.get(cat) ?? 0) + 1);
  }

  console.log(`\n=== Done! Total: ${jpCount + globalCount} channels seeded ===`);
  console.log("\nJP categories:");
  for (const [cat, count] of [...jpCategories.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log("\nGlobal categories:");
  for (const [cat, count] of [...globalCategories.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
}

main().catch(console.error);
