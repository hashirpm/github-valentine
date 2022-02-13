var express = require("express");
var router = express.Router();
var request = require("axios");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "GITHUB VALENTINE" });
});

router.get("/valentine", async (req, res) => {
  const username = req.query.username;
  //console.log(username)
  try {
    //-------------FUNCTIONS----------------
    //User Details Function
    var get_user = async (username) => {
      var url = "https://api.github.com/users/" + username,
        response = await request.get(url);
      //console.log(response)
      return response;
    };

    //User Repos Function
    var get_user_repos = async (username, page_number, prev_data) => {
      var page = page_number ? page_number : 1;

      var url =
        "https://api.github.com/users/" + username + "/repos?per_page=100";
      var data = prev_data ? prev_data : [];
      if (page_number > 1) {
        url += "&page=" + page_number;
      }

      response = await request.get(url);

      data = data.concat(response.data);

      if (response.length == 100) {
        get_user_repos(username, page + 1, data);
      } else {
        return data;
      }
    };



    //Sort by Popularity
    function sortByPopularity(a, b) {
      return b.popularity - a.popularity;
    }

    //Sort Languages
    function sortLanguages(languages, limit) {
      var languageTotal = 0;
      var sorted_languages = [];

      for (var lang in languages) {
        if (typeof lang !== "string") {
          continue;
        }
        sorted_languages.push({
          name: lang,
          popularity: languages[lang],
        });

        languageTotal += languages[lang];
      }

      if (limit) {
        sorted_languages = sorted_languages.slice(0, limit);
      }

      return sorted_languages.sort(sortByPopularity);
    }
    var get_starred_repo = async (username, page) => {
      var star = false;
      var repos = [];
      var page = page ? page : 1;
      var url =
        "https://api.github.com/users/" +
        username +
        "/starred?per_page=100&page=" +
        page;

      str_repos = await request.get(url);
      //console.log(str_repos.data);
      for (var i in str_repos.data) {
        repo = str_repos.data[i];

        if ((i = 0)) {
          //console.log(repo);
        }
        if (repo.full_name == "hashirpm/github-valentine") {
          // console.log(repo);
          star = true;
          return star;
        }
      }

      if (repos.length == 100) {
        star = get_starred_repo(username, page + 1);
      }

      return star;
    };
    var get_repo = async (language, page) => {

      try {
        const url =
          "https://api.github.com/search/repositories?per_page=1&page=" +
          page +
          "&q=language:" +
          language;

        response = await request.get(url);

        return (response.data.items[0].html_url);
        // open( response.data.items[0].html_url );
      } catch (e) {
        try {
          const url =
            "https://api.github.com/search/repositories?per_page=1&page=" +
            page +
            "&q=topic:" +
            language;
          response = await request.get(url);
          return (response.data.items[0].html_url);
          // open( response.data.items[0].html_url );
        } catch (e) {
          console.log(e.message);
        }

      }
    };

    //------------CALL FUNCTIONS-------------


    var userdata = await get_user(username);
    const isStarred = await get_starred_repo(username); //Is Starred Calling
    //console.log(isStarred); //Got isStarred
    if (!isStarred) {
      res.render("nostar");
    }
    data = userdata.data;

    var sinceDate = new Date(data.created_at);

    var since = sinceDate.getFullYear();

    var addHttp = "";
    if (data.blog && data.blog.indexOf("http") < 0) {
      addHttp = "http://";
    }

    var name = username;
    if (data.name !== null && data.name !== undefined && data.name.length) {
      name = data.name;
    }





    data = await get_user_repos(username, 1, []);


    languages = {};


    for (var i in data) {
      repo = data[i];

      if (repo.fork !== false) {
        continue;
      }

      if (repo.language) {
        if (repo.language in languages) {
          languages[repo.language]++;
        } else {
          languages[repo.language] = 1;
        }
      }


    }


    var maxLanguages = 5,
      languages = sortLanguages(languages, maxLanguages);
    majorLang = languages[0].name
    console.log(majorLang)

    var isUser = false;

    while (!isUser) {
      const page = Math.floor(Math.random() * 999) + 1;

      repo = await get_repo(majorLang, page);
      console.log(repo)
      split_repo_url = repo.split("/")

      target_user = split_repo_url[3]
      console.log(target_user)
      var valentineUser = await get_user(target_user);
      var valentineUserData = valentineUser.data

      console.log(valentineUserData.type)
      if (valentineUserData.type == "Organization") {
        continue;
      }

      isUser = true;
      res.redirect(
        "https://github.com/" + target_user
      );



    }

    //-------------RENDER-----------------


  }
  catch (e) {
    //console.log(e);
    res.render("error", { message: "An error occured" });
  }
});

module.exports = router;