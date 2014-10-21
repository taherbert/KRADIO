###
Auto-scraping
http://stackoverflow.com/questions/4138251/preload-html5-audio-while-it-is-playing
http://stackoverflow.com/questions/7779697/javascript-asynchronous-return-value-assignment-with-jquery
###

client_id       =   "2721807f620a4047d473472d46865f14"
priority_tags   = [ "kpop", "k pop", "k-pop", "korean", "korea"]
exclude_tags    = [ "cover", "acoustic", "instrumental", "remix", "mix", "re mix", 
                    "re-mix", "version", "ver.", "cvr"]
hangul          = new RegExp "[\u1100-\u11FF|\u3130-\u318F|\uA960-\uA97F|\uAC00-\uD7AF|\uD7B0-\uD7FF]"

top_queries =   [   "Madtown YOLO", 
                    "VIXX Error", 
                    "BTOB You're so fly", 
                    "PSY Hangover", 
                    "Boyfriend Witch", 
                    "Raina You End And Me", 
                    "Song Ji Eun Don't look at me like that", 
                    "Ailee Don't touch me", 
                    "Holler Taetiseo", 
                    "The Space Between Soyu", 
                    "Go Crazy 2PM",
                    "Teen Top Missing", 
                    "I Swear Sistar", 
                    "Empty B.I", 
                    "Anticipation Note NS YOON-G", 
                    "Beautiful PARK BO RAM", 
                    "Because I love You VIBE","양화대교 Yanghwa Bridge Zion. T",
                    "Sugar Free T-ara",
                    "소격동 Sogyeokdong IU","Let’s Not Go Crazy 8Eight",
                    "How I Am Kim Dong Ryul",
                    "Darling Girl’s Day",
                    "연애하나 봐 I Think I’m In Love Juniel",
                    "쳐다보지마 Don’t Look At Me Like That Song Ji Eun Secret",
                    "HER Block B",
                    "울컥 All Of A Sudden Krystal",
                    "눈물나는 내 사랑 Teardrop Of My Heart Kim Bum Soo",
                    "A Real Man Swings, Ailee",
                    "너무 보고 싶어 I Miss You So Much Acoustic Collabo",
                    "I Love You Yoon Mi Rae",
                    "MAMACITA Super Junior",
                    "I’ll Remain As A Friend Wheesung, Geeks",
                    "맘마미아 Mamma Mia Kara",
                    "The Day Noel",
                    "You’re So Fly BTOB",
                    "괜찮아 사랑이야 It’s Okay, That’s Love Davichi",
                    "Give Your Love? SPICA.S",
                    "I’m Fine Thank You Ladies’ Code",
                    "Still I’m By Your Side Clazziquai",
                    "Love Fiction Ulala Session",
                    "Body Language feat. Bumkey San E",
                    "눈, 코, 입 Eyes, Nose, Lips Taeyang",
                    "잠 못드는 밤 Sleepless Night feat. Punch Crush",
                    "노크 KNOCK Nasty Nasty",
                    "최고의 행운 Best Luck Chen EXO-M",
                    "컬러링 Color Ring WINNER",
                    "Love Me feat. Kim Tae Chun Linus’ Blanket",
                    "두 번 죽이는 말 Words To Kill Monday Kiz",
                    "Cha-Ga-Wa F.Cuz","빨개요 Red HyunA",
                    "그 한 사람 That One Person Lee Seung Hwan",
                    "Difficult Woman Jang Bum Joon",
                    "자전거 Bicycle Gary, Jung In",
                    "Pitiful feat. Hip Job Gavy NJ",
                    "Everyone Else But Me Yoo Seung Woo",
                    "가을냄새 I Smell The Autumn  Verbal Jint"
                ]


player_one          = document.getElementById("player_one")
player_two          = document.getElementById("player_two")
title               = document.getElementById("title")
playButton          = document.getElementById("playButton")
nextButton          = document.getElementById("nextButton")
seek                = document.getElementById("seek")
currentTime         = document.getElementById("currentTime")
endTime             = document.getElementById("endTime")


activePlayer        = player_one
inactivePlayer      = player_two

pad = (d) -> (if (d < 10) then "0" + d.toString() else d.toString())

getTimeFromSecs = (secs) ->
    minutes = secs/60
    seconds = (minutes % 1)*60
    minString = Math.floor(minutes)
    secString = Math.floor(seconds)
    return "#{minString}:#{pad(secString)}"

switchPlayer = ->
    oldActive       = activePlayer
    oldInactive     = inactivePlayer
    activePlayer    = oldInactive
    inactivePlayer  = oldActive

findInactive = ->
    if activePlayer is player_one then inactivePlayer = player_two
    else inactivePlayer = player_one

logEvent = (event) ->
    time = new Date().toTimeString().split(' ')[0]
    console.log "#{time} - #{event.type}"

getRandomSong = () ->
    console.log "#{new Date()} Started getRandomSong()"
    ###
    1. Get all tracks on SoundCloud for the query
    2. Break the tracks into two arrays - one with a K-POP indicator (genre, tags, or korean characters), one without any indicators
    3. Get top track for whichever array is used (use priority_songs if any in it)
    5. Get artwork, song title, and stream url to create player
    ###
    selected_song = top_queries[Math.floor(Math.random() * top_queries.length)]

    dfd = $.Deferred()
    SC.get '/tracks', {q: selected_song, limit: 200}, (tracks) ->
        console.log "#{new Date()} entered SC.get"

        # If query returns nothing, return false
        if tracks? and tracks.length is 0
            ret_song = false
            dfd.resolve(ret_song)
            return

        priority_songs = []
        untagged_songs = []
        approved_songs = []

        ###
        BLACKLIST CHECK
        Check all songs to see if the title or tags contain a blaclisted word. All songs that pass the check are added to the approved_songs array.
        ###
        for song in tracks
            blacklisted = 0

            # convert genre, title, and tags to lowercase. Split the song's tag_list into an array instead of a string.
            if not song.genre? then genre = ""
            else genre = song.genre.toLowerCase()

            if not song.title? then title = ""
            else title = song.title.toLowerCase()

            if not song.stream_url? then sURL = ""
            else sURL = song.stream_url

            if not song.tag_list? then tags = []
            else tag_list = song.tag_list.toLowerCase().split(" ")

            # Check title for blacklisted words
            for term in exclude_tags
                if title.indexOf(term) isnt -1
                    blacklisted += 1

            # Check tags for blacklisted words
            for term in exclude_tags
                for tag in tag_list 
                    if tag.indexOf(term) isnt -1
                        blacklisted += 1

            # Check for missing stream_url
            if sURL is "" then blacklisted += 1

            if blacklisted is 0 then approved_songs.push song

        console.log "#{new Date()} finished blacklist checking"


        ###
        PRIORITY CHECK
        Check all songs to see if they have indicators that they would be good quality or accurate. If so, put them into the priority array.
        ###
        for song in approved_songs
            # convert genre, title, and tags to lowercase. Split the song's tag_list into an array instead of a string.
            if not song.genre? then genre = ""
            else genre = song.genre.toLowerCase()

            if not song.title? then title = ""
            else title = song.title.toLowerCase()

            if not song.tag_list? then tags = []
            else tag_list = song.tag_list.toLowerCase().split(" ")

            add_criteria = 0

            # Check genre against priority_tags, push to priority array
            if genre in priority_tags
                add_criteria += 1

            # Check tags against priority_tags, push to priority array
            if tag_list.length > 0
                for tag in tag_list
                    if tag in priority_tags and tag not in exclude_tags
                        add_criteria += 1

            # Check song title for korean characters, push to priority array
            if hangul.test(title) is true
                add_criteria += 1

            # If song was priority for some reason, add to priority array. Otherwise, add to untagged array.
            if add_criteria > 0 then priority_songs.push song
            else untagged_songs.push song

        console.log "#{new Date()} finished whitelist checking"

        ###
        SORT SONGS
        Sort priority array if there are songs in it, otherwise sort untagged array
        ###

        #Check priority songs array
        if priority_songs.length > 0
            priority_songs.sort (a, b) ->
                keyA = a.playback_count
                keyB = b.playback_count
                return -1 if keyA > keyB
                return 1 if keyA < keyB
                return 0

            track = priority_songs[0]
            artwork = track.artwork_url.replace("-large","-t500x500")
            title = track.title
            duration = track.duration
            stream_url = track.stream_url

        #Check untagged songs array
        else if untagged_songs.length > 0
            untagged_songs.sort (a, b) ->
                keyA = a.playback_count
                keyB = b.playback_count
                return -1 if keyA > keyB
                return 1 if keyA < keyB
                return 0

            track = untagged_songs[0]
            artwork = track.artwork_url.replace("-large","-t500x500")
            title = track.title
            stream_url = track.stream_url
            duration = track.duration

        console.log "#{new Date()} finished sorting"

        # return object containing the song information
        if stream_url?
            ret_song = 
                artwork: artwork
                title: title
                duration: duration
                stream_url: stream_url
                query: selected_song
        else ret_song = false

        dfd.resolve(ret_song)
        console.log "#{new Date()} finished resolving"
        return

    return dfd.promise()






###

player.addEventListener "error", (failed = (e) ->
  switch e.target.error.code
    when e.target.error.MEDIA_ERR_ABORTED
      console.log "You aborted the video playback."
    when e.target.error.MEDIA_ERR_NETWORK
      console.log "A network error caused the audio download to fail."
    when e.target.error.MEDIA_ERR_DECODE
      console.log "The audio playback was aborted due to a corruption problem or because the video used features your browser did not support."
    when e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED
      console.log "The video audio not be loaded, either because the server or network failed or because the format is not supported."
    else
      console.log "An unknown error occurred."
), true

player.addEventListener("load",logEvent)
player.addEventListener("abort",logEvent)
player.addEventListener("canplay",logEvent)
player.addEventListener("canplaythrough",logEvent)
player.addEventListener("durationchange",logEvent)
player.addEventListener("emptied",logEvent)
player.addEventListener("interruptbegin",logEvent)
player.addEventListener("interruptend",logEvent)
player.addEventListener("loadeddata",logEvent)
player.addEventListener("loadedmetadata",logEvent)
player.addEventListener("loadstart",logEvent)
player.addEventListener("pause",logEvent)
player.addEventListener("play",logEvent)
player.addEventListener("playing",logEvent)
player.addEventListener("ratechange",logEvent)
player.addEventListener("seeked",logEvent)
player.addEventListener("seeking",logEvent)
player.addEventListener("stalled",logEvent)
#player.addEventListener("progress",logEvent)
#player.addEventListener("suspend",logEvent)
#player.addEventListener("timeupdate",logEvent)
player.addEventListener("volumechange",logEvent)
player.addEventListener("waiting",logEvent)
player.addEventListener("error",logEvent)
###

###
activePlayer.addEventListener "canplay", ->
    $("#nextButton").removeClass('spin')

activePlayer.addEventListener "playing", ->
    playButton.innerHTML = "&#xf04c;"

activePlayer.addEventListener "pause", ->
    playButton.innerHTML = "&#xf04b;"


activePlayer.addEventListener "timeupdate", ->
    $('#seek').val(activePlayer.currentTime)
    $('#currentTime').text(getTimeFromSecs(activePlayer.currentTime))

activePlayer.addEventListener "progress", ->
    if activePlayer.buffered.length > 0
        buffered = (activePlayer.buffered.end(0)/activePlayer.duration)*100+"%"
        remaining = (100 - ((activePlayer.buffered.end(0)/activePlayer.duration)*100))+"%"
        $('#seek').css "background-image", "linear-gradient(to right,#278998 #{buffered},transparent #{remaining})"

activePlayer.addEventListener "ended", ->
    getRandomSong()

activePlayer.addEventListener "stalled waiting", ->
    $("#nextButton").addClass('spin')

###


$('#seek').on("input", ->
    activePlayer.pause()
    activePlayer.currentTime = $('#seek').val()
)

$('#seek').on("change", ->
    activePlayer.play()
    activePlayer.currentTime = $('#seek').val()
)

$("#nextButton").click -> 
    console.log "---------- NEXT PRESSED ----------"
    #$("#nextButton").addClass('spin')
    getRandomSong().done (obj) ->
        console.log obj
        console.log "#{new Date()} finished getRandomSong()"


$("#playButton").click -> 
    if activePlayer.paused then activePlayer.play()
    else activePlayer.pause()

$(document).ready ->
    SC.initialize client_id: client_id