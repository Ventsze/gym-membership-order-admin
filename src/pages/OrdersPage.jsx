import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CloseCircleOutlined,
  DownloadOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  App as AntApp,
  Button,
  Card,
  Form,
  Input,
  Space,
  Table,
  Tabs,
  Tooltip,
  Typography,
} from 'antd'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { orderApi } from '../api/orders'
import { RenewalModal } from '../components/RenewalModal'
import { StatusTag } from '../components/StatusTag'
import {
  CANCELLABLE_STATUSES,
  EXPORTABLE_STATUSES,
  ORDER_STATUS,
  RENEWABLE_STATUS,
  STATUS_TABS,
} from '../constants/order'
import { useOrderList } from '../hooks/useOrderList'
import { exportOrdersToCsv } from '../utils/csv'
import { formatMoney } from '../utils/format'

const { Text, Title } = Typography
const IN_PROGRESS_STATUSES = [
  ORDER_STATUS.PENDING_REVIEW,
  ORDER_STATUS.PENDING_CARD,
  ORDER_STATUS.PENDING_MAIL,
]

export function OrdersPage() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { message, modal } = AntApp.useApp()
  const { query, data, total, loading, changeTab, search, reset, changePage, refresh } =
    useOrderList()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const selectionCache = useRef(new Map())
  const [renewOrders, setRenewOrders] = useState([])
  const [renewing, setRenewing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const pageOverview = useMemo(
    () => ({
      amount: data.reduce((sum, order) => sum + (Number(order.amount) || 0), 0),
      inProgress: data.filter((order) => IN_PROGRESS_STATUSES.includes(order.status))
        .length,
      renewable: data.filter((order) => order.status === RENEWABLE_STATUS).length,
    }),
    [data],
  )

  useEffect(() => {
    data.forEach((order) => {
      if (selectedRowKeys.includes(order.id)) {
        selectionCache.current.set(order.id, order)
      }
    })
  }, [data, selectedRowKeys])

  useEffect(() => {
    selectionCache.current.clear()
    setSelectedRowKeys([])
  }, [query.statusGroup, query.orderNo, query.memberName])

  const selectedOrders = selectedRowKeys
    .map((key) => selectionCache.current.get(key))
    .filter(Boolean)

  const clearSelection = () => {
    selectionCache.current.clear()
    setSelectedRowKeys([])
  }

  const openRenewModal = (orders) => {
    const invalid = orders.filter((order) => order.status !== RENEWABLE_STATUS)
    if (!orders.length) {
      message.warning('请先选择需要续卡的订单')
      return
    }
    if (invalid.length) {
      modal.error({
        title: '部分订单不满足续卡条件',
        content: (
          <div>
            <p>仅「已到期」订单可以续卡，以下订单无法操作：</p>
            <div className="order-number-list">
              {invalid.map((order) => (
                <Text code key={order.id}>
                  {order.orderNo}
                </Text>
              ))}
            </div>
          </div>
        ),
      })
      return
    }
    setRenewOrders(orders)
  }

  const submitRenewal = async (years) => {
    setRenewing(true)
    try {
      await orderApi.renew({
        orderIds: renewOrders.map((order) => order.id),
        years,
      })
      message.success(`${renewOrders.length} 笔订单续卡成功，已转为待审核`)
      setRenewOrders([])
      clearSelection()
      refresh()
    } finally {
      setRenewing(false)
    }
  }

  const cancelOrders = (orders) => {
    if (!orders.length) {
      message.warning('请先选择需要撤单的订单')
      return
    }
    const invalid = orders.filter(
      (order) => !CANCELLABLE_STATUSES.includes(order.status),
    )
    if (invalid.length) {
      modal.error({
        title: '部分订单不满足撤单条件',
        content: (
          <div>
            <p>仅「待制卡」「待寄卡」订单可以撤单：</p>
            <div className="order-number-list">
              {invalid.map((order) => (
                <Text code key={order.id}>
                  {order.orderNo}
                </Text>
              ))}
            </div>
          </div>
        ),
      })
      return
    }

    modal.confirm({
      title: `确认撤销 ${orders.length} 笔订单？`,
      icon: <CloseCircleOutlined className="danger-icon" />,
      okText: '确认撤单',
      okButtonProps: { danger: true },
      cancelText: '暂不撤单',
      content: (
        <div>
          <p>撤单后状态将变更为「已取消」，本次操作包含：</p>
          <div className="order-number-list">
            {orders.map((order) => (
              <Text code key={order.id}>
                {order.orderNo}
              </Text>
            ))}
          </div>
        </div>
      ),
      onOk: async () => {
        await orderApi.cancel({ orderIds: orders.map((order) => order.id) })
        message.success(`${orders.length} 笔订单已撤销`)
        clearSelection()
        refresh()
      },
    })
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const result = await orderApi.list({ ...query, all: true })
      const exportable = result.list.filter((order) =>
        EXPORTABLE_STATUSES.includes(order.status),
      )
      const blocked = result.list.filter(
        (order) => !EXPORTABLE_STATUSES.includes(order.status),
      )

      if (!exportable.length) {
        message.warning('当前筛选结果没有可导出的已完成或已到期订单')
        return
      }

      const download = () => {
        exportOrdersToCsv(exportable)
        message.success(`已导出 ${exportable.length} 笔订单`)
      }

      if (!blocked.length) {
        download()
        return
      }

      modal.confirm({
        title: '确认导出可对账订单',
        okText: '继续导出',
        cancelText: '取消',
        content: (
          <div>
            <p>将导出 {exportable.length} 笔「已完成 / 已到期」订单。</p>
            <p>
              已按权限规则排除 {blocked.length}{' '}
              笔进行中或已取消订单，避免未结算、无效数据进入财务对账。
            </p>
          </div>
        ),
        onOk: download,
      })
    } finally {
      setExporting(false)
    }
  }

  const handleReset = () => {
    form.resetFields()
    reset()
  }

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      width: 195,
      fixed: 'left',
      render: (value) => <Text className="order-no">{value}</Text>,
    },
    { title: '会员姓名', dataIndex: 'memberName', width: 120 },
    {
      title: '购卡年限',
      dataIndex: 'years',
      width: 110,
      render: (value) => `${value} 年`,
    },
    {
      title: '订单金额',
      dataIndex: 'amount',
      width: 130,
      align: 'right',
      render: (value) => <Text strong>¥ {formatMoney(value)}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (value) => <StatusTag status={value} />,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 175,
      render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          {record.status === ORDER_STATUS.EXPIRED && (
            <Button type="link" onClick={() => openRenewModal([record])}>
              续卡
            </Button>
          )}
          {CANCELLABLE_STATUSES.includes(record.status) && (
            <Button danger type="link" onClick={() => cancelOrders([record])}>
              撤单
            </Button>
          )}
          {record.status !== ORDER_STATUS.EXPIRED &&
            !CANCELLABLE_STATUSES.includes(record.status) && (
              <Text type="secondary">—</Text>
            )}
        </Space>
      ),
    },
  ]

  return (
    <div className="page-stack">
      <div className="page-heading heading-with-action">
        <div>
          <Text className="eyebrow dark">ORDER WORKSPACE</Text>
          <Title level={2}>会员办卡订单</Title>
          <Text type="secondary">查询、跟进并处理会员办卡全流程。</Text>
        </div>
        <Button
          type="primary"
          size="large"
          className="hero-create-button"
          icon={<PlusOutlined />}
          onClick={() => navigate('/orders/new')}
        >
          新建订单
        </Button>
      </div>

      <section className="overview-strip" aria-label="当前订单概览">
        <div className="overview-intro">
          <span className="overview-kicker">LIVE OVERVIEW</span>
          <strong>当前订单概览</strong>
          <small>数据随筛选条件实时更新</small>
        </div>
        <div className="overview-metric">
          <span>当前结果</span>
          <strong>{total}</strong>
          <small>笔订单</small>
        </div>
        <div className="overview-metric">
          <span>本页金额</span>
          <strong className="metric-money">¥ {formatMoney(pageOverview.amount)}</strong>
          <small>当前页合计</small>
        </div>
        <div className="overview-metric">
          <span>本页进行中</span>
          <strong>{pageOverview.inProgress}</strong>
          <small>待审核 / 制卡 / 寄卡</small>
        </div>
        <div className="overview-metric accent">
          <span>本页可续卡</span>
          <strong>{pageOverview.renewable}</strong>
          <small>已到期订单</small>
        </div>
      </section>

      <Card className="surface-card filter-card">
        <Tabs activeKey={query.statusGroup} items={STATUS_TABS} onChange={changeTab} />
        <Form form={form} layout="inline" className="search-form" onFinish={search}>
          <Form.Item name="orderNo" label="订单号">
            <Input placeholder="请输入完整订单号" allowClear />
          </Form.Item>
          <Form.Item name="memberName" label="会员姓名">
            <Input placeholder="支持模糊搜索" allowClear />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card className="surface-card table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-main">
            <div className="table-title-block">
              <strong>订单明细</strong>
              <span>共 {total} 笔</span>
            </div>
            <Space wrap>
              <Button onClick={() => openRenewModal(selectedOrders)}>批量续卡</Button>
              <Button danger onClick={() => cancelOrders(selectedOrders)}>
                一键撤单
              </Button>
              {selectedRowKeys.length > 0 && (
                <Text type="secondary">
                  已跨页选择 <Text strong>{selectedRowKeys.length}</Text> 项
                  <Button type="link" onClick={clearSelection}>
                    清空
                  </Button>
                </Text>
              )}
            </Space>
          </div>
          <Tooltip title="仅导出当前筛选下的已完成、已到期订单">
            <Button
              icon={<DownloadOutlined />}
              loading={exporting}
              onClick={handleExport}
            >
              导出对账 CSV
            </Button>
          </Tooltip>
        </div>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1100 }}
          rowSelection={{
            selectedRowKeys,
            preserveSelectedRowKeys: true,
            onSelect: (record, selected) => {
              if (selected) selectionCache.current.set(record.id, record)
              else selectionCache.current.delete(record.id)
            },
            onSelectAll: (selected, selectedRows, changedRows) => {
              changedRows.forEach((record) => {
                if (selected) selectionCache.current.set(record.id, record)
                else selectionCache.current.delete(record.id)
              })
            },
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          pagination={{
            current: query.page,
            pageSize: query.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (count) => `共 ${count} 笔订单`,
            onChange: changePage,
          }}
          locale={{ emptyText: '没有找到符合条件的订单' }}
        />
      </Card>

      <RenewalModal
        open={renewOrders.length > 0}
        orders={renewOrders}
        loading={renewing}
        onCancel={() => setRenewOrders([])}
        onSubmit={submitRenewal}
      />
    </div>
  )
}
