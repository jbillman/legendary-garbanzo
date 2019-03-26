// grab users
let _userBrightspace = "";
let _userCanvas = "";
let syncBtn = "";
let brightBtn = "";
let canvasBtn = "";
let googleBtn = "";
// grab courses

//TODO store brightspace courses

//TODO store canvas courses

// grab assignments

//TODO grab brightspace homework

//TODO grab canvas homework

window.onload = function() {
   init();

   document.querySelector('.brightBtn').addEventListener('click', () => {
      loginBrightspace();
   });

   document.querySelector('.canvasBtn').addEventListener('click', () => {
      //Stuff goes here
   });

   googleBtn.addEventListener('click', () => {
      chrome.identity.getAuthToken({interactive: true}, token => {
         console.log(token);
      });
   });

   syncBtn.addEventListener('click', () => {
      
      console.log('sync button');
   })
};


async function init(){
   checkLoginStatus();
   brightBtn = document.querySelector('.brightBtn');
   canvasBtn = document.querySelector('.canvasBtn');
   googleBtn = document.querySelector('.googleBtn');
   syncBtn = document.querySelector('.syncBtn');
   
   try{
      loginBrightspace();
      loginCanvas();
   }
   catch(error){
      console.log(error);
   }
   console.log(_userBrightspace);
   console.log(_userCanvas);
};

function renderWelcome(username){
   let welcome = document.querySelector('.welcome');
   
   try{
      welcome.innerHTML = `Welcome, ${username}!`
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

async function loginBrightspace(){
   try{ 
      _userBrightspace = await getJSON("https://byui.brightspace.com/d2l/api/lp/1.9/users/whoami");
      renderWelcome(_userBrightspace.FirstName);

      let login = document.querySelector('.brightLogin');
      login.innerHTML = `Logged in! ✔️`;
      checkLoginStatus();
   }
   catch{
         console.log("Did not return user. Not logged in, maybe?");
         console.log("Error: " + error);
         chrome.tabs.create({url: 'https://byui.brightspace.com/d2l/home', active: true});
         checkLoginStatus();
   }
}

async function loginCanvas(){
   try {
      let url = "https://byui.instructure.com/api/v1/users/self";
      let _userCanvas = JSON.parse((await getText(url)).split(";")[1]);

      let login = document.querySelector('.canvasLogin');
      login.innerHTML = 'Logged in! ✔️'; 
      checkLoginStatus();
   } catch (error) {
      console.log("Did not return Canvas user. Not logged in, maybe?");
      console.log("Error: " + error);
      chrome.tabs.create({url: 'https://byui.instructure.com/', active: true});
      checkLoginStatus();
   }
}

function checkLoginStatus(){
   if(_userBrightspace && _userCanvas){
      syncBtn.disabled = true;
      console.log(_userBrightspace);
      syncBtn.classList('btn-secondary');
      syncBtn.classList('btn-success');
   }
}

async function getEnrollment(){

   let date = new Date().getTime();
   let results = await getJSON(`https://byui.brightspace.com/d2l/api/lp/1.9/enrollments/myenrollments/?startDateTime=${date}`);
   return results.Items;
}
   
  //Canvas token - 	10706~cJCvI2tnXLICE4JGWZTLzL3N9FjqXlf1L1cQDXudI32o7xwd8aExBrack7djOU2e