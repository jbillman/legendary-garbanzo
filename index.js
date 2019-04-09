let _userBrightspace = null;
let _userCanvas = null;

let syncBtn = null;
let brightBtn = null;
let canvasBtn = null;
let googleBtn = null;

let brightLogin = null;
let canvasLogin = null;
let googleLogin = null;

let _semester = ""
let _courses = [];
let _assignments = [];
let _calendarId = null;


let semesters = [
      {
         name: "Winter 2019",
         startDate: new Date('January 4, 2019 0:00:00'),
         endDate: new Date('April 21, 2019 0:00:00')
      },
   
      {
         name:"Spring 2019",
         startDate: new Date('April 21, 2019 0:00:00'),
         endDate: new Date('August 1, 2019 0:00:00')
      },
   
      {
         name:"Summer 2019",
         startDate: new Date('July 28, 2019 0:00:00'),
         endDate: new Date('September 19, 2019 0:00:00')
      },
     
      {
         name:"Fall 2019",
         startDate: new Date('September 16, 2019 0:00:00'),
         endDate: new Date('January 7, 2019 0:00:00')
      },
   
      {
         name:"Winter 2020",
         startDate: new Date('January 7, 2020 0:00:00'),
         endDate: new Date('April 16, 2020 0:00:00')
      },
]

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
         if(chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
         }
      });
   });

   syncBtn.addEventListener('click', async () => {
      syncBtn.innerHTML = "Syncing <div class='ld ld-ring ld-spin' style='font-size:3em'></div>";
      syncBtn.classList.add("ld-over-full-inverse");
      syncBtn.classList.add("running");
      if(_courses.length == 0){
         await getBrightspaceEnrollment();
         await getCanvasEnrollment();
         if(_assignments.length == 0){
            console.log(_courses);
            await getHomework(_courses);
         }
      }
      chrome.identity.getAuthToken({interactive: true}, async token => {
         await createHomeworkCalendar(token);
         await getCalendarEvents(token, _calendarId);
      })
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
   
};

function renderWelcome(){
   let username = _userBrightspace || _userCanvas||_userGoogle;
   let welcome = document.querySelector('.welcome');
   let heading = document.querySelector('.heading');
   let semester = document.createElement('h6');
   semester.classList.add('semester');
   
   getCurrentSemester();
   
   semester.innerHTML = _semester.name;
   heading.appendChild(semester);
   if(username != null){
      welcome.innerHTML = `Welcome, ${username}!`;
   }else{
      welcome.innerHTML = `Welcome, please log in!`;
   }      
   
} 

function getJSON(url, init = null){
   return fetch(url, init)
   .then(response =>{
      if(response.ok){
         return response.json();
      }
      else{
         throw Error(response.status + ": " + response.statusText);
      }
   })
   .catch(Error => {
      console.log(Error);
   });
}

function getText(url, init = null){
   return fetch(url, init)
      .then(response =>{
         if(response.ok){
            return response.text();

         }
         else{
            throw Error(response.status + ": " + response.statusText);
         }
      })
      .catch(error => {
         console.log(error);
      });
}

function getCurrentSemester(){
   let current = new Date();
   for (let semester of semesters) {
      if(current > semester.startDate && current < semester.endDate){
         _semester = semester;
      }
   }
}

async function checkLoginStatus(){
   //check for Brightspace user
   if(_userBrightspace == null){
      try{
         let user = await getJSON("https://byui.brightspace.com/d2l/api/lp/1.9/users/whoami");
         _userBrightspace = user.FirstName;
         
         brightLogin.style.visibility = 'visible'; 
         brightBtn.style.visibility = "hidden";
         checkSyncButton();
      }catch(error){
         brightLogin.style.visibility = 'hidden'
         brightBtn.style.visibility = 'visible';
         console.log(error);
      }
   }
   
   //check for Canvas user
   if(_userCanvas == null){
      try{
            let response = await getText("https://byui.instructure.com/api/v1/users/self");
            let name = JSON.parse(response.split("while(1);")[1]).name;
            _userCanvas = name;
         if(_userCanvas != null){
            canvasLogin.style.visibility = 'visible'; 
            canvasBtn.style.visibility = "hidden";
            checkSyncButton();
         }else{
            canvasLogin.style.visibility = 'hidden'; 
            canvasBtn.style.visibility = 'visible';
         }
      }
      catch(Error){
         canvasLogin.style.visibility = 'hidden'; 
         canvasBtn.style.visibility = 'visible';
         console.log(Error);
      }
   }

   //check for Google user
   await chrome.identity.getAuthToken({interactive: true}, token => {
      if(!token) {
         console.log('not signed in')
         googleLogin.style.visibility = 'hidden'
         googleBtn.style.visibility = 'visible';
      } else {
         chrome.identity.getProfileUserInfo( userInfo => {
            _userGoogle = userInfo.email;
            console.log(_userGoogle);
            googleLogin.style.visibility = 'visible'; 
            googleBtn.style.visibility = "hidden";
            checkSyncButton();
            renderWelcome();
            
         })
      }
   });
}

function checkSyncButton(){
  chrome.identity.getAuthToken({interactive: true}, token => {
      if(token){
         if(_userBrightspace != null && _userCanvas != null){
            syncBtn.disabled = false;
            syncBtn.classList.remove('disabled');
            // syncBtn.classList.add('btn-success');
         }      
      }
   });
}

async function getBrightspaceEnrollment(){   
   await getJSON(`https://byui.brightspace.com/d2l/api/lp/1.9/enrollments/myenrollments/?orgUnitTypeId=3&sortBy=-EndDate`)
   .then( response =>{
      console.log(response)
      for(let item of response.Items){
         if(item.Access.StartDate != null || item.Access.EndDate != null){
            let temp = {};
            temp.startDate = new Date(item.Access.StartDate);
            // console.log(temp.startDate >= _semester.startDate.getTime());
            if(temp.startDate.getTime() >= _semester.startDate.getTime() && temp.startDate.getTime() <= _semester.endDate.getTime()){
               temp.name = item.OrgUnit.Name;
               temp.id = item.OrgUnit.Id;      
               temp.source = "brightspace";
               _courses.push(temp);
             }
         }
      }
      console.log(_courses);
   })
   .catch(error => {
      console.log(error);
   })
   
}

async function getCanvasEnrollment(){
   await getText('https://byui.instructure.com/api/v1/users/self/courses?include[]=term')
   .then( response => {
      // console.log(response);
      let courses = JSON.parse(response.split("while(1);")[1]);
      console.log(courses);
      for(let item of courses){
         // console.log(item);
         let temp = {};
         temp.startDate = new Date(item.start_at);
         if(item.term.name == _semester.name){
            temp.name = item.name;
            temp.id = item.id;
            temp.source = "canvas";
            _courses.push(temp);
         }
      }
      console.log(_courses);
   })
   .catch(error => {
      console.log(error);
   })

}

async function getHomework(courses){
   let brightspaceIds = "";
   let first = true;
   for(let item of courses){
      if(item.source == "brightspace"){
         if(first == true){
            brightspaceIds = item.id;
            // console.log(item);
            first = false;
         }
         else{
            // console.log(item);
            brightspaceIds += `,${item.id}`;
         }
      }
      else{
            try{
               await getText(`https://byui.instructure.com/api/v1/users/self/courses/${item.id}/assignments?per_page=100`)
               .then(response => {
                  let array = JSON.parse(response.split("while(1);")[1]);
                  // console.log(array);
                  for (const item of array) {
                     if(item.due_at != null){
                        let temp = {};
                        temp.name = item.name;
                        temp.course = getCourseName(item.course_id);
                        temp.dueDate = new Date(item.due_at);
                        temp.url = item.html_url
                        // console.log(temp);
                        _assignments.push(temp);
                     }
                  }
                     // console.log(_assignments);
               })
               .catch(error =>{
                  console.log(error);
               })
            }catch(Error){
               console.log(Error);
            }
      }
   }
   try{
      console.log(brightspaceIds);
      if(brightspaceIds.length != 0){
         console.log(`https://byui.brightspace.com/d2l/api/le/1.25/content/myItems/due/?orgUnitIdsCSV=${brightspaceIds}`)
         await getJSON(`https://byui.brightspace.com/d2l/api/le/1.25/content/myItems/due/?orgUnitIdsCSV=${brightspaceIds}`)
         .then( response => {
            // console.log(response);
            for (const item of response.Objects) {  
               if(item.DueDate != null){                 
                  let temp = {};
                  temp.name = item.ItemName;
                  temp.course = getCourseName(item.OrgUnitId);
                  temp.dueDate = new Date(item.DueDate);
                  temp.url = item.ItemUrl
                  // console.log(temp);
                  _assignments.push(temp);
               }
            }
            console.log(_assignments);
         })
         .catch(error => {
            console.log(error);
         })
      }
   }catch(Error){
      console.log(Error);
   }
   }   



function getCourseName(courseId){
   for (const course of _courses) {
      if(courseId == course.id)  
      return course.name;
   }
}

async function createHomeworkCalendar(token){
   try{
      let init = {
         method: 'GET',
         async: true,
         headers: {
           Authorization: 'Bearer ' + token,
           'Content-Type': 'application/json'
         },
         'contentType': 'json'
       };
      await getJSON('https://www.googleapis.com/calendar/v3/users/me/calendarList', init)
      .then(async response => {
         for (const item of response.items) {
            if(item.summary == "Homework"){
               console.log('Homework already exists!');
               _calendarId = item.id;
               return true;   
            }
         }
         let summary = {'summary':'Homework'};
         init = {
            method: 'POST',
            async: true,
            headers: {
               Authorization: 'Bearer ' + token,
               'Content-Type': 'application/json'
            },
            'contentType': 'json',
            body: JSON.stringify(summary)
         };
         await getJSON("https://www.googleapis.com/calendar/v3/calendars",init)
         .then(response => {
            _calendarId = response.id;
         })
         .catch(error => {
               console.log(error);
         })  
      })
      .catch(error => {
         console.log(error);
      })
   }catch(error){

   }
}

async function getCalendarEvents(token, calendarId){
   let init = {
      method: 'GET',
      async: true,
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      'contentType': 'json'
   };
   
   await getJSON(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?maxResults=1000`, init)
   .then(response => {
      let count = 1;
      let event1 = {};
      if(response.items.length != 0){
         console.log(response);
         for (const item of _assignments) {
            let exists = false;
            // let array = [];
            // array.push({name:item.name, course:item.course, url:item.url}) 
            // console.log("start");
            // console.log(item.name);
            for (const event of response.items) {
               let course = (event.description).split('->')[0];
               let url =  (event.description).split('->')[1];
               // console.log(event.summary);
               if(item.name == event.summary){
                  // console.log(`item.name: ${item.name} -> event.summary: ${event.summary}`)
                  // console.log("name exists");
                  
                  // console.log(course);
                  
                  if(item.url == url){

                     // console.log(`${event.summary} already exists`);
                     console.log("already exists");
                     exists = true;
                     break;
                  }
               }
               // array.push(
               //    {
               //       name:{name:event.summary,sameName: (item.name==event.summary)}, 
               //       course:{course:course, sameCourse:(item.course==course)},
               //       url:{url:url, sameCourse:(item.url==url)}
               //    });
            }
            if(!exists){
               // console.log(`Created assignment: ${item.name}`);
               console.log(`Created assignment`);
               // console.log(array);
               window.setTimeout(function () {createCalendarEvent(item, token, calendarId,event1)}, count *300);
               count++;
            }
            // console.log("end")
         }
      }
     if(response.items.length == 0){
         console.log("response length was 0");
         for (const item of _assignments) {
            // console.log(`Created assignment: ${item.name}`);
            // console.log(item);
            console.log(`Created assignment`);

            window.setTimeout(function () {createCalendarEvent(item, token, calendarId)}, count *300);
            count++;
         }
      }
      window.setTimeout(function () {renderFinished()}, count * 300);
   })
   .catch(error => {
      console.log(error);
   });
}

async function createCalendarEvent(assignment, token, calendarId){
   let startDate = new Date(assignment.dueDate)
   startDate.setHours(assignment.dueDate.getHours() - 2);
   let body = {
      start: {
         dateTime: startDate.toISOString()
      },
      end: {
         dateTime: assignment.dueDate.toISOString()
      },
      description: `${assignment.course}->${assignment.url}`, 
      summary: assignment.name
   }
   let init = {
      method: 'POST',
      async: true,
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      'contentType': 'json',
      body: JSON.stringify(body)
   };
   try{
     fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, init)
      .then( response => {
         if(response.ok)
            // console.log(`created new Event: ${assignment.name} : ${assignment.dueDate}`);
            console.log("successfully created new event")
         else
            console.log(response.json());
      })
      .catch(error => {
         console.log(error);
      })
   }
   catch(Error){
      console.log(Error);
   }
}

function renderFinished(){
   syncBtn.innerHTML = "Done!";
   syncBtn.classList.remove("running")
}