const CARD_FILES = [
  '画板 1.png',
  '画板 2.png',
  '画板 3.png',
  '画板 4.png',
  '画板 5.png',
  '画板 6.png',
  '画板 7.png',
  '画板 8.png',
  '画板 9.png',
  '画板 10.png',
  '说明卡1.png',
  '说明卡2.jpg',
  '说明卡3.png',
  '说明卡4.png',
  '说明卡5.png',
  '说明卡6.png',
  '说明卡7.png',
  '自杀开关1.png',
  '自杀开关2.png',
] as const;

export const bacteriaGuardianCards = CARD_FILES.map((filename, index) => ({
  src: `${import.meta.env.BASE_URL}images/ihp/cards/${encodeURIComponent(filename)}`,
  alt: `细菌卫士卡牌 ${index + 1}`,
}));
