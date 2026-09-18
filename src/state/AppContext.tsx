import { createContext, useContext, useMemo, useReducer } from 'react';
import type { Dispatch, PropsWithChildren } from 'react';

/** 全局 UI 状态。仅保存跨页面共享数据，不保存页面私有输入。 */
interface AppState {
  searchQuery: string;
  announcement: string | null;
}

/** 全局状态允许的动作集合。 */
type AppAction =
  | { type: 'search/set'; payload: string }
  | { type: 'announcement/set'; payload: string }
  | { type: 'announcement/clear' };

/** Context 向消费组件提供的值。 */
interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const initialState: AppState = { searchQuery: '', announcement: null };
const AppContext = createContext<AppContextValue | null>(null);

/**
 * 根据动作产生新的不可变全局状态。
 * @param state 当前状态。
 * @param action 描述状态变化的动作。
 * @returns 更新后的状态。
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'search/set':
      return { ...state, searchQuery: action.payload };
    case 'announcement/set':
      return { ...state, announcement: action.payload };
    case 'announcement/clear':
      return { ...state, announcement: null };
    default:
      return state;
  }
}

/**
 * 为应用提供轻量全局状态。使用 Context + useReducer，减少新成员学习额外状态库的成本。
 * @param props React 子树。
 * @returns Provider 元素。
 */
export function AppProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * 读取应用全局状态；若遗漏 Provider，会立即给出可定位的错误。
 * @returns 全局状态和 dispatch。
 */
// Provider 与配套 Hook 必须共享私有 Context；此处有意允许同文件导出非组件函数。
// eslint-disable-next-line react-refresh/only-export-components
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext 必须在 AppProvider 内使用。');
  return context;
}
