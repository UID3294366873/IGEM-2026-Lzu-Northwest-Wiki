const CARD_FILES = [
  { filename: '01_environment_switch.jpg', alt: '细菌卫士卡牌：环境响应开关' },
  { filename: '02_temperature_switch.jpg', alt: '细菌卫士卡牌：温度响应开关' },
  { filename: '03_rules.jpg', alt: '细菌卫士卡牌：游戏规则' },
  { filename: '04_level1.jpg', alt: '细菌卫士卡牌：第一关' },
  { filename: '05_level2.jpg', alt: '细菌卫士卡牌：第二关' },
  { filename: '06_level3.jpg', alt: '细菌卫士卡牌：第三关' },
  { filename: '07_level4.jpg', alt: '细菌卫士卡牌：第四关' },
  { filename: '08_level5_new.jpg', alt: '细菌卫士卡牌：第五关' },
  { filename: '09_level6.jpg', alt: '细菌卫士卡牌：第六关' },
  { filename: '画板 1.png', alt: '细菌卫士元件牌 1' },
  { filename: '画板 2.png', alt: '细菌卫士元件牌 2' },
  { filename: '画板 3.png', alt: '细菌卫士元件牌 3' },
  { filename: '画板 4.png', alt: '细菌卫士元件牌 4' },
  { filename: '画板 5.png', alt: '细菌卫士元件牌 5' },
  { filename: '画板 6.png', alt: '细菌卫士元件牌 6' },
  { filename: '画板 7.png', alt: '细菌卫士元件牌 7' },
  { filename: '画板 8.png', alt: '细菌卫士元件牌 8' },
  { filename: '画板 9.png', alt: '细菌卫士元件牌 9' },
  { filename: '画板 10.png', alt: '细菌卫士元件牌 10' },
] as const;

export const bacteriaGuardianCards = CARD_FILES.map(({ filename, alt }) => ({
  src: `${import.meta.env.BASE_URL}shared/images/bacteria-guardian/${encodeURIComponent(filename)}`,
  alt,
}));
