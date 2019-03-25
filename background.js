window.onload = function() {
   init();
   document.querySelector('.googleLogin').addEventListener('click', function() {
      chrome.identity.getAuthToken({interactive: true}, function(token) {
         console.log(token);
      });
   });

   document.querySelector('.canvasLogin').addEventListener('click', function() {
      //Stuff goes here
   });

   document.querySelector('.brightLogin').addEventListener('click', function(){
     displayUser();
     let enrollment = getEnrollment();
     console.log(enrollment);
   })
};


async function init(){
   let user = getUserBrightspace()
   // user.then(user => {
   //    console.log(user);
   //   renderWelcome(user);
   // });
   let url = "https://byui.instructure.com/api/v1/users/self";
   //document.querySelector('.heading').innerHTML = await getText(url);
};

function renderWelcome(user){
   let welcome = document.querySelector('.welcome');
   try{
      welcome.innerHTML = `Welcome, ${user.FirstName}`;
      console.log('In try. User => ' + user);
   }catch{      
      welcome.innerHTML = `Welcome, please log in!`;
      console.log('in catch. User => ' + user);
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
      getJSON("https://byui.brightspace.com/d2l/api/lp/1.9/users/whoami")
      .then(response => {
         console.log("successfully returned user")
         console.log(response);
         
         return response;
      })
      .catch(error =>{
         console.log("Did not return user. Not logged in, maybe?")
         console.log(error);
         chrome.tabs.create({url: 'https://byui.brightspace.com/d2l/home', active: false});
      })
}

function getUserCanvas(){
   getJSON("")
}

function displayUser(){
   let user = getUserBrightspace();
   console.log(user)
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