import { axios } from '@choerodon/boot';
import { getProjectId, getOrganizationId } from '@/utils/common';

interface versionIssueRelVO {
    relationType: string // 版本关系：fix、influence
    issueId: number, // 问题id
    versionId: number, // 版本id
    name: string, // 版本名称
    projectId: number, // 项目id
    statusCode: string // 版本状态
}

interface DragStoryMap {
    epicId: number, // 要关联的史诗id
    epicIssueIds: Array<number>, // 问题id列表，移动到版本，配合versionId使用
    featureId: number, // 要关联的特性id
    featureIssueIds: Array<number>, // 问题id列表，移动到特性，配合featureId使用
    versionId: number, // 要关联的版本id
    versionIssueIds: Array<number>, // 问题id列表，移动到版本，配合versionId使用
    versionIssueRelVOList: Array<versionIssueRelVO>
}

interface mainAdvancedSearch {
    advancedSearchArgs: {
        components?: Array<any>,
        sprints?: Array<any>,
        statusList?: Array<any>,
        versionList?: Array<any>
    }
}
interface demandAdvancedSearch {
    advancedSearchArgs: {
        statusList?: Array<any>,
        versionList?: Array<any>
    },
    searchArgs?: {
        assigneeId?: number,
    }
}

interface StoryMapWidthVO {
    objectVersionNumber?: number, // 修改时需要
    issueId: number,
    width: number,
    id: number,
    type: string,
    projectId: number,
}

interface SortVO {
    projectId: number
    type: string,
    before: boolean,
    after: boolean,
    referenceIssueId: number, // 移动到的位置所在问题id
    issueId: number, // 拖拽的问题id
    objectVersionNumber: number
}
const organizationId = getOrganizationId();

/**
 * 冲刺的工作日历 api
 * @author ding
 */
class StoryMapApi {
  get prefix() {
    return `/agile/v1/projects/${getProjectId()}`;
  }

  /**
     * 查询故事地图整体
     * @param searchVO 搜索条件
     * @returns
     */
  getStoryMap(searchVO: mainAdvancedSearch) {
    return axios({
      method: 'post',
      url: `${this.prefix}/story_map/main`,
      data: searchVO,
      params: {
        organizationId,
      },
    });
  }

  /**
* 故事地图拖拽移动卡片
* @param storyMapDragVO
*/
  move(storyMapDragVO: DragStoryMap) {
    return axios({
      method: 'post',
      url: `${this.prefix}/story_map/move?organizationId=${getOrganizationId()}`,
      data: storyMapDragVO,
      params: {
        organizationId,
      },

    });
  }

  /**
     * 获取故事地图的需求池中问题列表
     * @param searchVO
     */
  getDemands(searchVO: demandAdvancedSearch) {
    return axios({
      method: 'post',
      url: `${this.prefix}/story_map/demand`,
      data: searchVO,
      params: {
        organizationId,
      },
    });
  }

  /**
   * 创建故事地图列宽度
   * @param storyMapWidthVO
   */
  createWidth(storyMapWidthVO: StoryMapWidthVO) {
    return axios({
      method: 'post',
      url: `${this.prefix}/story_map_width`,
      data: storyMapWidthVO,
      params: {
        organizationId,
      },
    });
  }

  /**
     * 更改故事地图列宽度
     * @param storyMapWidthVO
     */
  changeWidth(storyMapWidthVO: StoryMapWidthVO) {
    return axios({
      method: 'put',
      url: `${this.prefix}/story_map_width`,
      data: storyMapWidthVO,
      params: {
        organizationId,
      },
    });
  }

  /**
       * 故事地图的史诗、特性进行排序
       * @param sortVO
       */
  sort(sortVO: SortVO) {
    return axios.post(`/agile/v1/projects/${getProjectId()}/rank`, sortVO);
  }
}

const storyMapApi = new StoryMapApi();

export { storyMapApi };
