import type { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/common/Badge';
import { SectionHeading } from '../components/common/SectionHeading';
import { PageLayout } from '../components/layout/PageLayout';
import { routeMetadata } from '../data/navigation';
import { useAppContext } from '../state/AppContext';

/**
 * 演示受控搜索输入、全局状态与数据过滤，不依赖具体展示 DOM。
 * @returns 站内页面搜索页。
 */
export function SearchPage() {
  const { state, dispatch } = useAppContext();
  const query = state.searchQuery.trim().toLocaleLowerCase();
  const results = routeMetadata.filter((route) =>
    `${route.title} ${route.description}`.toLocaleLowerCase().includes(query),
  );

  /**
   * 将搜索词写入全局状态，使用户离开再返回页面时仍保留输入。
   * @param event 搜索输入事件。
   */
  const handleSearch = (event: ChangeEvent<HTMLInputElement>): void =>
    dispatch({ type: 'search/set', payload: event.target.value });

  return (
    <PageLayout
      pageClassName="wiki-page--search"
      title="站内搜索"
      lead="快速定位页面、项目证据和维护入口。"
      group="Utility"
      sections={[{ id: 'search', label: '搜索页面' }]}
    >
      <section className="content-section" id="search">
        <SectionHeading
          eyebrow="01 / Find"
          title="搜索 Wiki"
          description="示例搜索覆盖页面标题和简介；正式项目可扩展为构建期内容索引。"
        />
        <div className="search-box">
          <label className="search-box__label" htmlFor="site-search">
            输入关键词
          </label>
          <div className="search-box__control">
            <span aria-hidden="true">⌕</span>
            <input
              id="site-search"
              name="search"
              type="search"
              placeholder="例如：项目、团队、实验……"
              value={state.searchQuery}
              onChange={handleSearch}
            />
          </div>
          <p className="search-box__hint">SEARCH / TITLE + DESCRIPTION</p>
        </div>
        <div className="search-results" aria-live="polite">
          <div className="search-results__header">
            <strong>RESULTS</strong>
            <Badge>{query ? `${results.length} FOUND` : 'WAITING'}</Badge>
          </div>
          {!query ? (
            <p className="search-results__empty">输入关键词后，匹配页面会显示在这里。</p>
          ) : results.length === 0 ? (
            <p className="search-results__empty" role="status">
              没有匹配页面。请尝试更短或不同的关键词。
            </p>
          ) : (
            <ol className="search-results__list">
              {results.map((route, index) => (
                <li className="search-results__item" key={route.path}>
                  <span className="search-results__index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <Badge>{route.group}</Badge>
                    <h3>
                      <Link to={route.path}>{route.title} →</Link>
                    </h3>
                    <p>{route.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
