import { useCallback, useState } from 'react';

/**
 * 管理可展开区域的开关状态，适用于移动导航、抽屉和说明面板。
 * @param initialOpen 初始是否展开，默认关闭。
 * @returns 当前状态及 open、close、toggle 操作。
 */
export function useDisclosure(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const open = useCallback((): void => setIsOpen(true), []);
  const close = useCallback((): void => setIsOpen(false), []);
  const toggle = useCallback((): void => setIsOpen((current) => !current), []);
  return { isOpen, open, close, toggle };
}
