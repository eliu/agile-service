import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import { Button, Tooltip, Icon } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { find } from 'lodash';
import dayjs from 'dayjs';
import classNames from 'classnames';
import {
  Page, Header, Content, Breadcrumb,
} from '@choerodon/boot';
import GanttComponent, { GanttProps } from '@/components/gantt';
import { ganttApi, issueApi, workCalendarApi } from '@/api';
import UserHead from '@/components/UserHead';
import { Gantt } from '@/components/gantt/types';
import TypeTag from '@/components/TypeTag';
import Loading from '@/components/Loading';
import SelectSprint from '@/components/select/select-sprint';
import FlatSelect from '@/components/flat-select';
import useFullScreen from '@/common/useFullScreen';
import { ILocalField } from '@/components/issue-search/store';
import { getSystemFields } from '@/stores/project/issue/IssueStore';
import { useIssueSearchStore } from '@/components/issue-search';
import FilterManage from '@/components/FilterManage';
import { transformFilter } from './components/search/util';
import Search from './components/search';
import GanttBar from './components/gantt-bar';
import IssueDetail from './components/issue-detail';
import Context from './context';
import GanttStore from './store';
import GanttOperation from './components/gantt-operation';
import './index.less';

const { Option } = FlatSelect;
const tableColumns = [{
  width: 214,
  name: 'summary',
  label: '名称',
  // @ts-ignore
  render: (record) => (
    !record.group ? (
      <span style={{ cursor: 'pointer', color: 'black' }}>
        <TypeTag data={record.issueTypeVO} style={{ marginRight: 5, marginTop: -3 }} />
        {record.summary}
      </span>
    ) : record.summary
  ),
},
{
  width: 100,
  name: 'assignee',
  label: '经办人',
  // @ts-ignore
  render: (record) => <UserHead user={record.assignee} />,
},
{
  width: 100,
  name: 'estimatedStartTime',
  label: '预计开始',
  // @ts-ignore
  render: (record) => record.estimatedStartTime && <Tooltip title={record.estimatedStartTime}><span>{dayjs(record.estimatedStartTime).format('YYYY-MM-DD')}</span></Tooltip>,
},
{
  width: 100,
  name: 'estimatedEndTime',
  label: '预计结束',
  // @ts-ignore
  render: (record) => record.estimatedEndTime && <Tooltip title={record.estimatedEndTime}><span>{dayjs(record.estimatedEndTime).format('YYYY-MM-DD')}</span></Tooltip>,
}];
const GanttPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [type, setType] = useState<string>('task');
  const [sprintId, setSprintId] = useState<string | null>(null);
  const [columns, setColumns] = useState<Gantt.Column[]>([]);
  const [workCalendar, setWorkCalendar] = useState<any>();
  const [filterManageVisible, setFilterManageVisible] = useState<boolean>();
  const [loading, setLoading] = useState(false);
  const issueSearchStore = useIssueSearchStore({
    getSystemFields: () => getSystemFields().filter((item) => item.code !== 'sprint') as ILocalField[],
    transformFilter,
  });
  const store = useMemo(() => new GanttStore(), []);
  const [isFullScreen, toggleFullScreen] = useFullScreen(() => document.body, () => { }, 'c7n-gantt-fullScreen');
  const loadData = useCallback(() => {
    (async () => {
      const year = dayjs().year();
      const filter = issueSearchStore.getCustomFieldFilters();
      if (sprintId === null) {
        return;
      }
      filter.otherArgs.sprint = [sprintId];
      setLoading(true);
      const [workCalendarRes, res] = await Promise.all([
        workCalendarApi.getWorkSetting(year),
        type === 'task' ? ganttApi.loadByTask(filter) : ganttApi.loadByUser(filter),
      ]);
      // setColumns(headers.map((h: any) => ({
      //   width: 100,
      //   name: h.fieldCode,
      //   label: h.name,
      // })));
      setWorkCalendar(workCalendarRes);
      setColumns(tableColumns);
      setData(res);
      setLoading(false);
    })();
  }, [issueSearchStore, sprintId, type]);
  useEffect(() => {
    loadData();
  }, [issueSearchStore, loadData]);
  const handleUpdate = useCallback(async (issue: Gantt.Item, startDate: string, endDate: string) => {
    try {
      await issueApi.update({
        issueId: issue.issueId as number,
        objectVersionNumber: issue.objectVersionNumber as number,
        estimatedStartTime: startDate,
        estimatedEndTime: endDate,
      });
      // eslint-disable-next-line no-param-reassign
      issue.objectVersionNumber += 1;
      return true;
    } catch (error) {
      return false;
    }
  }, []);
  const handleSprintChange = useCallback((value: string) => {
    setSprintId(value);
  }, []);
  const afterSprintLoad = useCallback((sprints) => {
    if (!sprintId) {
      const currentSprint = find(sprints, { statusCode: 'started' });
      if (currentSprint) {
        setSprintId(currentSprint.sprintId);
      } else {
        setSprintId(sprints[0]?.sprintId || '0');
      }
    }
  }, [sprintId]);
  const isRestDay = useCallback((date: string) => {
    if (!workCalendar) {
      return false;
    }
    const day = dayjs(date).weekday();
    const { saturdayWork, sundayWork, timeZoneWorkCalendarDTOS } = workCalendar;
    const unWorkDays = timeZoneWorkCalendarDTOS.map((w: any) => w.workDay);
    if (!saturdayWork && day === 6) {
      return true;
    }
    if (!sundayWork && day === 0) {
      return true;
    }
    if (unWorkDays.includes(dayjs(date).format('YYYY-MM-DD'))) {
      return true;
    }
    return false;
  }, [workCalendar]);
  const handleClickFilterManage = () => {
    setFilterManageVisible(true);
  };
  const { unit } = store;
  const onRow = useMemo(() => ({
    // @ts-ignore
    onClick: (issue) => {
      store.setIssueId(issue.issueId);
    },
  }), [store]);
  const getExpandIcon = useCallback(({ level, collapsed, onClick }) => (
    <div
      role="none"
      onClick={onClick}
      className={classNames('gantt-expand-icon', {
        'gantt-expand-icon-expanded': !collapsed,
      })}
    >
      <Icon type="navigate_next" />
    </div>
  ), []);
  const renderBar: GanttProps['renderBar'] = useCallback((bar, { width, height }) => (
    <GanttBar
      bar={bar}
      width={width}
      height={height}
    />
  ), []);
  return (
    <Page>
      <Header>
        <SelectSprint
          flat
          placeholder="冲刺"
          value={sprintId}
          onChange={handleSprintChange}
          clearButton={false}
          afterLoad={afterSprintLoad}
          hasUnassign
        />
        <FlatSelect value={type} onChange={setType} clearButton={false}>
          <Option value="task">
            按任务查看
          </Option>
          <Option value="assignee">
            按经办人查看
          </Option>
        </FlatSelect>
        <Button
          icon="playlist_add"
        >
          创建问题
        </Button>
        <Button
          // @ts-ignore
          onClick={() => { toggleFullScreen(); }}
          icon={isFullScreen ? 'fullscreen_exit' : 'zoom_out_map'}
        >
          {isFullScreen ? '退出全屏' : '全屏'}
        </Button>
        <Button onClick={handleClickFilterManage} icon="settings">筛选管理</Button>
      </Header>
      <Breadcrumb />
      <Content style={{
        borderTop: '1px solid rgb(216, 216, 216)',
        display: 'flex',
        paddingTop: 7,
        flexDirection: 'column',
      }}
      >
        <Context.Provider value={{ store }}>
          <div style={{ display: 'flex' }}>
            <Search issueSearchStore={issueSearchStore} loadData={loadData} />
            <GanttOperation />
          </div>
          <Loading loading={loading} />
          {columns.length > 0 && workCalendar && (
            <GanttComponent
              // @ts-ignore
              ref={store.ganttRef}
              data={data}
              columns={columns}
              onUpdate={handleUpdate}
              startDateKey="estimatedStartTime"
              endDateKey="estimatedEndTime"
              isRestDay={isRestDay}
              showBackToday={false}
              showUnitSwitch={false}
              unit={unit}
              onRow={onRow}
              tableIndent={28}
              expandIcon={getExpandIcon}
              renderBar={renderBar}
            />
          )}
          <IssueDetail />
          <FilterManage
            visible={filterManageVisible!}
            setVisible={setFilterManageVisible}
            issueSearchStore={issueSearchStore}
          />
        </Context.Provider>
      </Content>
    </Page>
  );
};
export default observer(GanttPage);
