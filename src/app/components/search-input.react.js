import React from 'react';

import {InputGroup, FormControl, Button} from 'react-bootstrap';

const SearchInput = () => {
  return (
    <InputGroup>
      <FormControl
        type="search"
        name="term"
        placeholder="Text to search for ..."
        size="100"
        autoComplete="on"
        autoFocus />
      <InputGroup.Button>
        <Button type="submit" bsStyle="primary">
          <i className="fa fa-search" />
          View
        </Button>
      </InputGroup.Button>
    </InputGroup>
  );
};

export default SearchInput;
