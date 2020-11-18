import React, { Component } from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { DateTimePicker, Select, Tooltip } from 'choerodon-ui/pro';
import TextEditToggle from '@/components/TextEditTogglePro';
import { toJS } from 'mobx';
import { featureApi, issueApi } from '@/api';
import SelectProgramVersion from '@/components/select/select-program-version';

class FieldProgramVersion extends Component {
  renderItem(name, symbol = ',') {
    if (name && [...name].length > 20) {
      return (
        <Tooltip title={name}>
          <span>
            {name.substring(0, 20)}
            ...
          </span>
          {symbol}
        </Tooltip>
      );
    }
    return (
      <span>
        {name}
        {symbol}
      </span>
    );
  }

  updateIssueField =async (value) => {
    const {
      store, onUpdate, reloadIssue, field,
    } = this.props;
    const issue = store.getIssue;
    const { issueId, objectVersionNumber } = issue;
    await featureApi.updateVersions(issueId, value);
    if (onUpdate) {
      onUpdate();
    }
    await reloadIssue(issueId);
  };

  render() {
    const { store, disabled } = this.props;
    const issue = store.getIssue;
    const { programVersionFeatureRelVOS, activePiTeams } = issue;
    const field = store.getFieldByCode('estimatedEndTime');
    const required = field?.required;
    const teamProjectIds = activePiTeams && activePiTeams.length > 0 ? activePiTeams.map((item) => item.id) : undefined;
    return (
      <div className="line-start mt-10">
        <div className="c7n-property-wrapper">
          <span className="c7n-property">
            版本
          </span>
        </div>
        <div className="c7n-value-wrapper" style={{ width: 'auto' }}>
          <TextEditToggle
            initValue={programVersionFeatureRelVOS && programVersionFeatureRelVOS.length > 0 ? programVersionFeatureRelVOS.map((item) => String(item.programVersionId)) : undefined}
            onSubmit={this.updateIssueField}
            alwaysRender={false}
            editor={() => (
              <SelectProgramVersion
                multiple
                required={required}
                teamProjectIds={teamProjectIds}
              />
            )}
            submitTrigger={['blur']}
            disabled={disabled}
          >

            <p className="primary" style={{ wordBreak: 'break-word' }}>
              {programVersionFeatureRelVOS && programVersionFeatureRelVOS.length > 0
                ? programVersionFeatureRelVOS.map((item, index, arr) => this.renderItem(item.name, index === arr.length - 1 ? '' : undefined)) : '无'}

            </p>

          </TextEditToggle>
        </div>
      </div>
    );
  }
}

export default observer(FieldProgramVersion);