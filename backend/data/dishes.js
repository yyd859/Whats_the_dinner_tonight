// 预设美食数据 - 50道中华美食
const dishes = [
  // ===== 川菜 (Sichuan Cuisine) =====
  {
    id: 1,
    name: "宫保鸡丁",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500",
    description: "经典川菜，酸甜微辣，鸡肉嫩滑配花生米",
    category: "川菜",
    difficulty: "中等"
  },
  {
    id: 2,
    name: "麻婆豆腐",
    image: "https://images.unsplash.com/photo-1582576163090-09d3b6f8a969?w=500",
    description: "麻辣鲜香，嫩豆腐配牛肉末",
    category: "川菜",
    difficulty: "中等"
  },
  {
    id: 3,
    name: "鱼香肉丝",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500",
    description: "酸甜微辣，下饭神器",
    category: "川菜",
    difficulty: "中等"
  },
  {
    id: 4,
    name: "水煮牛肉",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500",
    description: "麻辣鲜香，牛肉滑嫩",
    category: "川菜",
    difficulty: "较难"
  },
  {
    id: 5,
    name: "回锅肉",
    image: "https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=500",
    description: "川菜经典，肥瘦相间香味十足",
    category: "川菜",
    difficulty: "中等"
  },
  {
    id: 6,
    name: "酸菜鱼",
    image: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=500",
    description: "酸辣开胃，鱼肉鲜嫩",
    category: "川菜",
    difficulty: "较难"
  },
  {
    id: 7,
    name: "水煮鱼",
    image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=500",
    description: "麻辣鲜美，鱼片滑嫩",
    category: "川菜",
    difficulty: "较难"
  },
  {
    id: 8,
    name: "辣子鸡",
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500",
    description: "外酥里嫩，香辣过瘾",
    category: "川菜",
    difficulty: "中等"
  },
  {
    id: 9,
    name: "夫妻肺片",
    image: "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=500",
    description: "麻辣鲜香，红油四溢",
    category: "川菜",
    difficulty: "中等"
  },

  // ===== 粤菜 (Cantonese Cuisine) =====
  {
    id: 10,
    name: "清蒸鲈鱼",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500",
    description: "鲜嫩清淡，保持原汁原味",
    category: "粤菜",
    difficulty: "中等"
  },
  {
    id: 11,
    name: "白切鸡",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500",
    description: "皮爽肉滑，原汁原味",
    category: "粤菜",
    difficulty: "中等"
  },
  {
    id: 12,
    name: "蜜汁叉烧",
    image: "https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?w=500",
    description: "肥瘦相间，甜香四溢",
    category: "粤菜",
    difficulty: "较难"
  },
  {
    id: 13,
    name: "虾饺",
    image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500",
    description: "皮薄馅鲜，晶莹剔透",
    category: "粤菜",
    difficulty: "较难"
  },
  {
    id: 14,
    name: "烧鹅",
    image: "https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=500",
    description: "皮脆肉嫩，肥而不腻",
    category: "粤菜",
    difficulty: "较难"
  },
  {
    id: 15,
    name: "肠粉",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500",
    description: "爽滑细腻，配料丰富",
    category: "粤菜",
    difficulty: "中等"
  },

  // ===== 湘菜 (Hunan Cuisine) =====
  {
    id: 16,
    name: "剁椒鱼头",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500",
    description: "鲜辣可口，鱼头肥嫩",
    category: "湘菜",
    difficulty: "中等"
  },
  {
    id: 17,
    name: "小炒肉",
    image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=500",
    description: "湘菜经典，香辣下饭",
    category: "湘菜",
    difficulty: "简单"
  },
  {
    id: 18,
    name: "口味虾",
    image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500",
    description: "麻辣鲜香，虾肉Q弹",
    category: "湘菜",
    difficulty: "中等"
  },

  // ===== 鲁菜 (Shandong Cuisine) =====
  {
    id: 19,
    name: "糖醋鲤鱼",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500",
    description: "外焦里嫩，酸甜适口",
    category: "鲁菜",
    difficulty: "较难"
  },
  {
    id: 20,
    name: "葱烧海参",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500",
    description: "葱香浓郁，海参软糯",
    category: "鲁菜",
    difficulty: "较难"
  },
  {
    id: 21,
    name: "九转大肠",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500",
    description: "酸甜苦辣咸五味俱全",
    category: "鲁菜",
    difficulty: "较难"
  },

  // ===== 家常菜 (Home-style Dishes) =====
  {
    id: 22,
    name: "番茄炒蛋",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
    description: "家常必备，简单易做，酸甜开胃",
    category: "家常菜",
    difficulty: "简单"
  },
  {
    id: 23,
    name: "红烧肉",
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500",
    description: "肥而不腻，色泽红亮，入口即化",
    category: "家常菜",
    difficulty: "中等"
  },
  {
    id: 24,
    name: "青椒肉丝",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500",
    description: "清爽下饭，简单快手",
    category: "家常菜",
    difficulty: "简单"
  },
  {
    id: 25,
    name: "糖醋排骨",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500",
    description: "酸甜可口，外焦里嫩",
    category: "家常菜",
    difficulty: "中等"
  },
  {
    id: 26,
    name: "土豆炖牛肉",
    image: "https://images.unsplash.com/photo-1588347818036-4c8b8f551a2c?w=500",
    description: "营养丰富，牛肉软烂土豆香",
    category: "家常菜",
    difficulty: "中等"
  },
  {
    id: 27,
    name: "西红柿牛腩",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500",
    description: "酸甜浓郁，牛腩软烂",
    category: "家常菜",
    difficulty: "中等"
  },
  {
    id: 28,
    name: "红烧茄子",
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=500",
    description: "软糯入味，汤汁浓郁",
    category: "家常菜",
    difficulty: "简单"
  },
  {
    id: 29,
    name: "酸辣土豆丝",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82878a09?w=500",
    description: "酸辣爽脆，开胃下饭",
    category: "家常菜",
    difficulty: "简单"
  },
  {
    id: 30,
    name: "可乐鸡翅",
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500",
    description: "甜香酥嫩，老少皆宜",
    category: "家常菜",
    difficulty: "简单"
  },
  {
    id: 31,
    name: "红烧排骨",
    image: "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=500",
    description: "色泽红亮，肉质酥烂",
    category: "家常菜",
    difficulty: "中等"
  },
  {
    id: 32,
    name: "啤酒鸭",
    image: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=500",
    description: "香气浓郁，鸭肉酥烂",
    category: "家常菜",
    difficulty: "中等"
  },

  // ===== 素菜 (Vegetarian Dishes) =====
  {
    id: 33,
    name: "蒜蓉西兰花",
    image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=500",
    description: "清淡健康，蒜香浓郁",
    category: "素菜",
    difficulty: "简单"
  },
  {
    id: 34,
    name: "炒青菜",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
    description: "清淡健康，快手素菜",
    category: "素菜",
    difficulty: "简单"
  },
  {
    id: 35,
    name: "干煸四季豆",
    image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=500",
    description: "香辣爽口，豆角干香",
    category: "素菜",
    difficulty: "简单"
  },
  {
    id: 36,
    name: "地三鲜",
    image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=500",
    description: "东北名菜，茄子土豆青椒",
    category: "素菜",
    difficulty: "简单"
  },
  {
    id: 37,
    name: "醋溜白菜",
    image: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=500",
    description: "酸爽开胃，清脆可口",
    category: "素菜",
    difficulty: "简单"
  },

  // ===== 凉菜 (Cold Dishes) =====
  {
    id: 38,
    name: "凉拌黄瓜",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500",
    description: "清爽开胃，夏日必备",
    category: "凉菜",
    difficulty: "简单"
  },
  {
    id: 39,
    name: "蒜泥白肉",
    image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=500",
    description: "蒜香浓郁，肥而不腻",
    category: "凉菜",
    difficulty: "简单"
  },
  {
    id: 40,
    name: "皮蛋豆腐",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=500",
    description: "清爽滑嫩，开胃小菜",
    category: "凉菜",
    difficulty: "简单"
  },
  {
    id: 41,
    name: "口水鸡",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500",
    description: "麻辣鲜香，鸡肉嫩滑",
    category: "凉菜",
    difficulty: "中等"
  },

  // ===== 主食 (Staples) =====
  {
    id: 42,
    name: "蛋炒饭",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500",
    description: "简单快手，粒粒分明",
    category: "主食",
    difficulty: "简单"
  },
  {
    id: 43,
    name: "扬州炒饭",
    image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=500",
    description: "配料丰富，色香味俱全",
    category: "主食",
    difficulty: "中等"
  },
  {
    id: 44,
    name: "饺子",
    image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500",
    description: "皮薄馅大，鲜香可口",
    category: "主食",
    difficulty: "中等"
  },
  {
    id: 45,
    name: "炸酱面",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500",
    description: "老北京风味，酱香浓郁",
    category: "主食",
    difficulty: "中等"
  },
  {
    id: 46,
    name: "葱油拌面",
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=500",
    description: "葱香四溢，简单美味",
    category: "主食",
    difficulty: "简单"
  },
  {
    id: 47,
    name: "小笼包",
    image: "https://images.unsplash.com/photo-1539136788836-5699e78bfc75?w=500",
    description: "皮薄汤多，鲜香嫩滑",
    category: "主食",
    difficulty: "较难"
  },
  {
    id: 48,
    name: "葱油饼",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500",
    description: "层层酥脆，葱香浓郁",
    category: "主食",
    difficulty: "中等"
  },

  // ===== 汤类 (Soups) =====
  {
    id: 49,
    name: "酸辣汤",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500",
    description: "酸辣开胃，暖胃驱寒",
    category: "汤类",
    difficulty: "简单"
  },
  {
    id: 50,
    name: "紫菜蛋花汤",
    image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=500",
    description: "清淡鲜美，营养快手",
    category: "汤类",
    difficulty: "简单"
  }
];

module.exports = dishes;
