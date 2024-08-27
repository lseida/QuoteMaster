import React from 'react';
import { useForm } from '@refinedev/antd';
import { Form, Input, InputNumber } from 'antd';

const ProductoForm: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Form {...formProps} layout="vertical">
      <Form.Item
        label="Código"
        name="codigo"
        rules={[{ required: true, message: 'Por favor ingrese el código del producto' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Nombre del Producto"
        name="nombre"
        rules={[{ required: true, message: 'Por favor ingrese el nombre del producto' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Descripción"
        name="descripcion"
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item
        label="Precio"
        name="precio"
        rules={[{ required: true, message: 'Por favor ingrese el precio del producto' }]}
      >
        <InputNumber
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
        />
      </Form.Item>
    </Form>
  );
};

export default ProductoForm;