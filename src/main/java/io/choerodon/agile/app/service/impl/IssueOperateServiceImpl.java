package io.choerodon.agile.app.service.impl;

import com.alibaba.fastjson.JSON;
import io.choerodon.agile.api.vo.BatchUpdateFieldStatusVO;
import io.choerodon.agile.app.service.IssueOperateService;
import io.choerodon.agile.app.service.IssueService;
import io.choerodon.agile.app.service.UserService;
import io.choerodon.agile.infra.dto.IssueInfoDTO;
import io.choerodon.agile.infra.dto.business.IssueDTO;
import io.choerodon.agile.infra.mapper.IssueMapper;
import io.choerodon.core.exception.CommonException;
import io.choerodon.core.oauth.DetailsHelper;
import org.hzero.boot.message.MessageClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * @author zhaotianxin
 * @date 2020-11-27 17:06
 */
@Service
@Transactional(rollbackFor = Exception.class)
public class IssueOperateServiceImpl implements IssueOperateService {
    private static final String WEBSOCKET_BATCH_DELETE_ISSUE = "agile-batch-delete-issue";

    @Autowired
    private IssueService issueService;
    @Autowired
    private MessageClient messageClient;
    @Autowired
    private UserService userService;

    @Async
    @Override
    public void batchDeleteIssue(Long projectId, List<Long> issueIds) {
        if (!CollectionUtils.isEmpty(issueIds)) {
            Long userId = DetailsHelper.getUserDetails().getUserId();
            boolean projectOwner = userService.isProjectOwner(projectId, userId);
            if (Boolean.FALSE.equals(projectOwner)) {
                return;
            }
            String messageCode = WEBSOCKET_BATCH_DELETE_ISSUE + "-" + projectId;
            BatchUpdateFieldStatusVO batchUpdateFieldStatusVO = new BatchUpdateFieldStatusVO();
            Double progress = 0.0;
            double incrementalValue = 1.0 / (issueIds.size() == 0 ? 1 : issueIds.size());
            try {
                batchUpdateFieldStatusVO.setStatus("doing");
                batchUpdateFieldStatusVO.setKey(messageCode);
                batchUpdateFieldStatusVO.setUserId(userId);
                batchUpdateFieldStatusVO.setProcess(progress);
                messageClient.sendByUserId(userId, messageCode, JSON.toJSONString(batchUpdateFieldStatusVO));
                for (Long issueId : issueIds) {
                    issueService.deleteIssue(projectId, issueId);
                    progress += incrementalValue;
                    batchUpdateFieldStatusVO.setProcess(progress);
                    messageClient.sendByUserId(userId, messageCode, JSON.toJSONString(batchUpdateFieldStatusVO));
                }
                batchUpdateFieldStatusVO.setProcess(1.0);
            } catch (Exception e) {
                batchUpdateFieldStatusVO.setStatus("failed");
                batchUpdateFieldStatusVO.setError(e.getMessage());
                throw new CommonException("delete issue failed, exception: {}", e.getMessage());
            } finally {
                messageClient.sendByUserId(userId, messageCode, JSON.toJSONString(batchUpdateFieldStatusVO));
            }
        }
    }
}