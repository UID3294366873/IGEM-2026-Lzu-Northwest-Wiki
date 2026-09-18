import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { ContactFormErrors, ContactFormValues } from '../types/content';
import { validateContactForm } from '../utils/formValidation';

const initialValues: ContactFormValues = { name: '', email: '', message: '' };

/**
 * 管理联系表单输入、验证和提交结果，与实际 JSX 层级完全解耦。
 * @returns 表单值、错误、提交状态以及事件处理函数。
 */
export function useContactForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  /**
   * 按 input 的 name 更新对应字段。
   * @param event 输入框或文本域变更事件。
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const field = event.target.name as keyof ContactFormValues;
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  /**
   * 阻止静态站点真实发送数据并执行本地验证；接入后端时只需替换成功分支。
   * @param event 表单提交事件。
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validateContactForm(values);
    setErrors(nextErrors);
    setSubmitted(Object.keys(nextErrors).length === 0);
  };

  return { values, errors, submitted, handleChange, handleSubmit };
}
