(function() {
  var UrlExists, addToHistory, blacklist, checkBlacklist, checkWhitelist, choosePlayer, client_id, dontPlay, getSongJSON, has_korean, history, loadSong, nextSong, notAvailable, not_kor_eng, only_korean, player, player_one, player_three, player_two, players, processSong, queryLimit, randomQuery, song_data, top_queries, whitelist, _i, _len,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  client_id = "2721807f620a4047d473472d46865f14";


  /*
  lastfm = new LastFM(
    apiKey: "c04e77b276f955f8ed3a94006abb8c42"
    apiSecret: "69b6345d1e154c9b60f0b32b85268dad"
  )
   */

  SC.initialize({
    client_id: client_id
  });

  queryLimit = 100;

  whitelist = ["kpop", "k pop", "k-pop", "korean", "korea", "kor", "kor pop", "korean pop", "korean-pop", "kor-pop", "korean version", "kr", "kr ver", "original"];

  blacklist = ["cover", "acoustic", "instrumental", "remix", "mix", "re mix", "re-mix", "version", "ver.", "live", "live cover", "accapella", "cvr", "united states", "america", "india", "indian", "japan", "china", "chinese", "japanese", "viet", "vietnam", "vietnamese", "thai", "taiwan", "taiwanese", "russian", "ambient", "meditat"];

  not_kor_eng = /[^A-Za-z0-9\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF \♡\.\「\」\”\“\’\∞\♥\|\【\】\–\{\}\[\]\!\@\#\$\%\^\&\*\(\)\-\_\=\+\;\:\'\"\,\.\<\>\/\\\?\`\~]/g;

  has_korean = /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g;

  only_korean = /[^\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g;

  history = [];

  notAvailable = [];

  dontPlay = [];

  player_one = document.getElementById("player_one");

  player_two = document.getElementById("player_two");

  player_three = document.getElementById("player_three");

  players = [player_one, player_two, player_three];

  getSongJSON = function() {
    var xmlHttp;
    xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "http://jombly.com:3000/today", false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
  };

  song_data = JSON.parse(getSongJSON());

  top_queries = arrayUnique(song_data);

  Number.prototype.toHHMMSS = function() {
    var h, m, s;
    h = Math.floor(this / 3600);
    m = Math.floor(this % 3600 / 60);
    s = Math.floor(this % 3600 % 60);
    return (h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s;
  };

  UrlExists = function(url, cb) {
    jQuery.ajax({
      url: url,
      dataType: "text",
      type: "GET",
      complete: function(xhr) {
        if (typeof cb === "function") {
          cb.apply(this, [xhr.status]);
        }
      }
    });
  };

  checkBlacklist = function(song, query) {
    var arrays, cleaned_query, cleaned_song, created_date, date_limit, kor_eng_test, ok_months, query_array, result, song_array, term, _i, _j, _k, _len, _len1, _len2;
    if (song.title == null) {
      return false;
    }
    if (song.url == null) {
      return false;
    }
    if (song.created == null) {
      return false;
    }
    ok_months = 12;
    created_date = moment(song.created, "YYYY-MM-DD HH:MM:SS");
    date_limit = moment().subtract(ok_months, "months");
    if (date_limit.diff(created_date, "months") > 0) {
      return false;
    }
    if (song.duration > 360) {
      return false;
    }
    for (_i = 0, _len = blacklist.length; _i < _len; _i++) {
      term = blacklist[_i];
      if (song.title.indexOf(term) !== -1) {
        return false;
      }
    }
    for (_j = 0, _len1 = blacklist.length; _j < _len1; _j++) {
      term = blacklist[_j];
      if ((song.genre != null) && song.genre.indexOf(term) !== -1) {
        return false;
      }
    }
    for (_k = 0, _len2 = blacklist.length; _k < _len2; _k++) {
      term = blacklist[_k];
      if (__indexOf.call(song.tags, term) >= 0) {
        return false;
      }
    }
    kor_eng_test = not_kor_eng.test(song.title);
    if (kor_eng_test === true) {
      return false;
    }
    cleaned_song = song.title.replace(/[^A-Za-z0-9\s]+/g, "").replace(/\s+/g, ' ').toLowerCase().trim();
    cleaned_query = query.replace(/[^A-Za-z0-9\s]+/g, "").replace(/\s+/g, ' ').toLowerCase().trim();
    song_array = cleaned_song.split(" ");
    query_array = cleaned_query.split(" ");
    arrays = [song_array, query_array];
    result = arrays.shift().reduce(function(res, v) {
      if (res.indexOf(v) === -1 && arrays.every(function(a) {
        return a.indexOf(v) !== -1;
      })) {
        res.push(v);
      }
      return res;
    }, []);
    if (result.length === 0) {
      return false;
    }
    return true;
  };

  checkWhitelist = function(song, query) {
    var arrays, cleaned_query, cleaned_song, query_array, query_count, result, score, song_array, tags_count, term, test, _i, _len, _ref;
    score = 0;
    tags_count = 0;
    query_count = 0;
    cleaned_song = song.title.replace(/[^A-Za-z0-9\s]+/g, "").replace(/\s+/g, ' ').toLowerCase().trim();
    cleaned_query = query.replace(/[^A-Za-z0-9\s]+/g, "").replace(/\s+/g, ' ').toLowerCase().trim();
    if (_ref = song.genre, __indexOf.call(whitelist, _ref) >= 0) {
      score += 1;
    }
    for (_i = 0, _len = whitelist.length; _i < _len; _i++) {
      term = whitelist[_i];
      if (__indexOf.call(song.tags, term) >= 0) {
        tags_count += 1;
      }
    }
    if (tags_count > 0) {
      score += 1;
    }
    test = has_korean.test(song.title);
    if (test === true) {
      score += 1;
    }
    song_array = cleaned_song.split(" ");
    query_array = cleaned_query.split(" ");
    arrays = [song_array, query_array];
    result = arrays.shift().reduce(function(res, v) {
      if (res.indexOf(v) === -1 && arrays.every(function(a) {
        return a.indexOf(v) !== -1;
      })) {
        res.push(v);
      }
      return res;
    }, []);
    if (result.length === query_array.length) {
      score += 1;
    }
    if (levenstein(cleaned_query, cleaned_song) <= 10) {
      score += 1;
    }
    return score;
  };

  loadSong = function(q) {

    /*
    get purchase links from lastfm
    lastfm.track.getBuylinks({artist: q.artist, track: q.title, country: 'US'}
    , success: (data) ->
      buyLinks = data.affiliations.downloads.affiliation
    , error: (code, message) ->
      console.log code,message
    )
     */
    var dfd;
    dfd = $.Deferred();
    SC.get('/tracks', {
      q: q.query,
      limit: queryLimit
    }, function(tracks, err) {
      var acceptable;
      if ((tracks == null) || tracks.length === 0 || err !== null) {
        dfd.reject();
        return;
      } else {
        acceptable = [];
        tracks.forEach(function(t) {
          var artwork, blacklist_pass, created, duration, genre, korean, song, tags, test, url, views;
          test = has_korean.test(t.title);
          if ((t.title != null) && test === true) {
            korean = "(" + (t.title.toLowerCase().replace(only_korean, "")) + ")";
          } else {
            korean = "";
          }
          if (t.genre != null) {
            genre = t.genre.toLowerCase();
          }
          if (t.tag_list != null) {
            tags = t.tag_list.toLowerCase().split(" ");
          }
          if (t.created_at != null) {
            created = t.created_at;
          }
          if (t.stream_url != null) {
            url = t.stream_url + "?client_id=" + client_id;
          }
          if (t.artwork_url != null) {
            artwork = t.artwork_url.replace("-large", "-t500x500");
          }
          if (t.playback_count != null) {
            views = t.playback_count;
          }
          if (t.duration != null) {
            duration = t.duration / 1000;
          }
          song = {
            title: "" + q.artist + "  —  " + q.title + " " + korean,
            song: q.title,
            artist: q.artist,
            rank: q.rank,
            num_days: q.num_days,
            change: q.change,
            korean: korean,
            genre: genre,
            tags: tags,
            created: created,
            url: url,
            artwork: artwork,
            duration: duration,
            views: views,
            score: 0,
            query: q.query
          };
          blacklist_pass = checkBlacklist(song, q.query);
          song.score = checkWhitelist(song, q.query);
          if (blacklist_pass === true && song.score >= 3) {
            return acceptable.push(song);
          }
        });
        acceptable.sort(function(x, y) {
          return y.views - x.views;
        });
        if (acceptable.length > 0) {
          dfd.resolve(acceptable[0]);
        } else {
          dfd.reject();
        }
      }
    });
    return dfd.promise();
  };

  addToHistory = function(song) {
    var len, max;
    len = history.length;
    max = 9;
    if (song.query != null) {
      history.unshift(song.query);
    }
    if (len > max) {
      history.splice(max + 1, len - max);
    }
  };

  randomQuery = function() {
    var availableSongs;
    availableSongs = top_queries.filter(function(x) {
      return history.indexOf(x) < 0;
    });
    availableSongs = availableSongs.filter(function(y) {
      return notAvailable.indexOf(y) < 0;
    });
    availableSongs = availableSongs.filter(function(z) {
      return dontPlay.indexOf(z) < 0;
    });
    return availableSongs[Math.floor(Math.random() * availableSongs.length)];
  };

  processSong = function(query) {
    var dfd, request;
    request = function(query) {
      return loadSong(query).done(function(song) {
        addToHistory(song);
        return dfd.resolve(song);
      }).fail(function() {
        var newQ;
        notAvailable.push(query);
        newQ = randomQuery();
        return request(newQ);
      });
    };
    dfd = $.Deferred();
    request(query);
    return dfd.promise();
  };

  choosePlayer = function() {
    var a, c, len, n, o, seq;
    players = [player_one, player_two, player_three];
    c = players.indexOf(document.getElementsByClassName("active")[0]);
    len = players.length - 1;
    if ((c == null) || c === len) {
      a = 0;
    } else {
      a = c + 1;
    }
    if (a === len) {
      n = 0;
    } else {
      n = a + 1;
    }
    if (n === len) {
      o = 0;
    } else {
      o = n + 1;
    }
    seq = {
      active: players[a],
      next: players[n],
      onDeck: players[o],
      last: players[c]
    };
    seq.active.classList.add("active");
    seq.next.classList.remove("active");
    seq.onDeck.classList.remove("active");
    return seq;
  };

  nextSong = function() {
    var art, change, endTime, max, num_days, query, rank, title, url;
    players = choosePlayer();
    query = randomQuery();
    endTime = Number(players.active.getAttribute("songlength")).toHHMMSS();
    art = players.active.getAttribute("artwork");
    title = players.active.getAttribute("songtitle");
    max = players.active.getAttribute("songlength");
    url = players.active.getAttribute("src");
    rank = players.active.getAttribute("rank");
    change = players.active.getAttribute("change");
    num_days = players.active.getAttribute("num_days");
    UrlExists(url, function(status) {
      if (status === 404 || status === 503) {
        nextSong();
      }
    });
    UrlExists(art, function(status) {
      if (status === 404 || status === 503) {
        nextSong();
      }
    });
    players.last.pause();
    players.active.play();
    if ((endTime != null) && endTime !== void 0) {
      $('#endTime').val(endTime);
    }
    if ((max != null) && max !== void 0) {
      $('#seek').attr("max", max);
    }
    if ((title != null) && title !== void 0) {
      $('#title').text(title);
    }
    if ((art != null) && art !== void 0) {
      $('#container').css("background", "url(" + art + ") no-repeat center center");
    }
    $('#title').text(title);
    $('#rank').text("Rank " + rank);
    if (change < 0) {
      $('#change').css("color", "#D7431B");
      $('#change').text("( " + change + " )");
    }
    if (change > 0) {
      $('#change').css("color", "#288668");
      $('#change').text("( +" + change + " )");
    }
    if (change === 0) {
      $('#change').css("color", "#2d3033");
      $('#change').text("( — )");
    }
    $('#daysOnChart').text("" + num_days + " days on chart");
    processSong(query).done(function(result) {
      players.last.setAttribute("src", result.url);
      players.last.setAttribute("artwork", result.artwork);
      players.last.setAttribute("songtitle", result.title);
      players.last.setAttribute("songlength", result.duration);
      players.last.setAttribute("rank", result.rank);
      players.last.setAttribute("change", result.change);
      players.last.setAttribute("num_days", result.num_days);
      return players.last.setAttribute("query", result.query);
    });
  };

  document.addEventListener("touchmove", function(event) {
    return event.preventDefault();
  });

  $('#nextButton').on("click", function() {
    return nextSong();
  });

  $('#playButton').on("click", function() {
    var p;
    p = document.getElementsByClassName("active")[0];
    if (p.paused) {
      $('#playButton').html("&#xf04c;");
      return p.play();
    } else {
      $('#playButton').html("&#xf04b;");
      return p.pause();
    }
  });

  for (_i = 0, _len = players.length; _i < _len; _i++) {
    player = players[_i];
    $(player).on("playing", function() {
      return $('#playButton').html("&#xf04c;");
    });
    $(player).on("ended", function() {
      return nextSong();
    });
    $(player).on("timeupdate", function() {
      $('#currentTime').val(this.currentTime.toHHMMSS());
      return $('#seek').val(this.currentTime);
    });
  }

  $('#seek').on("input", function() {
    var c;
    c = document.getElementsByClassName("active")[0];
    c.pause();
    return c.currentTime = this.value;
  });

  $('#seek').on("change", function() {
    var c;
    c = document.getElementsByClassName("active")[0];
    return c.play();
  });

  $('#dontPlay').on("click", function() {
    var c, query;
    c = document.getElementsByClassName("active")[0];
    query = c.getAttribute("query");
    dontPlay.push(query);
    nextSong();
    return console.log(dontPlay);
  });


  /*
  seek = document.getElementById "seek"
  hammertime = new Hammer(seek)
  hammertime.on "tap", ->
    c = document.getElementsByClassName("active")[0]
    c.currentTime = $('#seek').value
    alert @value
   */

  $(document).ready(function() {
    var q_one, q_three, q_two;
    q_one = randomQuery();
    q_two = randomQuery();
    q_three = randomQuery();
    processSong(q_one).done(function(res_one) {
      player_one.setAttribute("src", res_one.url);
      player_one.setAttribute("artwork", res_one.artwork);
      player_one.setAttribute("songtitle", res_one.title);
      player_one.setAttribute("songlength", res_one.duration);
      player_one.setAttribute("rank", res_one.rank);
      player_one.setAttribute("change", res_one.change);
      player_one.setAttribute("num_days", res_one.num_days);
      player_one.setAttribute("query", res_one.query);
      if (res_one.duration != null) {
        $('#endTime').val(res_one.duration.toHHMMSS());
        $('#seek').attr("max", res_one.duration);
      }
      if (res_one.artwork != null) {
        $('#container').css("background", "url(" + res_one.artwork + ") no-repeat center center");
      }
      $('#title').text(res_one.title);
      $('#rank').text("Rank " + res_one.rank);
      if (res_one.change < 0) {
        $('#change').css("color", "#D7431B");
        $('#change').text("( " + res_one.change + " )");
      }
      if (res_one.change > 0) {
        $('#change').css("color", "#288668");
        $('#change').text("( +" + res_one.change + " )");
      }
      if (res_one.change === 0) {
        $('#change').css("color", "#2d3033");
        $('#change').text("( — )");
      }
      return $('#daysOnChart').text("" + res_one.num_days + " days on chart");
    });
    processSong(q_two).done(function(res_two) {
      player_two.setAttribute("src", res_two.url);
      player_two.setAttribute("artwork", res_two.artwork);
      player_two.setAttribute("songtitle", res_two.title);
      player_two.setAttribute("songlength", res_two.duration);
      player_two.setAttribute("rank", res_two.rank);
      player_two.setAttribute("change", res_two.change);
      player_two.setAttribute("num_days", res_two.num_days);
      return player_two.setAttribute("query", res_two.query);
    });
    return processSong(q_three).done(function(res_three) {
      player_three.setAttribute("src", res_three.url);
      player_three.setAttribute("artwork", res_three.artwork);
      player_three.setAttribute("songtitle", res_three.title);
      player_three.setAttribute("songlength", res_three.duration);
      player_three.setAttribute("rank", res_three.rank);
      player_three.setAttribute("change", res_three.change);
      player_three.setAttribute("num_days", res_three.num_days);
      return player_three.setAttribute("query", res_three.query);
    });
  });

}).call(this);
