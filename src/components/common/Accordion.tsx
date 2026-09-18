/** 折叠项定义。 */
interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

/** 折叠列表属性。 */
interface AccordionProps {
  items: AccordionItem[];
}

/**
 * 使用原生 details 提供无需 JavaScript 状态的渐进增强折叠列表。
 * @param props 折叠项列表。
 * @returns 可键盘操作的折叠内容。
 */
export function Accordion({ items }: AccordionProps) {
  return (
    <div className="accordion">
      {items.map((item) => (
        <details className="accordion__item" key={item.id}>
          <summary className="accordion__summary">{item.title}</summary>
          <div className="accordion__content">
            <p>{item.content}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
