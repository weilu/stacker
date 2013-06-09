Stacker = typeof Stacker === "undefined" ? {} : Stacker;

Stacker.AppView = Backbone.View.extend({


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
    this.dateAbsolute = new Date(1000 * this.model.get('creation_date'));
    this.dateRelative = this.dateAbsolute.getDate() ? $.timeago(this.dateAbsolute) : '';
    this.timelineType = this.model.get('timeline_type');
    this.postType = this.model.get('post_type');
    this.site = Stacker.Utils.getSite(this.model.get('site_name'));
    this.user = Stacker.Utils.getUser(this.site.name, this.model.get('user_id'));
    this.userUrl = this.site.site_url + "/u/" + this.model.get('user_id');
    this.postUrl = this.model.get('post_id') ? this.site.site_url + "/q/" + this.model.get('post_id') : '#';
    this.postTitle = this.model.get('title') ? this.model.get('title') : '';
    this.detail = this.model.get('detail') ? this.model.get('detail') : '';

    this.$el.append("<img class='profile' src='" + this.user.image +
                    "'/><span class='activity'><a class='name left' href='" + this.userUrl + "'>" + this.user.name +
                    "</a><img src='" + this.site.favicon_url + "' title='" + this.site.name +
                    "' /><span class='type left'> " + this.timelineType +
                    "</span><span class='right date relative'>" + this.dateRelative + "</span>" +
                    "<span class='right date absolute'>" + this.dateAbsolute + "</span>" +
                    "<br><a href='" + this.postUrl + "'>" + this.postTitle + "</a><br>" +
                    "<p>" + this.detail + "</p></span>");
    return this;
  }
});

Stacker.Feed = Backbone.Model.extend({});

Stacker.BaseFeeds = Backbone.Collection.extend({
  model: Stacker.Feed,
  comparator: function(feed){
    var date = feed.get("creation_date");
    if(!date){
      date = 0;
    }
    return -date;
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
            + Stacker.Utils.getSite(this.site).api_site_parameter;
  },

  parse: function(response){
    for(var i in response.items){
      response.items[i]["site_name"] = this.site;
    }
    return response.items;
  }
});

function fetchFeedsInBatch(size, page){
  var start = size * page + 1;
  var counter = 0;
  for(var site in Stacker.sitesToUsers){
    counter++;

    if(counter < start || Stacker.Utils.getSite(site) === undefined){//TODO: fix this: sites hashed by site name is not reliable. Consider site_url
      continue;
    }

    var feeds = new Stacker.Feeds({site: site, users: Stacker.sitesToUsers[site]});
    feeds.fetch({
      success: sortAndDisplay
    });

    if(counter == 30){
      setTimeout(function(){
       fetchFeedsInBatch(size, page+1);
      }, 1000);
      break;
    }
  }
}

function sortAndDisplay(collection, response){
  console.debug("feeds for site and users ", collection.site, collection.userIds);
  window.feeds.add(collection.models, {silent: true});
  totalDone++;

  if(totalDone == Object.keys(Stacker.sitesToUsers).length){
    window.view = new Stacker.AppView({ feeds: window.feeds, el: $('#stacker') }).render();
  }
}

$(function(){
  window.feeds = new Stacker.BaseFeeds();
  var stackerStorage = localStorage['stacker'];
  var stackerSitesStorage = localStorage['stacker_sites'];
  if(!stackerStorage || !stackerSitesStorage){
    $('#stacker').append("<p>There's nothing here because you are not following anyone yet! <a href='./options.html'>Start stalking</a></p>");
    return;
  }

  Stacker.sites = JSON.parse(stackerSitesStorage);
  Stacker.following = JSON.parse(stackerStorage).following;
  Stacker.sitesToUsers = JSON.parse(stackerStorage).sitesToUsers;

  if(!Stacker.sitesToUsers || !Stacker.sites || !Stacker.following){
    console.log('should not be here')
    return; //shouldn't be here but better safe than sorry
  }

  //TODO: bad bad global variable
  window.totalDone = 0;
  fetchFeedsInBatch(30, 0);
});
