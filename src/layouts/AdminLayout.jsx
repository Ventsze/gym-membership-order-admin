import { useMemo, useState } from 'react'
import {
  CloseOutlined,
  FileAddOutlined,
  LogoutOutlined,
  MenuOutlined,
  OrderedListOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Breadcrumb, Button, Dropdown, Menu, Space } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const menuItems = [
  { key: '/orders', icon: <OrderedListOutlined />, label: '订单列表' },
  { key: '/orders/new', icon: <FileAddOutlined />, label: '新建订单' },
]

const pageNames = {
  '/orders': '订单列表',
  '/orders/new': '新建订单',
}

export function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { username, logout } = useAuthStore()

  const selectedKey = location.pathname.startsWith('/orders/new')
    ? '/orders/new'
    : '/orders'
  const breadcrumbItems = useMemo(
    () => [{ title: '会员订单' }, { title: pageNames[location.pathname] || '页面' }],
    [location.pathname],
  )

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      {mobileMenuOpen && (
        <button
          className="mobile-overlay"
          aria-label="关闭菜单"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside className={`app-sider ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="brand" onClick={() => navigate('/orders')}>
          <div className="brand-mark">
            <TrophyOutlined />
          </div>
          <div>
            <div className="brand-name">跃动会员管理</div>
            <div className="brand-subtitle">MEMBER OPERATIONS</div>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => {
            navigate(key)
            setMobileMenuOpen(false)
          }}
        />
        <div className="sider-footer">
          <div className="sider-footnote">
            <span className="online-dot" />
            模拟服务运行中
          </div>
          <Button
            block
            className="sidebar-logout"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </div>
      </aside>
      <div className="app-content-shell">
        <header className="app-header">
          <Button
            type="text"
            className="mobile-menu-button"
            aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
            icon={mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            onClick={() => setMobileMenuOpen((value) => !value)}
          />
          <Breadcrumb items={breadcrumbItems} className="page-breadcrumb" />
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: handleLogout,
                },
              ],
            }}
            placement="bottomRight"
          >
            <Button type="text" className="user-entry">
              <Space>
                <Avatar size={32} icon={<UserOutlined />} />
                <span>{username}</span>
              </Space>
            </Button>
          </Dropdown>
        </header>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
