window.addEventListener("load", function () {
    //add event listener to the form
    var form = document.querySelector("#search form");
    form.addEventListener("submit", sendMessage);
    document.querySelector("#imageCheckbox").checked = true;
    var searchError = document.querySelector(".searchError");
    searchError.classList.add("hide");
});

async function sendMessage(evt) {
    // Prevent the form from submitting
    evt.preventDefault();
    var userInput = document.querySelector("#searchBox").value;
    var fieldValid = true;
    var loadImages = true;
    var pageSize = document.querySelector("#resultAmountDropdown").value;
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
        var resultsContainer = document.querySelector("#results");
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
                var results = data.records;

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

                    // Create a paragraph element for the date
                    var date = document.createElement("p");
                    if (result._primaryDate === "") {
                        date.textContent = "No date available";
                    } else {
                        date.textContent = "Date:" + result._primaryDate;
                    }
                    itemContainer.appendChild(date);

                    // Create a paragraph element for the description
                    var descriptionTitle = document.createElement("h3");
                    descriptionTitle.textContent = "Description";
                    itemContainer.appendChild(descriptionTitle);

                    var description = document.createElement("p");
                    // Set description to the summary description and remove any HTML tags
                    var fullDescription = result.summaryDescription.replaceAll(
                        /<[^>]*>?/gm,
                        ""
                    );
                    // If the description is longer than 300 characters, shorten it and add an ellipsis
                    var shortDescription =
                        fullDescription.substring(0, 100) + "...";
                    description.textContent = shortDescription;

                    // If the description is empty, display a message
                    if (result.summaryDescription === "") {
                        description.textContent = "No description available";
                    }
                    itemContainer.appendChild(description);

                    // Create a paragraph element for the click for more text
                    var clickForMore = document.createElement("p");
                    clickForMore.textContent = "Click for more";
                    clickForMore.classList.add("clickForMore");
                    itemContainer.appendChild(clickForMore);

                    var image = `${result._images._iiif_image_base_url}/full/full/0/default.jpg`;
                    //creates a new image element and check the src is loading or display a default image
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

                    //function to display the full size image and description when the user clicks on the item using a modal/popup
                    itemContainer.addEventListener("click", function () {
                        var modal = document.querySelector("#popup");
                        var modelContent =
                            document.querySelector("#modalContent");
                        modal.classList.add("block");
                        modelContent.classList.remove("close");
                        modelContent.classList.add("open");
                        var title = document.createElement("h2");
                        title.textContent = result._primaryTitle;
                        modelContent.appendChild(title);

                        var date = document.createElement("p");
                        date.textContent = "Date: " + result._primaryDate;
                        if (result._primaryDate === "") {
                            date.textContent = "No date available";
                        }
                        modelContent.appendChild(date);

                        var description = document.createElement("p");
                        description.textContent = fullDescription;
                        if (result.summaryDescription === "") {
                            description.textContent =
                                "No description available";
                        }
                        modelContent.appendChild(description);

                        var img = document.createElement("img");
                        img.classList.add("fullsizeImage");
                        img.src = `${result._images._iiif_image_base_url}/full/full/0/default.jpg`;
                        img.alt = "Image of " + result._primaryTitle;
                        img.onerror = function () {
                            img.src = "NOIMAGE.png";
                            modelContent.appendChild(img);
                        };
                        img.onload = function () {
                            modelContent.appendChild(img);
                        };

                        // Gets the x button that closes the modal
                        var span = document.querySelector(".closeButton");
                        //when the user clicks on the x button, the modal is closed
                        span.onclick = function () {
                            modelContent.classList.remove("open");
                            modelContent.classList.add("close");
                            setTimeout(function () {
                                modal.classList.remove("block");
                                modelContent.removeChild(description);
                                modelContent.removeChild(date);
                                modelContent.removeChild(title);
                                modelContent.removeChild(img);
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
