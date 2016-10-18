angular
  .module('fd-view')
  .filter('cleanCode', () => {
    return code => {
      const keys = code.split('.');
      if (keys.length > 1) {
        return keys
          .filter(key => {
            return key !== 'tag' && key !== 'code';
          })
          .slice(-2)
          .reduce((acc, el) => `${acc}/${el}`);
      }
      return code;
    };
  });
