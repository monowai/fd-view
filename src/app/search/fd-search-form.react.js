import React from 'react';
import {connect} from 'react-redux';

import {Row, Col} from 'react-bootstrap';

import SearchInput from '../components/search-input.react';
import FortressInput from '../components/fortress-input.react';
import TypesInput from "../components/types-input.react";

import {setTerm, runTermSearch} from './actions';

import {getAngularService} from '../services/angular-react-helper';

const FdSearchForm = props => {
  const store = getAngularService(document, '$ngRedux');
  const handleSubmit = e => {
    e.preventDefault();
    props.onSearch(e.target.term.value);
  };

  return (
    <form id="search-form" className="panel" onSubmit={handleSubmit}>
      <SearchInput term={props.term} />
      <Row>
        <Col md={6}>
          <FortressInput store={store} />
        </Col>
        <Col md={6}>
          <TypesInput store={store} />
        </Col>
      </Row>
    </form>
  );
};

const mapStateToProps = state => ({
  term: state.reducer.search.term,
  fortress: state.reducer.provider.fortress,
  types: state.reducer.provider.typesSelected,
  from: state.reducer.search.index,
  filter: state.reducer.search.filter
});

const mergeProps = (stateProps, dispatchProps) => {
  const {fortress, types, from, filter} = stateProps;
  const {dispatch} = dispatchProps;

  return {
    onSearch(term) {
      dispatch(setTerm(term));
      dispatch(runTermSearch({
        searchText: term || '*',
        fortress: fortress.length ? fortress[0].name : null,
        types: types.map(t => t.name),
        from,
        filter: Object.keys(filter).length ? filter : null
      }));
    }
  };
};

export default connect(mapStateToProps, null, mergeProps)(FdSearchForm);
