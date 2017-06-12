import React from 'react';
import {connect} from 'react-redux';

import {Row, Col, Button} from 'react-bootstrap';

import SearchResult from './search-result.react';

import {selectProvider, selectTypes, fetchTypes} from '../config/actions';

const FdSearchResults = ({entities, total, index, setFilter}) => {
  if (entities.length) {
    return (
      <Row id="results">
        <Col md={12}>
          <div className="box-body">
            <ul className="timeline" infinite-scroll="$ctrl.sr.nextPage()" infinite-scroll-distance="1">
              <li className="time-label">
                <span className="bg-green">{total} Search Results</span>
              </li>

              {entities.map((searchResult, i) => (<SearchResult key={i} entity={searchResult} setFilter={setFilter} />))}

              {(index < total &&
                  <li className="text-center">
                    <Button bsStyle="default" bsSize="small" href="$ctrl.sr.nextPage()">
                      <i className="fa fa-arrow-down text-muted" />
                      LOAD MORE
                    </Button>
                  </li>)}
            </ul>
          </div>
        </Col>
      </Row>
    );
  }
  return null;
};

const mapStateToProps = state => ({
  entities: state.reducer.search.entities,
  total: state.reducer.search.total,
  index: state.reducer.search.index
});

const mapDispatchToProps = dispatch => ({
  setFilter(fortress, docType) {
    dispatch(selectProvider(fortress));
    if (docType) {
      dispatch(selectTypes([{name: docType}]));
    } else {
      dispatch(fetchTypes(fortress));
    }
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(FdSearchResults);
