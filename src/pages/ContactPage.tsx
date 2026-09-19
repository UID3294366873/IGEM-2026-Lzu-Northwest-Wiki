import { Callout } from '../components/common/Callout';
import { SectionHeading } from '../components/common/SectionHeading';
import { PageLayout } from '../components/layout/PageLayout';
import { useContactForm } from '../hooks/useContactForm';

/**
 * 演示与 DOM 解耦的联系表单及客户端基础验证；默认不向外部服务发送数据。
 * @returns 联系页面。
 */
export function ContactPage() {
  const form = useContactForm();
  return (
    <PageLayout
      pageClassName="wiki-page--contact"
      title="联系表单"
      lead="欢迎交流、复现和改进我们的工作。"
      group="Utility"
      sections={[
        { id: 'contact', label: '发送留言' },
        { id: 'channels', label: '其他渠道' },
      ]}
    >
      <section className="content-section" id="contact">
        <SectionHeading
          eyebrow="01 / Message"
          title="发送留言"
          description="这是静态验证演示；正式上线前需要配置符合规则的提交端点。"
        />
        <form className="contact-form" noValidate onSubmit={form.handleSubmit}>
          <div className="contact-form__field">
            <label htmlFor="contact-name">
              姓名 <span aria-hidden="true">*</span>
            </label>
            <input
              id="contact-name"
              name="name"
              value={form.values.name}
              onChange={form.handleChange}
              aria-describedby="contact-name-error"
              placeholder="你的姓名"
            />
            {form.errors.name ? (
              <p id="contact-name-error" role="alert">
                {form.errors.name}
              </p>
            ) : null}
          </div>
          <div className="contact-form__field">
            <label htmlFor="contact-email">
              邮箱 <span aria-hidden="true">*</span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              value={form.values.email}
              onChange={form.handleChange}
              aria-describedby="contact-email-error"
              placeholder="name@example.com"
            />
            {form.errors.email ? (
              <p id="contact-email-error" role="alert">
                {form.errors.email}
              </p>
            ) : null}
          </div>
          <div className="contact-form__field contact-form__field--wide">
            <label htmlFor="contact-message">
              留言 <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={7}
              value={form.values.message}
              onChange={form.handleChange}
              aria-describedby="contact-message-error"
              placeholder="请说明问题、复现背景或合作想法……"
            />
            {form.errors.message ? (
              <p id="contact-message-error" role="alert">
                {form.errors.message}
              </p>
            ) : null}
          </div>
          <div className="contact-form__actions">
            <button className="button button--primary" type="submit">
              本地验证 →
            </button>
            <span>不会发送或保存数据</span>
          </div>
          {form.submitted ? (
            <p className="form-status" role="status">
              ✓ 验证通过。演示模式不会发送数据。
            </p>
          ) : null}
        </form>
      </section>
      <section className="content-section" id="channels">
        <SectionHeading eyebrow="02 / Channels" title="其他联系渠道" />
        <div className="contact-channels">
          <div>
            <strong>GENERAL</strong>
            <a href="mailto:team@example.edu">team@example.edu</a>
          </div>
          <div>
            <strong>GITLAB</strong>
            <span>Issues / Merge Requests</span>
          </div>
          <div>
            <strong>RESPONSE</strong>
            <span>预计 3—5 个工作日</span>
          </div>
        </div>
        <Callout title="隐私提示">
          <p>不要在公开 Wiki 表单中收集敏感个人信息。当前示例不会发送或保存任何数据。</p>
        </Callout>
      </section>
    </PageLayout>
  );
}
