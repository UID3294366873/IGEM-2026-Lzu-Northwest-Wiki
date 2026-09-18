import type { ContactFormErrors, ContactFormValues } from '../types/content';

/**
 * 校验联系表单，保持验证规则独立于任何具体表单 DOM。
 * @param values 当前表单值。
 * @returns 按字段组织的中文错误信息；空对象表示验证通过。
 */
export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};
  if (values.name.trim().length < 2) errors.name = '姓名至少需要 2 个字符。';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = '请输入有效邮箱。';
  if (values.message.trim().length < 10) errors.message = '留言至少需要 10 个字符。';
  return errors;
}
