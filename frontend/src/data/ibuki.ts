import type { ImageSourcePropType } from "react-native";

export type PhotoTone =
  | "warm"
  | "dawn"
  | "dusk"
  | "night"
  | "clay"
  | "moss"
  | "ink"
  | "mint"
  | "paper";

export type Hobby = {
  id: string;
  number: string;
  nameJa: string;
  nameEn: string;
  slug: string;
  tags: string[];
  quote: string;
  distance: string;
  lastSeen: string;
  savedAt: string;
  photoTone: PhotoTone;
  image: ImageSourcePropType;
  beginnerNote: string;
  intro: string;
  howToStart: string[]; // 3-4 steps for starting this hobby
};

export type Encounter = {
  id: string;
  hobbyId: string;
  time: string;
  distance: string;
  isNew: boolean;
  context: string;
};

export type EntryStep = {
  id: string;
  title: string;
  description: string;
  status: "done" | "active" | "locked";
};

export type ProfileSummary = {
  handle: string;
  location: string;
  since: string;
  savedCount: number;
  sharingCount: number;
  mutualCount: number;
  level: string;
};

export type SukiAction = {
  id: string;
  title: string;
  description: string;
  example?: string;
};

export type SukiActionLog = {
  id: string;
  sukiId: string;
  actionId: string;
  timestamp: string;
  notes?: string;
};

export type PlanterItem = {
  id: string;
  sukiId: string;
  startDate: string;
  level: number;
  actionCount: number;
  lastActionDate: string;
};

export type GrowthStatus = {
  level: number;
  actionCount: number;
  lastActionDate: string;
  nextLevelProgressPercent: number;
};

export const hobbies: Hobby[] = [
  {
    id: "film-camera",
    number: "041",
    nameJa: "フィルムカメラ",
    nameEn: "Film Camera",
    slug: "film camera",
    tags: ["#散歩", "#写真", "#レトロ"],
    quote: "何気ない日常が、少し映画っぽく見えるから。",
    distance: "110m",
    lastSeen: "3分前",
    savedAt: "今日",
    photoTone: "dusk",
    image: require("@/assets/images/hobbies/film-camera -dusk-.png"),
    beginnerNote:
      "写ルンですや中古コンパクトから。現像店を1つ見つけると続けやすい。",
    intro:
      "街の光や影を、あとでゆっくり受け取る趣味。散歩の速度が少しだけ変わります。",
    howToStart: [
      "ネットで安い中古フィルムカメラを探す",
      "最初の一本は写ルンですで試す",
      "近所のカメラ屋で現像に出す",
      "写真を見返して世界を再発見する",
    ],
  },
  {
    id: "togei",
    number: "012",
    nameJa: "陶芸",
    nameEn: "Togei",
    slug: "togei",
    tags: ["#手仕事", "#集中", "#土"],
    quote: "土に触れる時間を、自分のペースで。",
    distance: "1.2km",
    lastSeen: "昨日",
    savedAt: "3日前",
    photoTone: "clay",
    image: require("@/assets/images/hobbies/pottery -clay-.png"),
    beginnerNote: "体験教室で湯呑みを1つ。エプロンだけ持っていけば大丈夫。",
    intro:
      "形がゆっくり立ち上がる時間を楽しむ趣味。完成まで待つことも、体験の一部です。",
    howToStart: [
      "YouTube で陶芸の基本動画を見る",
      "近所の体験教室を探してネット予約",
      "初回は湯呑みやお皿を一つ作る",
      "焼き上がりを受け取りに行く",
    ],
  },
  {
    id: "jazz-kissa",
    number: "022",
    nameJa: "ジャズ喫茶",
    nameEn: "Jazz Kissa",
    slug: "jazz kissa",
    tags: ["#音楽", "#街歩き"],
    quote: "知らないレコードに、静かに会いに行く。",
    distance: "510m",
    lastSeen: "26分前",
    savedAt: "1週前",
    photoTone: "night",
    image: require("@/assets/images/hobbies/jazz-kissa -night-.png"),
    beginnerNote: "会話より音を聴く場所。まずは昼の時間帯に一杯だけ。",
    intro: "大きなスピーカーと暗い灯りの中で、音楽に場所ごと浸る趣味です。",
    howToStart: [
      "ジャズの入門盤をSpotifyで聴いてみる",
      "ネットで近所のジャズ喫茶を検索",
      "昼間に一人で訪れてコーヒー一杯",
      "好きなアーティストをスタッフに聞く",
    ],
  },
  {
    id: "birdwatching",
    number: "014",
    nameJa: "野鳥観察",
    nameEn: "Birdwatching",
    slug: "birdwatching",
    tags: ["#自然", "#朝"],
    quote: "同じ道に、知らない気配が増えていく。",
    distance: "4.2km",
    lastSeen: "2時間前",
    savedAt: "3週前",
    photoTone: "moss",
    image: require("@/assets/images/hobbies/birdwatching -dawn-.png"),
    beginnerNote:
      "双眼鏡がなくても、鳴き声アプリと公園のベンチから始められる。",
    intro: "街の中の小さな動きを見つける趣味。朝の散歩が観察の時間になります。",
    howToStart: [
      "鳴き声認識アプリをスマホに入れる",
      "早朝に近所の公園に行ってみる",
      "ベンチに座って聞こえる鳥の声を記録",
      "図書館で野鳥図鑑を借りて確認",
    ],
  },
  {
    id: "tanka",
    number: "058",
    nameJa: "短歌",
    nameEn: "Tanka",
    slug: "tanka",
    tags: ["#言葉"],
    quote: "一日の端っこを、五七五七七で残す。",
    distance: "—",
    lastSeen: "先週",
    savedAt: "2週前",
    photoTone: "paper",
    image: require("@/assets/images/hobbies/tanka -ink-.png"),
    beginnerNote:
      "まずは好きな一首を写すところから。SNS投稿でも十分に入口です。",
    intro: "短い形式に生活の湿度を閉じ込める趣味。読むだけでも始まります。",
    howToStart: [
      "好きな短歌を集めた本をAmazonで探す",
      "好きな一首を声に出して読んでみる",
      "自分で3行の短歌風テキストを作成",
      "SNSでハッシュタグ付けで投稿",
    ],
  },
  {
    id: "board-game",
    number: "073",
    nameJa: "ボードゲーム",
    nameEn: "Board Game",
    slug: "board game",
    tags: ["#人と", "#戦略"],
    quote: "小さな盤面で、知らない人と同じ時間を囲む。",
    distance: "850m",
    lastSeen: "1時間前",
    savedAt: "2週前",
    photoTone: "mint",
    image: require("@/assets/images/hobbies/board-game -mint-.png"),
    beginnerNote: "相席歓迎のカフェで、15分ルールの軽いゲームから。",
    intro:
      "会話と考える時間が自然に混ざる趣味。初対面でもルールが間をつないでくれます。",
    howToStart: [
      "YouTubeでボードゲームのルール動画を見る",
      "相席歓迎のボドゲカフェをネットで検索",
      "簡単な15分ゲームから始める",
      "毎週ゲーム会に参加",
    ],
  },
  {
    id: "sauna",
    number: "031",
    nameJa: "サウナ巡り",
    nameEn: "Sauna",
    slug: "sauna",
    tags: ["#整う", "#夜"],
    quote: "熱と水で、一日を区切り直す。",
    distance: "700m",
    lastSeen: "4時間前",
    savedAt: "先月",
    photoTone: "warm",
    image: require("@/assets/images/hobbies/sento.png"),
    beginnerNote:
      "水分補給を忘れず、短いセットから。休憩を長めに取ると楽しい。",
    intro: "熱い部屋、水風呂、外気浴。単純な反復が生活のリズムになります。",
    howToStart: [
      "近所のサウナ施設をGoogleマップで探す",
      "初回は無理なく短いセット5分から",
      "水風呂で冷やして外気浴の時間を楽しむ",
      "定期的に通ってお気に入りを見つける",
    ],
  },
  {
    id: "bookstores",
    number: "066",
    nameJa: "本屋散歩",
    nameEn: "Bookstores",
    slug: "bookstores",
    tags: ["#街歩き", "#本"],
    quote: "目的のない棚の前で、次の興味が見つかる。",
    distance: "320m",
    lastSeen: "今朝",
    savedAt: "先月",
    photoTone: "ink",
    image: require("@/assets/images/hobbies/paper.png"),
    beginnerNote:
      "知らない駅で小さな本屋を1つ探す。買わなくても、棚を見るだけでいい。",
    intro:
      "本棚を通して街を見る趣味。旅ほど大きくなく、散歩より少し深い時間です。",
    howToStart: [
      "知らない駅に降りて散歩してみる",
      "小さな個人書店を探してみる",
      "興味がなくても本のカバーを眺める",
      "一冊だけ買って帰る",
    ],
  },
];

export const encounters: Encounter[] = [
  {
    id: "enc-1",
    hobbyId: "film-camera",
    time: "3分前",
    distance: "110m",
    isNew: true,
    context: "dusk walk",
  },
  {
    id: "enc-2",
    hobbyId: "jazz-kissa",
    time: "26分前",
    distance: "510m",
    isNew: false,
    context: "after work",
  },
  {
    id: "enc-3",
    hobbyId: "board-game",
    time: "1時間前",
    distance: "850m",
    isNew: false,
    context: "station side",
  },
  {
    id: "enc-4",
    hobbyId: "birdwatching",
    time: "2時間前",
    distance: "4.2km",
    isNew: false,
    context: "morning park",
  },
];

export const encounterFilters = ["全て", "新しい", "近い順", "ひとり向け"];
export const savedFilters = [
  "全て",
  "今週",
  "いつかやってみたい",
  "近くで体験できる",
  "初心者向け",
];

export const entrySteps: EntryStep[] = [
  {
    id: "find",
    title: "近くの教室を1つ見る",
    description: "料金と所要時間だけ確認する",
    status: "done",
  },
  {
    id: "book",
    title: "体験日を仮で決める",
    description: "週末の午前か平日の夜がおすすめ",
    status: "active",
  },
  {
    id: "go",
    title: "手ぶら体験に行く",
    description: "汚れてもいい服だけ選ぶ",
    status: "locked",
  },
  {
    id: "keep",
    title: "完成品を受け取る",
    description: "次に作りたい形をメモする",
    status: "locked",
  },
];

export const profileSummary: ProfileSummary = {
  handle: "@anon_4129",
  location: "東京",
  since: "2026.03",
  savedCount: 14,
  sharingCount: 3,
  mutualCount: 2,
  level: "L3",
};

export const sukiActions: SukiAction[] = [
  {
    id: "action-1",
    title: "動画を見てみる",
    description: "YouTubeやネットで関連動画を視聴",
    example: "フィルムカメラの使い方動画を見た",
  },
  {
    id: "action-2",
    title: "本や記事を読む",
    description: "本屋やネットで情報収集",
    example: "陶芸の技法についての本を読んだ",
  },
  {
    id: "action-3",
    title: "体験に行く",
    description: "実際に体験教室やイベントに参加",
    example: "陶芸の体験教室に行った",
  },
  {
    id: "action-4",
    title: "道具や材料を買う",
    description: "必要な道具や材料を購入",
    example: "フィルムカメラを購入した",
  },
  {
    id: "action-5",
    title: "友人と一緒にやる",
    description: "知人や友人と共に楽しむ",
    example: "友人とサウナ巡りに行った",
  },
  {
    id: "action-6",
    title: "その他",
    description: "上記以外の行動",
    example: "",
  },
];

export const planterItems: PlanterItem[] = [
  {
    id: "planter-1",
    sukiId: "togei",
    startDate: "2026-04-15",
    level: 3,
    actionCount: 7,
    lastActionDate: "2026-05-23",
  },
  {
    id: "planter-2",
    sukiId: "sauna",
    startDate: "2026-05-01",
    level: 2,
    actionCount: 4,
    lastActionDate: "2026-05-24",
  },
  {
    id: "planter-3",
    sukiId: "jazz-kissa",
    startDate: "2026-04-01",
    level: 4,
    actionCount: 12,
    lastActionDate: "2026-05-20",
  },
];

export const sukiActionLogs: SukiActionLog[] = [
  {
    id: "log-1",
    sukiId: "togei",
    actionId: "action-3",
    timestamp: "2026-05-23",
    notes: "代々木うつわ工房で手ひねり体験。湯呑みを成形した。",
  },
  {
    id: "log-2",
    sukiId: "togei",
    actionId: "action-1",
    timestamp: "2026-05-20",
    notes: "NHK手仕事の動画を見て、釉薬の掛け方について学んだ。",
  },
  {
    id: "log-3",
    sukiId: "togei",
    actionId: "action-4",
    timestamp: "2026-05-15",
    notes: "粘土のセットと簡易的なろくろを購入。",
  },
  {
    id: "log-4",
    sukiId: "togei",
    actionId: "action-1",
    timestamp: "2026-05-10",
    notes: "陶芸の基本について Coursera で動画を見た。",
  },
  {
    id: "log-5",
    sukiId: "sauna",
    actionId: "action-5",
    timestamp: "2026-05-24",
    notes: "友人とサウナ好きの新店舗を一緒に体験。",
  },
  {
    id: "log-6",
    sukiId: "sauna",
    actionId: "action-1",
    timestamp: "2026-05-18",
    notes: "サウナ本を読み始めた。",
  },
  {
    id: "log-7",
    sukiId: "jazz-kissa",
    actionId: "action-3",
    timestamp: "2026-05-20",
    notes: "赤坂ジャズ喫茶でひとりでレコードを聴いた。",
  },
  {
    id: "log-8",
    sukiId: "jazz-kissa",
    actionId: "action-1",
    timestamp: "2026-05-15",
    notes: "ジャズの歴史ドキュメンタリーを見た。",
  },
];

export function getHobbyById(id: string | string[] | undefined) {
  const hobbyId = Array.isArray(id) ? id[0] : id;
  return hobbies.find((hobby) => hobby.id === hobbyId) ?? hobbies[0];
}

export function getEncounterHobby(encounter: Encounter) {
  return hobbies.find((hobby) => hobby.id === encounter.hobbyId) ?? hobbies[0];
}

export function getPlanterItem(sukiId: string): PlanterItem | undefined {
  return planterItems.find((item) => item.sukiId === sukiId);
}

export function getGrowthStatus(sukiId: string): GrowthStatus {
  const item = getPlanterItem(sukiId);
  if (!item) {
    return { level: 0, actionCount: 0, lastActionDate: "", nextLevelProgressPercent: 0 };
  }

  const nextLevelThreshold = (item.level + 1) * 4;
  const progressPercent = Math.min(
    Math.round((item.actionCount / nextLevelThreshold) * 100),
    100
  );

  return {
    level: item.level,
    actionCount: item.actionCount,
    lastActionDate: item.lastActionDate,
    nextLevelProgressPercent: progressPercent,
  };
}

export function getSukiActionLogsForSuki(sukiId: string): SukiActionLog[] {
  return sukiActionLogs.filter((log) => log.sukiId === sukiId);
}

export function getSukiActionById(actionId: string): SukiAction | undefined {
  return sukiActions.find((action) => action.id === actionId);
}
