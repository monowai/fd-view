import React from 'react';
import {connect} from 'react-redux';
import {selectTypes} from '../config/actions';
import {Typeahead} from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Token.css';

const TypesInput = props => {
  return (
    <div className="form-group">
      <label>Types</label>
      <Typeahead
        options={props.types}
        labelKey="name"
        multiple
        placeholder="Types"
        onChange={props.onChange}
        selected={props.selected}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  types: state.reducer.provider.types,
  selected: state.reducer.provider.typesSelected
});

const mapDispatchToProps = dispatch => ({
  onChange(types) {
    dispatch(selectTypes(types));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TypesInput);
