import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Client } from '../Types/client';
import supabase from '../utility/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const ClienteList: React.FC = () => {
  const { isAdmin } = useAuth();
  const [clientes, setClientes] = useState<Client[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchClientes = async () => {
    setLoading(true);
    const { count, error: countError } = await supabase
      .from('client')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      message.error('Error al contar los clientes: ' + countError.message);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('client')
      .select('*')
      .range((pagination.current - 1) * pagination.pageSize, pagination.current * pagination.pageSize - 1);

    if (error) {
      message.error('Error al cargar los clientes: ' + error.message);
    } else {
      setClientes(data || []);
      setPagination(prev => ({ ...prev, total: count || 0 }));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClientes();
  }, [pagination.current, pagination.pageSize]);

  const columns = [
    { 
      title: 'Nombre', 
      dataIndex: 'nombre', 
      key: 'nombre',
      sorter: (a: Client, b: Client) => a.nombre.localeCompare(b.nombre),
    },
    { title: 'Empresa', dataIndex: 'empresa', key: 'empresa' },
    { title: 'Correo', dataIndex: 'correo', key: 'correo' },
    { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono' },
    { title: 'RUT', dataIndex: 'rut', key: 'rut' },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_:any, record: Client) => (
        <Space size="middle">
          <Button onClick={() => showModal(record)}>Editar</Button>
          <Popconfirm
            title="¿Está seguro de eliminar este cliente?"
            onConfirm={() => handleDeleteClient(Number(record.id))}
            okText="Sí"
            cancelText="No"
          >
            <Button danger>Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAddCliente = async (values: Omit<Client, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('client')
        .insert([values])
        .select()
        .single();
      if (error) throw error;
      setClientes([...clientes, data]);
      message.success('Cliente agregado exitosamente');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      message.error('Error al agregar el cliente: ' + errorMessage);
    }
  };

  const handleEditClient = async (values: Client) => {
    try {
      const { data, error } = await supabase
        .from('client')
        .update(values)
        .eq('id', editingClient?.id)
        .select()
        .single();
      if (error) throw error;
      setClientes(clientes.map(c => c.id === data.id ? data : c));
      setEditingClient(null);
      message.success('Cliente actualizado exitosamente');
      setIsModalVisible(false);
      } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      message.error('Error al agregar el cliente: ' + errorMessage);
    }
    
  };

  const handleDeleteClient = async (id: number) => {
    try {
      const { error } = await supabase
        .from('client')
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      // Actualizar la lista de clientes localmente
      setClientes(prevClientes => prevClientes.filter(c => c.id !== id.toString()));
      
      // Actualizar la paginación si es necesario
      if (clientes.length === 1 && pagination.current > 1) {
        setPagination(prev => ({ ...prev, current: prev.current - 1 }));
      } else {
        // Refetch para asegurar que tenemos los datos más actualizados
        fetchClientes();
      }
      
      message.success('Cliente eliminado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      message.error('Error al agregar el cliente: ' + errorMessage);
    }
  };

  const showModal = (client: Client | null = null) => {
    setEditingClient(client);
    if (client) {
      form.setFieldsValue(client);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingClient(null);
    form.resetFields();
  };

  return (
    <div>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Clientes</h1>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Crear
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchClientes}
            >
              Actualizar
            </Button>
          </Space>
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
          loading={loading}
        />
      </Space>
      
      <Modal
        title={editingClient ? "Editar Cliente" : "Agregar Cliente"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form 
          form={form} 
          onFinish={editingClient ? handleEditClient : handleAddCliente}
          initialValues={{}}
        >
          <Form.Item name="nombre" rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}>
            <Input placeholder="Nombre" />
          </Form.Item>
          <Form.Item name="empresa" rules={[{ required: true, message: 'Por favor ingrese la empresa' }]}>
            <Input placeholder="Empresa" />
          </Form.Item>
          <Form.Item name="correo" rules={[{ required: true, type: 'email', message: 'Por favor ingrese un correo válido' }]}>
            <Input placeholder="Correo" />
          </Form.Item>
          <Form.Item name="telefono" rules={[{ required: true, message: 'Por favor ingrese el teléfono' }]}>
            <Input placeholder="Teléfono" />
          </Form.Item>
          <Form.Item name="rut" rules={[{ required: true, message: 'Por favor ingrese el RUT' }]}>
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