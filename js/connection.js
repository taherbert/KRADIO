var client_id,container,currentTime,endTime,exclude_tags,getActivePlayer,getRandomSong,getReadyPlayer,getTimeFromSecs,hangul,hangul_chars,logEvent,nextButton,pad,playButton,playNext,player_five,player_four,player_one,player_three,player_two,preparePlayer,priority_tags,seek,setActivePlayer,song_title,top_queries,__indexOf=[].indexOf||function(item){for(var i=0,l=this.length;l>i;i++)if(i in this&&this[i]===item)return i;return-1};client_id="2721807f620a4047d473472d46865f14",priority_tags=["kpop","k pop","k-pop","korean","korea"],exclude_tags=["cover","acoustic","instrumental","remix","mix","re mix","re-mix","version","ver.","cvr"],hangul_chars="[ᄀ-ᇿ|㄰-㆏|ꥠ-꥿|가-힯|ힰ-퟿]",hangul=new RegExp(hangul_chars),top_queries=["Madtown YOLO","VIXX Error","BTOB You're so fly","PSY Hangover","Boyfriend Witch","Raina You End And Me","Song Ji Eun Don't look at me like that","Ailee Don't touch me"],player_one=document.getElementById("player_one"),player_two=document.getElementById("player_two"),player_three=document.getElementById("player_three"),player_four=document.getElementById("player_four"),player_five=document.getElementById("player_five"),song_title=document.getElementById("title"),container=document.getElementById("container"),playButton=document.getElementById("playButton"),nextButton=document.getElementById("nextButton"),seek=document.getElementById("seek"),currentTime=document.getElementById("currentTime"),endTime=document.getElementById("endTime"),pad=function(d){return 10>d?"0"+d.toString():d.toString()},getTimeFromSecs=function(secs){var minString,minutes,secString,seconds;return minutes=secs/60,seconds=minutes%1*60,minString=Math.floor(minutes),secString=Math.floor(seconds),""+minString+":"+pad(secString)},logEvent=function(event){var time;return time=(new Date).toTimeString().split(" ")[0],console.log(""+time+" || "+event.target.id+" - "+event.type)},playNext=function(){var current,next;return current=getActivePlayer(),current.pause(),preparePlayer(current),next=getReadyPlayer(),setActivePlayer(next),next.play()},setActivePlayer=function(player){var isActive,p,players,_i,_len;for(players=document.getElementsByTagName("audio"),_i=0,_len=players.length;_len>_i;_i++)p=players[_i],isActive=p.classList.contains("active"),p===player&&isActive!==!0?(p.classList.add("active"),p.classList.remove("ready")):p.classList.remove("active");return song_title.innerHTML=player.getAttribute("title"),endTime.innerHTML=getTimeFromSecs(player.getAttribute("duration")/1e3),seek.setAttribute("max",player.getAttribute("duration")/1e3),container.style.background="url("+player.getAttribute("artwork")+") no-repeat center center fixed",container.style["background-size"]="cover",player.addEventListener("timeupdate",function(){return seek.value=this.currentTime,currentTime.innerHTML=getTimeFromSecs(this.currentTime)}),player.addEventListener("playing",function(){return playButton.innerHTML="&#xf04c;"}),player.addEventListener("pause",function(){return playButton.innerHTML="&#xf04b;"}),player.addEventListener("ended",function(){return playNext()}),player.play()},getActivePlayer=function(){return document.getElementsByClassName("active")[0]},getReadyPlayer=function(){var players,selected;return players=document.getElementsByClassName("ready"),selected=players[Math.floor(Math.random()*players.length)]},preparePlayer=function(player){var dfd;return player.classList.remove("ready"),player.removeEventListener("progress"),player.removeEventListener("timeupdate"),player.removeEventListener("playing"),player.removeEventListener("pause"),player.removeEventListener("ended"),dfd=$.Deferred(),getRandomSong().done(function(song){player.src=song.stream_url,player.setAttribute("title",song.title),player.setAttribute("artwork",song.artwork),player.setAttribute("query",song.query),player.setAttribute("duration",song.duration),player.classList.add("ready"),dfd.resolve(player)}),dfd.promise()},getRandomSong=function(){var dfd,selected_song;return selected_song=top_queries[Math.floor(Math.random()*top_queries.length)],dfd=$.Deferred(),SC.get("/tracks",{q:selected_song,limit:200},function(tracks){var add_criteria,approved_songs,artwork,blacklisted,duration,genre,priority_songs,ret_song,sURL,song,stream_url,tag,tag_list,tags,term,title,track,untagged_songs,_i,_j,_k,_l,_len,_len1,_len2,_len3,_len4,_len5,_m,_n;if(null!=tracks&&0===tracks.length)return ret_song=!1,dfd.resolve(ret_song),void 0;for(priority_songs=[],untagged_songs=[],approved_songs=[],_i=0,_len=tracks.length;_len>_i;_i++){for(song=tracks[_i],blacklisted=0,genre=null==song.genre?"":song.genre.toLowerCase(),title=null==song.title?"":song.title.toLowerCase(),sURL=null==song.stream_url?"":song.stream_url,null==song.tag_list?tags=[]:tag_list=song.tag_list.toLowerCase().split(" "),_j=0,_len1=exclude_tags.length;_len1>_j;_j++)term=exclude_tags[_j],-1!==title.indexOf(term)&&(blacklisted+=1);for(_k=0,_len2=exclude_tags.length;_len2>_k;_k++)for(term=exclude_tags[_k],_l=0,_len3=tag_list.length;_len3>_l;_l++)tag=tag_list[_l],-1!==tag.indexOf(term)&&(blacklisted+=1);""===sURL&&(blacklisted+=1),0===blacklisted&&approved_songs.push(song)}for(_m=0,_len4=approved_songs.length;_len4>_m;_m++){if(song=approved_songs[_m],genre=null==song.genre?"":song.genre.toLowerCase(),title=null==song.title?"":song.title.toLowerCase(),null==song.tag_list?tags=[]:tag_list=song.tag_list.toLowerCase().split(" "),add_criteria=0,__indexOf.call(priority_tags,genre)>=0&&(add_criteria+=1),tag_list.length>0)for(_n=0,_len5=tag_list.length;_len5>_n;_n++)tag=tag_list[_n],__indexOf.call(priority_tags,tag)>=0&&__indexOf.call(exclude_tags,tag)<0&&(add_criteria+=1);hangul.test(title)===!0&&(add_criteria+=1),add_criteria>0?priority_songs.push(song):untagged_songs.push(song)}priority_songs.length>0?(priority_songs.sort(function(a,b){var keyA,keyB;return keyA=a.playback_count,keyB=b.playback_count,keyA>keyB?-1:keyB>keyA?1:0}),track=priority_songs[0],artwork=track.artwork_url.replace("-large","-t500x500"),title=track.title,duration=track.duration,stream_url=track.stream_url):untagged_songs.length>0&&(untagged_songs.sort(function(a,b){var keyA,keyB;return keyA=a.playback_count,keyB=b.playback_count,keyA>keyB?-1:keyB>keyA?1:0}),track=untagged_songs[0],artwork=track.artwork_url.replace("-large","-t500x500"),title=track.title,stream_url=track.stream_url,duration=track.duration),ret_song=null!=stream_url?{artwork:artwork,title:title,duration:duration,stream_url:stream_url+"?client_id="+client_id,query:selected_song}:!1,dfd.resolve(ret_song)}),dfd.promise()},$(document).ready(function(){return SC.initialize({client_id:client_id}),seek.addEventListener("change",function(){var current;return current=getActivePlayer(),current.play(),current.currentTime=seek.value}),seek.addEventListener("input",function(){var current;return current=getActivePlayer(),current.pause(),current.currentTime=seek.value}),nextButton.addEventListener("click",function(){return playNext()}),playButton.addEventListener("click",function(){var active;return active=getActivePlayer(),active.paused?active.play():active.pause()}),preparePlayer(player_one).done(function(player){return setActivePlayer(player),preparePlayer(player_two).done(function(){return preparePlayer(player_three).done(function(){return preparePlayer(player_four).done(function(){return preparePlayer(player_five).done})})})})});