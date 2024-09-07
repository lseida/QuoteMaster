import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Row, Col, TablePaginationConfig } from 'antd';
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
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('client')
        .select('*', { count: 'exact' });
      
      if (searchText) {
        query = query.or(`nombre.ilike.%${searchText}%,empresa.ilike.%${searchText}%,correo.ilike.%${searchText}%`);
      }

      const { data, count, error } = await query
        .range(((pagination.current || 1) - 1) * (pagination.pageSize || 10), (pagination.current || 1) * (pagination.pageSize || 10) - 1);

      if (error) throw error;

      setClientes(data || []);
      setPagination(prev => ({ ...prev, total: count || 0 }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      message.error('Error al cargar los clientes: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const handleDeleteClient = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from('client')
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      setClientes(prevClientes => prevClientes.filter(c => c.id !== id.toString()));
      
      if (clientes.length === 1 && (pagination.current ?? 1) > 1) {
        setPagination(prev => ({ ...prev, current: (prev.current ?? 1) - 1 }));
      } else {
        fetchClientes();
      }
      
      message.success('Cliente eliminado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      message.error('Error al eliminar el cliente: ' + errorMessage);
    }
  }, [clientes.length, pagination.current, fetchClientes]);

  const showModal = useCallback((client: Client | null = null) => {
    setEditingClient(client);
    if (client) {
      form.setFieldsValue(client);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  }, [form]);

  const columns = useMemo(() => [
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
      render: (_: React.ReactNode, record: Client) => (
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
  ], [handleDeleteClient, showModal]);

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

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingClient(null);
    form.resetFields();
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current ?? prev.current,
      pageSize: newPagination.pageSize ?? prev.pageSize,
    }));
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  return (
    <div>
      <Space direction="vertical" size="middle" style={{ display: 'flex', width: '100%' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <h1>Clientes</h1>
          </Col>
          <Col xs={24} sm={24} md={16} lg={16} xl={16}>
            <Row gutter={[8, 8]} justify="end">
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Input.Search
                  placeholder="Buscar clientes"
                  onSearch={handleSearch}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showModal()}
                  style={{ width: '100%' }}
                >
                  Crear
                </Button>
              </Col>
              <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchClientes}
                  style={{ width: '100%' }}
                >
                  Actualizar
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Table 
          dataSource={clientes} 
          columns={columns} 
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} clientes`,
            locale: { items_per_page: '/ páginas' },
          }}
          onChange={handleTableChange}  // <-- Añadir esta línea
          loading={loading}
          scroll={{ x: 'max-content' }}
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