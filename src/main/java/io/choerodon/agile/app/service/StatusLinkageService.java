package io.choerodon.agile.app.service;

import io.choerodon.agile.api.vo.StatusLinkageVO;

import java.util.List;

/**
 * @author zhaotianxin
 * @date 2020-08-17 19:12
 */
public interface StatusLinkageService {
    List<StatusLinkageVO> createOrUpdate(Long projectId, Long issueTypeId, Long statusId, Long objectVersionNumber, String applyType, List<StatusLinkageVO> linkageVOS);

    List<StatusLinkageVO> listByIssueTypeAndStatusId(Long projectId, Long issueTypeId, Long statusId);

    List<StatusLinkageVO> listByStatusIds(Long projectId, Long issueTypeId, List<Long> statusIds,String applyType);

    boolean updateParentStatus(Long projectId, Long issueId, String applyType);

    List<StatusLinkageVO> listStatusLinkageByProjectId(Long projectId);
}
