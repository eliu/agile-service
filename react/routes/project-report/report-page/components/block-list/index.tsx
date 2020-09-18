import React from 'react';
import { observer } from 'mobx-react-lite';
import { useProjectReportContext } from '../../context';
import ReportBlock from '../report-block';

const BlockList: React.FC = () => {
  const { store } = useProjectReportContext();
  return (
    <>
      {store.blockList.map((block, index) => <ReportBlock index={index} data={block} />)}
    </>
  );
};
export default observer(BlockList);