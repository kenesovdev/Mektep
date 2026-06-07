import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Result
        status="403"
        title="Доступ запрещён"
        subTitle="У вас нет прав для просмотра этой страницы."
        extra={
          <Link to="/login">
            <Button type="primary">На страницу входа</Button>
          </Link>
        }
      />
    </div>
  );
}
