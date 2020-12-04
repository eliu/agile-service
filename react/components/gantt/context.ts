import { createContext } from 'react';
import type GanttStore from './store';
import { Gantt } from './types';

export interface GanttContext {
  store: GanttStore
  getBarColor?: (item: Gantt.Item) => { backgroundColor: string, borderColor: string }
  showBackToday: boolean
  showUnitSwitch: boolean
  onRow?: {
    onClick: (item: Gantt.Item) => void
  }
  tableIndent: number
  expandIcon?: ({ level, collapsed, onClick }: {
    level: number,
    collapsed: boolean
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  }) => React.ReactNode
  renderBar?: (barInfo: Gantt.Bar, { width, height }: { width: number, height: number }) => React.ReactNode
  renderBarThumb?: (item: Gantt.Item, type: 'left' | 'right') => React.ReactNode
  onBarClick?: (item: Gantt.Item) => void
  tableCollapseAble: boolean
}
const context = createContext({} as GanttContext);
export default context;
