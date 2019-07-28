import _ from 'lodash';
import template from './edit-coldef.html';
import EditColdefCtrl from './edit-coldef.controller';

export default class EditColdefModal {
  /** @ngInject */
  constructor(ContentModel, DataSample, modalService) {
    this._cm = ContentModel;
    this._modal = modalService;
    this._sample = DataSample;
  }

  display(key, options = { openAsTag: false }) {
    const model = this._cm.getCurrent().content;
    let col = {};
    const dataType = col.dataType;

    if (options.openAsTag) {
      const t = this._cm.findTag(key);
      col[t.label] = t;
      col.options = options;
    } else {
      col = _.pick(model, key);
    }

    return this._modal
      .show({
        size: 'lg',
        backdrop: 'static',
        controller: EditColdefCtrl,
        controllerAs: '$ctrl',
        template,
        resolve: {
          coldef: () => col
        }
      })
      .then(res => {
        if (res.$id) {
          _.each(model, cd => {
            function checkAndUpdate(tag) {
              if (tag.$id === res.$id) {
                return _.extend(tag, res);
              }
              if (tag.targets) {
                _.each(tag.targets, t => {
                  checkAndUpdate(t);
                });
              }
            }

            if (cd.tag) {
              checkAndUpdate(cd);
            }
          });
        } else {
          model[key] = res;
        }

        if (dataType !== res.dataType) {
          this._sample.convertCol(key, res.dataType);
        }

        if (res.$alias) {
          const atag = this._cm.findTag(res.$alias.tag);
          const alias = _.omit(res.$alias, 'tag');
          atag.aliases = atag.aliases || [];
          if (!_.findWhere(atag.aliases, alias)) {
            atag.aliases.push(alias);
          }
        }
      });
  }
}
