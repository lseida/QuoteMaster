import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Checkbox, Space, Select, DatePicker, Tag, Input as AntInput } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table'; // Agrega esta línea

const { Search } = AntInput;

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'Alta' | 'Media' | 'Baja';
  reminder: string | null;
  tags: string[];
  archived: boolean;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const handleTaskCompletion = (id: string, completed: boolean) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed, archived: completed } : task
    ));
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue(task);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleArchive = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, archived: true, completed: true } : task
    ));
  };

  const columns = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      filteredValue: [searchText],
      onFilter: (value: string | number | boolean, record: Task) =>
        record.title.toLowerCase().includes(String(value).toLowerCase()),
    } as ColumnType<Task>,
    {
      title: 'Completada',
      dataIndex: 'completed',
      key: 'completed',
      render: (completed: boolean, record: Task) => (
        <Checkbox
          checked={completed}
          onChange={(e) => handleTaskCompletion(record.id, e.target.checked)}
          disabled={record.archived}
        />
      ),
    },
    {
      title: 'Prioridad',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={priority === 'Alta' ? 'red' : priority === 'Media' ? 'yellow' : 'green'}>
          {priority}
        </Tag>
      ),
    },
    {
      title: 'Recordatorio',
      dataIndex: 'reminder',
      key: 'reminder',
      render: (reminder: string) => reminder || 'No establecido',
    },
    {
      title: 'Etiquetas',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Task) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} disabled={record.archived} />
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          {!record.archived && (
            <Button icon={<InboxOutlined />} onClick={() => handleArchive(record.id)} />
          )}
        </Space>
      ),
    },
  ];

  const handleAddOrUpdateTask = (values: Omit<Task, 'id' | 'archived'>) => {
    if (editingTask) {
      // Actualiza la tarea existente
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { ...task, ...values, archived: values.completed } : task
      ));
    } else {
            const newTask: Task = {
        id: Date.now().toString(),
        ...values,
        tags: values.tags || [],
        archived: false,
        completed: false, 
      };
      setTasks([...tasks, newTask]);
    }
   
    setIsModalVisible(false);
    setEditingTask(null);
    form.resetFields();
  };

  const filteredTasks = tasks.filter(task => task.archived === showArchived);

  return (
    <div>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Lista de Tareas</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTask(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Agregar Tarea
          </Button>
        </div>
        <Search
          placeholder="Buscar tareas"
          onSearch={value => setSearchText(value)}
          style={{ width: 200 }}
        />
        <Button onClick={() => setShowArchived(!showArchived)}>
          {showArchived ? 'Ver tareas activas' : 'Ver tareas archivadas'}
        </Button>
        <Table dataSource={filteredTasks} columns={columns} rowKey="id" />
      </Space>
      
      <Modal
        title={editingTask ? 'Editar Tarea' : 'Agregar Tarea'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingTask(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleAddOrUpdateTask} initialValues={editingTask || {}}>
          <Form.Item
            name="title"
            rules={[{ required: true, message: 'Por favor ingrese el título de la tarea' }]}
          >
            <Input placeholder="Título de la tarea" />
          </Form.Item>
                    <Form.Item name="priority" rules={[{ required: true }]}>
            <Select placeholder="Seleccione la prioridad">
              <Select.Option value="Alta">Alta</Select.Option>
              <Select.Option value="Media">Media</Select.Option>
              <Select.Option value="Baja">Baja</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="reminder">
            <DatePicker showTime placeholder="Seleccione un recordatorio" />
          </Form.Item>
          <Form.Item name="tags">
            <Select mode="tags" style={{ width: '100%' }} placeholder="Agregar etiquetas">
              <Select.Option value="trabajo">Trabajo</Select.Option>
              <Select.Option value="personal">Personal</Select.Option>
              <Select.Option value="urgente">Urgente</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingTask ? 'Actualizar' : 'Agregar'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskList;