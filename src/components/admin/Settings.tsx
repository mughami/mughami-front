import { Form, Input, Switch, Card, Typography, message } from 'antd';
import useSettingsStore from '../../store/settingsStore';

const { Title } = Typography;

export const Settings = () => {
  const { settings, loading: settingsLoading, updateSettings } = useSettingsStore();
  const [settingsForm] = Form.useForm();

  const handleSettingsSubmit = async () => {
    try {
      const values = await settingsForm.validateFields();
      await updateSettings(values);
      message.success('Settings updated successfully');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>პარამეტრები</Title>
      </div>
      <Card loading={settingsLoading}>
        <Form
          form={settingsForm}
          layout="vertical"
          onFinish={handleSettingsSubmit}
          initialValues={settings || undefined}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="siteName"
              label="საიტის სახელი"
              rules={[{ required: true, message: 'გთხოვთ შეიყვანოთ საიტის სახელი' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="siteDescription"
              label="საიტის აღწერა"
              rules={[{ required: true, message: 'გთხოვთ შეიყვანოთ საიტის აღწერა' }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="contactEmail"
              label="საკონტაქტო ელ-ფოსტა"
              rules={[
                { required: true, message: 'გთხოვთ შეიყვანოთ საკონტაქტო ელ-ფოსტა' },
                { type: 'email', message: 'გთხოვთ შეიყვანოთ სწორი ელ-ფოსტა' },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="maxPollsPerUser"
              label="მაქსიმალური გამოკითხვების რაოდენობა მომხმარებელზე"
              rules={[{ required: true, message: 'გთხოვთ შეიყვანოთ რაოდენობა' }]}
            >
              <Input type="number" min={1} />
            </Form.Item>
            <Form.Item
              name="maxOptionsPerPoll"
              label="მაქსიმალური ვარიანტების რაოდენობა გამოკითხვაში"
              rules={[{ required: true, message: 'გთხოვთ შეიყვანოთ რაოდენობა' }]}
            >
              <Input type="number" min={2} />
            </Form.Item>
            <Form.Item name="maintenanceMode" label="მოვლის რეჟიმი" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item
              name="allowUserRegistration"
              label="მომხმარებლების რეგისტრაცია"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Card>
    </div>
  );
};
