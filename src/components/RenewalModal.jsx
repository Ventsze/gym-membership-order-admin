import { useEffect } from 'react'
import { Alert, Form, InputNumber, Modal, Space, Typography } from 'antd'
import { calculateFee } from '../constants/order'
import { formatMoney } from '../utils/format'

const { Text, Title } = Typography

export function RenewalModal({ open, orders, loading, onCancel, onSubmit }) {
  const [form] = Form.useForm()
  const years = Form.useWatch('years', form) || 0
  const unitFee = calculateFee(years, true)
  const totalFee = unitFee * orders.length
  const discounted = years >= 5

  useEffect(() => {
    if (open) form.setFieldsValue({ years: 1 })
  }, [form, open])

  const handleOk = async () => {
    const values = await form.validateFields()
    await onSubmit(values.years)
  }

  return (
    <Modal
      open={open}
      title="办理续卡"
      okText="确认续卡"
      cancelText="取消"
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnHidden
    >
      <div className="renew-summary">
        <Text type="secondary">本次续卡订单</Text>
        <Title level={4}>{orders.length} 笔</Title>
        <div className="order-number-list">
          {orders.map((order) => (
            <Text code key={order.id}>
              {order.orderNo}
            </Text>
          ))}
        </div>
      </div>
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          name="years"
          label="续卡年限"
          rules={[
            { required: true, message: '请输入续卡年限' },
            {
              type: 'integer',
              min: 1,
              max: 10,
              message: '请输入 1～10 的整数',
            },
          ]}
        >
          <InputNumber min={1} max={10} precision={0} suffix="年" />
        </Form.Item>
      </Form>
      <div className="fee-panel">
        <Space direction="vertical" size={2}>
          <Text type="secondary">应付费用</Text>
          <Title level={3}>¥ {formatMoney(totalFee)}</Title>
          <Text type={discounted ? 'success' : 'secondary'}>
            {discounted
              ? `已享 8 折：每笔 ¥ ${formatMoney(unitFee)}`
              : `¥ 1,200.00 / 年 × ${orders.length} 笔订单`}
          </Text>
        </Space>
      </div>
      {discounted && (
        <Alert type="success" showIcon message="单次续卡满 5 年，已自动应用 8 折优惠" />
      )}
    </Modal>
  )
}
