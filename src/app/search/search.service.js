/** @ngInject */
function SearchService(EntityService) {
  function Search(searchText, fortress, typesToBeSend, termFilter) {
    this.entities = [];
    this.busy = false;
    this.index = 0;
    // this.total=0;
    this.searchText = searchText;
    this.fortress = fortress;
    this.typesToBeSend = typesToBeSend;
    const query = { match: {} };
    if (termFilter) {
      query.match[termFilter.name] = {
        query: termFilter.value,
        type: 'phrase'
      };

      this.termFilter = { bool: { must: [{ query }] } };
    }
  }

  Search.prototype.nextPage = async function() {
    if (this.busy || this.index === this.total) {
      return;
    }
    this.busy = true;
    const data = await EntityService.search(
      this.searchText,
      this.fortress,
      this.typesToBeSend,
      this.index,
      this.termFilter
    );
    _.forEach(data.results, d => {
      d.resources = [];
      let uniqueList = [];
      _.find(d.fragments, (ele, k) => {
        const uniqueEle = _.difference(_.uniq(ele), uniqueList);
        if (uniqueEle.length > 0) {
          d.resources.push({ key: k, value: uniqueEle });
          uniqueList = _.union(uniqueEle, uniqueList);
        }
      });
    });

    this.entities = this.entities.concat(data.results);
    this.index += data.results.length;
    this.total = data.total;
    this.busy = false;
  };

  return Search;
}

export default SearchService;
