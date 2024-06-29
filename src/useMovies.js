import { useState, useEffect } from "react";

const KEY = "fec27eea";
export function useMovies(query, onCloseMovie) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
  return { movies, isLoading, error };
}
