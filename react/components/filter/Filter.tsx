import React, { useCallback, useMemo } from 'react';
import { find, uniq, pull } from 'lodash';
import { Button, Icon } from 'choerodon-ui/pro';
import classNames from 'classnames';
import SelectField, { SelectFieldProps } from '@/components/field/select-field';
import Field from '@/components/field';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { ISystemField, ICustomField, IFilterField } from '.';
import { getFlatElement, renderGroupedFields, renderFields } from './utils';

export interface IFilter {
  [key: string]: any
}
export type IRenderFields = (arg: {
  fields: IFilterField[]
  getFieldElement: (field: IFilterField) => { element: React.ReactElement, removeButton: React.ReactElement | null }
  selectField: React.ReactElement | null
  resetButton: React.ReactElement | null
}) => React.ReactElement

export interface FilterProps {
  filter: IFilter
  onFilterChange: (filter: IFilter) => void
  selected: string[]
  onSelectChange: (selected: string[]) => void
  systemFields: ISystemField[]
  customFields: ICustomField[]
  alwaysRenderFields?: string[]
  render?: (field: IFilterField, element: React.ReactNode) => React.ReactNode
  renderer?: IRenderFields
  removeButton?: boolean | React.ReactNode
  grouped?: boolean
  flat?: boolean
  selectFieldGroups?: SelectFieldProps['groups']
}
const Filter: React.FC<FilterProps> = ({
  systemFields,
  customFields,
  alwaysRenderFields = [],
  render,
  renderer,
  onSelectChange,
  onFilterChange,
  selected,
  removeButton,
  grouped,
  flat,
  filter,
  selectFieldGroups,
}) => {
  const handleFilterChange = useCallback((code: string, v: any) => {
    const clonedFilter = { ...filter };
    if (v === null || v === undefined) {
      delete clonedFilter[code];
    } else {
      clonedFilter[code] = v;
    }
    onFilterChange(clonedFilter);
  }, [filter, onFilterChange]);
  const handleSelect = useCallback((select: string[]) => {
    const newValue = uniq([...selected, ...select]);
    onSelectChange(newValue);
  }, [onSelectChange, selected]);
  const handleUnSelect = useCallback((unselect: string[]) => {
    const newValue = [...selected];
    const clonedFilter = { ...filter };
    let changedFilter = false;
    unselect.forEach((code) => {
      pull(newValue, code);
      if (Object.prototype.hasOwnProperty.call(filter, code)) {
        changedFilter = true;
        delete clonedFilter[code];
      }
    });
    onSelectChange(newValue);
    if (changedFilter) {
      onFilterChange(clonedFilter);
    }
  }, [filter, onSelectChange, onFilterChange, selected]);
  const handleSelectChange = useCallback((codes: string[], select: boolean) => {
    if (select) {
      handleSelect(codes);
    } else {
      handleUnSelect(codes);
    }
  }, [handleSelect, handleUnSelect]);
  const totalFields = useMemo(() => [...systemFields, ...customFields], [customFields, systemFields]);
  const selectedFields = useMemo(() => alwaysRenderFields.concat(selected).reduce((result: IFilterField[], code) => {
    const field = find(totalFields, { code });
    if (field) {
      result.push(field as IFilterField);
    }
    return result;
  }, []), [alwaysRenderFields, selected, totalFields]);
  const systemFieldsWithoutAlwaysRender = useMemo(() => systemFields.filter(({ code }) => !alwaysRenderFields.includes(code)), [alwaysRenderFields, systemFields]);
  const groups = useMemo(() => selectFieldGroups || [
    ...(systemFieldsWithoutAlwaysRender.length > 0 ? [{
      title: '系统字段',
      options: systemFieldsWithoutAlwaysRender.map((f) => ({
        title: f.title,
        code: f.code,
      })),
    }] : []),
    {
      title: '自定义字段',
      options: customFields.map((f: any) => ({
        title: f.title,
        code: f.code,
      })),
    },
  ], [customFields, selectFieldGroups, systemFieldsWithoutAlwaysRender]);
  const renderRemoveButton = useCallback((field: IFilterField) => {
    if (!removeButton || alwaysRenderFields.includes(field.code)) {
      return null;
    }
    if (removeButton === true) {
      return (
        <Button
          icon="delete"
          style={{ marginLeft: 10, flexShrink: 0 }}
          onClick={() => {
            handleSelectChange([field.code], false);
          }}
        />
      );
    }
    if (React.isValidElement(removeButton)) {
      return React.cloneElement(removeButton, {
        onClick: () => {
          handleSelectChange([field.code], false);
        },
      });
    }
    return null;
  }, [alwaysRenderFields, handleSelectChange, removeButton]);
  const getEmptyValue = useCallback((v: any, {
    isSelect,
    isText,
    isTime,
  }) => {
    if (v) {
      return v;
    }
    if (isSelect) {
      return [];
    }
    if (isText) {
      return '';
    }
    if (isTime) {
      return { start: undefined, end: undefined };
    }
    return v;
  }, []);
  const renderFlatElement = useCallback((field: IFilterField, element: React.ReactNode) => {
    const flatElement = getFlatElement(field, element);
    return render ? render(field, flatElement) : flatElement;
  }, [render]);
  const renderField = useCallback((field: IFilterField) => {
    const isSelect = ['single', 'multiple', 'radio', 'checkbox', 'member'].includes(field.fieldType);
    const isText = ['input', 'text'].includes(field.fieldType);
    const isUser = ['member'].includes(field.fieldType);
    const isTime = ['time', 'datetime', 'date'].includes(field.fieldType);
    const className = flat ? classNames({
      'c7n-pro-select-flat': isSelect,
      'c7n-pro-cascader-flat': isSelect,
    }) : undefined;
    const placeholder = isTime ? ['开始时间', '结束时间'] : field.title;
    return {
      element: <Field
        style={{
          marginRight: 10, marginTop: flat ? 0 : 10, flex: 1, flexShrink: 1,
        }}
        render={flat ? renderFlatElement : render}
        mode="filter"
        field={field}
        label={field.title}
        // @ts-ignore
        placeholder={placeholder}
        required={field.required}
        value={getEmptyValue(filter[field.code], {
          isSelect,
          isText,
          isTime,
        })}
        onChange={(v: any) => {
          if (isTime && v && v.length > 0) {
            if (v[0] === undefined && v[1] === undefined) {
              handleFilterChange(field.code, undefined);
              return;
            }
          }
          if (filter[field.code] === undefined && v === null) {
            return;
          }
          handleFilterChange(field.code, v);
        }}
        dropdownMatchSelectWidth={false}
        maxTagCount={3}
        className={className}
        labelLayout={!flat || isText || isTime ? 'float' as LabelLayout : 'none' as LabelLayout}
        {...isUser ? {
          autoQueryConfig: {
            selectedUserIds: filter[field.code],
          },
        } : {}}
      />,
      removeButton: renderRemoveButton(field),
    };
  }, [flat, renderFlatElement, render, getEmptyValue, filter, renderRemoveButton, handleFilterChange]);
  const renderSelectField = useCallback(() => {
    if (groups.length === 0) {
      return null;
    }
    return (
      <SelectField
        groups={groups}
        value={selected}
        onChange={handleSelectChange}
        triggerElement={flat ? (
          <Button>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              添加筛选
              <Icon type="arrow_drop_down" />
            </span>
          </Button>
        ) : undefined}
      />
    );
  }, [flat, groups, handleSelectChange, selected]);
  const resetFilter = useCallback(() => {
    onFilterChange({});
  }, [onFilterChange]);
  const renderResetButton = useCallback(() => {
    if (!Object.keys(filter).some((key) => filter[key] !== undefined && filter[key] !== null && filter[key] !== '')) {
      return null;
    }
    return (
      <Button color={'blue' as ButtonColor} onClick={resetFilter}>
        重置
      </Button>
    );
  }, [filter, resetFilter]);
  const selectField = renderSelectField();
  const resetButton = renderResetButton();
  if (renderer) {
    return renderer({
      fields: selectedFields, getFieldElement: renderField, selectField, resetButton,
    });
  }
  return grouped
    ? renderGroupedFields({
      fields: selectedFields, getFieldElement: renderField, selectField, resetButton,
    })
    : renderFields({
      fields: selectedFields, getFieldElement: renderField, selectField, resetButton,
    });
};
export default Filter;