function calcWeight(game1, game2) {
  //this method will calculate the weight between the two game vertices based on genre, theme, etc. will give it 0 
  let indG = 0;
  let indT = 0;
  let intersectionT = [];
  let intersectionG = [];
  let intSize = 0;
  if (!(game1.themes === undefined)) {
      var game1Themes = game1.themes.length;
  } else {
    var game1Themes = 0;
  }

  if (!(game2.themes === undefined)) {
      var game2Themes = game2.themes.length;
  } else {
    var game2Themes = 0;
  }

  if (!(game1.genres === undefined)) {
      var game1Genres = game1.genres.length;
  } else {
    var game1Genres = 0;
  }

  if (!(game2.genres === undefined)) {
      var game2Genres = game2.genres.length;
  } else {
    var game2Genres = 0;
  }

  totalGenreSize = game1Genres + game2Genres;
  totalThemeSize = game1Themes + game2Themes;
  for(var i = 0; i < game1Genres; i++) {
    for(var j = 0; j < game2Genres; j++) {
      if((game1.genres)[i] === (game2.genres)[j]) {
        intersectionG.push(game2.genres[j]);
      }
    }
  }

  for(var i = 0; i < (game1Themes); i++) {
    for(var j = 0; j < (game2Themes); j++) {
      if(game1.themes[i] === game2.themes[j]) {
        intersectionT.push(game2.themes[j]);        
      }
    }
  }

  let intSize1 = intersectionG.length;
  var weight1 = 1.0 - (intSize1 / (totalGenreSize-intSize1));
  let intSize2 = intersectionT.length;
  var weight2 = 1.0 - (intSize2 / (totalThemeSize - intSize2));
  var averageWeight = (weight1 + weight2) / 2.0;
  return averageWeight;
}

function sortDistances(games) { 
  let size = games.length;
  var newGames = games;
  let minimum = 0;
  
  for(let i = 0; i < size; i++) {
    minimum = i;
    for(let j = i + 1; j < size; j++){
  if(newGames[j].distToSrc < newGames[minimum].distToSrc) {
        minimum = j;
      }
    }
    
    if (minimum != i) {
      let temp = newGames[i]; 
      newGames[i] = newGames[minimum];
      newGames[minimum] = temp;      
    }
  }
      
  return newGames; 
}

function cutNewGames(newgames) {
    let finalGames = [];
    for(var i = 0; i < 16; i++) {
      finalGames[i] = newgames[i];
    }
    
    return finalGames;
  }

class Game 
{
  constructor(id, genres, name, rating, themes, index, distToSrc) {
    this.id = id;
    this.genres = genres;
    this.themes = themes;
    this.rating = rating;
    this.name = name;
    this.index = index;
    this.distToSrc = distToSrc;
  }
}

class Graph
{
	constructor(size)
	{
		if (size <= 0)
		{
			// Invalid number of nodes
			return;
		}
		this.matrix = Array(size).fill(0).map(() => new Array(size).fill(0));
		this.size = size;
	}

	addEdge(game1, game2) {
		if (this.size > game1.index && this.size > game2.index) {
      var weight = calcWeight(game1, game2);
      if (this.size > game1.index && this.size > game2.index) {
        // Link video games
        this.matrix[game1.index][game2.index] = weight;
        this.matrix[game2.index][game1.index] = weight;
      }
	  }
  }

  BFS(srcGame, games) {
    let visited = new Array(this.size);
    let breadth = [];
    let queue = new tstl.Queue();
    queue.push(srcGame);
    while (!queue.empty()) {
      var currentGame = queue.front();
      queue.pop();
      visited[currentGame] = true;
      breadth.push(games[currentGame]);

      for (var i = 0; i < this.size; i++) {
        if(!visited[i] && this.matrix[currentGame][i] < 0.42) {
          queue.push(i);
        }
      }
    }
    
    return breadth;
  }

  dijkstra(srcGame) {
    let distances = new Array(this.size); //array of the shortest distances from every game to the source game
    let visited = new Array(this.size);//boolean array keeping track of the games visited
    for (let gameIndex = 0; gameIndex < this.size; gameIndex++) {
        distances[gameIndex] = Number.MAX_VALUE;
        visited[gameIndex] = false;
    }
    distances[srcGame] = 0; //set distance to source game equal to 0
    let ancestors = new Array(this.size);
    ancestors[srcGame] = -1;

    for (let i = 1; i < this.size; i++) {
        let closestGame = -1;
        let minDistance = Number.MAX_VALUE;
        for (let gameIndex = 0; gameIndex < this.size; gameIndex++) {
            if (!visited[gameIndex] && distances[gameIndex] < minDistance) {
                closestGame = gameIndex;
                minDistance = distances[gameIndex];
            }
        }

        // Mark the picked vertex as
        // processed
        visited[closestGame] = true;

        // Update dist value of the
        // adjacent vertices of the
        // picked vertex.
        for (let gameIndex = 0; gameIndex < this.size; gameIndex++) {
          let edgeDistance = this.matrix[closestGame][gameIndex];
              
          if (edgeDistance > 0 && ((minDistance + edgeDistance) < distances[gameIndex])) {
            ancestors[gameIndex] = closestGame;
            distances[gameIndex] = minDistance + edgeDistance;
          }
        }
      }
       
      for(var i = 0; i < distances.length; i++) {
        games[i].distToSrc = distances[i];
      }
  }
}

var games = [];
var axios = require('axios');
var tstl = require('tstl');
var data = 'fields name, total_rating, genres, themes; limit 500;\nsort total_rating desc;\nwhere total_rating_count > 100;';

var config = {
  method: 'post',
  url: 'https://api.igdb.com/v4/games',
  headers: { 
    'Client-ID': 'cbmmh3tx0muhs63khi7lveotolhtvq', 
    'Authorization': 'Bearer 62cm9pfvaenpaabv6ijwwi2hsz7v4p', 
    'Content-Type': 'text/plain'
  },
  data : data
};

axios(config)
.then(function (response) {
  for (var i = 0; i < ((response.data).length); i++) {
    const obj = response.data[i];
    var game = new Game (obj.id, obj.genres, obj.name, obj.total_rating, obj.themes, i);  
    games.push(game);
  }

  const prompt = require('prompt-sync')(); 
  let cont = true;
  
  var srcGame;
  console.log("Welcome to the Gator Game Grabber!\nTell us your favorite game!\n\ \nYou will get a personally curated list of games to add to your wishlist :)\n");
  while(cont) {
    var playedGame = prompt('Input the exact title of your favorite game: ');
    for(var i = 0; i < games.length; i++) {
      //console.log(games[i]);
      if(games[i].name === playedGame) {
        srcGame = games[i];
        cont = false;
        break;
      }
    }

    if (cont) {
      console.log("Invalid title!\n");
    } 
  }
  
  myGraph = new Graph(games.length);
  for(var i = 0; i < games.length; i++) {
    for(var j = 0; j < games.length; j++) {
      myGraph.addEdge(games[i], games[j]);
    }
  }

  console.log('Recommend with Dijkstra: 1\nRecommend with BFS: 2\n');
  var algChoice = 0;
  while(!(algChoice === '1' || algChoice === '2')) {
    console.log("Please choose a valid algorithim (1 or 2)\n");
    algChoice = prompt();
    if(algChoice === '1') {
      myGraph.dijkstra(srcGame.index);
      var newGames = new Array();
      newGames = sortDistances(games)
      mostSimilar = cutNewGames(newGames);
      console.log("Hey, Gator! Here are the top 15 most similar games to " + srcGame.name + " grabbed just for you!\n");
      for (var i = 1; i < mostSimilar.length; i++) {
        console.log((i) + ". " + mostSimilar[i].name);
        console.log("Rating: " + mostSimilar[i].rating);
        console.log("Similarity Index: " + mostSimilar[i].distToSrc  + '\n');
      }
    } else if(algChoice === '2') {
      breadth = myGraph.BFS(srcGame.index, games);
      gameSet = new Set();
      for (var i = 0; i < breadth.length; i++) {
        gameSet.add(breadth[i]);
      }

      console.log("Hey, Gator! Here are some of the most similar games to " + srcGame.name + " grabbed just for you!\n");
      const gameArr = Array.from(gameSet)
      for (var i = 1; i < 16; i++) {
        console.log(i + ". " + gameArr[i].name + '\nRating: ' + gameArr[i].rating + '\n');
      }
    }
  }
})
.catch(function (error) {
  console.log(error);
});