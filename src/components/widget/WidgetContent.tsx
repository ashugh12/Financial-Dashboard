// components/widget/WidgetContent.tsx
'use client'

import { transformDataForWidget } from '@/utils/flatten'
import WidgetCard from './WidgetCard'
import WidgetTable from './WidgetTable'
import WidgetChart from './WidgetChart'

interface WidgetContentProps {
  type: 'card' | 'table' | 'chart'
  data: any
  selected: string[]
}

export default function WidgetContent({ type, data, selected }: WidgetContentProps) {
  const transformedData = transformDataForWidget(data, selected, type)

  switch (type) {
    case 'card':
      return <WidgetCard cardData={transformedData} />
    case 'table':
      return <WidgetTable tableData={transformedData} />
    case 'chart':
      return <WidgetChart chartData={transformedData} />
    default:
      return <WidgetCard cardData={transformedData} />
  }
}
