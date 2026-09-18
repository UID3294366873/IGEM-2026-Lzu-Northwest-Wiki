/** 通用表格列定义。 */
interface TableColumn<T> {
  key: keyof T;
  label: string;
}

/** 通用数据表属性。 */
interface DataTableProps<T extends object> {
  caption: string;
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
}

/**
 * 渲染带 caption、表头和横向滚动容器的数据表。
 * @param props 表格说明、列、行和稳定键生成函数。
 * @returns 可访问数据表。
 */
export function DataTable<T extends object>({
  caption,
  columns,
  rows,
  getRowKey,
}: DataTableProps<T>) {
  return (
    <div className="data-table" tabIndex={0}>
      <table className="data-table__table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th scope="col" key={String(column.key)}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => (
                <td key={String(column.key)}>{String(row[column.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
