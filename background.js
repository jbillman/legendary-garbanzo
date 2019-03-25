// grab users

//TODO store brightspace user

//TODO store canvas user

// grab courses

//TODO store brightspace courses

//TODO store canvas courses

// grab assignments

//TODO grab brightspace homework

//TODO grab canvas homework

window.onload = function() {
   init();
   document.querySelector('.googleLogin').addEventListener('click', function() {
      chrome.identity.getAuthToken({interactive: true}, function(token) {
         console.log(token);
      });
   });

   document.querySelector('.brightLogin').addEventListener('click', function(){
      displayUser();
      let enrollment = getEnrollment();
      console.log(enrollment);
    })

   document.querySelector('.canvasLogin').addEventListener('click', function() {
      //Stuff goes here
   });
};


async function init(){
   try{
      let userBright = await getUserBrightspace();
      renderWelcome(userBright.FirstName);
  
      console.log(userBright);
   }
   catch(error){
      console.log(error);
   }

   // trys to grab the user from Canvas
   try{
      let url = "https://byui.instructure.com/api/v1/users/self";
      let userCanvas = JSON.parse((await getText(url)).split(";")[1]);
      console.log(userCanvas.name) 
   }
   catch(error){
      console.log(error);
   }
};

function renderWelcome(username){
   let welcome = document.querySelector('.welcome');
   try{
      welcome.innerHTML = `Welcome, ${username}`;
   }catch{      
      welcome.innerHTML = `Welcome, please log in!`;
   }
} 

function getJSON(url){
   return fetch(url)
      .then(response =>{
         return response.json();
      })
      .catch(error => {
         console.log(error);
      });
}

function getText(url){
   return fetch(url)
      .then(response =>{
         return response.text();
      })
      .catch(error => {
         console.log(error);
      });
}

async function getUserBrightspace(){
   try{ 
      let response = await getJSON("https://byui.brightspace.com/d2l/api/lp/1.9/users/whoami");
      
      //console.log("successfully returned user")
      //console.log(response);
         
      return response;
   }
   catch{
         console.log("Did not return user. Not logged in, maybe?")
         console.log(error);
         chrome.tabs.create({url: 'https://byui.brightspace.com/d2l/home', active: false});
   }
}

async function getEnrollment(){

   let date = new Date().getTime();
   let results = await getJSON(`https://byui.brightspace.com/d2l/api/lp/1.9/enrollments/myenrollments/?startDateTime=${date}`);
   let array = results.Items;
   return array;
}
   //TODO Test if User is logged into brightspace and canvas

   //TODO create list of courses

   //TODO use list of courses to grab list of assignments.
   
  //Canvas token - 	10706~cJCvI2tnXLICE4JGWZTLzL3N9FjqXlf1L1cQDXudI32o7xwd8aExBrack7djOU2e