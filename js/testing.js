(function() {
  var active, addToHistory, blacklist, checkBlacklist, checkWhitelist, choosePlayer, client_id, eyk, has_korean, history, loadSong, mwave, next, notAvailable, not_kor_eng, onDeck, player_one, player_three, player_two, processSong, queryLimit, randomQuery, song, top_queries, whitelist, _i, _j, _len, _len1,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  client_id = "2721807f620a4047d473472d46865f14";

  SC.initialize({
    client_id: client_id
  });

  queryLimit = 100;

  whitelist = ["kpop", "k pop", "k-pop", "korean", "korea", "kor", "kor pop", "korean pop", "korean-pop", "kor-pop", "korean version", "kr", "kr ver", "original"];

  blacklist = ["cover", "acoustic", "instrumental", "remix", "mix", "re mix", "re-mix", "version", "ver.", "live", "live cover", "accapella", "cvr", "united states", "america", "india", "indian", "japan", "china", "chinese", "japanese", "viet", "vietnam", "vietnamese", "thai", "taiwan", "taiwanese", "russian", "ambient", "meditat"];

  not_kor_eng = /[^A-Za-z0-9\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF \♡\.\「\」\”\“\’\∞\♥\|\【\】\–\{\}\[\]\!\@\#\$\%\^\&\*\(\)\-\_\=\+\;\:\'\"\,\.\<\>\/\\\?\`\~]/g;

  has_korean = /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g;

  history = [];

  notAvailable = [];

  player_one = document.getElementById("player_one");

  player_two = document.getElementById("player_two");

  player_three = document.getElementById("player_three");

  active = null;

  next = null;

  onDeck = null;

  eyk = (function() {
    var json;
    json = null;
    $.ajax({
      async: false,
      global: false,
      url: "../scrape/EYK/tutorial/eyk.json",
      dataType: "json",
      success: function(data) {
        json = data;
      }
    });
    return json;
  })();

  mwave = (function() {
    var json;
    json = null;
    $.ajax({
      async: false,
      global: false,
      url: "../scrape/MWAVE/tutorial/mwave.json",
      dataType: "json",
      success: function(data) {
        json = data;
      }
    });
    return json;
  })();

  top_queries = [];

  for (_i = 0, _len = eyk.length; _i < _len; _i++) {
    song = eyk[_i];
    song = song.title;
    song = song.toLowerCase();
    top_queries.push(song);
  }

  for (_j = 0, _len1 = mwave.length; _j < _len1; _j++) {
    song = mwave[_j];
    song = song.artist + " " + song.title;
    song = song.toLowerCase();
    top_queries.push(song);
  }

  top_queries = arrayUnique(top_queries);

  checkBlacklist = function(song, query) {
    var arrays, cleaned_query, cleaned_song, created_date, date_limit, kor_eng_test, ok_months, query_array, result, song_array, term, _k, _l, _len2, _len3, _len4, _m;
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
    for (_k = 0, _len2 = blacklist.length; _k < _len2; _k++) {
      term = blacklist[_k];
      if (song.title.indexOf(term) !== -1) {
        return false;
      }
    }
    for (_l = 0, _len3 = blacklist.length; _l < _len3; _l++) {
      term = blacklist[_l];
      if ((song.genre != null) && song.genre.indexOf(term) !== -1) {
        return false;
      }
    }
    for (_m = 0, _len4 = blacklist.length; _m < _len4; _m++) {
      term = blacklist[_m];
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
    var arrays, cleaned_query, cleaned_song, query_array, query_count, result, score, song_array, tags_count, term, test, _k, _len2, _ref;
    score = 0;
    tags_count = 0;
    query_count = 0;
    cleaned_song = song.title.replace(/[^A-Za-z0-9\s]+/g, "").replace(/\s+/g, ' ').toLowerCase().trim();
    cleaned_query = query.replace(/[^A-Za-z0-9\s]+/g, "").replace(/\s+/g, ' ').toLowerCase().trim();
    if (_ref = song.genre, __indexOf.call(whitelist, _ref) >= 0) {
      score += 1;
    }
    for (_k = 0, _len2 = whitelist.length; _k < _len2; _k++) {
      term = whitelist[_k];
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

  loadSong = function(query) {
    var dfd;
    dfd = $.Deferred();
    SC.get('/tracks', {
      q: query,
      limit: queryLimit
    }, function(tracks) {
      var finalists;
      if ((tracks == null) || tracks.length === 0) {
        dfd.resolve(false);
        return;
      } else {
        finalists = [];
        tracks.forEach(function(track) {
          var artwork, blacklist_pass, created, duration, genre, tags, title, url, views;
          if (track.title != null) {
            title = track.title.toLowerCase();
          }
          if (track.genre != null) {
            genre = track.genre.toLowerCase();
          }
          if (track.tag_list != null) {
            tags = track.tag_list.toLowerCase().split(" ");
          }
          if (track.created_at != null) {
            created = track.created_at;
          }
          if (track.stream_url != null) {
            url = track.stream_url + "?client_id=" + client_id;
          }
          if (track.artwork_url != null) {
            artwork = track.artwork_url.replace("-large", "-t500x500");
          }
          if (track.playback_count != null) {
            views = track.playback_count;
          }
          if (track.duration != null) {
            duration = track.duration / 1000;
          }
          song = {
            title: title,
            genre: genre,
            tags: tags,
            created: created,
            url: url,
            artwork: artwork,
            duration: duration,
            views: views,
            score: 0,
            query: query
          };
          blacklist_pass = checkBlacklist(song, query);
          song.score = checkWhitelist(song, query);
          if (blacklist_pass === true && song.score >= 2) {
            return finalists.push(song);
          }
        });
        finalists.sort(function(x, y) {
          var n;
          n = y.score - x.score;
          if (n !== 0) {
            return n;
          }
          return y.views - x.views;
        });
        if (finalists.length > 0) {
          dfd.resolve(finalists[0]);
        } else {
          dfd.resolve(false);
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
    return availableSongs[Math.floor(Math.random() * availableSongs.length)];
  };

  processSong = function(query) {
    var dfd;
    dfd = $.Deferred();
    loadSong(query).done(function(song) {
      if (song !== false) {
        addToHistory(song);
        console.log("Loaded song: " + song.title);
        dfd.resolve(song);
      } else {
        notAvailable.push(query);
        console.log("Error loading song: " + song.query);
        dfd.resolve(false);
      }
    });
    return dfd.promise();
  };

  choosePlayer = function() {
    var c, len, players, sequence;
    players = [player_one, player_two, player_three];
    c = players.indexOf(document.getElementsByClassName("active")[0]);
    len = players.length;
    if (c == null) {
      console.log("no current active");
      sequence = {
        active: players[0],
        next: players[1],
        onDeck: players[2],
        last: players[c]
      };
      return sequence;
    } else {
      if (c === 0) {
        sequence = {
          active: players[1],
          next: players[2],
          onDeck: players[0],
          last: players[c]
        };
        sequence.active.classList.add("active");
        sequence.next.classList.remove("active");
        sequence.onDeck.classList.remove("active");
        return sequence;
      } else if (c === 1) {
        sequence = {
          active: players[2],
          next: players[0],
          onDeck: players[1],
          last: players[c]
        };
        sequence.active.classList.add("active");
        sequence.next.classList.remove("active");
        sequence.onDeck.classList.remove("active");
        return sequence;
      } else if (c === 2) {
        sequence = {
          active: players[0],
          next: players[1],
          onDeck: players[2],
          last: players[c]
        };
        sequence.active.classList.add("active");
        sequence.next.classList.remove("active");
        sequence.onDeck.classList.remove("active");
        return sequence;
      }
    }
  };

  $('#test').on("click", function() {
    var players, query;
    players = choosePlayer();
    query = randomQuery();
    return processSong(query).done(function(result_one) {
      if (result_one !== false) {
        players.last.pause();
        players.active.play();
        return players.last.setAttribute("src", result_one.url);
      } else {
        notAvailable.push(query);
        query = randomQuery();
        return processSong(query).done(function(result_two) {
          if (result_two !== false) {
            players.active.setAttribute("src", result_two.url);
            players.last.pause();
            return players.active.play();
          } else {
            notAvailable.push(query);
            query = randomQuery();
            return processSong(query).done(function(result_three) {
              players.active.setAttribute("src", result_three.url);
              players.last.pause();
              return players.active.play();
            });
          }
        });
      }
    });
  });

  $(document).ready(function() {
    var query;
    query = randomQuery();
    processSong(query).done(function(result_one) {
      if (result_one !== false) {
        player_one.setAttribute("src", result_one.url);
      } else {
        notAvailable.push(query);
        query = randomQuery();
        processSong(query).done(function(result_two) {
          if (result_two !== false) {
            return player_one.setAttribute("src", result_two.url);
          } else {
            notAvailable.push(query);
            query = randomQuery();
            return processSong(query).done(function(result_three) {
              return player_one.setAttribute("src", result_three.url);
            });
          }
        });
      }
      query = randomQuery();
      return processSong(query).done(function(result_one) {
        if (result_one !== false) {
          player_two.setAttribute("src", result_one.url);
        } else {
          notAvailable.push(query);
          query = randomQuery();
          processSong(query).done(function(result_two) {
            if (result_two !== false) {
              return player_two.setAttribute("src", result_two.url);
            } else {
              notAvailable.push(query);
              query = randomQuery();
              return processSong(query).done(function(result_three) {
                return player_two.setAttribute("src", result_three.url);
              });
            }
          });
        }
        query = randomQuery();
        return processSong(query).done(function(result_one) {
          if (result_one !== false) {
            return player_three.setAttribute("src", result_one.url);
          } else {
            notAvailable.push(query);
            query = randomQuery();
            return processSong(query).done(function(result_two) {
              if (result_two !== false) {
                return player_three.setAttribute("src", result_two.url);
              } else {
                notAvailable.push(query);
                query = randomQuery();
                return processSong(query).done(function(result_three) {
                  return player_three.setAttribute("src", result_three.url);
                });
              }
            });
          }
        });
      });
    });
  });

}).call(this);