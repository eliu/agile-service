/* eslint-disable no-nested-ternary */
import React, {
  Fragment, useEffect, useRef, useCallback,
} from 'react';
import {
  Page, Header, Content, Breadcrumb,
} from '@choerodon/boot';
import { Button } from 'choerodon-ui';
import {
  CheckBox,
} from 'choerodon-ui/pro';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { observer } from 'mobx-react-lite';
import useIsInProgram from '@/hooks/useIsInProgram';
import HeaderLine from '@/components/HeaderLine';
import FilterManage from '@/components/FilterManage';
import { localPageCacheStore } from '@/stores/common/LocalPageCacheStore';
import StoryMapStore from '@/stores/project/StoryMap/StoryMapStore';
import { useIssueSearchStore } from '@/components/issue-search';
import { getSystemFieldsInStoryMap } from '@/stores/project/issue/IssueStore';
import { transformFilter } from '@/routes/Issue/stores/utils';
import Minimap from './components/MiniMap';
import Empty from '../../../components/Empty';
import epicPic from './emptyStory.svg';
import emptyPic from './emptyData.svg';
import Loading from '../../../components/Loading';
import StoryMapBody from './components/StoryMapBody';
import SideIssueList from './components/SideIssueList';
import SwitchSwimLine from './components/SwitchSwimLine';
import CreateEpicModal from './components/CreateEpicModal';
import IssueDetail from './components/IssueDetail';
import StoryMapSearch from './components/Search';
import useFullScreen from '../../../common/useFullScreen';
import './StoryMapHome.less';

const HEX = {
  'c7nagile-StoryMap-EpicCard': '#D9C2FB',
  'c7nagile-StoryMap-StoryCard': '#AEE9E0',
  business: '#BCC6FF',
  enabler: '#FEA',
};

const StoryMapHome = observer(() => {
  const issueSearchStore = useIssueSearchStore({
    // @ts-ignore
    getSystemFields: () => getSystemFieldsInStoryMap(['issueTypeId', 'quickFilterIds']),
    transformFilter,
    // @ts-ignore
    defaultChosenFields: Array.isArray(localPageCacheStore.getItem('storyMapFilter')) ? new Map(localPageCacheStore.getItem('storyMapFilter').map((item) => [item.code, item])) : undefined,
  });
  StoryMapStore.setIssueSearchStore(issueSearchStore);
  const handleRefresh = (firstLoad = false) => {
    StoryMapStore.getStoryMap(firstLoad);
  };
  const ref = useRef(null);
  StoryMapStore.setMiniMapRef(ref);

  useEffect(() => {
    const defaultHiddenNoStoryValue = localPageCacheStore.getItem('stroyMap.hidden.no.stroy');
    defaultHiddenNoStoryValue && StoryMapStore.setHiddenColumnNoStory(defaultHiddenNoStoryValue);

    const defaultFoldCompletedEpic = localPageCacheStore.getItem('stroyMap.fold.completedEpic');
    defaultFoldCompletedEpic && StoryMapStore.setFoldCompletedEpic(defaultFoldCompletedEpic);

    const cacheSearchVO = localPageCacheStore.getItem('storyMapSearchVO');
    cacheSearchVO && StoryMapStore.setSearchVO(cacheSearchVO);

    handleRefresh(true);
    return () => { StoryMapStore.clear(); };
  }, []);
  const handleOpenIssueList = () => {
    StoryMapStore.toggleSideIssueListVisible(!StoryMapStore.sideIssueListVisible);
  };
  const handleCloseIssueList = () => {
    setTimeout(() => {
      StoryMapStore.toggleSideIssueListVisible(false);
    });
  };

  const handleCreateEpicClick = () => {
    StoryMapStore.setCreateEpicModalVisible(true);
  };

  const handleCreateEpic = (newEpic) => {
    StoryMapStore.setCreateEpicModalVisible(false);
    StoryMapStore.afterCreateEpicInModal(newEpic);
  };

  const onFullScreenChange = (isFullScreen) => {
    StoryMapStore.setIsFullScreen(!!isFullScreen);
  };

  const renderChild = ({
    width, height, left, top, node,
  }) => {
    let classNameFound = null;
    node.classList.forEach((className) => {
      if (HEX[className]) {
        classNameFound = className;
      }
    });

    return (
      <div
        style={{
          position: 'absolute',
          width,
          height,
          left,
          top,
          backgroundColor: HEX[classNameFound],
        }}
      />
    );
  };

  /**
   * 问题宽度localStorage.getItem('agile.EditIssue.width')
   * @param {*} width
   */
  const setIssueWidth = (width) => {
    if (ref.current) {
      ref.current.source.style.width = `calc(100% - ${width || 400}px)`;
    }
  };

  const handleNoStoryCheckBoxChange = (value) => {
    localPageCacheStore.setItem('stroyMap.hidden.no.stroy', value);
    StoryMapStore.setHiddenColumnNoStory(value);
  };

  const handleCompletedEpicCheckBoxChange = (value) => {
    localPageCacheStore.setItem('stroyMap.fold.completedEpic', value);
    StoryMapStore.setFoldCompletedEpic(value);
    StoryMapStore.foldCompletedEpicColumn(value);
  };

  const handleClickFilterManage = useCallback(() => {
    // const editFilterInfo = IssueStore.getEditFilterInfo;
    // const filterListVisible = IssueStore.getFilterListVisible;
    // IssueStore.setFilterListVisible(!filterListVisible);
    StoryMapStore.setFilterListVisible(!StoryMapStore.filterListVisible);
  }, []);

  const {
    loading, selectedIssueMap, storyMapData, storyData, hiddenColumnNoStory,
  } = StoryMapStore;
  const isEmpty = StoryMapStore.getIsEmpty;
  /**
   * 打开问题详情时设置样式 用以显示全部地图
   */
  useEffect(() => {
    if (ref.current && selectedIssueMap.size) {
      ref.current.source.style.width = `calc(100% - ${localStorage.getItem('agile.EditIssue.width')})`;
    } else if (ref.current) {
      ref.current.source.style.width = '';
    }
  }, [selectedIssueMap.size]);

  const { isInProgram } = useIsInProgram(); // 判断是否为项目群下的子项目 是则不显示史诗
  const [isFullScreen, toggleFullScreen] = useFullScreen(() => document.body, () => { }, 'c7nagile-StoryMap-fullScreen');

  return (
    <Page
      className="c7nagile-StoryMap"
      // service={[
      //   'choerodon.code.project.cooperation.story-map.ps.default',
      // ]}
    >
      <Header title="故事地图">
        {!isInProgram && isEmpty && !loading ? <Button onClick={handleCreateEpicClick} icon="playlist_add">创建史诗</Button> : null}
        {!StoryMapStore.isFullScreen && (
          <Button
            icon="view_module"
            onClick={handleOpenIssueList}
          >
            需求池
          </Button>
        )}
        <Button className="c7nagile-StoryMap-fullScreenBtn" onClick={() => { toggleFullScreen(); }} icon={isFullScreen ? 'fullscreen_exit' : 'zoom_out_map'}>
          {isFullScreen ? '退出全屏' : '全屏'}
        </Button>
        <HeaderLine />
        <SwitchSwimLine />
        {isInProgram && <CheckBox style={{ marginLeft: 20 }} name="hiddenColumn" checked={StoryMapStore.hiddenColumnNoStory} onChange={handleNoStoryCheckBoxChange}>隐藏无故事的列</CheckBox>}
        <CheckBox name="foldCompletedEpic" style={{ marginLeft: 20 }} checked={StoryMapStore.foldCompletedEpic} onChange={handleCompletedEpicCheckBoxChange}>收起已完成的史诗列</CheckBox>
        {/* <Button onClick={handleClickFilterManage} icon="settings">筛选管理</Button> */}
      </Header>
      <Breadcrumb />
      <Content style={{
        padding: 0, borderTop: '1px solid #D8D8D8', overflow: 'hidden',
      }}
      >
        <Loading loading={loading} />
        <StoryMapSearch issueSearchStore={issueSearchStore} />

        {!isEmpty ? (
          hiddenColumnNoStory && Object.values(storyData).every((item) => !item.storys.length) ? (
            <Empty
              pic={emptyPic}
              title="暂无数据"
              description="隐藏无故事的列后无史诗数据"
            />
          ) : (
            <Minimap ref={ref} disabledVertical width={300} height={40} showHeight={300} className="c7nagile-StoryMap-minimap" selector=".minimapCard" childComponent={renderChild}>
              <StoryMapBody />
            </Minimap>
          )
        ) : (
          loading ? null : (
              // eslint-disable-next-line react/jsx-indent
              <Empty
                style={{ background: 'white', height: 'calc(100% + 120px)', marginTop: -120 }}
                pic={epicPic}
                title="欢迎使用敏捷用户故事地图"
                description="用户故事地图是以史诗为基础，根据版本控制进行管理规划"
              />
          )
        )}
        <FilterManage
          visible={StoryMapStore.filterListVisible}
          setVisible={StoryMapStore.setFilterListVisible}
          issueSearchStore={issueSearchStore}
        />
        <SideIssueList handleClickOutside={handleCloseIssueList} eventTypes={['click']} />
        <CreateEpicModal onOk={handleCreateEpic} />
        <IssueDetail refresh={handleRefresh} isFullScreen={isFullScreen} onChangeWidth={setIssueWidth} />
      </Content>
    </Page>
  );
});

StoryMapHome.propTypes = {

};
export default ({ ...props }) => (
  <DragDropContextProvider backend={HTML5Backend}>
    <StoryMapHome {...props} />
  </DragDropContextProvider>
);
