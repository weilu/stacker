// window.Stacker = window.Stacker ? window.Stacker : {};

function getSites(page, sites){
	var req = new XMLHttpRequest();
	req.open("GET", "http://api.stackexchange.com/2.0/sites?pagesize=100&page=" + page, true);
	var response;

	req.onload = function(){
		response = JSON.parse(req.response);

		var newSites = _.pluck(response.items, "api_site_parameter");
		sites = sites.concat(newSites);

		// console.debug("2 sites", sites);

		if(response.has_more){
			getSites(page+1, sites);
		}else{
			window.Stacker.sites = sites;
			// console.debug("all sites: ", window.Stacker.sites);
		}
	};
req.send(null);
}

// getSites(1, []);
