import { useMemo, useState } from 'react'
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  InfoCircleOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Typography,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { orderApi } from '../api/orders'
import { calculateFee } from '../constants/order'
import { formatMoney } from '../utils/format'

const { Text, Title } = Typography
const { TextArea } = Input

export function NewOrderPage() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { message } = AntApp.useApp()
  const [submitting, setSubmitting] = useState(false)
  const years = Form.useWatch('years', form) || 0
  const amount = useMemo(() => calculateFee(years), [years])

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      const order = await orderApi.create(values)
      message.success(`订单 ${order.orderNo} 创建成功`)
      navigate('/orders')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-stack narrow-page">
      <div className="page-heading">
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="back-button"
            onClick={() => navigate('/orders')}
          >
            返回订单列表
          </Button>
          <Title level={2}>新建会员订单</Title>
          <Text type="secondary">录入会员与办卡信息，提交后订单将进入待审核。</Text>
        </div>
      </div>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card className="surface-card form-card" title="会员与套餐信息">
            <Form
              form={form}
              layout="vertical"
              initialValues={{ years: 1 }}
              requiredMark="optional"
              onFinish={handleSubmit}
            >
              <Row gutter={20}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="会员姓名"
                    name="memberName"
                    rules={[
                      { required: true, message: '请输入会员姓名' },
                      { min: 2, max: 30, message: '姓名长度应为 2～30 个字符' },
                    ]}
                  >
                    <Input placeholder="请输入会员姓名" maxLength={30} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="联系手机号"
                    name="phone"
                    rules={[
                      { required: true, message: '请输入联系手机号' },
                      {
                        pattern: /^1[3-9]\d{9}$/,
                        message: '请输入有效的中国大陆手机号',
                      },
                    ]}
                  >
                    <Input placeholder="11 位手机号" maxLength={11} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="购卡年限"
                    name="years"
                    rules={[
                      { required: true, message: '请输入购卡年限' },
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
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="办卡费用">
                    <Input
                      className="money-input"
                      value={`¥ ${formatMoney(amount)}`}
                      readOnly
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                label="备注"
                name="remark"
                rules={[{ max: 200, message: '备注最多 200 字' }]}
              >
                <TextArea
                  rows={5}
                  maxLength={200}
                  showCount
                  placeholder="可填写训练偏好、到店时间等补充信息"
                />
              </Form.Item>
              <div className="form-actions">
                <Space>
                  <Button onClick={() => navigate('/orders')}>取消</Button>
                  <Button type="primary" htmlType="submit" loading={submitting}>
                    创建订单
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="surface-card price-card">
            <Text type="secondary">订单金额</Text>
            <div className="price-value">¥ {formatMoney(amount)}</div>
            <div className="price-calc">{years || 0} 年 × ¥ 1,200.00 / 年</div>
            <div className="divider" />
            <Space direction="vertical" size={14}>
              <Text>
                <CheckCircleFilled /> 提交后自动生成唯一订单号
              </Text>
              <Text>
                <CheckCircleFilled /> 新订单初始状态为「待审核」
              </Text>
              <Text>
                <CheckCircleFilled /> 数据即时同步至订单列表
              </Text>
            </Space>
          </Card>
          <Alert
            className="helper-alert"
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            message="计费说明"
            description="新办卡按 1,200 元/年计费；续卡满 5 年的折扣将在续卡操作中单独计算。"
          />
        </Col>
      </Row>
    </div>
  )
}
