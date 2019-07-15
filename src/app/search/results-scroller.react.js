import {connect} from 'react-redux';
import InfiniteScroll from 'redux-infinite-scroll';

import {Button} from 'react-bootstrap';
import SearchResult from './search-result.react';
import {fetchTypes, selectProvider, selectTypes} from '../config/actions';
import {runTermSearch} from './actions';

const ResultsScroller = ({entities, total, index, onSearch, setFilter, ...params}) => {
  const loadMore = () => {
    onSearch({index, ...params});
  };

  return (
    <InfiniteScroll
  loadMore = {loadMore}
  hasMore = {index < total
}
  elementIsScrollable = {false}
  className = "timeline"
    >
      <li className="time-label">
        <span className="bg-green">{total} Search Results</span>
      </li>
  {
    entities.map((searchResult, i) => (
      < SearchResult
    key = {i}
    entity = {searchResult}
    setFilter = {setFilter}
    />
  ))
  }
  {
    index < total && (
        <li className="text-center">
          <Button bsStyle="default" bsSize="small" onClick={loadMore}>
            <i className="fa fa-arrow-down text-muted" />
            LOAD MORE
          </Button>
        </li>
      )}
    </InfiniteScroll>
  );
};

const mapStateToProps = state => ({
  entities: state.reducer.search.entities,
  total: state.reducer.search.total,
  // search configs from the state:
  term: state.reducer.search.term,
  fortress: state.reducer.provider.fortress,
  types: state.reducer.provider.typesSelected,
  index: state.reducer.search.index,
  filter: state.reducer.search.filter
});

const mapDispatchToProps = dispatch => ({
  setFilter(fortress, docType) {
    dispatch(selectProvider(fortress));
    if (docType) {
      dispatch(selectTypes([{name: docType}]));
    } else {
      dispatch(fetchTypes(fortress));
    }
  },
  onSearch(params) {
    const {term, fortress, types, index, filter} = params;
    dispatch(
      runTermSearch({
        searchText: term || '*',
        fortress: fortress.length ? fortress[0].name : null,
        types: types.map(t => t.name),
        from: index,
        filter: Object.keys(filter).length ? filter : null
      })
    );
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResultsScroller);
