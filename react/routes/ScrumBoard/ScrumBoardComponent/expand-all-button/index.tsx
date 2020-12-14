import React, { useState } from 'react';
import {
  Button, Select, Spin, Icon, Modal, Form, Tooltip, Radio,
} from 'choerodon-ui';
import classnames from 'classnames';
import scrumBoardStore from '@/stores/project/scrumBoard/ScrumBoardStore';
import { observer } from 'mobx-react-lite';
import expandStyles from './index.less';

function ExpandAllButton() {
  const [expandAll, setExpandAll] = useState<boolean>();
  function handleClick() {
    if (scrumBoardStore.currentBindFunctionMaps.has('expandOrUp-epic')) {
      scrumBoardStore.executeBindFunction(['expandOrUp-epic'], !expandAll);
      setExpandAll(!expandAll);

      return;
    }
    scrumBoardStore.executeBindFunction(['expandOrUp', 'expandOrUp-epic'], !expandAll);
    setExpandAll(!expandAll);
    // scrumBoardStore.currentBindFunctionMaps.get('expandOrUp')(!expandAll);
  }
  return scrumBoardStore.currentBindFunctionMaps.get('expandOrUp') || scrumBoardStore.currentBindFunctionMaps.get('expandOrUp-epic') ? (
    <Button onClick={handleClick}>
      {expandAll ? '全部收起' : (
        <Tooltip title="仅展开前15项">
          <span>全部展开</span>
        </Tooltip>
      )}
      <Icon type="baseline-arrow_right" className={classnames({ [expandStyles.expand]: expandAll })} />
    </Button>
  ) : null;
}
export default observer(ExpandAllButton);
