import { useEffect, useState } from "react";
import StarRating from "./starRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "fec27eea";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const onSelectMovie = (id) => {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  };

  const onCloseMovie = () => {
    setSelectedId(null);
  };

  const handleAddWatched = (movie) => {
    setWatched((watched) => [...watched, movie]);
  };

  const handleDeleteWatched = (id) => {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  };

  useEffect(
    function () {
      if (query.length === 0) {
        onCloseMovie();
      }

      const controller = new AbortController();

      setIsLoading(true);
      setError("");
      async function dataMovies() {
        try {
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error("something went wrong when fetching data");

          const data = await res.json();
          if (data.Response === "False") throw new Error("movies is not found");
          setMovies(data.Search);
          setError("");
        } catch (err) {
          setError(err.message);
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        setIsLoading(false);
        return;
      }
      onCloseMovie();
      dataMovies(); // excute the fetch data
      return function () {
        //to cancel current request each time that a new one coms in
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <NavBar>
        {" "}
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />{" "}
      </NavBar>
      <Main>
        <Box>
          {/* {isLoading ? <Loading /> : <MovieList movies={movies} />} */}
          {isLoading && <Loading />}
          {!isLoading && !error && (
            <MovieList onSelectMovie={onSelectMovie} movies={movies} />
          )}
          {error && <ErrorMsssage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              onAddWatched={handleAddWatched}
              selectedId={selectedId}
              onCloseMovie={onCloseMovie}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                onDeleteWatched={handleDeleteWatched}
                watched={watched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function ErrorMsssage({ message }) {
  return (
    <p className="error">
      <span> ❌ {message} ❌</span>{" "}
    </p>
  );
}

function Loading() {
  return <span className="loader">L &nbsp; ading</span>;
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      {" "}
      <Logo /> {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResult({ movies }) {
  const numMovie = movies.length;
  return (
    <p className="num-results">
      Found <strong>{numMovie}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ onSelectMovie, movies }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie onSelectMovie={onSelectMovie} key={movie.imdbID} movie={movie} />
      ))}
    </ul>
  );
}
function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ watched, onAddWatched, selectedId, onCloseMovie }) {
  const [isLoading, setIsLoading] = useState(false);
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState("");

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  // const watchedUserRating = watched.find(
  //   (movie) => movie.imdbID === selectedId
  // )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Relesed: released,
    Genre: genre,
  } = movie;

  const handleAddWatched = () => {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      userRating,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie(null);
  };

  useEffect(
    function () {
      document.addEventListener("keydown", (e) => {
        if (e.code === "Enter") {
          onCloseMovie();
        }
      });
      return function () {
        document.removeEventListener("keydown", (e) => {
          if (e.code === "Enter") {
            onCloseMovie();
          }
        });
      };
    },
    [onCloseMovie]
  );

  useEffect(
    function () {
      setIsLoading(true);
      async function getMovieDetails() {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `movie | ${title}`;

      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );
  return (
    <div className="details">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {" "}
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} imdbRating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={26}
                    onSetRating={setUserRating}
                  />
                  <button onClick={handleAddWatched} className="btn-add">
                    Add to List
                  </button>
                </>
              ) : (
                <p>you rated this movie </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>starring {movie.Actor}</p>
            <p>directed by {movie.Director}</p>
          </section>{" "}
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{Number(avgImdbRating.toFixed(2))}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ onDeleteWatched, watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          onDeleteWatched={onDeleteWatched}
          key={movie.imdbID}
          movie={movie}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ onDeleteWatched, movie }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        ></button>
      </div>
    </li>
  );
}
