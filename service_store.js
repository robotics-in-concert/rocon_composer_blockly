var  R = require('ramda'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  glob = Promise.promisify(require('glob')),
  fs = Promise.promisifyAll(require('fs')),
  xml2js = Promise.promisifyAll(require('xml2js')),
  libxml = require('libxmljs'),
  exec = Promise.promisify(require('child_process').exec),
  Path = require('path'),
  yaml = require('js-yaml'),
  mkdirp = require('mkdirp');
  // ServiceStore = require('./service_store');
  

var ServiceStore = function(options){
  // options
  // - ros_root
  this.options = options;

};


var _to_colon_sep = function(obj){
  return R.compose(
    R.join("\n"),
    R.map(R.join(": ")),
    R.toPairs
  )(obj);
};


ServiceStore.prototype.allPackageInfos = function(){
  return exec("rospack list").spread(function(stdout, stderr){
    var lines = R.reject(R.isEmpty, stdout.split(/\n/));
    var packs = R.map(function(l){ return l.split(/\s/)[1] + "/package.xml"; })(lines);
    logger.log(packs);


    return Promise.resolve(packs)
      .map(function(xmlpath){
        return fs.readFileAsync(xmlpath).then(function(xml){
          return xml2js.parseStringAsync(xml, {explicitArray: false});
        })
        .then(function(item){
          item = item.package;
          item.path = xmlpath;
          return item;

        });

      })


  });


};


ServiceStore.prototype.orderedWorkflows = function(workflow_titles){

  console.log(workflow_titles);


  var that = this;

  var workflows = _(this.options.workflow_items)
    .filter(function(item){ return _.contains(workflow_titles, item.title); })
    .sortBy(function(item){
      return that._getWorkflowOrder(item);
    })
    .value();

  return workflows;
  
  // console.log(this.options.workflow_items);
  // console.log(workflow_titles);



};


ServiceStore.prototype._getWorkflowOrder = function(workflow){
  var r = null;
  xml2js.parseString(workflow.xml, {async: false}, function(err, result){
    r = result;

    var top_block_types = _(r.xml.block)
      .map(function(b){ return b.$.type; })
      .uniq()
      .value();


    if(_.contains(top_block_types, 'engine_global_set')){
      r = 1;
    }else{
      var other = _(top_block_types).without('procedures_defnoreturn', 'procedures_defreturn').value();
      if(other.length == 0){
        r = 2;
      }else{
        r = 3;
      }
    }
    

    logger.debug(top_block_types, r);


  });
  return r;

};


ServiceStore.prototype.exportToROS = function(package_name, service_meta, package_name){
  var that = this;
  return this.allPackageInfos().then(function(packages){ 
    logger.debug(service_meta);
    logger.debug(package_name);
    var pack =  R.find(R.propEq('name', package_name))(packages);




    var name_key = service_meta.name.replace(/\s+/g, "_").toLowerCase();
    var service_base = Path.join( Path.dirname(pack.path), "services", name_key);


    var xml = fs.readFileSync(pack.path)
    var xmlDoc = libxml.parseXmlString(xml);

    var package = xmlDoc.get('/package');

    var node = package.get('//export');
    if(!node){
      node = package.node('export');
    }

    node.node('concert_service', Path.join('services', name_key, name_key+'.service'));

    var resultXml = xmlDoc.toString(true);

    fs.writeFileSync(pack.path, resultXml);




    logger.debug(service_base);


    mkdirp.sync(service_base);

    logger.debug(name_key);


    // .parameters
    //
    //
    
    var params = _(service_meta.parameters)
      .map(function(param){ return _.values(_.pick(param, ['key', 'value'])); })
      .object()
      .value();

    var param_file_content = _to_colon_sep(params);
    R.forEach(function(i){
      i.parameters = R.fromPairs(R.map(R.values)(i.parameters));
    })(service_meta.interactions);


    logger.debug('.interactions', yaml.dump(service_meta.interactions));

    logger.debug('.parameters', param_file_content);

    logger.debug('.launcher', service_meta.launcher.launcher_body);

    // .service
    var service_kv = _.pick(service_meta, "name description author priority interactions parameters".split(/\s+/))
    service_kv.launcher_type = service_meta.launcher.launcher_type
    service_kv.launcher = name_key + ".launcher";
    // service_kv.icon = name_key + ".icon";
    service_kv.interactions = name_key + ".interactions";
    service_kv.parameters = name_key + ".parameters";
    var service_file_content = _to_colon_sep(service_kv);

    logger.debug('.service', service_file_content);

    // save icon

    // workflows
    
    var promises = []

    if(!_.isEmpty(service_meta.workflows)){
      var workflow_base = Path.join( Path.dirname(pack.path), "workflows" );
      mkdirp.sync(workflow_base);
      var list = that.orderedWorkflows(service_meta.workflows);


      _.each(list, function(item){
        var workflow_path = Path.join(workflow_base, item.title + ".wf");
        promises.push(fs.writeFileAsync(workflow_path, JSON.stringify(item)));
      });

      list = _(list)
        .map(function(item, idx){
          return {workflow: name_key + "/" + item.title + ".wf",
            order: idx + 1}
        })
        .value()
      var workflows_content = yaml.dump({workflows: list});
      logger.debug('.workflows', workflows_content);
      promises.push(fs.writeFileAsync(service_base + "/" + name_key + ".workflows", workflows_content));




    }


    return Promise.all(
      promises.concat([
        fs.writeFileAsync(service_base + "/" + name_key + ".parameters", param_file_content),
        fs.writeFileAsync(service_base + "/" + name_key + ".launcher", service_meta.launcher.launcher_body),
        fs.writeFileAsync(service_base + "/" + name_key + ".service", service_file_content),
        fs.writeFileAsync(service_base + "/" + name_key + ".interactions", yaml.dump(service_meta.interactions))
      ])
    );


  });




};


module.exports = ServiceStore;
