Stacker = typeof Stacker === "undefined" ? {} : Stacker;

Stacker.Utils = {
  getSite: function(siteName){
    return Stacker.sites[siteName];
  },

  getUser: function(siteName, userId){
    var accountId = Stacker.sitesToUsers[siteName][userId];
    return Stacker.following[accountId];
  }
};
