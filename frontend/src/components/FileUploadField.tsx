import { Upload, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const ACCEPT = '.pdf,.jpg,.jpeg,.png,.doc,.docx';

interface FileUploadFieldProps {
  value: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
}

export default function FileUploadField({ value, onChange, required = false }: FileUploadFieldProps) {
  const fileList: UploadFile[] = value
    ? [{ uid: '-1', name: value.name, status: 'done' }]
    : [];

  return (
    <div>
      <Upload.Dragger
        accept={ACCEPT}
        maxCount={1}
        fileList={fileList}
        beforeUpload={(file) => {
          onChange(file);
          return false;
        }}
        onRemove={() => {
          onChange(null);
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Нажмите или перетащите файл</p>
        <p className="ant-upload-hint">PDF, JPG, PNG, DOC, DOCX</p>
      </Upload.Dragger>
      {required && !value && (
        <Typography.Text type="danger" style={{ fontSize: 12 }}>
          Файл обязателен
        </Typography.Text>
      )}
    </div>
  );
}
