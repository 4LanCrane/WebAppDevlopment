window.addEventListener("load", function () {
  //add event listener to the form
  var form = document.querySelector("#search form");
  form.addEventListener("submit", sendMessage);

  document.querySelector("#imageCheckbox").checked = true;
  document.querySelector("#descriptionCheckbox").checked = true;
});

async function sendMessage(evt) {
  evt.preventDefault();

  var userInput = document.querySelector("#searchBox").value;
  let fieldValid = true;
  let loadImages = true;
  let pageSize = document.querySelector("#resultAmountDropdown").value;

  console.log(pageSize);

  if (userInput === "" || userInput.length < 0) {
    alert("Please enter a search term");
    fieldValid = false;
  } else {
    fieldValid = true;
  }

  if (document.getElementById("imageCheckbox").checked) {
    loadImages = true;
  } else {
    loadImages = false;
  }

  if (fieldValid) {
    console.log(userInput);
    // send a request to the server to get the data using the fetch API and the user input and store the response in a variable
    const response = await fetch(
      "https://api.vam.ac.uk/v2/objects/search?q=" +
        userInput +
        "&data_profile=full" +
        "&page_size=" +
        pageSize +
        "&images=" +
        loadImages
    ).catch(function (error) {
      console.log(
        "There has been a problem with your fetch operation: " + error.message
      );
      alert(
        "There has been a problem with your fetch operation: " + error.message
      );
    });

    //if the responce is okay do the following
    if (response.ok) {
      //show the loading spinner
      loading.classList.add("show");
      //hide the results container
      var resultsContainer = document.querySelector("#results");
      resultsContainer.classList.remove("show");
    }

    // store the response in a variable
    const data = await response.json();

    // log the data to the console
    console.log(data);

    // create a variable to store the results
    var results = data.records;

    // log the results to the console
    console.log(results);

    // Clear previous results
    while (resultsContainer.firstChild) {
      resultsContainer.removeChild(resultsContainer.firstChild);
    }

    // Iterate over the results and create HTML elements for each item
    results.forEach((result) => {
      // Create a container for each item
      var itemContainer = document.createElement("div");
      itemContainer.classList.add("item");

      // Create a heading element
      var heading = document.createElement("h2");
      if (result._primaryTitle === "") {
        heading.textContent = "No title available";
      } else {
        heading.textContent = result._primaryTitle;
      }
      itemContainer.appendChild(heading);

      var date = document.createElement("p");
      if (result._primaryDate === "") {
        date.textContent = "No date available";
      } else {
        date.textContent = "Date:" + result._primaryDate;
      }
      itemContainer.appendChild(date);
     
      var descriptionTitle = document.createElement("h3");
      descriptionTitle.textContent = "Description";
      itemContainer.appendChild(descriptionTitle);

      var description = document.createElement("p");

      // set description to the summary description and remove any html tags
      description.textContent = result.summaryDescription.replaceAll(
        /<[^>]*>?/gm,
        ""
      );
      if (result.summaryDescription === "") {
        description.textContent = "No description available";
      }
      itemContainer.appendChild(description);


      var image = result._images._primary_thumbnail;
      if (image === undefined) {
        var noImage = document.createElement("p");
        noImage.textContent = "No image available";
        itemContainer.appendChild(noImage);
      }else{
       //now create a new image element and check the src is loading  
      var img = new Image();
      img.src = image;
      img.onerror = function(){
        itemContainer.removeChild(img);
        var noImage = document.createElement("p");
        noImage.textContent = "(Image failed to load)";
        itemContainer.appendChild(noImage);
      };

      img.onload = function(){
        itemContainer.appendChild(img);
      };}

      // Append the item container to the results container
      resultsContainer.appendChild(itemContainer);
    });

    loading.classList.remove("show");
    resultsContainer.classList.add("show");
  }
}
