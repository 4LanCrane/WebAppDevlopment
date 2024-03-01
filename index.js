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
    resultsContainer.classList.add("hide");
    loading.classList.add("showLoad");

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


        //check if the results array is empty
        if(results.length === 0){
          searchError.textContent = "No results found";
          searchError.classList.remove("hide");
          loading.classList.remove("showLoad");
          return;
        }

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
          itemContainer.classList.add("item");;

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
          // Set description to the summary description and remove any HTML tags
          var fullDescription = result.summaryDescription.replaceAll(
            /<[^>]*>?/gm,
            ""
          );
          var shortDescription = fullDescription.substring(0, 300) + "...";
          description.textContent = shortDescription;

          if (result.summaryDescription === "") {
            description.textContent = "No description available";
          }



          itemContainer.appendChild(description);

          var image = `${result._images._iiif_image_base_url}/full/full/0/default.jpg`;
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

        

          //when the item container is clicked, open myModal
          itemContainer.addEventListener("click", function () {
            var modal = document.getElementById("myModal");
            modal.classList.add("block");
            var modelContent = document.querySelector(".modal-content");

            //create a  h2 element for the title
            var title = document.createElement("h2");
            title.textContent = result._primaryTitle; 
            modelContent.appendChild(title);


            //create a p element for the date
            var date = document.createElement("p");
            date.textContent = "Date: " + result._primaryDate;
            modelContent.appendChild(date);


            var description = document.createElement("p");
            description.textContent = fullDescription;
            modelContent.appendChild(description);

          var img = document.createElement("img");
          img.classList.add("fullsizeImage");
          img.src = `${result._images._iiif_image_base_url}/full/full/0/default.jpg`;
          img.alt = "Image of " + result._primaryTitle;
          img.onerror = function () {
            img.src = "NOIMAGE.png";
            modelContent.appendChild(img);
          }   
          img.onload = function () {  
            modelContent.appendChild(img);
          }


            
            // Get the <span> element that closes the modal
            var span = document.getElementsByClassName("close")[0];
            // When the user clicks on <span> (x), close the modal
            span.onclick = function () {
              modal.classList.remove("block");
              modelContent.removeChild(description);
              modelContent.removeChild(date);
              modelContent.removeChild(title);
              modelContent.removeChild(img);
            };

          
          });

          // Append the item container to the results container
          resultsContainer.appendChild(itemContainer);
        });

        loading.classList.remove("showLoad");
        resultsContainer.classList.remove("hide");
      })
      .catch(function (error) {
        searchError.textContent = "An error occurred" + error;
        searchError.classList.remove("hide");
        console.log(error);
      });
  }
}
