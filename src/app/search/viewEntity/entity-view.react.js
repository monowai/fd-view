import {connect} from 'react-redux';

import {fetchEntity, selectLog} from './actions';

import {Row} from 'react-bootstrap';
import EntityInfo from './entity-info.react';
import EntityLog from './entity-log.react';

const EntityView = ({selected, changes, ...props}) => (
  <Row>
  < EntityLog
changes = {changes}
logSelected = {selected}
onClick = {props.selectLog}
/>
< EntityInfo
{...
  props
}
/>
  </Row>
);

const mapStateToProps = state => {
  const {details, delta, changes, tags, type, selected} = state.reducer.entity;

  return {
    details,
    delta,
    changes,
    tags,
    type,
    selected
  };
};

const mapDispatchToProps = dispatch => ({
  loadEntity(key) {
    dispatch(fetchEntity(key));
  },
  selectLog(id) {
    dispatch(selectLog(id));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EntityView);
