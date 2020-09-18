import React, { useMemo, useCallback, useImperativeHandle } from 'react';
import EpicBurnDown from '@/components/charts/epic-burnDown';
import EpicBurnDownSearch from '@/components/charts/epic-burnDown/search';
import useEpicBurnDownReport from '@/components/charts/epic-burnDown/useEpicBurnDownReport';
import pic from '@/assets/image/emptyChart.svg';
import EmptyBlock from '@/components/EmptyBlock';
import to from '@/utils/to';
import LINK_URL from '@/constants/LINK_URL';
import { IReportChartBlock, EpicBurndownSearchVO } from '@/routes/project-report/report-page/store';
import { getProjectId } from '@/utils/common';
import { ChartRefProps } from '../..';

interface Props {
  innerRef: React.MutableRefObject<ChartRefProps>
  data?: IReportChartBlock
}
export const transformEpicBurndownSearch = (searchVO: EpicBurndownSearchVO): {
  epicId: string,
  checked: 'checked' | undefined,
} | undefined => {
  if (!searchVO) {
    return undefined;
  }
  return ({
    epicId: searchVO.epicId,
    checked: searchVO.calibrationSprint ? 'checked' : undefined,
  });
};

const EpicBurnDownComponent:React.FC<Props> = ({ innerRef, data }) => {
  const config = useMemo(() => transformEpicBurndownSearch(data?.chartSearchVO as EpicBurndownSearchVO), [data?.chartSearchVO]);
  const [searchProps, props] = useEpicBurnDownReport(config);
  const { epics, currentEpicId, checked } = searchProps;
  const handleSubmit = useCallback(async (): Promise<EpicBurndownSearchVO> => ({
    type: 'epic',
    epicId: currentEpicId,
    calibrationSprint: checked === 'checked',
    projectId: getProjectId(),
  }),
  [checked, currentEpicId]);

  useImperativeHandle(innerRef, () => ({
    submit: handleSubmit,
  }), [handleSubmit]);

  return (
    <div>
      {
        epics && epics.length > 0 ? (
          <>
            <EpicBurnDownSearch {...searchProps} />
            <EpicBurnDown {...props} />
          </>
        ) : (
          <EmptyBlock
            textWidth="auto"
            pic={pic}
            title="当前项目无可用史诗"
            des={(
              <div>
                <span>请在</span>
                <span
                  className="primary"
                  style={{ margin: '0 5px', cursor: 'pointer' }}
                  role="none"
                  onClick={() => {
                    to(LINK_URL.workListBacklog);
                  }}
                >
                  待办事项
                </span>
                <span>或</span>
                <span
                  className="primary"
                  style={{ margin: '0 5px', cursor: 'pointer' }}
                  role="none"
                  onClick={() => {
                    to(LINK_URL.workListIssue);
                  }}
                >
                  问题管理
                </span>
                <span>中创建一个史诗</span>
              </div>
            )}
          />
        )
      }

    </div>
  );
};
export default EpicBurnDownComponent;
