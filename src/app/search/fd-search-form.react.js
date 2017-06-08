import React from 'react';
import {connect} from 'react-redux';

import SearchInput from '../components/search-input.react';
import FortressInput from '../components/fortress-input.react';
import TypesInput from "../components/types-input.react";

import {setTerm, searchTerm} from './actions';

import {getAngularService} from '../services/angular-react-helper';

const FdSearchForm = props => {
  const store = getAngularService(document, '$ngRedux');
  const handleSubmit = e => {
    e.preventDefault();
    props.onSearch(e.target.term.value);
  };

  return (
    <form id="search-form" className="panel" onSubmit={handleSubmit}>
      <SearchInput />
      <div className="row">
        <div className="col-md-6">
          <FortressInput store={store} />
        </div>
        <div className="col-md-6">
          <TypesInput store={store} />
        </div>
      </div>
    </form>
  );
};

const mapStateToProps = state => ({
  term: state.reducer.search.term
});

const mapDispatchToProps = dispatch => ({
  onSearch(term) {
    dispatch(setTerm(term));
    dispatch(searchTerm());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(FdSearchForm);
