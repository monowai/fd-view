import React from 'react';

const SearchInput = () => {
  return (
    <div className="input-group">
      <input type="search" name="term" className="form-control"
             placeholder="Text to search for ..."
             size="100" autoComplete="on"
             autoFocus />
      <div className="input-group-btn">
        <button type="submit" className="btn btn-primary">
          <i className="fa fa-search" /> View
        </button>
      </div>
    </div>
  );
};

export default SearchInput;
