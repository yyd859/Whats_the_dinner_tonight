// 预设美食数据
const dishes = [
  {
    id: 1,
    name: "宫保鸡丁",
    image: "https://images.unsplash.com/photo-1603073163308-9b4074e9f8d2?w=500",
    description: "经典川菜，酸甜微辣，鸡肉嫩滑配花生米",
    category: "川菜",
    difficulty: "中等"
  },
  {
    id: 2,
    name: "番茄炒蛋",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500",
    description: "家常必备，简单易做，酸甜开胃",
    category: "家常菜",
    difficulty: "简单"
  },
  {
    id: 3,
    name: "红烧肉",
    image: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=500",
    description: "肥而不腻，色泽红亮，入口即化",
    category: "家常菜",
    difficulty: "中等"
  },
  {
    id: 4,
    name: "麻婆豆腐",
    image: "https://images.unsplash.com/photo-1633806446509-59f7e5da0c2c?w=500",
    description: "麻辣鲜香，嫩豆腐配牛肉末",
    category: "川菜",
    difficulty: "中等"
  },
  {
    id: 5,
    name: "清蒸鲈鱼",
    image: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=500",
    description: "鲜嫩清淡，保持原汁原味",
    category: "粤菜",
    difficulty: "中等"
  },
  {
    id: 6,
    name: "鱼香肉丝",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500",
    description: "酸甜微辣，下饭神器",
    category: "川菜",
    difficulty: "中等"
  },
  {
    id: 7,
    name: "酸菜鱼",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500",
    description: "酸辣开胃，鱼肉鲜嫩",
    category: "川菜",
    difficulty: "较难"
  },
  {
    id: 8,
    name: "土豆炖牛肉",
    image: "https://images.unsplash.com/photo-1588347818036-4c8b8f551a2c?w=500",
    description: "营养丰富，牛肉软烂土豆香",
    category: "家常菜",
    difficulty: "中等"
  },
  {
    id: 9,
    name: "青椒肉丝",
    image: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=500",
    description: "清爽下饭，简单快手",
    category: "家常菜",
    difficulty: "简单"
  },
  {
    id: 10,
    name: "糖醋排骨",
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500",
    description: "酸甜可口，外焦里嫩",
    category: "家常菜",
    difficulty: "中等"
  },
  {
    id: 11,
    name: "水煮牛肉",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500",
    description: "麻辣鲜香，牛肉滑嫩",
    category: "川菜",
    difficulty: "较难"
  },
  {
    id: 12,
    name: "西红柿牛腩",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500",
    description: "酸甜浓郁，牛腩软烂",
    category: "家常菜",
    difficulty: "中等"
  },
  {
    id: 13,
    name: "蒜蓉西兰花",
    image: "https://images.unsplash.com/photo-1628773822990-202c9cf02056?w=500",
    description: "清淡健康，蒜香浓郁",
    category: "素菜",
    difficulty: "简单"
  },
  {
    id: 14,
    name: "红烧茄子",
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=500",
    description: "软糯入味，汤汁浓郁",
    category: "家常菜",
    difficulty: "简单"
  },
  {
    id: 15,
    name: "回锅肉",
    image: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=500",
    description: "川菜经典，肥瘦相间香味十足",
    category: "川菜",
    difficulty: "中等"
  },
  {
    id: 16,
    name: "凉拌黄瓜",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500",
    description: "清爽开胃，夏日必备",
    category: "凉菜",
    difficulty: "简单"
  },
  {
    id: 17,
    name: "香辣虾",
    image: "https://images.unsplash.com/photo-1633801259435-c87a7e2f8f8f?w=500",
    description: "麻辣鲜香，虾肉Q弹",
    category: "川菜",
    difficulty: "中等"
  },
  {
    id: 18,
    name: "蛋炒饭",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500",
    description: "简单快手，粒粒分明",
    category: "主食",
    difficulty: "简单"
  },
  {
    id: 19,
    name: "酸辣土豆丝",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500",
    description: "酸辣爽脆，开胃下饭",
    category: "家常菜",
    difficulty: "简单"
  },
  {
    id: 20,
    name: "炒青菜",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
    description: "清淡健康，快手素菜",
    category: "素菜",
    difficulty: "简单"
  }
];

module.exports = dishes;
