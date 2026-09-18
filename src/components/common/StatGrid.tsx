/** 单个统计项。 */
interface StatItem {
  value: string;
  label: string;
  detail?: string;
}

/** 统计网格属性。 */
interface StatGridProps {
  items: StatItem[];
  label: string;
}

/**
 * 以描述列表展示核心数字和摘要。
 * @param props 统计项和无障碍标签。
 * @returns 响应式统计网格。
 */
export function StatGrid({ items, label }: StatGridProps) {
  return (
    <dl className="stat-grid" aria-label={label}>
      {items.map((item) => (
        <div className="stat-grid__item" key={item.label}>
          <dd className="stat-grid__value">{item.value}</dd>
          <dt className="stat-grid__label">{item.label}</dt>
          {item.detail ? <dd className="stat-grid__detail">{item.detail}</dd> : null}
        </div>
      ))}
    </dl>
  );
}
