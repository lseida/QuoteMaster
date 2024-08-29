import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, InputNumber, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Producto } from '../Types/producto';

const ProductoList: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Aquí deberías cargar los productos desde tu API o base de datos
  useEffect(() => {
    // Ejemplo: setProductos(await fetchProductos());
  }, []);

  const columns = [
    { title: 'Código', dataIndex: 'codigo', key: 'codigo' },
    { title: 'Nombre del Producto', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
    { 
      title: 'Precio', 
      dataIndex: 'precio', 
      key: 'precio',
      render: (value: number, record: Producto) => (
        <span>
          {record.moneda === 'USD' ? '$' : 'CLP '}
          {record.moneda === 'USD' 
            ? value.toFixed(2) 
            : Math.round(value).toLocaleString('es-CL')}
        </span>
      )
    },
    { title: 'Moneda', dataIndex: 'moneda', key: 'moneda' },
  ];

  const handleAddProducto = (values: Omit<Producto, 'id'>) => {
    const newProducto: Producto = {
      ...values,
      id: Date.now().toString(),
      precio: values.precio, // Elimina parseFloat
    };
    setProductos([...productos, newProducto]);
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Productos</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Crear
          </Button>
        </div>
        <Table dataSource={productos} columns={columns} rowKey="id" />
      </Space>
      
      <Modal
        title="Agregar Producto"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddProducto}>
          <Form.Item name="codigo" rules={[{ required: true }]}>
            <Input placeholder="Código" />
          </Form.Item>
          <Form.Item name="nombre" rules={[{ required: true }]}>
            <Input placeholder="Nombre del Producto" />
          </Form.Item>
          <Form.Item name="descripcion" rules={[{ required: true }]}>
            <Input.TextArea placeholder="Descripción" />
          </Form.Item>
          <Form.Item name="precio" rules={[{ required: true, type: 'number', min: 0 }]}>
            <InputNumber placeholder="Precio" step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="moneda" rules={[{ required: true }]}>
            <Select placeholder="Seleccione la moneda">
              <Select.Option value="USD">USD</Select.Option>
              <Select.Option value="CLP">CLP</Select.Option>
            </Select>
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

export default ProductoList;