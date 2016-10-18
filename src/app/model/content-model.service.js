class ContentModelService {
  /** @ngInject */
  constructor($http, $q, configuration) {
    this._cp = {};            // actual content model
    this._cpGraph = {};       // latest graph visualization of the content model
    this._cpFortress = {};
    this._cpType = {};        // fortress and doctype of the current content model
    this._code = {};          // code for tag only model
    this._tags = [];          // list of tags

    // services
    this._http = $http;
    this._q = $q;
    this._cfg = configuration;
  }

  getAll() {
    return this._http.get(`${this._cfg.engineUrl()}/api/v1/model/`);
  }

  getTags() {
    return this._tags;
  }

  findTag(id) {
    function findInList(list) {
      let tag = {};
      _.forEach(list, item => {
        if (item.$id === id) {
          tag = item;
          return false;
        }
        tag = findInList(item.targets);
        if (!_.isEmpty(tag)) {
          return false;
        }
      });
      return tag;
    }
    return findInList(this._cp.content);
  }

  addCol(col) {
    const column = {};
    column[col.name] = {dataType: col.dataType, persistent: true, value: col.value};
    _.extend(this._cp.content, column);
  }

  addEntitylink(col, el) {
    const cd = this._cp.content[col];
    if (_.has(cd, 'entityLinks')) {
      cd.entityLinks.push(el);
    } else {
      cd.entityLinks = [el];
    }
  }

  addTag(tag) {
    tag.$id = tag.$id || _.uniqueId('tag_');
    this._tags.push({label: tag.label || tag.code, id: tag.$id});
    return tag.$id;
  }

  addAlias(tag, alias) {
    const t = this.findTag(tag.id);
    t.aliases = t.aliases || [];
    t.aliases.push(alias);
  }

  getCurrent() {
    return this._cp;
  }

  getModel(modelKey) {
    if (modelKey) {
      return this._http.get(`${this._cfg.engineUrl()}/api/v1/model/${modelKey}`)
        .success(data => {
          this._cp = data.contentModel;
          if (!this._cp.tagModel) {
            this._cpFortress = this._cp.fortress.name;
            this._cpType = this._cp.documentType.name;
          }
          this._tags = [];
        });
    }
    const deferred = this._q.defer();
    deferred.resolve(this._cp);
    return deferred.promise;
  }

  downloadModel(keys) {
    return this._http.post(`${this._cfg.engineUrl()}/api/v1/model/download`, keys);
  }

  deleteModel(key) {
    return this._http.delete(`${this._cfg.engineUrl()}/api/v1/model/${key}`);
  }

  getDefault(data) {
    const payload = angular.extend({contentModel: this._cp}, data);

    return this._http.post(`${this._cfg.engineUrl()}/api/v1/model/default`, payload)
      .success(res => {
        this._cp.content = res.content;
      });
  }

  validate(data) {
    const payload = {contentModel: this._cp, rows: data};

    return this._http.post(`${this._cfg.engineUrl()}/api/v1/model/validate`, payload)
      .success(res => res);
  }

  graphModel() {
    if (!_.isEmpty(this._cp)) {
      const graph = {nodes: [], edges: []};

      const createEntity = (name, data) => {
        const entity = {id: name, name, type: 'entity'};
        _.extend(entity, data);
        return entity;
      };

      const isTagModel = model => model.tagModel;

      const isTag = o => Boolean(o.tag) === true;

      const createTag = (id, data) => {
        const tag = {id, name: id, type: 'tag'};
        _.extend(tag, data);
        return tag;
      };

      const connect = (source, target, rel, reverse, type) => {
        let edge = {};
        if (reverse) {
          edge = {source: target, target: source, relationship: rel, type};
        } else {
          edge = {source, target, relationship: rel, type};
        }
        if (!containsEdge(edge)) {
          graph.edges.push({data: edge});
        }
      };

      const hasTargets = obj => obj.targets && obj.targets.length;

      const hasEntityLinks = obj => obj.entityLinks && obj.entityLinks.length;

      const hasAliases = obj => obj.aliases && obj.aliases.length;

      const containsEdge = edge => { // to check if edge is already in the graph
        return _.findIndex(graph.edges, o => _.isMatch(o.data, edge)) >= 0;
      };

      const containsTag = tag => {
        const t = graph.nodes[_.findIndex(graph.nodes, o => {
          return _.isMatch(o.data, {type: 'tag', label: tag.label, code: tag.code});
        })];
        if (!t) {
          return false;
        }
        return t.data;
      };

      const createTargets = tag => {
        _.each(tag.targets, target => {
          const tgData = {label: target.label, code: target.code};
          let t = containsTag(tgData);
          if (t) {
            target.$id = t.id;
          } else {
            t = createTag(target.$id || this.addTag(target), tgData);
            graph.nodes.push({data: t});
          }
          connect(tag.$id, t.id, target.relationship, target.reverse);
          if (hasTargets(target)) {
            createTargets(target);
          }
        });
      };

      let root = {};

      if (!isTagModel(this._cp)) {
        const entityName = this._cp.documentType ? this._cp.documentType.name : 'Name Missing!';
        root = createEntity(this._cp.documentName || entityName);
        graph.nodes.push({data: root});
      }

      _.each(this._cp.content, (obj, key) => {
        if (isTag(obj)) {
          const label = (obj.label || key);
          let tag = containsTag(obj);
          if (tag) {
            obj.$id = tag.id;
          } else {
            obj.code = obj.code || key;
            tag = createTag(obj.$id || this.addTag(obj), {label, code: obj.code});
            graph.nodes.push({data: tag});
          }
          if (!_.isEmpty(root)) {
            if (obj.entityTagLinks) {
              _.each(obj.entityTagLinks, link => {
                connect(root.id, tag.id, link.relationshipName, link.reverse, link.geo ? 'geo' : undefined);
              });
            }
          }

          if (hasTargets(obj)) {
            createTargets(obj);
          }

          if (hasAliases(obj)) {
            _.each(obj.aliases, alias => {
              const a = {
                id: alias.code,
                code: alias.code,
                description: alias.description,
                type: 'alias'
              };
              graph.nodes.push({data: a});
              connect(tag.id, a.id);
            });
          }
        }
        if (hasEntityLinks(obj)) {
          _.each(obj.entityLinks, entity => {
            const e = createEntity(entity.documentName);
            graph.nodes.push({data: e});
            connect(root.id, e.id, entity.relationshipName, obj.reverse);
          });
        }
      });
      this._cpGraph = graph;
      // console.log(graph);
      return graph;
    }
  }

  uploadModel(models) {
    return this._http.post(`${this._cfg.engineUrl()}/api/v1/model/`, models);
  }

  updateModel(profile) {
    this._cp = profile;
    if (this._cp.code) {
      this._code = this._cp.code;
    }
    this._cpType = this._cp.documentType ? this._cp.documentType.name : this._cpType;
    this._cpFortress = this._cp.fortress ? this._cp.fortress.name : this._cpFortress;
  }

  saveModel() {
    let url;
    if (this._cp.tagModel) {
      url = `tag/${this._code}`;
    } else {
      const fcode = this._cpFortress.toLowerCase().replace(/\s/g, '');
      url = fcode + (this._cpType ? `/${this._cpType}` : '');
    }

    return this._http.post(`${this._cfg.engineUrl()}/api/v1/model/${url}`, this._cp);
  }
}

angular
  .module('fd-view')
  .service('ContentModel', ContentModelService);
