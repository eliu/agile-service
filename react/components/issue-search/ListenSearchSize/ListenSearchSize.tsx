import React, { useEffect, useState, useContext } from 'react';
import { useSize } from 'ahooks';
import { BasicTarget } from 'ahooks/lib/utils/dom';
import IssueSearchContext from '../context';

const ListenSize: React.FC = () => {
  const { store } = useContext(IssueSearchContext);
  const [searchEle, setSearchEle] = useState<Element | null>(null);

  useEffect(() => {
    setSearchEle(document.getElementsByClassName('c7n-issue-search')[0]);
  }, [searchEle]);

  const searchSize = useSize(searchEle as BasicTarget);

  useEffect(() => {
    store.setOverflowLine((searchSize.height || 0) > 50);
  }, [searchSize.height, store]);

  return (
    <div />
  );
};

export default ListenSize;
