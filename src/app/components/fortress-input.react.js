import {connect} from 'react-redux';
import {fetchProviders, fetchTypes, selectProvider} from '../config/actions';

import {Typeahead} from 'react-bootstrap-typeahead';

const FortressInput = props => {
  if (!props.providers.length) {
    props.loadProviders();
  }

  return (
    <div className="form-group">
      <label>Data Provider</label>
      <Typeahead
        options={props.providers}
        labelKey="name"
        placeholder="Optional System"
        onChange={props.onChange}
        selected={props.fortress}
      />
    </div>
  );
};

// FortressInput.PropTypes = {
//   providers: PropTypes.array,
//   fortress: PropTypes.object
// };

const mapStateToProps = state => ({
  providers: state.reducer.provider.fortresses,
  fortress: state.reducer.provider.fortress
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onChange(fortress) {
    if (fortress.length) {
      dispatch(selectProvider(fortress));
      dispatch(fetchTypes(fortress[0]));
    }
  },
  loadProviders() {
    dispatch(fetchProviders());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FortressInput);
