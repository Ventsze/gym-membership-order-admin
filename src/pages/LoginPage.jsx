import { useState } from 'react'
import { DesktopOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input, Typography } from 'antd'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LoginCharacters } from '../components/LoginCharacters'
import { useAuthStore } from '../stores/authStore'

const { Paragraph, Title } = Typography

export function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordLength, setPasswordLength] = useState(0)
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
    <main className="login-split-container">
      <section className="login-left-panel" aria-label="品牌展示">
        <div className="login-logo">
          <span className="login-logo-mark">Y</span>
          <span>跃动会员订单中心</span>
        </div>
        <div className="login-animation-box">
          <LoginCharacters
            isTyping={isTyping}
            passwordLength={passwordLength}
            showPassword={showPassword}
          />
        </div>
        <div className="login-left-footer">Membership operations · Demo</div>
      </section>
      <section className="login-right-panel">
        <div className="login-form-box">
          <div className="desktop-tip">
            <DesktopOutlined />
            <span>建议使用电脑端访问，体验更完整</span>
          </div>
          <Title level={2}>系统登录</Title>
          <Paragraph className="login-description">
            登录后即可跟进会员办卡、续卡与寄送进度。
          </Paragraph>
          <Paragraph className="login-demo-tip">
            演示环境：任意账号密码均可登录
          </Paragraph>
          <Form
            className="minimal-login-form"
            size="large"
            onFinish={handleSubmit}
            requiredMark={false}
            onValuesChange={(changed) => {
              if (Object.hasOwn(changed, 'password')) {
                setPasswordLength(changed.password?.length || 0)
              }
            }}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入账号' }]}
            >
              <Input
                className="mac-input"
                prefix={<UserOutlined />}
                placeholder="账号"
                autoFocus
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                className="mac-input"
                prefix={<LockOutlined />}
                placeholder="密码"
                visibilityToggle={{
                  visible: showPassword,
                  onVisibleChange: setShowPassword,
                }}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
              />
            </Form.Item>
            <Button
              block
              className="mac-login-button"
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              登录管理后台
            </Button>
          </Form>
          <div className="login-footnote">内部演示系统 · 数据刷新后重置</div>
        </div>
      </section>
    </main>
  )
}
