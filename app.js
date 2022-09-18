const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const app = express();
app.use(express.json());

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB is Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDBObject = (dbObjectItem) => {
  return {
    movieName: dbObjectItem.movie_name,
  };
};

//Get Movies API1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT * FROM movie;
    `;
  const MoviesArray = await db.all(getMoviesQuery);
  response.send(MoviesArray.map((eachMovies) => convertDBObject(eachMovies)));
});

//ADD Movie API2
app.post("/movies/", async (request, response) => {
  const moviesDetails = request.body;
  const { directorId, movieName, leadActor } = moviesDetails;
  const addMovieQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES (
        ${directorId}, 
        '${movieName}', 
        '${leadActor}'
    )
    `;
  const dbResponse = await db.run(addMovieQuery);
  response.send(`Movie Successfully Added`);
});

//GET Movie API3
const ConvertMovieDbAPI3 = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailsQuery = `select * from movie where movie_id = ${movieId};`;
  const getMovieDetailsQueryResponse = await db.get(getMovieDetailsQuery);
  response.send(ConvertMovieDbAPI3(getMovieDetailsQueryResponse));
});

//PUT Movies API4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetailsUpdateQuery = request.body;
  const { directorId, movieName, leadActor } = movieDetailsUpdateQuery;
  const updateMovieQuery = `
    UPDATE movie SET
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
        WHERE movie_id = ${movieId};
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete Movies API5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId};
    `;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//API 6
//Returns a list of all directors in the director table
const convertDirectorDbAPI6 = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `select * from director;`;
  const getDirectorsQueryResponse = await db.all(getDirectorsQuery);
  response.send(
    getDirectorsQueryResponse.map((eachItem) => convertDirectorDbAPI6(eachItem))
  );
});

//API 7
//Returns a list of all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesByDirectorQuery = `select movie_name as movieName from movie where 
  director_id = ${directorId};`;
  const getMoviesByDirectorQueryResponse = await db.all(
    getMoviesByDirectorQuery
  );
  response.send(getMoviesByDirectorQueryResponse);
});

module.exports = app;
