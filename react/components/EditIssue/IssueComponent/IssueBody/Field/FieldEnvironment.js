import React, { Component } from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { issueApi } from '@/api';
import TextEditToggle from '@/components/TextEditTogglePro';
import { Select } from 'choerodon-ui/pro';

@observer class FieldEnvironment extends Component {
    updateIssueField = (value) => {
      const {
        store, onUpdate, field, reloadIssue,
      } = this.props;
      const issue = store.getIssue;

      const { issueId, objectVersionNumber } = issue;
      const obj = {
        issueId,
        objectVersionNumber,
        environment: value,
      };
      issueApi.update(obj)
        .then(() => {
          if (onUpdate) {
            onUpdate();
          }
          if (reloadIssue) {
            reloadIssue(issueId);
          }
        });
    };

    render() {
      const { field, store, disabled } = this.props;
      const issue = store.getIssue;
      const { environment } = issue;
      return (
        <div className="line-start mt-10">
          <div className="c7n-property-wrapper">
            <span className="c7n-property">
              环境
            </span>
          </div>
          <div className="c7n-value-wrapper" style={{ width: 'auto' }}>
            <TextEditToggle
              disabled={disabled}
              alwaysRender
              onSubmit={this.updateIssueField}
              initValue={environment}
              editor={(
                <Select vertical required={field.required}>
                  <Select.Option value="生产环境">生产环境</Select.Option>
                  <Select.Option value="非生产环境">非生产环境</Select.Option>
                </Select>
                        )}
              submitTrigger={['blur', 'change']}
            >
              <div style={{ maxWidth: 200, wordBreak: 'break-all', whiteSpace: 'pre-line' }}>
                {environment || '无'}
              </div>
            </TextEditToggle>
          </div>
        </div>
      );
    }
}

export default FieldEnvironment;
