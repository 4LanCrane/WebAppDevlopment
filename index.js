window.addEventListener("load", function () {
  //add event listener to the form
  const form = document.querySelector("#search form");
  form.addEventListener("submit", sendMessage);
  document.querySelector("#imageCheckbox").checked = true;
  const searchError = document.querySelector(".searchError");
  searchError.classList.add("hide");
});

async function sendMessage(evt) {
  // Prevent the form from submitting
  evt.preventDefault();
  const userInput = document.querySelector("#searchBox").value;
  var fieldValid = true;
  var loadImages = true;
  const pageSize = document.querySelector("#resultAmountDropdown").value;
  let loading = document.querySelector("#loading");
  var searchError = document.querySelector(".searchError");

  //check if the user has entered a search term
  if (userInput === "" || userInput.length < 0) {
    searchError.classList.remove("hide");
    searchError.textContent = "Please enter a search term";
    fieldValid = false;
  } else {
    searchError.classList.add("hide");
    fieldValid = true;
  }

  //check if the user has selected the option to load images
  if (document.querySelector("#imageCheckbox").checked) {
    loadImages = true;
  } else {
    loadImages = false;
  }

  //if the field is valid, the loading spinner is shown and the results are fetched from the API
  if (fieldValid) {
    const resultsContainer = document.querySelector("#results");
    resultsContainer.classList.add("hide");
    loading.classList.add("showLoad");

    //fetches the results from the API
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

        //creates a variable to store the results from the API
        const results = data.records;

        //check if the results array is empty
        if (results.length === 0) {
          searchError.textContent = "No results found for " + userInput;
          searchError.classList.remove("hide");
          loading.classList.remove("showLoad");
          return;
        }

        // Clear previous results
        while (resultsContainer.firstChild) {
          resultsContainer.removeChild(resultsContainer.firstChild);
        }

        // Iterate over the results and create HTML elements for each item
        results.forEach((result) => {
          // Create a container for each item
          const itemContainer = document.createElement("div");
          itemContainer.classList.add("item");

          // Create a heading element
          const heading = document.createElement("h2");
          if (result._primaryTitle === "") {
            heading.textContent = "No title available";
          } else {
            heading.textContent = result._primaryTitle;
          }
          itemContainer.appendChild(heading);

          // Create a paragraph element for the date
          const date = document.createElement("p");
          if (result._primaryDate === "") {
            date.textContent = "No date available";
          } else {
            date.textContent = "Date:" + result._primaryDate;
          }
          itemContainer.appendChild(date);

          // Create a paragraph element for the description
          const descriptionTitle = document.createElement("h3");
          descriptionTitle.textContent = "Description";
          itemContainer.appendChild(descriptionTitle);

          const description = document.createElement("p");
          // Set description to the summary description and remove any HTML tags
          const fullDescription = result.summaryDescription.replaceAll(
            /<[^>]*>?/gm,
            ""
          );
          // If the description is longer than 300 characters, shorten it and add an ellipsis
          const shortDescription = fullDescription.substring(0, 100) + "...";
          description.textContent = shortDescription;

          // If the description is empty, display a message
          if (result.summaryDescription === "") {
            description.textContent = "No description available";
          }
          itemContainer.appendChild(description);

          // Create a paragraph element for the click for more text
          const clickForMore = document.createElement("p");
          clickForMore.textContent = "Click for more";
          clickForMore.classList.add("clickForMore");
          itemContainer.appendChild(clickForMore);

          const image = `${result._images._iiif_image_base_url}/full/full/0/default.jpg`;
          //creates a new image element and check the src is loading or display a default image
          const img = new Image();
          img.src = image;
          img.alt = "Image of " + result._primaryTitle;
          if (result._primaryTitle === "") {
            img.alt = "No image title, Please see description for more details";
          }
          img.onerror = function () {
            img.src = "NOIMAGE.png";
            itemContainer.appendChild(img);
          };

          img.onload = function () {
            itemContainer.appendChild(img);
          };

          //function to display the full size image and description when the user clicks on the item using a modal/popup
          itemContainer.addEventListener("click", function () {
            const modal = document.querySelector("#popup");
            const modalContent = document.querySelector("#modalContent");
            const closeButton = document.createElement("span");
            closeButton.textContent = "X";
            closeButton.classList.add("closeButton");
            modalContent.appendChild(closeButton);
            modal.classList.add("block");
            modalContent.classList.remove("close");
            modalContent.classList.add("open");

            const title = document.createElement("h2");
            title.textContent = result._primaryTitle;
            modalContent.appendChild(title);

            const date = document.createElement("p");
            date.textContent = "Date: " + result._primaryDate;
            if (result._primaryDate === "") {
              date.textContent = "No date available";
            }
            modalContent.appendChild(date);

            const description = document.createElement("p");
            description.textContent = fullDescription;
            if (result.summaryDescription === "") {
              description.textContent = "No description available";
            }
            modalContent.appendChild(description);

            const img = document.createElement("img");
            img.classList.add("fullsizeImage");
            img.src = `${result._images._iiif_image_base_url}/full/full/0/default.jpg`;
            if (result._primaryTitle === "") {
              img.alt =
                "No image title, Please see description for more details";
            } else {
              img.alt = "large image of " + result._primaryTitle;
            }

            img.onerror = function () {
              img.src = "NOIMAGE.png";
              modalContent.appendChild(img);
            };
            img.onload = function () {
              modalContent.appendChild(img);
            };

            //when the user clicks on the x button, the modal is closed
            closeButton.onclick = function () {
              modalContent.classList.remove("open");
              modalContent.classList.add("close");
              setTimeout(function () {
                modal.classList.remove("block");
                while (modalContent.firstChild) {
                  modalContent.removeChild(modalContent.firstChild);
                }
              }, 500);
            };
          });

          // Append the item container to the results container
          resultsContainer.appendChild(itemContainer);
        });

        // Remove the loading spinner and show the results
        loading.classList.remove("showLoad");
        resultsContainer.classList.remove("hide");
      })
      //catches any errors and displays an error message to the user and logs the error to the console
      .catch(function (error) {
        searchError.textContent = "technical issue please try again later";
        searchError.classList.remove("hide");
        loading.classList.remove("showLoad");
        console.log(error);
      });
  }
}
