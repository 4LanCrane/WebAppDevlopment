window.addEventListener("load", function() {
  //add event listener to the form
  var form = document.querySelector("#search form");
  form.addEventListener("submit", sendMessage);
});

async function sendMessage(evt) {
  evt.preventDefault();

  var userInput = document.querySelector("#searchBox").value;
  let fieldValid = true;

  if(userInput === "" || userInput.length < 0){
    alert("Please enter a search term");
    fieldValid = false;
  }else{
    fieldValid = true;
  }


if(fieldValid){

  console.log(userInput);
  
  loading.classList.add("show");
    // Get the container where you want to display the results
    var resultsContainer = document.querySelector("#results");
    resultsContainer.classList.remove("show");


  // send a request to the server to get the data using the fetch API and the user input and store the response in a variable
  const response = await fetch('https://api.vam.ac.uk/v2/objects/search?q=' + userInput + '&data_profile=full'+'&page_size=50');
  // store the response in a variable
  const data = await response.json();
  // log the data to the console

  console.log(data);


  // create a variable to store the results
  var results = data.records;
  console.log(results);

 

  

  // Clear previous results
  while (resultsContainer.firstChild) {
    resultsContainer.removeChild(resultsContainer.firstChild);
  }

  // Iterate over the results and create HTML elements for each item
  results.forEach(result => {
    // Create a container for each item
    var itemContainer = document.createElement("div");
    itemContainer.classList.add("item");

    // Create a heading element
    var heading = document.createElement("h2");
    if(result._primaryTitle === ""){
      heading.textContent = "No title available"}else{
        heading.textContent = result._primaryTitle;
      }
    itemContainer.appendChild(heading);
    
    var date = document.createElement("p");
    if(result._primaryDate === ""){
      date.textContent = "No date available";
    }else{
      date.textContent = "Date:"+result._primaryDate;
    }
    itemContainer.appendChild(date);

   

    var image = result._images._primary_thumbnail;
    if(image === undefined){
      var notAvailable = document.createElement("p");
      notAvailable.textContent = "No image available";  
      itemContainer.appendChild(notAvailable);
    }else{
      var image = document.createElement("img");
      image.src = result._images._primary_thumbnail;
      itemContainer.appendChild(image);
    }

    var descriptionTitle = document.createElement("h3");
    descriptionTitle.textContent = "Description";
    itemContainer.appendChild(descriptionTitle);


  var description = document.createElement("p");
    if(result.summaryDescription === ""){
      description.textContent = "No description available";
    }else{

      //check if the description text content contains <br> and </br> and replace it with a space
      if(result.summaryDescription.includes("<br>")){
        result.summaryDescription = result.summaryDescription.replace(/<br>/g, " ");
      }
    
      //check if the description text content contains <b> and </b> and replace it with a space
      if(result.summaryDescription.includes("<b>")){
        result.summaryDescription = result.summaryDescription.replace(/<b>/g, "(");
        
      }
      //check if the description text content contains </b> and </b> and replace it with a space
      if(result.summaryDescription.includes("</b>")){
        result.summaryDescription = result.summaryDescription.replace(/<\/b>/g, ")");
      }
   
      

      description.textContent = result.summaryDescription;
    }

 

  itemContainer.appendChild(description);

 



    // Append the item container to the results container
    resultsContainer.appendChild(itemContainer);
  });

  loading.classList.remove("show");
  resultsContainer.classList.add("show");

}
 
}
