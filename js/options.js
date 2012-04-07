$(function(){
  Stacker = {};
  Stacker.sites = {"Stack Overflow":"stackoverflow","Server Fault":"serverfault","Super User":"superuser","Meta Stack Overflow":"meta.stackoverflow","Web Applications":"webapps","Web Applications Meta":"meta.webapps","Gaming":"gaming","Gaming Meta":"meta.gaming","Webmasters":"webmasters","Webmasters Meta":"meta.webmasters","Cooking":"cooking","Cooking Meta":"meta.cooking","Game Development":"gamedev","Game Development Meta":"meta.gamedev","Photography":"photo","Photography Meta":"meta.photo","Statistical Analysis":"stats","Statistical Analysis Meta":"meta.stats","Mathematics":"math","Mathematics Meta":"meta.math","Home Improvement":"diy","Home Improvement Meta":"meta.diy","Meta Super User":"meta.superuser","Meta Server Fault":"meta.serverfault","GIS":"gis","GIS Meta":"meta.gis","TeX - LaTeX":"tex","TeX - LaTeX Meta":"meta.tex","Ask Ubuntu":"askubuntu","Ask Ubuntu Meta":"meta.askubuntu","Personal Finance and Money":"money","Personal Finance and Money Meta":"meta.money","English Language and Usage":"english","English Language and Usage Meta":"meta.english","Stack Apps":"stackapps","User Experience":"ux","User Experience Meta":"meta.ux","Unix and Linux":"unix","Unix and Linux Meta":"meta.unix","WordPress":"wordpress","WordPress Meta":"meta.wordpress","Theoretical Computer Science":"cstheory","Theoretical Computer Science Meta":"meta.cstheory","Apple":"apple","Apple Meta":"meta.apple","Role-playing Games":"rpg","Role-playing Games Meta":"meta.rpg","Bicycles":"bicycles","Bicycles Meta":"meta.bicycles","Programmers":"programmers","Programmers Meta":"meta.programmers","Electrical Engineering":"electronics","Electrical Engineering Meta":"meta.electronics","Android Enthusiasts":"android","Android Enthusiasts Meta":"meta.android","OnStartups":"answers.onstartups","OnStartups Meta":"meta.answers.onstartups","Board and Card Games":"boardgames","Board and Card Games Meta":"meta.boardgames","Physics":"physics","Physics Meta":"meta.physics","Homebrewing":"homebrew","Homebrewing Meta":"meta.homebrew","IT Security":"security","IT Security Meta":"meta.security","Writers":"writers","Writers Meta":"meta.writers","Audio-Video Production":"avp","Audio-Video Production Meta":"meta.avp","Graphic Design":"graphicdesign","Graphic Design Meta":"meta.graphicdesign","Database Administrators":"dba","Database Administrators Meta":"meta.dba","Science Fiction and Fantasy":"scifi","Science Fiction and Fantasy Meta":"meta.scifi","Code Review":"codereview","Code Review Meta":"meta.codereview","Code Golf":"codegolf","Code Golf Meta":"meta.codegolf","Quantitative Finance":"quant","Quantitative Finance Meta":"meta.quant","Project Management":"pm","Project Management Meta":"meta.pm","Skeptics":"skeptics","Skeptics Meta":"meta.skeptics","Fitness and Nutrition":"fitness","Fitness and Nutrition Meta":"meta.fitness","Drupal Answers":"drupal","Drupal Answers Meta":"meta.drupal","Motor Vehicle Maintenance and Repair":"mechanics","Motor Vehicle Maintenance and Repair Meta":"meta.mechanics","Parenting":"parenting","Parenting Meta":"meta.parenting","SharePoint":"sharepoint","SharePoint Meta":"meta.sharepoint","Musical Practice and Performance":"music","Musical Practice and Performance Meta":"meta.music","Software Quality Assurance and Testing":"sqa","Software Quality Assurance and Testing Meta":"meta.sqa","Jewish Life and Learning":"judaism","Jewish Life and Learning Meta":"meta.judaism","German Language and Usage":"german","German Language and Usage Meta":"meta.german","Japanese Language and Usage":"japanese","Japanese Language and Usage Meta":"meta.japanese","Astronomy":"astronomy","Astronomy Meta":"meta.astronomy","Philosophy":"philosophy","Philosophy Meta":"meta.philosophy","Gardening and Landscaping":"gardening","Gardening and Landscaping Meta":"meta.gardening","Travel":"travel","Travel Meta":"meta.travel","Personal Productivity":"productivity","Personal Productivity Meta":"meta.productivity","Cryptography":"crypto","Cryptography Meta":"meta.crypto","Literature":"literature","Literature Meta":"meta.literature","Signal Processing":"dsp","Signal Processing Meta":"meta.dsp","French Language and Usage":"french","French Language and Usage Meta":"meta.french","Christianity":"christianity","Christianity Meta":"meta.christianity","Bitcoin":"bitcoin","Bitcoin Meta":"meta.bitcoin","Linguistics":"linguistics","Linguistics Meta":"meta.linguistics","Theoretical Physics":"theoreticalphysics","Theoretical Physics Meta":"meta.theoreticalphysics","Biblical Hermeneutics":"hermeneutics","Biblical Hermeneutics Meta":"meta.hermeneutics","History":"history","History Meta":"meta.history","Economics":"economics","Economics Meta":"meta.economics","Healthcare IT":"healthcareit","Healthcare IT Meta":"meta.healthcareit","LEGO&#174; Answers":"bricks","LEGO&#174; Answers Meta":"meta.bricks","Firearms":"firearms","Firearms Meta":"meta.firearms","Spanish Language and Usage":"spanish","Spanish Language and Usage Meta":"meta.spanish","Computational Science":"scicomp","Computational Science Meta":"meta.scicomp","Movies and TV":"movies","Movies and TV Meta":"meta.movies","Chinese Language and Usage":"chinese","Chinese Language and Usage Meta":"meta.chinese","Biology":"biology","Biology Meta":"meta.biology","Poker":"poker","Poker Meta":"meta.poker","Mathematica":"mathematica","Mathematica Meta":"meta.mathematica","Cognitive Sciences":"cogsci","Cognitive Sciences Meta":"meta.cogsci","The Great Outdoors":"outdoors","The Great Outdoors Meta":"meta.outdoors","SmugMug":"smugmug","SmugMug Meta":"meta.smugmug","Martial Arts":"martialarts","Martial Arts Meta":"meta.martialarts","Sports":"sports","Sports Meta":"meta.sports","Academia":"academia","Academia Meta":"meta.academia","Computer Science":"cs","Computer Science Meta":"meta.cs"}

  Stacker.OptView = Backbone.View.extend({
    el: 'body',

    events: {
      'click button': 'follow'
    },

    initialize: function(){
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
        select.append("<option value='" + this._getSite(siteName) + "'>" + siteName + "</optoins>");
      }
    },

    displayFollowing: function(){
      var ul = $('ul#following');
      ul.empty();
      
      for(var userId in this.following){
        ul.append("<li>" + this.following[userId] + "</li>");
      }
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
      var url = "http://api.stackexchange.com/2.0/users/" + userId + "?site=" + site;
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

      this.following[user.account_id] = user.display_name;

      var ul = $('ul#following');
      ul.append("<li>" + user.display_name + "</li>");
      
      this._updateSitesToUsers(user.account_id);
    },

    _updateSitesToUsers: function(accountId){
      var url = "http://api.stackexchange.com/2.0/users/" + accountId + "/associated";
      var req = new XMLHttpRequest();
      req.open("GET", url, true);

      view = this;
      req.onload = function(){
        var items = JSON.parse(req.response).items;
        for(var index in items){
          var account = items[index];
          var site = view._getSite(account.site_name);
          if(!view.sitesToUsers[site]){
            view.sitesToUsers[site] = [];
          }
          view.sitesToUsers[site].push(account.user_id)
          view.sitesToUsers[site] =  _.uniq(view.sitesToUsers[site]);
        }

        view._save();
      }
      req.send(null);
    },

    _getSite: function(siteName){
      return Stacker.sites[siteName];
    },

    _save: function(){
      localStorage["stacker"] = JSON.stringify({following: this.following, sitesToUsers: this.sitesToUsers});
    }
  });

  window.view = new Stacker.OptView().render();
});