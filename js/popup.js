$(function(){
  Stacker = {};

  Stacker.AppView = Backbone.View.extend({
    el: $('#stacker'),
    initialize: function(){
      this.feeds = new Stacker.Feeds({site: "stackoverflow", userIds: [429288,859536]});
      this.feeds.fetch();
      console.debug("done fetching")
    },

    render: function(){
      console.debug("start rendering")
      var view = this;
      view.feeds.each(function(feed){
        view.renderFeed(feed);
      });
      console.debug("done rendering")
    },

    renderFeed: function(feed){
      var feedView = new Stacker.FeedView({model: feed});
      this.$('ul').append(feedView.render().el);
    }
  });

  Stacker.FeedView = Backbone.View.extend({
    tagName: 'li',
    render: function(){
      this.$el.html(this.model.get('title') + "[" + this.model.get('post_type') + "] by - " + this.model.get('user_id')); //TODO
      return this;
    }
  });

  Stacker.Feed = Backbone.Model.extend({});

  Stacker.Feeds = Backbone.Collection.extend({
    
    model: Stacker.Feed,
    
    initialize: function(options){
      this.site = options.site;
      this.userIds = options.userIds;
    },

    url: function(){
      return "https://api.stackexchange.com/2.0/users/"
              + encodeURIComponent(this.userIds.join(";"))
              + "/timeline?site=" 
              + this.site
    },

    parse: function(response){
      // console.debug("response.items", response.items);
      return response.items;
    },

    comparator: function(feed){
      return -feed.get("creation_date");
    }
  });

  window.view = new Stacker.AppView().render();
});