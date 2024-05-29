const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const mainContent = document.getElementById("mainContent");
const spinner = document.getElementById("spinner");
const errorModal = document.getElementById("errorModal");
const errorMessage = document.getElementById("errorMessage");
const closeSpan = document.getElementsByClassName("close")[0];
const apiKey = "a5589223";
let searchResults = [];
let isFirstSearch = true;

// Llamar a searchMovies al cargar la página
window.addEventListener("load", searchMovies);

searchButton.addEventListener("click", searchMovies);
searchInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    searchMovies();
  }
});

closeSpan.onclick = function () {
  errorModal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target === errorModal) {
    errorModal.style.display = "none";
  }
};

// Función para manejar la navegación hacia atrás
window.addEventListener("popstate", function (event) {
  if (event.state && event.state.searchResults) {
    displayMovies(event.state.searchResults);
  } else {
    // Si no hay resultados en el estado de la historia, volver a realizar la búsqueda
    searchMovies();
  }
});

function searchMovies() {
  let searchTerm = searchInput.value.trim();

  if (isFirstSearch && searchTerm === "") {
    searchTerm = "war";
    isFirstSearch = true;
  }

  const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(
    searchTerm
  )}`;

  mainContent.innerHTML = "";
  spinner.style.display = "block"; 

  setTimeout(() => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.Response === "True") {
          searchResults = data.Search;
          displayMovies(searchResults);
          // Guardar los resultados de búsqueda en el historial de navegación
          history.pushState({ searchResults: searchResults }, null, null);
        } else {
          displayError(data.Error);
        }
      })
      .catch((error) => {
        displayError("Ocurrió un error al conectar con la API.");
      })
      .finally(() => {
        spinner.style.display = "none";
      });
  }, 1000);
}

function displayMovies(movies) {
  errorMessage.textContent = "";
  errorModal.style.display = "none";
  mainContent.innerHTML = ""; // 

  movies.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.className = "movie-card";

    const movieTitle = document.createElement("h2");
    movieTitle.textContent = `${movie.Title} (${movie.Year})`;

    const moviePoster = document.createElement("img");
    moviePoster.src = movie.Poster !== "N/A" ? movie.Poster : "placeholder.png"; 
    moviePoster.alt = `${movie.Title} Poster`;

    movieCard.appendChild(moviePoster);
    movieCard.appendChild(movieTitle);

    movieCard.addEventListener("click", () => {
      displayMovieDetails(movie);
    });

    mainContent.appendChild(movieCard);
  });
}

function displayMovieDetails(movie) {
  mainContent.innerHTML = ""; // Limpiar resultados anteriores

  const movieDetails = document.createElement("div");
  movieDetails.className = "movie-details";

  const movieTitle = document.createElement("h2");
  movieTitle.textContent = `${movie.Title} (${movie.Year})`;

  const moviePoster = document.createElement("img");
  moviePoster.src = movie.Poster !== "N/A" ? movie.Poster : "placeholder.png";
  moviePoster.alt = `${movie.Title} Poster`;

  const moviePlot = document.createElement("p");
  moviePlot.textContent = "Cargando detalles...";

  const backButton = document.createElement("button");
  backButton.textContent = "Regresar";
  backButton.addEventListener("click", () => {
    displayMovies(searchResults);
    history.pushState({ searchResults: searchResults }, null, null);
  });

  movieDetails.appendChild(moviePoster);
  movieDetails.appendChild(movieTitle);
  movieDetails.appendChild(moviePlot);
  movieDetails.appendChild(backButton);

  mainContent.appendChild(movieDetails);

  // Obtener detalles de la película
  fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`)
    .then((response) => response.json())
    .then((details) => {
      // Actualizar la descripción de la película una vez que se obtienen los detalles
      moviePlot.textContent = details.Plot;
    })
    .catch((error) => {
      displayError("Ocurrió un error al obtener los detalles de la película.");
    });
}

function displayError(message) {
  errorMessage.textContent = message;
  errorModal.style.display = "block";
}
