import { useCallback, useEffect, useState } from 'react';

/** 异步数据请求的可辨识状态。 */
export type AsyncState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'empty'; data: T; error: null }
  | { status: 'error'; data: null; error: Error };

/**
 * 封装加载、错误、空数据和重试逻辑；页面只负责决定各状态的展示结构。
 * @param loader 无参数异步加载函数，应支持由外部封装 fetch 或模拟数据。
 * @param isEmpty 判断返回数据是否为空的函数。
 * @returns 当前异步状态及 retry 重试函数。
 */
export function useAsyncData<T>(loader: () => Promise<T>, isEmpty: (data: T) => boolean) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading', data: null, error: null });

  useEffect(() => {
    let active = true;
    loader().then(
      (data) => {
        if (active)
          setState(
            isEmpty(data)
              ? { status: 'empty', data, error: null }
              : { status: 'success', data, error: null },
          );
      },
      (error: unknown) => {
        if (active)
          setState({
            status: 'error',
            data: null,
            error: error instanceof Error ? error : new Error('未知错误'),
          });
      },
    );
    return () => {
      active = false;
    };
  }, [isEmpty, loader]);

  /** 由用户事件触发重试，先恢复加载态，再执行相同加载流程。 */
  const retry = useCallback(async (): Promise<void> => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const data = await loader();
      setState(
        isEmpty(data)
          ? { status: 'empty', data, error: null }
          : { status: 'success', data, error: null },
      );
    } catch (error) {
      setState({
        status: 'error',
        data: null,
        error: error instanceof Error ? error : new Error('未知错误'),
      });
    }
  }, [isEmpty, loader]);

  return { state, retry };
}
