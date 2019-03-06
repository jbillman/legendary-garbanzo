window.onload = function() {
   document.querySelector('.googleLogin').addEventListener('click', function() {
      chrome.identity.getAuthToken({interactive: true}, function(token) {
         console.log(token);
      });
   });

   document.querySelector('.canvasLogin').addEventListener('click', function() {
      //Stuff goes here
      console.log("clicked canvas button");
   });

   document.querySelector('.brightLogin').addEventListener('click', function(){
      console.log("clicked iLearn button");
   })
};
  






  //Canvas token - 	10706~cJCvI2tnXLICE4JGWZTLzL3N9FjqXlf1L1cQDXudI32o7xwd8aExBrack7djOU2e