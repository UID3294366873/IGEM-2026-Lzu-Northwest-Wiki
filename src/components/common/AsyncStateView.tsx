import type { ReactNode } from 'react';

/** 异步状态展示属性。 */
interface AsyncStateViewProps {
  status: 'loading' | 'error' | 'empty';
  message?: string;
  onRetry?: () => void;
  children?: ReactNode;
}

/**
 * 统一 Loading、Error 与 Empty 的可访问提示，业务页面无需依赖固定 DOM。
 * @param props 状态、补充消息、重试回调及可选内容。
 * @returns 对应状态展示块。
 */
export function AsyncStateView({ status, message, onRetry, children }: AsyncStateViewProps) {
  const labels = { loading: '正在加载…', error: '加载失败。', empty: '暂无数据。' };
  return (
    <section
      className={`async-state async-state--${status}`}
      aria-live="polite"
      aria-busy={status === 'loading'}
    >
      <p>{message || labels[status]}</p>
      {children}
      {status === 'error' && onRetry ? (
        <button type="button" onClick={onRetry}>
          重试
        </button>
      ) : null}
    </section>
  );
}
