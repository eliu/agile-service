package io.choerodon.agile.api.vo;

import io.swagger.annotations.ApiModelProperty;

import javax.validation.constraints.NotNull;
import java.util.Date;

/**
 * Created by jian_zhang02@163.com on 2018/5/14.
 */

public class ProductVersionCreateVO {
    private static final String NAME_NULL_ERROR = "error.productVersionName.NotNull";
    private static final String PROJECT_ID_NULL_ERROR = "error.projectId.NotNull";

    @ApiModelProperty(value = "版本名称")
    @NotNull(message = NAME_NULL_ERROR)
    private String name;

    @ApiModelProperty(value = "版本描述")
    private String description;

    @ApiModelProperty(value = "版本开始时间")
    private Date startDate;

    @ApiModelProperty(value = "版本预期发布时间")
    private Date expectReleaseDate;

    @ApiModelProperty(value = "版本发布时间")
    private Date releaseDate;

    @ApiModelProperty(value = "项目id")
    @NotNull(message = PROJECT_ID_NULL_ERROR)
    private Long projectId;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public void setExpectReleaseDate(Date expectReleaseDate) {
        this.expectReleaseDate = expectReleaseDate;
    }

    public Date getExpectReleaseDate() {
        return expectReleaseDate;
    }

    public Date getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(Date releaseDate) {
        this.releaseDate = releaseDate;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

}
