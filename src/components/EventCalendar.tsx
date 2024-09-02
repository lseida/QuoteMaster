import React, { useState, useEffect } from 'react';
import { Calendar, Modal, Form, Input, TimePicker, Select, Tag, message, Button, ConfigProvider, List, Card, Empty } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import './styles/EventCalendar.css'; 
import esES from 'antd/lib/locale/es_ES';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

// Actualiza la interfaz Event
interface Event {
  title: string;
  date: Dayjs;
  time: Dayjs;
  tag: string;
  description: string;
  color: string;
}

const tagColors = {
  trabajo: 'blue',
  personal: 'green',
  importante: 'red',
  otros: 'orange',
  // Añade más etiquetas aquí
  familia: 'purple',
  estudio: 'cyan',
  salud: 'magenta',
  ocio: 'lime',
};

const EventCalendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [form] = Form.useForm();
  const [customTag, setCustomTag] = useState<string>('');
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  // Actualiza las funciones que manejan fechas
  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalVisible(true);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsModalVisible(true);
    form.setFieldsValue({
      title: event.title,
      time: event.time,
      tag: event.tag,
      description: event.description,
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (selectedEvent) {
        // Editar evento existente
        const updatedEvents = events.map(e => 
          e === selectedEvent ? { ...e, ...values, date: selectedDate || e.date } : e
        );
        setEvents(updatedEvents);
        message.success('Evento actualizado con éxito');
      } else {
        // Añadir nuevo evento
        const newEvent: Event = {
          title: values.title,
          date: selectedDate || dayjs(),
          time: values.time,
          tag: values.tag,
          description: values.description,
          color: values.color,
        };
        setEvents([...events, newEvent]);
        message.success('Evento añadido con éxito');
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(e => e !== selectedEvent));
      setIsModalVisible(false);
      message.success('Evento eliminado con éxito');
    }
  };

  const handleCustomTagChange = (value: string) => {
    setCustomTag(value);
  };

  const handleCustomTagAdd = () => {
    if (customTag && !Object.keys(tagColors).includes(customTag)) {
      const newTagColors = { ...tagColors, [customTag]: 'gray' };
      // Actualiza el estado global de tagColors si es necesario
      // setTagColors(newTagColors);
      form.setFieldsValue({ tag: customTag });
      setCustomTag('');
      message.success('Etiqueta personalizada añadida');
    } else if (Object.keys(tagColors).includes(customTag)) {
      message.warning('Esta etiqueta ya existe');
    }
  };

  const dateCellRender = (date: Dayjs) => {
    const eventsForDate = events.filter(event => event.date.isSame(date, 'day'));
    return (
      <ul className="events">
        {eventsForDate.map((event, index) => (
          <li key={index} onClick={(e) => handleEventClick(event, e)}>
            <Tag 
              color={tagColors[event.tag as keyof typeof tagColors]} 
              style={{ cursor: 'pointer' }}
              className="event-tag"
            >
              {event.title}
            </Tag>
          </li>
        ))}
      </ul>
    );
  };

  const handleViewChange = (newView: 'month' | 'day') => {
    setCurrentView(newView);
    if (newView === 'day') {
      setSelectedViewDate(dayjs());
    }
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    setSelectedViewDate(prevDate => 
      direction === 'prev' ? prevDate.subtract(1, 'day') : prevDate.add(1, 'day')
    );
  };

  const renderDayView = () => {
    const eventsForDay = events.filter(event => event.date.isSame(selectedViewDate, 'day'));
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Button icon={<LeftOutlined />} onClick={() => handleDateChange('prev')} />
          <span>{selectedViewDate.format('DD/MM/YYYY')}</span>
          <Button icon={<RightOutlined />} onClick={() => handleDateChange('next')} />
        </div>
        <List
          header={<div>Eventos para {selectedViewDate.format('DD/MM/YYYY')}</div>}
          bordered
          dataSource={eventsForDay}
          renderItem={(event) => (
            <List.Item
              onClick={(e) => handleEventClick(event, e)}
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
            >
              <div>
                <span style={{ marginRight: '10px' }}>{event.time.format('HH:mm')}</span>
                <span>{event.title}</span>
              </div>
              <Tag color={tagColors[event.tag as keyof typeof tagColors]}>
                {event.tag}
              </Tag>
            </List.Item>
          )}
        />
      </div>
    );
  };

  const [currentView, setCurrentView] = useState<'month' | 'day'>('day');
  const [selectedViewDate, setSelectedViewDate] = useState<Dayjs>(dayjs());

  // Nueva función para obtener los próximos eventos
  const getUpcomingEvents = () => {
    const sortedEvents = events.sort((a, b) => a.date.diff(b.date));
    return sortedEvents.slice(0, 5); // Obtener los próximos 5 eventos
  };

  // Actualizar upcomingEvents cuando cambian los eventos
  useEffect(() => {
    setUpcomingEvents(getUpcomingEvents());
  }, [events]);

  return (
    <ConfigProvider locale={esES}>
      <div className="event-calendar-container">
        <div className="sidebar">
          <Card title="Próximos eventos" className="upcoming-events-card">
            {upcomingEvents.length > 0 ? (
              <List
                dataSource={upcomingEvents}
                renderItem={(event) => (
                  <List.Item>
                    <div>
                      <div>{event.title}</div>
                      <small>{event.date.format('DD/MM/YYYY HH:mm')}</small>
                    </div>
                    <Tag color={tagColors[event.tag as keyof typeof tagColors]}>
                      {event.tag}
                    </Tag>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No hay datos" />
            )}
          </Card>
        </div>

        <div className="main-content">
          <Button.Group className="view-toggle">
            <Button 
              type={currentView === 'day' ? 'primary' : 'default'} 
              onClick={() => handleViewChange('day')}
            >
              Día
            </Button>
            <Button 
              type={currentView === 'month' ? 'primary' : 'default'} 
              onClick={() => handleViewChange('month')}
            >
              Mes
            </Button>
          </Button.Group>

          {currentView === 'month' ? (
            <Calendar 
              onSelect={(date) => {
                setSelectedViewDate(date);
                handleDateSelect(date);
              }}
              cellRender={(date, info) => info.type === 'date' ? dateCellRender(date) : null}
            />
          ) : (
            renderDayView()
          )}
        </div>
      </div>

      <Modal
        title={selectedEvent ? "Editar evento" : "Añadir evento"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedEvent(null);
          form.resetFields();
        }}
        okText="Aceptar"
        cancelText="Cancelar"
        footer={[
          selectedEvent && (
            <Button key="delete" danger onClick={handleDeleteEvent}>
              Eliminar
            </Button>
          ),
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancelar
          </Button>,
          <Button key="submit" type="primary" onClick={handleModalOk}>
            {selectedEvent ? "Actualizar" : "Añadir"}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Título del evento"
            rules={[{ required: true, message: 'Por favor ingresa un título para el evento' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="time"
            label="Hora"
            rules={[{ required: true, message: 'Por favor selecciona una hora' }]}
          >
            <TimePicker 
              format="HH:mm A" 
              use12Hours 
              popupClassName="custom-time-picker-dropdown"
            />
          </Form.Item>
          <Form.Item
            name="tag"
            label="Etiqueta"
            rules={[{ required: true, message: 'Por favor selecciona o crea una etiqueta' }]}
          >
            <Select
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                    <Input
                      style={{ flex: 'auto' }}
                      value={customTag}
                      onChange={(e) => handleCustomTagChange(e.target.value)}
                      placeholder="Añadir etiqueta personalizada"
                    />
                    <Button type="link" onClick={handleCustomTagAdd}>
                      Añadir
                    </Button>
                  </div>
                </>
              )}
            >
              {Object.entries(tagColors).map(([tag, color]) => (
                <Option key={tag} value={tag}>
                  <Tag color={color}>{tag}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="Descripción"
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export default EventCalendar;