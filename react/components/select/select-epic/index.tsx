import React, { useMemo, forwardRef } from 'react';
import { Select } from 'choerodon-ui/pro';
import { epicApi } from '@/api';
import useSelect, { SelectConfig } from '@/hooks/useSelect';
import { SelectProps } from 'choerodon-ui/pro/lib/select/Select';
import { IEpic } from '@/components/charts/epic-report/search';
import FlatSelect from '@/components/flat-select';

interface Props extends Partial<SelectProps> {
  isProgram?: boolean
  dataRef?: React.MutableRefObject<any>
  afterLoad?: (epics: IEpic[]) => void
  dontAddEpic0?: boolean
  flat?:boolean
}

const SelectEpic: React.FC<Props> = forwardRef(({
  isProgram, afterLoad, dataRef, dontAddEpic0, flat, ...otherProps
}, ref: React.Ref<Select>) => {
  const config = useMemo((): SelectConfig => ({
    name: 'epic',
    textField: 'epicName',
    valueField: 'issueId',
    request: () => (isProgram ? epicApi.loadProgramEpics() : epicApi.loadEpics()),
    middleWare: (epicList:IEpic[]) => {
      if (isProgram && !dontAddEpic0) {
        epicList.unshift({ issueId: '0', epicName: '未分配史诗' });
      }
      if (dataRef) {
        Object.assign(dataRef, {
          current: isProgram && !dontAddEpic0 ? epicList.unshift({ issueId: '0', epicName: '未分配史诗' }) : epicList,
        });
      }
      if (afterLoad) {
        afterLoad(epicList);
      }
      return epicList;
    },
    paging: false,
  }), []);
  const props = useSelect(config);
  const Component = flat ? FlatSelect : Select;

  return (
    <Component
      ref={ref}
      clearButton
      {...props}
      {...otherProps}
    />
  );
});
export default SelectEpic;
