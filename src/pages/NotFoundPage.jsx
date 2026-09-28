import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <main className="not-found-page">
      <Result
        status="404"
        title="页面走丢了"
        subTitle="你访问的页面不存在，或地址已经发生变化。"
        extra={
          <Button type="primary" onClick={() => navigate('/orders')}>
            返回订单列表
          </Button>
        }
      />
    </main>
  )
}
