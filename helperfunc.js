const helperfunc = (usersDB, urlDB) => {
const emailCheck = (loginEmail) => {
  //console.log(loginEmail);
  //console.log(usersDB);
    for (let user in usersDB) {
      //console.log(usersDB[user].email);
      if (usersDB[user].email === loginEmail) {
        return true;
      }
    }
    return false;
  };

const generateRandomString = () => {
  var result = ''; 
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
  var charactersLength = characters.length;     
  for ( var i = 0; i < 6; i++ ) {    
    result += characters.charAt(Math.floor(Math.random() *   charactersLength));  
  }  
  return result;
};

const getUserId = (email) => {
  for (let user in usersDB) {
    if (usersDB[user].email === email) {
      return usersDB[user].id;
    }
  }
};


const getUserByEmail = (email) => {
  for (let user in usersDB) {
    if (usersDB[user].email === email) {
      return usersDB[user];
    }
  }
};

const urlsForUser = (userID) => {
  //console.log(userID);
  const authorizedURLs = {};
  for (const url in urlDB) {
    //console.log(url);
    //console.log(urlDB[url].userID);
    if (urlDB[url].userID === userID) {
      authorizedURLs[url] = urlDB[url];
    }
  }
  return authorizedURLs;
};

return {generateRandomString, emailCheck, getUserId, urlsForUser, getUserByEmail};

};





  module.exports = helperfunc;