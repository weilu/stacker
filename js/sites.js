// window.Stacker = window.Stacker ? window.Stacker : {};

function getSites(page, sites){
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
			getSites(page+1, sites);
		}else{
			window.Stacker.sites = sites;
//			console.debug("all sites: ", JSON.stringify(window.Stacker.sites));
		}
	};
req.send(null);
}

// getSites(1, {});
