Stacker = typeof Stacker === "undefined" ? {} : Stacker;

function getSites(page, sites, callback){
  var req = new XMLHttpRequest();
  req.open("GET", "http://api.stackexchange.com/2.0/sites?pagesize=100&page=" + page, true);
  var response;

  req.onload = function(){
    response = JSON.parse(req.response);

    for(var item in response.items){
      var site = response.items[item];
      sites[site.name] = site;
    }

    if(response.has_more){
      getSites(page+1, sites, callback);
    }else{
      window.Stacker.sites = {};
      var keys = Object.keys(sites).sort();
      for(var i in keys){
        window.Stacker.sites[keys[i]] = sites[keys[i]];
      }
      //console.debug("all sites: ", JSON.stringify(window.Stacker.sites));
      if(callback)
        callback.call()
    }
  };
  req.send(null);
}

