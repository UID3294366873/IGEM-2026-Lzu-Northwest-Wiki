import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';

/**
 * 提供未知路由的可恢复出口。
 * @returns 404 页面。
 */
export function NotFoundPage() {
  return (
    <PageLayout
      title="页面不存在"
      lead="请求的页面尚未创建或地址有误。"
      pageClassName="wiki-page--not-found"
    >
      <p>
        <Link to="/">返回首页</Link>
      </p>
    </PageLayout>
  );
}
