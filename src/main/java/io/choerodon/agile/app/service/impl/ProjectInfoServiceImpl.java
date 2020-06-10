package io.choerodon.agile.app.service.impl;

import io.choerodon.core.domain.Page;
import io.choerodon.agile.api.vo.*;
import io.choerodon.agile.app.service.ProjectInfoService;
import io.choerodon.agile.api.vo.event.ProjectEvent;
import io.choerodon.agile.infra.utils.ConvertUtil;
import io.choerodon.agile.infra.dto.ProjectInfoDTO;
import io.choerodon.agile.infra.feign.BaseFeignClient;
import io.choerodon.agile.infra.mapper.ProjectInfoMapper;
import io.choerodon.core.exception.CommonException;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * @author dinghuang123@gmail.com
 * @since 2018/5/30
 */
@Component
@Transactional(rollbackFor = Exception.class)
public class ProjectInfoServiceImpl implements ProjectInfoService {

    @Autowired
    private ProjectInfoMapper projectInfoMapper;
    @Autowired
    private BaseFeignClient baseFeignClient;
    @Autowired
    private ModelMapper modelMapper;

    @Override
    public void initializationProjectInfo(ProjectEvent projectEvent) {
        ProjectInfoDTO projectInfoDTO = new ProjectInfoDTO();
        projectInfoDTO.setIssueMaxNum(0L);
        projectInfoDTO.setProjectCode(projectEvent.getProjectCode());
        projectInfoDTO.setProjectId(projectEvent.getProjectId());
        projectInfoDTO.setFeedbackMaxNum(0L);
        int result = projectInfoMapper.insert(projectInfoDTO);
        if (result != 1) {
            throw new CommonException("error.projectInfo.initializationProjectInfo");
        }
    }

    @Override
    public Boolean checkProjectCode(String projectName) {
        ProjectInfoDTO projectInfoDTO = new ProjectInfoDTO();
        projectInfoDTO.setProjectCode(projectName);
        return projectInfoMapper.selectOne(projectInfoDTO) != null;
    }

    @Override
    public ProjectInfoVO updateProjectInfo(ProjectInfoVO projectInfoVO) {
        ProjectInfoDTO projectInfoDTO = modelMapper.map(projectInfoVO, ProjectInfoDTO.class);
        if (projectInfoMapper.updateByPrimaryKeySelective(projectInfoDTO) != 1) {
            throw new CommonException("error.projectInfo.update");
        }
        return projectInfoVO;
    }

    @Override
    public ProjectInfoVO queryProjectInfoByProjectId(Long projectId) {
        ProjectInfoDTO projectInfoDTO = new ProjectInfoDTO();
        projectInfoDTO.setProjectId(projectId);
        return modelMapper.map(projectInfoMapper.selectOne(projectInfoDTO), ProjectInfoVO.class);
    }

    /**
     * 更新MaxNum方法，在高并发的情况下，可能更新的maxNum已经不是最大的maxNum，因此不需要判断是否更新成功
     *
     * @param projectId   projectId
     * @param issueMaxNum issueMaxNum
     */
    @Override
    public void updateIssueMaxNum(Long projectId, String issueMaxNum) {
        projectInfoMapper.updateIssueMaxNum(projectId, issueMaxNum);
    }

    @Override
    public List<ProjectInfoFixVO> queryAllProjectInfo() {
        List<ProjectInfoDTO> projectInfoDTOList = projectInfoMapper.selectAll();
        if (projectInfoDTOList != null && !projectInfoDTOList.isEmpty()) {
            return modelMapper.map(projectInfoDTOList, new TypeToken<List<ProjectInfoFixVO>>(){}.getType());
        } else {
            return new ArrayList<>();
        }
    }

}
