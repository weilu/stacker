$(function(){

  Stacker = {};

  Stacker.AppView = Backbone.View.extend({

    el: $('#stacker'),

    initialize: function(options){
      this.feeds = options.feeds;
    },

    render: function(){
      console.debug("start rendering")
      var view = this;
      console.debug( view.feeds.size() );
      view.feeds.each(function(feed){
        view.renderFeed(feed);
      });
      console.debug("done rendering")
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
      console.debug("model", this.model);
      this.$el.html("*" + this.model.get('timeline_type') + "*"
                  + this.model.get('title') + "[" + this.model.get('post_type')
                  + "] by - " + this.model.get('user_id')); //TODO
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
      this.userIds = options.userIds;
    },

    url: function(){
      return "https://api.stackexchange.com/2.0/users/"
              + encodeURIComponent(this.userIds.join(";"))
              + "/timeline?site=" 
              + this.site;
    },

    parse: function(response){
      // console.debug("response.items", response.items);
      return response.items;
    }
  });

  window.feeds = new Stacker.BaseFeeds();
  var stackerStorage = localStorage['stacker'];
  if(!stackerStorage){
    return;
  }

  var sitesToUsers = JSON.parse(stackerStorage).sitesToUsers;
  if(!sitesToUsers){
    return;
  }

  var totalDone = 0;
  for(var site in sitesToUsers){
    var feeds = new Stacker.Feeds({site: site, userIds: sitesToUsers[site]});
    feeds.fetch({
      success: sortAndDisplay
    });
  }

  function sortAndDisplay(collection, response){
    console.debug("feeds for site and users ", collection.site, collection.userIds);
    window.feeds.add(collection.models, {silent: true});
    totalDone++;

    if(totalDone == Object.keys(sitesToUsers).length){
      window.view = new Stacker.AppView({ feeds: window.feeds }).render();
    }
  }

});