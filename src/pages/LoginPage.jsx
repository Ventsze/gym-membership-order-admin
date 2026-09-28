import { useState } from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input, Typography } from 'antd'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const { Paragraph, Text, Title } = Typography

export function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { token, login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  if (token) return <Navigate to="/orders" replace />

  const handleSubmit = async ({ username }) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 450))
    login(username.trim())
    navigate(location.state?.from || '/orders', { replace: true })
  }

  return (
    <main className="login-page">
      <section className="login-visual" aria-label="品牌介绍">
        <div className="login-brand">
          <div className="brand-mark large">Y</div>
          <span>跃动健身</span>
        </div>
        <div className="login-visual-copy">
          <Text className="eyebrow">MEMBERSHIP OPERATIONS</Text>
          <Title>
            每一份会员承诺，
            <br />
            都有清晰的进度。
          </Title>
          <Paragraph>从办卡审核到寄送完成，在一处跟进门店会员订单。</Paragraph>
        </div>
        <div className="visual-orbit" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit-center">12</div>
          <span className="orbit-label">
            家门店
            <br />
            协同在线
          </span>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <Text className="eyebrow dark">WELCOME BACK</Text>
          <Title level={2}>登录管理后台</Title>
          <Paragraph type="secondary">请输入账号信息，任意账号密码均可体验。</Paragraph>
          <Form
            layout="vertical"
            size="large"
            initialValues={{ remember: true }}
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              label="账号"
              name="username"
              rules={[{ required: true, message: '请输入账号' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入账号" autoFocus />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
            </Form.Item>
            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>保持登录状态</Checkbox>
            </Form.Item>
            <Button block type="primary" htmlType="submit" loading={loading}>
              登录
            </Button>
          </Form>
          <div className="login-footnote">内部系统 · 请妥善保管账号信息</div>
        </div>
      </section>
    </main>
  )
}
