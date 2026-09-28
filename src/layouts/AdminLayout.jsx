import { useMemo, useState } from 'react'
import {
  FileAddOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  OrderedListOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Breadcrumb, Button, Dropdown, Layout, Menu, Space } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/orders', icon: <OrderedListOutlined />, label: '订单列表' },
  { key: '/orders/new', icon: <FileAddOutlined />, label: '新建订单' },
]

const pageNames = {
  '/orders': '订单列表',
  '/orders/new': '新建订单',
}

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
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
    <Layout className="app-shell">
      <Sider
        className="app-sider"
        width={240}
        collapsedWidth={80}
        collapsed={collapsed}
        trigger={null}
      >
        <div className="brand" onClick={() => navigate('/orders')}>
          <div className="brand-mark">Y</div>
          {!collapsed && (
            <div>
              <div className="brand-name">跃动健身</div>
              <div className="brand-subtitle">MEMBER OPS</div>
            </div>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
        {!collapsed && (
          <div className="sider-footnote">
            <span className="online-dot" />
            模拟服务运行中
          </div>
        )}
      </Sider>
      <Layout>
        <Header className="app-header">
          <Button
            type="text"
            className="collapse-button"
            aria-label={collapsed ? '展开侧栏' : '收起侧栏'}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((value) => !value)}
          />
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
        </Header>
        <Content className="app-main">
          <Breadcrumb items={breadcrumbItems} className="page-breadcrumb" />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
