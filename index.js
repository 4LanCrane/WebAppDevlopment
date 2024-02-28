window.addEventListener("load", function () {
    //add event listener to the form
    var form = document.querySelector("#search form");
    form.addEventListener("submit", sendMessage);
  
    document.querySelector("#imageCheckbox").checked = true;
    var searchError = document.querySelector(".searchError");
    searchError.classList.add("hide");
  });
  
  async function sendMessage(evt) {
    evt.preventDefault();
  
    var userInput = document.querySelector("#searchBox").value;
    var fieldValid = true;
    var loadImages = true;
    var pageSize = document.querySelector("#resultAmountDropdown").value;
    let loading = document.querySelector("#loading");
    var searchError = document.querySelector(".searchError");
  
    console.log(pageSize);
  
    if (userInput === "" || userInput.length < 0) {
      searchError.classList.remove("hide");
      searchError.textContent = "Please enter a search term";
      fieldValid = false;
    } else {
      searchError.classList.add("hide");
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
      var resultsContainer = document.querySelector("#results");
      loading.classList.add("show");
  
      fetch(
        "https://api.vam.ac.uk/v2/objects/search?q=" +
          userInput +
          "&data_profile=full" +
          "&page_size=" +
          pageSize +
          "&images=" +
          loadImages
      )
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          
          console.log(data);
  
          searchError.classList.add("hide");
  
          var results = data.records;
  
          // log the data to the console
          console.log(data);
  
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
  
            var image =  `${result._images._iiif_image_base_url}/full/full/0/default.jpg`;
              //creates a new image element and check the src is loading or
              var img = new Image();
              img.src = image;
              img.alt = "Image of " + result._primaryTitle;
              img.onerror = function () {
                img.src = "NOIMAGE.png";
                itemContainer.appendChild(img);
              };
  
              img.onload = function () {
                itemContainer.appendChild(img);
              };
            

  
            itemContainer.addEventListener("click", function () {
             img.classList.toggle('fullsizeImage');
            });
  
            // Append the item container to the results container
            resultsContainer.appendChild(itemContainer);
          });
  
          loading.classList.remove("show");
          resultsContainer.classList.add("show");
        })
        .catch(function (error) {
          searchError.textContent = "An error occurred" + error;
          searchError.classList.remove("hide");
          console.log(error);
        });
    }
  }
  