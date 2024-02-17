window.addEventListener("load", function() {
  //add event listener to the form
  var form = document.querySelector("#search form");
  form.addEventListener("submit", sendMessage);
});

async function sendMessage(evt) {
  evt.preventDefault();

  var userInput = document.querySelector("#searchBox").value;

  console.log(userInput);

  // send a request to the server to get the data using the fetch API and the user input and store the response in a variable
  const response = await fetch('https://api.vam.ac.uk/v2/objects/search?q=' + userInput);
  // store the response in a variable
  const data = await response.json();
  // log the data to the console

  console.log(data);

  // create a variable to store the results
  var results = data.records;
  console.log(results);

   // Get the container where you want to display the results
  var resultsContainer = document.querySelector("#results");

  // Clear previous results
  resultsContainer.innerHTML = "";

  // Iterate over the results and create HTML elements for each item
  results.forEach(result => {
    // Create a container for each item
    var itemContainer = document.createElement("div");
    itemContainer.classList.add("item");

    // Create an image element
    var image = document.createElement("img");
    image.src = result._images._primary_thumbnail;
    itemContainer.appendChild(image);

    // Append the item container to the results container
    resultsContainer.appendChild(itemContainer);
  });



 
}
