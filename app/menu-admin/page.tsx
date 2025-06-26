'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, Input, Select, Button, Space, Typography, Tag, Collapse, Row, Col, Statistic, Alert, Tabs } from 'antd'
import { SearchOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

// Типы для iiko API структуры
interface IikoGroup {
  id: string
  name: string
  parentGroup: string | null
  isIncludedInMenu: boolean
  isDeleted: boolean
  tags: string[]
  order: number
}

interface IikoProduct {
  id: string
  name: string
  type: 'Dish' | 'Modifier' | 'Good'
  groupId: string
  productCategoryId: string
  isDeleted: boolean
  sizePrices: Array<{
    price: {
      currentPrice: number
      isIncludedInMenu: boolean
    }
  }>
  description?: string
  imageLinks: string[]
  weight?: number
  measureUnit: string
}

interface IikoCategory {
  id: string
  name: string
  isDeleted: boolean
}

interface IikoMenuData {
  groups: IikoGroup[]
  products: IikoProduct[]
  productCategories: IikoCategory[]
}

export default function MenuAdminPage() {
  const [menuData, setMenuData] = useState<IikoMenuData | null | 'error'>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'Dish' | 'Modifier' | 'Good'>('all')
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden' | 'deleted'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')

  // Загрузка JSON данных
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        const response = await fetch('/menu.json')
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const data = await response.json()
        setMenuData(data)
      } catch (error) {
        console.error('Ошибка загрузки меню:', error)
        setMenuData('error' as any)
      } finally {
        setLoading(false)
      }
    }
    loadMenuData()
  }, [])

  // Мемоизированная фильтрация и анализ данных
  const analyzedData = useMemo(() => {
    if (!menuData || menuData === 'error') return null

    const { groups, products, productCategories } = menuData

    // Создаем мапы для быстрого поиска
    const groupsMap = new Map(groups.map(g => [g.id, g]))
    const categoriesMap = new Map(productCategories.map(c => [c.id, c]))

    // Фильтрация продуктов
    const filteredProducts = products.filter(product => {
      // Поиск по названию
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Фильтр по типу
      if (typeFilter !== 'all' && product.type !== typeFilter) {
        return false
      }

      // Фильтр по видимости
      if (visibilityFilter === 'deleted' && !product.isDeleted) return false
      if (visibilityFilter === 'visible' && 
          (product.isDeleted || !product.sizePrices[0]?.price?.isIncludedInMenu)) return false
      if (visibilityFilter === 'hidden' && 
          (!product.isDeleted && product.sizePrices[0]?.price?.isIncludedInMenu)) return false

      // Фильтр по категории
      if (selectedCategory !== 'all' && product.productCategoryId !== selectedCategory) {
        return false
      }

      return true
    })

    // Группировка по категориям
    const productsByCategory = filteredProducts.reduce((acc, product) => {
      const category = categoriesMap.get(product.productCategoryId)
      const group = groupsMap.get(product.groupId)
      const categoryName = category?.name || 'Без категории'
      
      if (!acc[categoryName]) {
        acc[categoryName] = {
          products: [],
          category,
          stats: { total: 0, dishes: 0, modifiers: 0, goods: 0, visible: 0, hidden: 0, deleted: 0 }
        }
      }
      
      const enrichedProduct = {
        ...product,
        categoryName,
        groupName: group?.name || 'Без группы',
        isVisible: !product.isDeleted && product.sizePrices[0]?.price?.isIncludedInMenu,
        price: product.sizePrices[0]?.price?.currentPrice || 0
      }
      
      acc[categoryName].products.push(enrichedProduct)
      
      // Обновляем статистику
      const stats = acc[categoryName].stats
      stats.total++
      if (product.type === 'Dish') stats.dishes++
      if (product.type === 'Modifier') stats.modifiers++
      if (product.type === 'Good') stats.goods = (stats.goods || 0) + 1
      if (enrichedProduct.isVisible) stats.visible++
      if (product.isDeleted) stats.deleted++
      else if (!enrichedProduct.isVisible) stats.hidden++
      
      return acc
    }, {} as Record<string, any>)

    // Общая статистика
    const totalStats = {
      totalProducts: products.length,
      totalGroups: groups.length,
      totalCategories: productCategories.length,
      dishes: products.filter(p => p.type === 'Dish').length,
      modifiers: products.filter(p => p.type === 'Modifier').length,
      goods: products.filter(p => p.type === 'Good').length,
      visible: products.filter(p => !p.isDeleted && p.sizePrices[0]?.price?.isIncludedInMenu).length,
      deleted: products.filter(p => p.isDeleted).length,
      filteredCount: filteredProducts.length,
      withImages: products.filter(p => p.imageLinks && p.imageLinks.length > 0).length,
      serviceGroups: groups.filter(g => g.name.startsWith('*')).length
    }

    // Фильтруем категории, оставляя только те, в которых есть товары
    const categoriesWithProducts = productCategories.filter(c => {
      if (c.isDeleted) return false
      return products.some(p => p.productCategoryId === c.id && !p.isDeleted)
    })

    return {
      productsByCategory,
      totalStats,
      filteredProducts,
      categories: categoriesWithProducts,
      groupsMap,
      categoriesMap
    }
  }, [menuData, searchTerm, typeFilter, visibilityFilter, selectedCategory])

  // Экспорт очищенного каталога
  const exportCleanCatalog = () => {
    if (!analyzedData) return
    
    const cleanProducts = analyzedData.filteredProducts
      .filter(p => 
        p.type === 'Dish' && 
        !p.isDeleted && 
        p.sizePrices[0]?.price?.isIncludedInMenu &&
        p.sizePrices[0]?.price?.currentPrice > 0
      )
      .map(product => {
        const group = analyzedData.groupsMap.get(product.groupId)
        const category = analyzedData.categoriesMap.get(product.productCategoryId)
        
        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: product.sizePrices[0]?.price?.currentPrice || 0,
          weight: product.weight || 0,
          measureUnit: product.measureUnit || 'порц',
          imageUrl: product.imageLinks?.[0] || '',
          categoryName: category?.name || 'Без категории',
          groupName: group?.name || 'Без группы',
          categoryId: product.productCategoryId,
          groupId: product.groupId
        }
      })
    
    const catalogData = {
      timestamp: new Date().toISOString(),
      totalProducts: cleanProducts.length,
      products: cleanProducts
    }
    
    const blob = new Blob([JSON.stringify(catalogData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clean-catalog-${Date.now()}.json`
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <Title level={3} className="text-white">Загрузка меню...</Title>
        </div>
      </div>
    )
  }

  if (!analyzedData || menuData === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md mx-auto">
          <Alert 
            message="Файл menu.json не найден" 
            description="Для работы админки нужно добавить файл menu.json в папку public/" 
            type="error" 
            showIcon 
          />
          <Card className="mt-4 bg-gray-800 border-gray-700">
            <Title level={4} className="text-white">📋 Инструкция:</Title>
            <ol className="ml-4 space-y-2 text-gray-300">
              <li>1. Получите JSON от iiko API: <code className="bg-gray-700 px-1 rounded">/api/1/nomenclature</code></li>
              <li>2. Сохраните файл как <code className="bg-gray-700 px-1 rounded">public/menu.json</code></li>
              <li>3. Обновите страницу</li>
            </ol>
            <Button 
              type="primary" 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
              Попробовать снова
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <style jsx global>{`
        .ant-statistic-title {
          color: #d1d5db !important;
        }
        .ant-card {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
        }
        .ant-tabs-tab {
          color: #d1d5db !important;
        }
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #60a5fa !important;
        }
        .ant-tabs-ink-bar {
          background: #60a5fa !important;
        }
        .ant-collapse > .ant-collapse-item {
          border-color: #374151 !important;
        }
        .ant-collapse-content {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
        }
        .ant-collapse-header {
          background-color: #1f2937 !important;
          color: #d1d5db !important;
        }
        .ant-input {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
          color: #d1d5db !important;
        }
        .ant-select-selector {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
          color: #d1d5db !important;
        }
        .ant-select-arrow {
          color: #d1d5db !important;
        }
        .ant-btn {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          color: #d1d5db !important;
        }
        .ant-btn-primary {
          background-color: #3b82f6 !important;
          border-color: #2563eb !important;
        }
      `}</style>
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Title level={2} className="mb-2 text-white">🍽️ Админка меню iiko</Title>
              <Text className="text-gray-300">
                Анализ и управление номенклатурой ресторана • 
                <Text className="text-green-400 font-medium ml-2">
                  {analyzedData.totalStats.totalProducts.toLocaleString()} товаров
                </Text>
              </Text>
            </div>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
                Обновить
              </Button>
              <Button type="primary" icon={<DownloadOutlined />} onClick={exportCleanCatalog}>
                Экспорт каталога
              </Button>
            </Space>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          size="large"
          items={[
            {
              key: 'overview',
              label: '📊 Обзор',
              children: (
                <div>
                  <Row gutter={[16, 16]} className="mb-6">
                    <Col span={6}>
                      <Card className="bg-gray-800 border-gray-700">
                        <Statistic title="Всего товаров" value={analyzedData.totalStats.totalProducts} valueStyle={{ color: '#60a5fa' }} />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card className="bg-gray-800 border-gray-700">
                        <Statistic title="Блюда" value={analyzedData.totalStats.dishes} valueStyle={{ color: '#34d399' }} />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card className="bg-gray-800 border-gray-700">
                        <Statistic title="Модификаторы" value={analyzedData.totalStats.modifiers} valueStyle={{ color: '#a78bfa' }} />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card className="bg-gray-800 border-gray-700">
                        <Statistic title="Товары (Good)" value={analyzedData.totalStats.goods} valueStyle={{ color: '#fbbf24' }} />
                      </Card>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]} className="mb-6">
                    <Col span={8}>
                      <Card className="bg-gray-800 border-gray-700">
                        <Statistic title="Видимые" value={analyzedData.totalStats.visible} valueStyle={{ color: '#34d399' }} />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card className="bg-gray-800 border-gray-700">
                        <Statistic title="С изображениями" value={analyzedData.totalStats.withImages} valueStyle={{ color: '#fb923c' }} />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card className="bg-gray-800 border-gray-700">
                        <Statistic title="Удаленные" value={analyzedData.totalStats.deleted} valueStyle={{ color: '#f87171' }} />
                      </Card>
                    </Col>
                  </Row>

                  <Card className="mb-6 bg-gray-800 border-gray-700">
                    <Title level={4} className="text-white">🎯 Рекомендации для каталога</Title>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Alert
                          message="Для каталога пользователей"
                          description={`Используйте ${analyzedData.totalStats.dishes} блюд и ${analyzedData.totalStats.goods} товаров из ${analyzedData.totalStats.visible} видимых`}
                          type="success"
                          showIcon
                        />
                      </Col>
                      <Col span={8}>
                        <Alert
                          message="Служебные данные"
                          description={`${analyzedData.totalStats.serviceGroups} служебных групп, ${analyzedData.totalStats.modifiers} модификаторов и ${analyzedData.totalStats.deleted} удаленных товаров`}
                          type="warning"
                          showIcon
                        />
                      </Col>
                      <Col span={8}>
                        <Alert
                          message="Оптимизация"
                          description={`Можно сократить JSON на ${Math.round((analyzedData.totalStats.deleted + analyzedData.totalStats.modifiers) / analyzedData.totalStats.totalProducts * 100)}% для каталога`}
                          type="info"
                          showIcon
                        />
                      </Col>
                    </Row>
                  </Card>
                </div>
              )
            },
            {
              key: 'products',
              label: '🔍 Анализ товаров',
              children: (
                <div>
                  <Card className="mb-6 bg-gray-800 border-gray-700">
                    <Title level={4} className="text-white">🔧 Фильтры и поиск</Title>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Input
                          placeholder="Поиск по названию..."
                          prefix={<SearchOutlined />}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          allowClear
                        />
                      </Col>
                      <Col span={4}>
                        <Select value={typeFilter} onChange={setTypeFilter} style={{ width: '100%' }}>
                          <Option value="all">Все типы</Option>
                          <Option value="Dish">Блюда</Option>
                          <Option value="Modifier">Модификаторы</Option>
                          <Option value="Good">Товары</Option>
                        </Select>
                      </Col>
                      <Col span={4}>
                        <Select value={visibilityFilter} onChange={setVisibilityFilter} style={{ width: '100%' }}>
                          <Option value="all">Все</Option>
                          <Option value="visible">Видимые</Option>
                          <Option value="hidden">Скрытые</Option>
                          <Option value="deleted">Удаленные</Option>
                        </Select>
                      </Col>
                      <Col span={6}>
                        <Select value={selectedCategory} onChange={setSelectedCategory} style={{ width: '100%' }} showSearch>
                          <Option value="all">Все категории</Option>
                          {analyzedData.categories.map(cat => (
                            <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                          ))}
                        </Select>
                      </Col>
                    </Row>
                    <div className="mt-4">
                      <Text className="text-gray-300">
                        Найдено: <Text strong className="text-white">{analyzedData.totalStats.filteredCount}</Text> товаров
                      </Text>
                    </div>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <Title level={4} className="text-white">🗂️ Товары по категориям</Title>
                    <Collapse
                      items={Object.entries(analyzedData.productsByCategory)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([categoryName, data]) => ({
                          key: categoryName,
                          label: (
                            <Space>
                              <Text strong>{categoryName}</Text>
                              <Tag color="blue">{data.stats.total}</Tag>
                              <Tag color="green">Блюд: {data.stats.dishes}</Tag>
                              <Tag color="orange">Модиф: {data.stats.modifiers}</Tag>
                              <Tag color="yellow">Товары: {data.stats.goods || 0}</Tag>
                              <Tag color="cyan">Видимых: {data.stats.visible}</Tag>
                              {data.stats.deleted > 0 && <Tag color="red">Удаленных: {data.stats.deleted}</Tag>}
                            </Space>
                          ),
                          children: (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                              {data.products.map((product: any) => (
                                <Card 
                                  key={product.id} 
                                  size="small" 
                                  className="mb-2 bg-gray-700 border-gray-600"
                                  style={{ 
                                    borderLeft: `4px solid ${
                                      product.isDeleted ? '#f87171' : 
                                      product.isVisible ? '#34d399' : '#fbbf24'
                                    }`
                                  }}
                                >
                                  <Row>
                                    <Col span={12}>
                                      <Text strong className="text-white">{product.name}</Text>
                                      <br />
                                      <Text className="text-gray-400" style={{ fontSize: '12px' }}>
                                        {product.groupName}
                                      </Text>
                                    </Col>
                                    <Col span={3}>
                                      <Tag color={
                                        product.type === 'Dish' ? 'blue' : 
                                        product.type === 'Modifier' ? 'purple' : 'gold'
                                      }>
                                        {product.type}
                                      </Tag>
                                    </Col>
                                    <Col span={3}>
                                      <Text className="text-gray-300">{product.price > 0 ? `${product.price}₽` : 'Бесплатно'}</Text>
                                    </Col>
                                    <Col span={3}>
                                      <Tag color={
                                        product.isDeleted ? 'red' : 
                                        product.isVisible ? 'green' : 'orange'
                                      }>
                                        {product.isDeleted ? 'Удален' : product.isVisible ? 'Видим' : 'Скрыт'}
                                      </Tag>
                                    </Col>
                                    <Col span={3}>
                                      {product.imageLinks && product.imageLinks.length > 0 && (
                                        <Tag color="gold">Есть фото</Tag>
                                      )}
                                    </Col>
                                  </Row>
                                </Card>
                              ))}
                            </div>
                          )
                        }))}
                    />
                  </Card>
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  )
}
