import React from 'react';
import moment from 'moment';
import {connect} from 'react-redux';

import {FormGroup, FormControl, ControlLabel} from 'react-bootstrap';

import {selectDelta} from './actions';

const CompareSelect = ({changes, selected, selectDelta}) => (
  <FormGroup>
    <ControlLabel style={{marginRight: 10}}>Compare with: </ControlLabel>
    <FormControl
      componentClass="select"
      className="input-sm"
      onChange={e => selectDelta(e.target.value)}
      defaultValue={selected}
      placeholder="Select Log Item"
    >
      {changes.map(logsResult => {
        return (
          <option key={logsResult.id} value={logsResult.id}>
            {logsResult.event.name} |&nbsp;
            {logsResult.madeBy} |&nbsp;
            {moment(logsResult.when).format('YYYY-MM-DD, hh:mm a')}
          </option>);
      })}
    </FormControl>
  </FormGroup>
);

const mapStateToProps = state => {
  const {changes, selected} = state.reducer.entity;

  return {changes, selected};
};

const mapDispatchToProps = dispatch => ({
  selectDelta(id) {
    dispatch(selectDelta(id));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(CompareSelect);
