import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Client } from '../Types/client';
import supabase from '../utility/supabaseClient';
import { message } from 'antd';

const ClienteList: React.FC = () => {
  const [clientes, setClientes] = useState<Client[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    const fetchClientes = async () => {
      const { count } = await supabase
        .from('client')
        .select('*', { count: 'exact', head: true });

      const { data, error } = await supabase
        .from('client')
        .select('*')
        .range((pagination.current - 1) * pagination.pageSize, pagination.current * pagination.pageSize - 1);

      if (error) {
        console.error(error);
        message.error('Error al cargar los clientes: ' + error.message);
      } else {
        setClientes(data || []);
        setPagination(prev => ({ ...prev, total: count || 0 }));
      }
    };

    fetchClientes();
  }, [pagination.current, pagination.pageSize]);

  const columns = [
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Empresa', dataIndex: 'empresa', key: 'empresa' },
    { title: 'Correo', dataIndex: 'correo', key: 'correo' },
    { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono' },
    { title: 'RUT', dataIndex: 'rut', key: 'rut' },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_:any, record: Client) => (
        <Space size="middle">
          <Button onClick={() => setEditingClient(record)}>Editar</Button>
          <Button danger onClick={() => handleDeleteClient(Number(record.id))}>Eliminar</Button> // Convert id to number
        </Space>
      ),
    },
  ];

  const handleAddCliente = async (values: Omit<Client, 'id'>) => {
    const { data, error } = await supabase
      .from('client')
      .insert([values])
      .select()
      .single();
    if (error) {
      console.error(error);
      message.error('Hubo un error al procesar la solicitud');
    } else if (data) {
      setClientes([...clientes, data]);
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEditClient = async (values: Client) => {
    const { data, error } = await supabase
      .from('client')
      .update(values)
      .eq('id', editingClient?.id)
      .select()
      .single();
  
    if (error) {
      console.error(error);
      message.error('Hubo un error al procesar la solicitud');
    } else if (data) {
      setClientes(clientes.map(c => c.id === data.id ? data : c));
      setEditingClient(null);
    }
  };

  const handleDeleteClient = async (id: number) => {
    const { error } = await supabase
      .from('client')
      .delete()
      .eq('id', id);
  
    if (error) {
      console.error(error);
      message.error('Hubo un error al procesar la solicitud');
    } else {
      setClientes(clientes.filter(c => c.id !== id.toString())); // Convert id to string
    }
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
        <Table 
          dataSource={clientes} 
          columns={columns} 
          rowKey="id"
          pagination={pagination}
          onChange={(newPagination) => setPagination({
            ...pagination,
            current: newPagination.current || pagination.current,
            pageSize: newPagination.pageSize || pagination.pageSize,
          })}
        />
      </Space>
      
      <Modal
        title={editingClient ? "Editar Cliente" : "Agregar Cliente"}
        visible={isModalVisible || !!editingClient}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingClient(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form 
          form={form} 
          onFinish={editingClient ? handleEditClient : handleAddCliente}
          initialValues={editingClient || {}}
        >
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
              {editingClient ? "Actualizar" : "Agregar"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClienteList;