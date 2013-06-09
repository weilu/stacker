Stacker = typeof Stacker === "undefined" ? {} : Stacker;

Stacker.OptView = Backbone.View.extend({
  el: 'body',

  events: {
    'click button': 'follow',
    'click .unfollow': 'unfollow'
  },

  initialize: function(){
    this.ul = $('ul#following');

    this.following = {};
    this.sitesToUsers = {};

    var stackerStorage = localStorage["stacker"];
    if(!stackerStorage){
      return;
    }

    var stackerOpts = JSON.parse(stackerStorage)
    if(stackerOpts.following){
      this.following = stackerOpts.following;
    }
    if(stackerOpts.sitesToUsers){
      this.sitesToUsers = stackerOpts.sitesToUsers;
    }
  },

  render: function(){
    this.populateSeleteSites();
    this.displayFollowing();

    return this;
  },

  populateSeleteSites: function(){
    var select = $('select#site');
    select.empty();
    for(var siteName in Stacker.sites){
      select.append("<option value='" + siteName + "'>" + siteName + "</optoins>");
    }
  },

  displayFollowing: function(){
    this.ul.empty();

    for(var userId in this.following){
      this.renderUser(userId);
      this._addSitesToUser(userId);
    }
  },

  renderUser: function(userId){
    var user = this.following[userId];
    this.ul.append("<li data-id='" + userId + "'><img class='profile' src='" + user.image + "'/><span>" + user.name + "</span><a href='#' class='right unfollow'>&nbsp&nbspx&nbsp&nbsp</a><br></li>");
  },

  unfollow: function(e){
    var userEl = $(e.target).closest('li').remove();
    var accountId = userEl.data('id');

    for(var accountIndex in this.following[accountId].accounts){
      var account = this.following[accountId].accounts[accountIndex];
      delete this.sitesToUsers[account.site_name][account.user_id];

      if(Object.keys(this.sitesToUsers[account.site_name]).length == 0){
        delete this.sitesToUsers[account.site_name];
      }
    }
    delete this.following[accountId];

    this._save();
    return false;
  },

  follow: function(){
    var site = $('#site').val();
    var userId = $('#user_id').val();

    if(!site || !userId){
      return;
    }

    this._getUser(site, userId);

    return false;
  },

  _getUser: function(site, userId){
    var url = "http://api.stackexchange.com/2.0/users/" + userId + "?site=" + Stacker.sites[site].api_site_parameter;
    var req = new XMLHttpRequest();
    req.open("GET", url, true);

    view = this;
    req.onload = function(){
      var items = JSON.parse(req.response).items;
      if(items && items.length==1){
        view._addUser(items[0]);
      }
    }
    req.send(null);
  },

  _addUser: function(user){
    if(this.following[user.account_id]){
      return; //already following
    }

    this.following[user.account_id] = {name: user.display_name, image: user.profile_image};
    this.renderUser(user.account_id);

    this._updateLocalStorage(user);
  },

  _updateLocalStorage: function(user){
    var accountId = user.account_id;
    var url = "http://api.stackexchange.com/2.0/users/" + accountId + "/associated";
    var req = new XMLHttpRequest();
    req.open("GET", url, true);

    view = this;
    req.onload = function(){
      var items = JSON.parse(req.response).items;
      var accounts = [];
      for(var index in items){
        var account = items[index];
        accounts.push(account);

        var site = account.site_name;
        if(Stacker.sites[site] === undefined)
          continue //TODO: fix this: sites hashed by site name is not reliable. Consider site_url

        if(!view.sitesToUsers[site]){
          view.sitesToUsers[site] = {};
        }

        view.sitesToUsers[site][account.user_id] = accountId;
      }
      view.following[accountId].accounts = accounts;
      view._addSitesToUser(accountId);

      view._save();
    };
    req.send(null);
  },

  _addSitesToUser: function(accountId){
    for(var accountIndex in this.following[accountId].accounts){
      var account = this.following[accountId].accounts[accountIndex];
      var site = Stacker.sites[account.site_name];
      if(site == undefined)
        continue //TODO: fix this: sites hashed by site name is not reliable. Consider site_url
      var siteIcon = "<img src='" + site.favicon_url + "' title='" + site.name + "' />";
      $("li[data-id='" + accountId + "']").append(siteIcon)
    }
  },

  _save: function(){
    localStorage["stacker"] = JSON.stringify({following: this.following, sitesToUsers: this.sitesToUsers});
  }
});

$(function(){
  //attempt to load from localStorage first
  var stackerSitesStorage = localStorage["stacker_sites"];
  if(stackerSitesStorage){
    Stacker.sites = JSON.parse(localStorage["stacker_sites"])
  }

  if(Stacker.sites === undefined){
    getSites(1, {}, function(){
      //save all stackexchange sites to localStorage if not found
      localStorage["stacker_sites"] = JSON.stringify(Stacker.sites);

      window.view = (new Stacker.OptView()).render();
    })
  }
  else {
    window.view = (new Stacker.OptView()).render();
  }
});
