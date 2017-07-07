import React from 'react';
import PropTypes from 'prop-types';

import {Col, Tabs, Tab} from 'react-bootstrap';
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/theme/github';

import JsonEditor from '../../components/jsoneditor.react';
import JsonDiff from './jsondiff.react';

import EntityTags from './entity-tags.react';

const EntityInfo = props => {
  const {details, delta, tags, type} = props;
  let src;
  if (details.src) {
    src = details.src.join('\n');
    require(`brace/mode/${type}`);
    // this.codeOptions = {mode: this.metaHeader.type};
  }

  return (
    <Col xs={12} sm={12} md={8} lg={8}>
      <Tabs defaultActiveKey={src ? "code" : "tags"} className="nav-tabs-custom" id="entity-info">
        {src ?
          <Tab eventKey="code" title={<span><i className="fa fa-file-text"/> Source</span>}>
            <AceEditor
              readOnly={true}
              value={src}
              mode={type}
              width="100%"
              theme="github"
              editorProps={{$blockScrolling: true}}
            />
          </Tab> :
          <Tab eventKey="details" title={<span><i className="fa fa-clock-o"/> Details</span>}>
             <JsonEditor
               json={details}
               mode="tree"
               onEditable={() => false}
             />
          </Tab>
        }
        <Tab eventKey="tags" title={<span><i className="fa fa-tags"/> Tags</span>}>
          <EntityTags tags={tags}/>
        </Tab>
        <Tab eventKey="delta" title={<span><i className="fa fa-arrow-right"/> Delta</span>}>
          <JsonDiff selected={details} delta={delta}/>
        </Tab>
      </Tabs>
    </Col>
  );
};

EntityInfo.PropTypes = {
  details: PropTypes.object,
  delta: PropTypes.object,
  tags: PropTypes.array,
  type: PropTypes.string
};

export default EntityInfo;
