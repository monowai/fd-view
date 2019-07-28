import {Component} from 'react';
import JsonDiff from 'jsondiffpatch-for-react';
import {Checkbox, Form} from 'react-bootstrap';
import {isEqual} from 'lodash';

import CompareSelect from './compare-select.react';

import {getAngularService} from '../../services/angular-react-helper';

export default class JsonDiffForm extends Component {
  state = { showUnchanged: true };

  handleChange = e => {
    this.setState({ showUnchanged: e.target.checked });
  };

  render() {
    const store = getAngularService(document, '$ngRedux');
    const { delta, selected } = this.props;
    return (
      <Form inline>
        <CompareSelect store={store} />

        {delta && !isEqual(delta, selected) && (
          <div className="widget-body smart-form">
            <Checkbox checked={this.state.showUnchanged} onChange={this.handleChange}>
              {' '}
              Show unchanged values
            </Checkbox>
            <JsonDiff name="diff" left={selected} right={delta} show={this.state.showUnchanged} />
          </div>
        )}
      </Form>
    );
  }
}
