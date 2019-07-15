import {Col, Label, Row, Table} from 'react-bootstrap';

const EntityTags = ({tags}) => (
  <Row>
    <Col xs={12}>
      <Table bordered>
        <tbody>
{tags &&
tags.map((tag, i) => (
  < tr
key = {i} >
  < td >
  < Label
bsStyle = "primary" >
  {tag.relationship}
/ {tag.tag.name ? tag.tag.name : tag.tag.code}
< /Label>
< /td>
< /tr>
))
}
        </tbody>
      </Table>
    </Col>
  </Row>
);

export default EntityTags;
