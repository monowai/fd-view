import React from 'react';
import {connect} from 'react-redux';

import {Row, Col} from 'react-bootstrap';
import ResultsScroller from './results-scroller.react';
import {getAngularService} from '../services/angular-react-helper';

const FdSearchResults = ({total}) => {
  if (total > 0) {
    const store = getAngularService(document, '$ngRedux');
    return (
      <Row id="results">
        <Col md={12}>
          <div className="box-body">
            <ResultsScroller store={store}/>
          </div>
        </Col>
      </Row>
    );
  }
  return null;
};

const mapStateToProps = state => ({
  total: state.reducer.search.total
});

export default connect(mapStateToProps)(FdSearchResults);
