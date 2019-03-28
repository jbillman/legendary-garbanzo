
let _userBrightspace = null;
let _userCanvas = null;
let _userGoogle = null;

let syncBtn = null;
let brightBtn = null;
let canvasBtn = null;
let googleBtn = null;

let brightLogin = null;
let canvasLogin = null;
let googleLogin = null;

let _brightCourses = [];
let _canvasCourses = [];

//TODO store brightspace courses

//TODO store canvas courses

// grab assignments

//TODO grab brightspace homework

//TODO grab canvas homework

window.onload = function() {
   init();

   brightBtn.addEventListener('click', () => {
      loginBrightspace();
   });

   canvasBtn.addEventListener('click', () => {
      loginCanvas();
   });

   googleBtn.addEventListener('click', () => {
      chrome.identity.getAuthToken({interactive: true}, token => {
         console.log(token);
      });
   });

   syncBtn.addEventListener('click', () => {
      getEnrollment();
      getCanvasEnrollment();
   })
};


async function init(){
   brightBtn = document.querySelector('.brightBtn');
   canvasBtn = document.querySelector('.canvasBtn');
   googleBtn = document.querySelector('.googleBtn');
   syncBtn = document.querySelector('.syncBtn');
   
   brightLogin = document.querySelector('.brightLogin');
   canvasLogin = document.querySelector('.canvasLogin');
   googleLogin = document.querySelector('.googleLogin');

   await checkLoginStatus();
   renderWelcome();
};

function renderWelcome(){
   let username = _userBrightspace || _userCanvas || _userGoogle;
   let welcome = document.querySelector('.welcome');
   if(username != null){
      welcome.innerHTML = `Welcome, ${username}!`;
   }else{
      welcome.innerHTML = `Welcome, please log in!`;
   }      
   
} 

function getJSON(url){
   return fetch(url)
      .then(response =>{
         if(response.ok){
            return response.json();
         }
         else{
            throw Error(response.statusText);
         }
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
   //FIXME Not woking properly when logged off.
   try{ 
      chrome.tabs.create({url: 'https://byui.brightspace.com/d2l/home', active: true});
   }catch(error){
      console.log("Did not return user. Not logged in, maybe?");
      console.log("Error: " + error);      
   }
}

async function loginCanvas(){
   try {
      let url = "https://byui.instructure.com/api/v1/users/self";
      _userCanvas = JSON.parse((await getText(url)).split(";")[1]).name;
      // console.log(_userCanvas);
      showLoggedIn(canvasLogin, canvasBtn);
      checkLoginStatus();
   } catch (error) {
      console.log("Did not return Canvas user. Not logged in, maybe?");
      console.log("Error: " + error);
      chrome.tabs.create({url: 'https://byui.instructure.com/', active: false});
      showNotLoggedIn(canvasLogin,canvasBtn);
      checkLoginStatus();
   }
}

function showLoggedIn(element,btn){
   element.innerHTML = 'Logged in! ✔️'; 
   btn.style.visibility = "hidden";
}

function showNotLoggedIn(element,btn){
   element.innerHTML = 'Not logged in! ❌'
   btn.style.visibility = 'visible';
}

async function checkLoginStatus(){
   if(_userBrightspace == null){
      try{
         let user =  await getJSON("https://byui.brightspace.com/d2l/api/lp/1.9/users/whoami");
         //console.log(user);
         _userBrightspace = user.FirstName;
         showLoggedIn(brightLogin, brightBtn);
      }catch(error){
         showNotLoggedIn(brightLogin, brightBtn);
         console.log(error);
      }
   }
   
   if(_userCanvas == null){
      let response =  await getText("https://byui.instructure.com/api/v1/users/self");
      let name = JSON.parse(response.split(";")[1]).name;
      _userCanvas = name;
      if(_userCanvas != null){
         showLoggedIn(canvasLogin, canvasBtn);
      }
   }else{
      showLoggedIn(canvasLogin, canvasBtn);
   }
   
   let test = false;
   if(_userBrightspace && _userCanvas){
      test = true;
   };

   if(_userBrightspace != null && _userCanvas != null){
      syncBtn.disabled = false;
      syncBtn.classList.remove('btn-secondary');
      syncBtn.classList.add('btn-success');
   }
}

async function getEnrollment(){
   let startDate = new Date();
   let endDate = new Date();
   startDate.setMonth(startDate.getMonth() - 3);
   endDate.setMonth(endDate.getMonth() + 3);
   
   let testDate = new Date()

   console.log(`Start Date: ${startDate}, End Date: ${endDate}`);
   console.log(`https://byui.brightspace.com/d2l/api/lp/1.9/enrollments/myenrollments/?orgUnitTypeId=3&sortBy=-EndDate&startDateTime=${testDate.toISOString()}&endDateTime=${endDate.toISOString()}`)
   
   await getJSON(`https://byui.brightspace.com/d2l/api/lp/1.9/enrollments/myenrollments/?orgUnitTypeId=3&sortBy=-EndDate&startDateTime=${testDate.toISOString()}&endDateTime=${endDate.toISOString}`)
   .then( results =>{
      let array = [];
      for(let item of results.Items){
         if(item.Access.StartDate != null || item.Access.EndDate != null){
            let temp = {};
            temp.name = item.OrgUnit.Name;
            temp.id = item.OrgUnit.Id;
            array.push(item);
         }
      }
      //TODO Store only the relevant data from the query into an array of objects;
      console.log(array);
      
      
      console.log(results);
   })
   .catch(error => {
      console.log(error);
   })
   
}
async function getCanvasEnrollment(){
   
   await getText("https://byui.instructure.com/api/v1/users/self/enrollments")
   .then( results => {
      console.log(JSON.parse(results.split(";")[1]));
     
   })
   .catch(error => {
      console.log(error);
   })

}