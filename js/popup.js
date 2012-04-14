$(function(){

  Stacker = {};

  Stacker.Utils = {
    getSite: function(siteName){
      return Stacker.sites[siteName];
    },

    getUser: function(siteName, userId){
      var accountId = Stacker.sitesToUsers[siteName][userId];
      return Stacker.following[accountId];
    }
  };

  Stacker.AppView = Backbone.View.extend({

    el: $('#stacker'),

    initialize: function(options){
      this.feeds = options.feeds;
    },

    render: function(){
      // console.debug("start rendering")
      var view = this;
      // console.debug( view.feeds.size() );
      view.feeds.each(function(feed){
        view.renderFeed(feed);
      });
      // console.debug("done rendering")
      return this;
    },

    renderFeed: function(feed){
      var feedView = new Stacker.FeedView({model: feed});
      this.$('ul').append(feedView.render().el);
    }
  });

  Stacker.FeedView = Backbone.View.extend({
    tagName: 'li',
    render: function(){
      // console.debug("model", this.model);
      this.date = new Date(1000 * this.model.get('creation_date'));
      this.timelineType = this.model.get('timeline_type');
      this.postType = this.model.get('post_type');
      this.site = Stacker.Utils.getSite(this.model.get('site_name'));
      this.user = Stacker.Utils.getUser(this.site.name, this.model.get('user_id'));

      this.$el.append("<img class='profile' src='" + this.user.image + 
                      "'/><span class='name left'>" + this.user.name + " </span><span class='type left'>" + this.timelineType + " " + this.postType +
                      "</span><span class='right'>" + this.date + "</span><br>" + 
                      "<p>" + this.model.get('title') + "</p>"); //TODO
      return this;
    }
  });

  Stacker.Feed = Backbone.Model.extend({});

  Stacker.BaseFeeds = Backbone.Collection.extend({
    model: Stacker.Feed,
    comparator: function(feed){
      return -feed.get("creation_date");
    }
  });

  Stacker.Feeds = Stacker.BaseFeeds.extend({
    initialize: function(options){
      this.site = options.site;
      this.userIds = Object.keys(options.users);
    },

    url: function(){
      return "https://api.stackexchange.com/2.0/users/"
              + encodeURIComponent(this.userIds.join(";"))
              + "/timeline?site=" 
              + Stacker.Utils.getSite(site).api_site_parameter;
    },

    parse: function(response){
      for(var i in response.items){
        response.items[i]["site_name"] = this.site;
      }
      return response.items;
    }
  });

  window.feeds = new Stacker.BaseFeeds();
  var stackerStorage = localStorage['stacker'];
  var stackerSitesStorage = localStorage['stacker_sites'];
  if(!stackerStorage || !stackerSitesStorage){
    $('body').append("<p>There's nothing here because you are not following anyone yet! <a href='./options.html'>Start stalking</a></p>");
    return;
  }

  Stacker.sites = JSON.parse(stackerSitesStorage);
  Stacker.following = JSON.parse(stackerStorage).following;

  Stacker.sitesToUsers = JSON.parse(stackerStorage).sitesToUsers;

  if(!Stacker.sitesToUsers || !Stacker.sites || !Stacker.following){
    return; //shouldn't be here but better safe than sorry
  }

  var totalDone = 0;
  for(var site in Stacker.sitesToUsers){
    var feeds = new Stacker.Feeds({site: site, users: Stacker.sitesToUsers[site]});
    feeds.fetch({
      success: sortAndDisplay
    });
  }

  function sortAndDisplay(collection, response){
    // console.debug("feeds for site and users ", collection.site, collection.userIds);
    window.feeds.add(collection.models, {silent: true});
    totalDone++;

    if(totalDone == Object.keys(Stacker.sitesToUsers).length){
      window.view = new Stacker.AppView({ feeds: window.feeds }).render();
    }
  }

});