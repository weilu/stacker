$(function(){

  Stacker = {};
  Stacker.sites = ["stackoverflow", "serverfault", "superuser", "meta.stackoverflow", "webapps", 
           "meta.webapps", "gaming", "meta.gaming", "webmasters", "meta.webmasters", 
           "cooking", "meta.cooking", "gamedev", "meta.gamedev", "photo", 
           "meta.photo", "stats", "meta.stats", "math", "meta.math", 
           "diy", "meta.diy", "meta.superuser", "meta.serverfault", "gis", 
           "meta.gis", "tex", "meta.tex", "askubuntu", "meta.askubuntu", 
           "money", "meta.money", "english", "meta.english", "stackapps", 
           "ux", "meta.ux", "unix", "meta.unix", "wordpress", 
           "meta.wordpress", "cstheory", "meta.cstheory", "apple", "meta.apple", 
           "rpg", "meta.rpg", "bicycles", "meta.bicycles", "programmers", 
           "meta.programmers", "electronics", "meta.electronics", "android", "meta.android", 
           "answers.onstartups", "meta.answers.onstartups", "boardgames", "meta.boardgames", "physics", 
           "meta.physics", "homebrew", "meta.homebrew", "security", "meta.security", 
           "writers", "meta.writers", "avp", "meta.avp", "graphicdesign", 
           "meta.graphicdesign", "dba", "meta.dba", "scifi", "meta.scifi", 
           "codereview", "meta.codereview", "codegolf", "meta.codegolf", "quant", 
           "meta.quant", "pm", "meta.pm", "skeptics", "meta.skeptics", 
           "fitness", "meta.fitness", "drupal", "meta.drupal", "mechanics", 
           "meta.mechanics", "parenting", "meta.parenting", "sharepoint", "meta.sharepoint", 
           "music", "meta.music", "sqa", "meta.sqa", "judaism", 
           "meta.judaism", "german", "meta.german", "japanese", "meta.japanese", 
           "astronomy", "meta.astronomy", "philosophy", "meta.philosophy", "gardening", 
           "meta.gardening", "travel", "meta.travel", "productivity", "meta.productivity", 
           "crypto", "meta.crypto", "literature", "meta.literature", "dsp", 
           "meta.dsp", "french", "meta.french", "christianity", "meta.christianity", 
           "bitcoin", "meta.bitcoin", "linguistics", "meta.linguistics", "theoreticalphysics", 
           "meta.theoreticalphysics", "hermeneutics", "meta.hermeneutics", "history", "meta.history", 
           "economics", "meta.economics", "healthcareit", "meta.healthcareit", "bricks", 
           "meta.bricks", "firearms", "meta.firearms", "spanish", "meta.spanish", 
           "scicomp", "meta.scicomp", "movies", "meta.movies", "chinese", 
           "meta.chinese", "biology", "meta.biology", "poker", "meta.poker", 
           "mathematica", "meta.mathematica", "cogsci", "meta.cogsci", "outdoors", 
           "meta.outdoors", "smugmug", "meta.smugmug", "martialarts", "meta.martialarts", 
           "sports", "meta.sports", "academia", "meta.academia", "cs", 
           "meta.cs"];

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

  window.feeds = new Stacker.Feeds({site: "stackoverflow", userIds: [429288,859536]});
  window.view = new Stacker.AppView({ feeds: window.feeds });

  window.feeds.fetch({
    success: function(){
      window.view = window.view.render();
    }
  });
});