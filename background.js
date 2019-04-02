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

let _semester = ""

let _courses = [];


let semesters = [
      {
         name: "Winter 2019",
         startDate: new Date('January 5, 2019 0:00:00'),
         endDate: new Date('April 18, 2019 0:00:00')
      },
   
      {
         name:"Spring 2019",
         startDate: new Date('April 22, 2019 0:00:00'),
         endDate: new Date('August 1, 2019 0:00:00')
      },
   
      {
         name:"Summer 2019",
         startDate: new Date('July 29, 2019 0:00:00'),
         endDate: new Date('September 19, 2019 0:00:00')
      },
     
      {
         name:"Fall 2019",
         startDate: new Date('September 16, 2019 0:00:00'),
         endDate: new Date('December 27, 2019 0:00:00')
      },
   
      {
         name:"Winter 2020",
         startDate: new Date('January 8, 2020 0:00:00'),
         endDate: new Date('April 16, 2020 0:00:00')
      },
]

// grab assignments

//TODO grab brightspace homework

//TODO grab canvas homework

window.onload = function() {
   init();

   brightBtn.addEventListener('click', () => {
      chrome.tabs.create({url: 'https://byui.brightspace.com/d2l/home', active: true});
   });

   canvasBtn.addEventListener('click', () => {
      chrome.tabs.create({url: 'https://byui.instructure.com/', active: true});
   });

   googleBtn.addEventListener('click', () => {
      chrome.identity.getAuthToken({interactive: true}, token => {
         console.log(token);
      });
   });

   syncBtn.addEventListener('click', async () => {
      getBrightspaceEnrollment();
      await getCanvasEnrollment();
      console.log(_courses);

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

   getCurrentSemester();

   await checkLoginStatus();
   renderWelcome();
};

function renderWelcome(){
   let username = _userBrightspace || _userCanvas || _userGoogle;
   let welcome = document.querySelector('.welcome');
   let heading = document.querySelector('.heading');
   let semester = document.createElement('h5');
   semester.innerHTML = _semester.name;
   heading.appendChild(semester);
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
         if(response.ok){
            return response.text();

         }
         else{
            throw Error(response.statusText);
         }
      })
      .catch(error => {
         console.log(error);
      });
}

function getCurrentSemester(){
   let current = new Date();
   for (let semester of semesters) {
      // console.log(`Semester Start: ${semester.startDate.toISOString()} Semester End: ${semester.endDate.toISOString()}`);
      if(current > semester.startDate && current < semester.endDate){
         _semester = semester;
      }
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
         // console.log(user);
         _userBrightspace = user.FirstName;
         showLoggedIn(brightLogin, brightBtn);
      }catch(error){
         showNotLoggedIn(brightLogin, brightBtn);
         console.log(error);
      }
   }
   
   if(_userCanvas == null){
      try{
            let response =  await getText("https://byui.instructure.com/api/v1/users/self");
            let name = JSON.parse(response.split(";")[1]).name;
            _userCanvas = name;
         if(_userCanvas != null){
            showLoggedIn(canvasLogin, canvasBtn);
         }else{
            showNotLoggedIn(canvasLogin, canvasBtn);
         }
      }
      catch(Error){
         showNotLoggedIn(canvasLogin,canvasBtn);
         console.log(Error);
      }
   }

   if(_userBrightspace != null && _userCanvas != null){
      syncBtn.disabled = false;
      syncBtn.classList.remove('btn-secondary');
      syncBtn.classList.add('btn-success');
   }
}

async function getBrightspaceEnrollment(){   
   await getJSON(`https://byui.brightspace.com/d2l/api/lp/1.9/enrollments/myenrollments/?orgUnitTypeId=3&sortBy=-EndDate`)
   .then( results =>{
      for(let item of results.Items){
         if(item.Access.StartDate != null || item.Access.EndDate != null){
            let temp = {};
            temp.startDate = new Date(item.Access.StartDate);
            temp.endDate = new Date(item.Access.EndDate);
            if(temp.startDate.getTime() >= _semester.startDate.getTime() && temp.endDate.getTime() <= _semester.endDate.getTime()){
               temp.name = item.OrgUnit.Name;
               temp.id = item.OrgUnit.Id;      
               temp.source = "brightspace";
               _courses.push(temp);
            }
         }
      }
      console.log(results);
   })
   .catch(error => {
      console.log(error);
   })
   
}

async function getCanvasEnrollment(){
   await getText('https://byui.instructure.com/api/v1/users/self/courses')
   .then( results => {
      let array = [];
      let courses = JSON.parse(results.split(";")[1]);
      for(let item of courses){
         let temp = {};
         temp.startDate = new Date(item.start_at);
         if(temp.startDate.getTime() >= _semester.startDate.getTime() && temp.startDate.getTime() <= _semester.endDate.getTime()){
            temp.name = item.name;
            temp.id = item.id;
            temp.source = "canvas";
            _courses.push(temp);
         }
      }
      console.log(courses);
   })
   .catch(error => {
      console.log(error);
   })

}

async function getCourseInfo(course_id){
   await getText(`https://byui.brightspace.com/d2l/api/lp/1.9/enrollments/myenrollments/${course_id}`)
   .then(response => {
      
   })
   .catch(error => {
      console.log(error);
   })
   
}