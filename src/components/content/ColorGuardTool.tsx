import { useEffect, useRef, useState, type ChangeEvent } from 'react';

type Simulation = 'deuteranopia' | 'protanomaly' | 'tritanomaly';

const simulations: Record<Simulation, { label: string; matrix: number[][] }> = {
  deuteranopia: {
    label: '红绿色盲',
    matrix: [
      [0.378, 0.622, 0],
      [0.378, 0.622, 0],
      [0, 0.154, 0.846],
    ],
  },
  protanomaly: {
    label: '红色弱',
    matrix: [
      [0.62, 0.38, 0],
      [0.259, 0.741, 0],
      [0, 0.141, 0.859],
    ],
  },
  tritanomaly: {
    label: '蓝黄色弱',
    matrix: [
      [0.95, 0.05, 0],
      [0, 0.433, 0.567],
      [0, 0.475, 0.525],
    ],
  },
};

const presets = [
  { label: '折线图', file: 'line-chart.jpg' },
  { label: '应力云图', file: 'stress-map.jpg' },
  { label: '化学显色', file: 'ph-colors.jpg' },
  { label: '热力图', file: 'heatmap.jpg' },
  { label: '柱状图', file: 'bar-chart.png' },
];

/** @returns 可在 Education 页面直接使用的本地化 ColorGuard 图像模拟器。 */
export function ColorGuardTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | undefined>(undefined);
  const [source, setSource] = useState(
    `${import.meta.env.BASE_URL}pages/education/images/colorguard/${presets[0].file}`,
  );
  const [sourceLabel, setSourceLabel] = useState(presets[0].label);
  const [simulation, setSimulation] = useState<Simulation>('deuteranopia');
  const [processed, setProcessed] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.drawImage(image, 0, 0);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;
      const matrix = simulations[simulation].matrix;
      for (let index = 0; index < data.length; index += 4) {
        const red = data[index];
        const green = data[index + 1];
        const blue = data[index + 2];
        data[index] = matrix[0][0] * red + matrix[0][1] * green + matrix[0][2] * blue;
        data[index + 1] = matrix[1][0] * red + matrix[1][1] * green + matrix[1][2] * blue;
        data[index + 2] = matrix[2][0] * red + matrix[2][1] * green + matrix[2][2] * blue;
      }
      context.putImageData(imageData, 0, 0);
      setProcessed(canvas.toDataURL('image/png'));
      setError('');
    };
    image.onerror = () => setError('图片无法读取，请更换图片后重试。');
    image.src = source;
  }, [simulation, source]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  /** 将访客选择的图片保留在当前浏览器标签页内处理。 */
  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件。');
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    setSource(objectUrlRef.current);
    setSourceLabel(file.name);
    event.target.value = '';
  }

  /** 选择随 Wiki 发布的测试图。 */
  function choosePreset(label: string, file: string) {
    setSource(`${import.meta.env.BASE_URL}pages/education/images/colorguard/${file}`);
    setSourceLabel(label);
  }

  return (
    <section className="color-guard" aria-labelledby="color-guard-title">
      <div className="color-guard__header">
        <div>
          <p className="color-guard__eyebrow">INTERACTIVE TOOL · 浏览器本地处理</p>
          <h3 id="color-guard-title">ColorGuard 色觉模拟</h3>
          <p>选择测试图，或从设备载入图片，立即比较原图与模拟结果。</p>
        </div>
        <button
          className="color-guard__upload"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          选择本地图片
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} hidden />
      </div>

      <div className="color-guard__presets" aria-label="测试图片">
        <span>测试图片</span>
        {presets.map((preset) => (
          <button
            type="button"
            key={preset.file}
            aria-pressed={sourceLabel === preset.label}
            onClick={() => choosePreset(preset.label, preset.file)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="color-guard__comparison" aria-live="polite">
        <figure>
          <figcaption>
            <span>01</span> 原始图像
          </figcaption>
          <div className="color-guard__image">
            <img src={source} alt={`${sourceLabel}原始图像`} />
          </div>
        </figure>
        <figure>
          <figcaption>
            <span>02</span> {simulations[simulation].label}模拟
          </figcaption>
          <div className="color-guard__image">
            {processed ? (
              <img src={processed} alt={`${sourceLabel}${simulations[simulation].label}模拟结果`} />
            ) : null}
          </div>
        </figure>
      </div>

      <div className="color-guard__footer">
        <div className="color-guard__filters" aria-label="色觉模拟类型">
          {(Object.keys(simulations) as Simulation[]).map((key) => (
            <button
              type="button"
              key={key}
              aria-pressed={simulation === key}
              onClick={() => setSimulation(key)}
            >
              {simulations[key].label}
            </button>
          ))}
        </div>
      </div>
      {error ? (
        <p className="color-guard__error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
