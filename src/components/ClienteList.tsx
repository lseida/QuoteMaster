import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Client } from '../Types/client';

const ClienteList: React.FC = () => {
  const [clientes, setClientes] = useState<Client[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Aquí deberías cargar los clientes desde tu API o base de datos
  useEffect(() => {
    // Ejemplo: setClientes(await fetchClientes());
  }, []);

  const columns = [
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Empresa', dataIndex: 'empresa', key: 'empresa' },
    { title: 'Correo', dataIndex: 'correo', key: 'correo' },
    { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono' },
    { title: 'RUT', dataIndex: 'rut', key: 'rut' },
  ];

  const handleAddCliente = (values: Omit<Client, 'id'>) => {
    const newCliente: Client = {
      ...values,
      id: Date.now().toString(), // Esto es solo un ejemplo, deberías usar un ID único real
    };
    setClientes([...clientes, newCliente]);
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Clientes</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Crear
          </Button>
        </div>
        <Table dataSource={clientes} columns={columns} rowKey="id" />
      </Space>
      
      <Modal
        title="Agregar Cliente"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddCliente}>
          <Form.Item name="nombre" rules={[{ required: true }]}>
            <Input placeholder="Nombre" />
          </Form.Item>
          <Form.Item name="empresa" rules={[{ required: true }]}>
            <Input placeholder="Empresa" />
          </Form.Item>
          <Form.Item name="correo" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="Correo" />
          </Form.Item>
          <Form.Item name="telefono" rules={[{ required: true }]}>
            <Input placeholder="Teléfono" />
          </Form.Item>
          <Form.Item name="rut" rules={[{ required: true }]}>
            <Input placeholder="RUT" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Agregar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClienteList;