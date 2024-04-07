document.addEventListener("DOMContentLoaded", function () {
  const baseURL = "http://localhost:3000/films";

  // Fetch movie details for the first movie
  fetch("http://localhost:3000/films/1")
    .then((response) => response.json())
    .then((movie) => getMovieDetails(movie));

  // Function to display movie details
  function getMovieDetails(movie) {
    // Display movie details
    let filmInfo = document.getElementById("film-info");

    // Clear previous content
    filmInfo.innerHTML = "";

    // Create and set movie title
    let title = document.createElement("h2");
    title.textContent = movie.title;
    filmInfo.appendChild(title);

    let poster = document.getElementById("poster");
    poster.src = movie.poster;
    poster.alt = `${movie.title} Poster`;

    let runtime = document.getElementById("runtime");
    runtime.textContent = `Runtime: ${movie.runtime} minutes`;

    let showtime = document.getElementById("showtime");
    showtime.textContent = `Showtime: ${movie.showtime}`;

    let ticketNum = document.getElementById("ticket-num");
    ticketNum.textContent = `${movie.capacity - movie.tickets_sold} `;

    // Update buy ticket button
    let buyTicketButton = document.getElementById("buy-ticket");
    buyTicketButton.textContent =
      movie.capacity - movie.tickets_sold === 0 ? "Sold Out" : "Buy Ticket";
    buyTicketButton.disabled = movie.capacity - movie.tickets_sold === 0;

    // Add event listener to buy ticket button
    buyTicketButton.addEventListener("click", function (e) {
      e.preventDefault();
      buyTicket(movie.id);
    });
  }

  // Function to buy a ticket for a movie
  function buyTicket(movieId) {
    fetch(`${baseURL}/${movieId}`)
      .then((response) => response.json())
      .then((movie) => {
        const availableTickets = movie.capacity - movie.tickets_sold;
        if (availableTickets > 0) {
          // Reduce available tickets by 1
          const updatedTicketsSold = movie.tickets_sold + 1;
          // Update tickets_sold on the server
          fetch(`${baseURL}/${movieId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tickets_sold: updatedTicketsSold,
            }),
          })
            .then((response) => response.json())
            .then((updatedMovie) => {
              // Update UI to reflect ticket purchase
              let ticketNum = document.getElementById("ticket-num");
              ticketNum.textContent = `${
                movie.capacity - updatedMovie.tickets_sold
              }`;
              // Add ticket sale to the tickets endpoint
              addTicketSale(movieId, 1);
            });
        }
      });
  }

  // Function to record ticket sale
  function addTicketSale(movieId, numberOfTickets) {
    fetch(`${baseURL}/${movieId}/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        film_id: movieId,
        number_of_tickets: numberOfTickets,
      }),
    });
  }

  // Function to delete a film from the server
  function deleteFilm(movieId) {
    fetch(`${baseURL}/${movieId}`, {
      method: "DELETE",
    }).then(() => {
      // Remove film from UI
      let filmItemToRemove = document.querySelector(
        `#films li[data-id="${movieId}"]`
      );
      filmItemToRemove.remove();
    });
  }

  // Fetch and display all movies in the menu
  fetch(baseURL)
    .then((response) => response.json())
    .then((data) => displayMovieList(data));

  // Function to display movie list in the menu
  function displayMovieList(movies) {
    let filmsList = document.getElementById("films");
    // Clear existing list
    filmsList.innerHTML = "";
    // Iterate through each movie and create list items
    movies.forEach((movie) => {
      let li = document.createElement("li");
      li.textContent = movie.title;
      li.dataset.id = movie.id;
      li.classList.add("film", "item");
      li.addEventListener("click", function (e) {
        e.preventDefault();
        fetchAndDisplayMovieDetails(movie.id);
      });
      filmsList.appendChild(li);
      // Update ticket availability for each movie
      ticketUpdate(movie.capacity, movie.tickets_sold, li);
    });
  }

  // Function to fetch and display movie details when a movie is clicked
  function fetchAndDisplayMovieDetails(movieId) {
    fetch(`${baseURL}/${movieId}`)
      .then((response) => response.json())
      .then((movie) => getMovieDetails(movie));
  }

  // Function to update ticket availability for a movie in the menu
  function ticketUpdate(capacity, soldTicket, li) {
    let availableTicket = capacity - soldTicket;
    let tickerNum = document.querySelector("#ticket-num");
    tickerNum.textContent = `${availableTicket}`;
    let buyTicketButton = document.getElementById("buy-ticket");
    buyTicketButton.textContent =
      availableTicket === 0 ? "Sold Out" : "Buy Ticket";
    buyTicketButton.disabled = availableTicket === 0;
    if (availableTicket === 0) {
      li.classList.add("sold-out");
    } else {
      li.classList.remove("sold-out");
    }
  }

  // Add event listener to delete buttons
  document.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const movieId = button.dataset.id;
      deleteFilm(movieId);
    });
  });
});
