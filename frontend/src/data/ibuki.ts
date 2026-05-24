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
  nearbyPlace: string;
  intro: string;
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
    image: require("@/assets/images/placeholders/film-camera.png"),
    beginnerNote:
      "写ルンですや中古コンパクトから。現像店を1つ見つけると続けやすい。",
    nearbyPlace: "渋谷フォトラボ · 徒歩8分",
    intro:
      "街の光や影を、あとでゆっくり受け取る趣味。散歩の速度が少しだけ変わります。",
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
    image: require("@/assets/images/placeholders/togei.png"),
    beginnerNote: "体験教室で湯呑みを1つ。エプロンだけ持っていけば大丈夫。",
    nearbyPlace: "代々木うつわ工房 · 電車12分",
    intro:
      "形がゆっくり立ち上がる時間を楽しむ趣味。完成まで待つことも、体験の一部です。",
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
    image: require("@/assets/images/placeholders/jazz-kissa.png"),
    beginnerNote: "会話より音を聴く場所。まずは昼の時間帯に一杯だけ。",
    nearbyPlace: "道玄坂 Quiet Blue · 徒歩9分",
    intro: "大きなスピーカーと暗い灯りの中で、音楽に場所ごと浸る趣味です。",
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
    image: require("@/assets/images/placeholders/birdwatching.png"),
    beginnerNote:
      "双眼鏡がなくても、鳴き声アプリと公園のベンチから始められる。",
    nearbyPlace: "明治神宮外苑 · 電車10分",
    intro: "街の中の小さな動きを見つける趣味。朝の散歩が観察の時間になります。",
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
    image: require("@/assets/images/placeholders/tanka.png"),
    beginnerNote:
      "まずは好きな一首を写すところから。SNS投稿でも十分に入口です。",
    nearbyPlace: "青山ブックセンター · 徒歩18分",
    intro: "短い形式に生活の湿度を閉じ込める趣味。読むだけでも始まります。",
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
    image: require("@/assets/images/placeholders/board-game.png"),
    beginnerNote: "相席歓迎のカフェで、15分ルールの軽いゲームから。",
    nearbyPlace: "恵比寿 Table Door · 徒歩14分",
    intro:
      "会話と考える時間が自然に混ざる趣味。初対面でもルールが間をつないでくれます。",
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
    image: require("@/assets/images/placeholders/sauna.png"),
    beginnerNote:
      "水分補給を忘れず、短いセットから。休憩を長めに取ると楽しい。",
    nearbyPlace: "笹塚マルシンスパ · 電車16分",
    intro: "熱い部屋、水風呂、外気浴。単純な反復が生活のリズムになります。",
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
    image: require("@/assets/images/placeholders/bookstores.png"),
    beginnerNote:
      "知らない駅で小さな本屋を1つ探す。買わなくても、棚を見るだけでいい。",
    nearbyPlace: "渋谷 Publishing & Books · 徒歩6分",
    intro:
      "本棚を通して街を見る趣味。旅ほど大きくなく、散歩より少し深い時間です。",
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

export function getHobbyById(id: string | string[] | undefined) {
  const hobbyId = Array.isArray(id) ? id[0] : id;
  return hobbies.find((hobby) => hobby.id === hobbyId) ?? hobbies[0];
}

export function getEncounterHobby(encounter: Encounter) {
  return hobbies.find((hobby) => hobby.id === encounter.hobbyId) ?? hobbies[0];
}
