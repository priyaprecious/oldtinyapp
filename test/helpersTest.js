const {assert} = require('chai');
const {users, urlDatabase} = require('../appData');
const helperFunctions = require('../helperfunc');
const {generateRandomString, emailCheck, getUserId, urlsForUser, getUserByEmail} = helperFunctions(users, urlDatabase);



describe('getUserByEmail', () => {
  it('should return a user with valid email', function() {
    const usr = getUserByEmail("user2@example.com", users)
    const expectedUsrID = "i3BoGr";
    assert.deepEqual(usr, users[expectedUsrID])
  });

  it('should return undefined if the email does not exist', function() {
    const usr = getUserByEmail("test@example.com", users)
    const expectedUsrID = undefined;
    assert.deepEqual(usr, users[expectedUsrID])
  });
});

describe('emailCheck', () => {
  it('should return true if the email exist in the usersDB', () => {
    const result = emailCheck("user2@example.com")
    assert.isTrue(result)
  })

  it('should return false if the email does not exist in the usersDB', () => {
    const result = emailCheck("test@example.com")
    assert.isFalse(result)
  })
})

describe('getUserId', () => {
  it('should return the user id if email exist in userDB',() => {
    const userID = getUserId("user2@example.com")
    const result = "i3BoGr"
    assert.equal(userID, result)
  })

  it('should return undefined if email does not exist in userDB',() => {
    const userID = getUserId("test@example.com")
    const result = undefined
    assert.equal(userID, result)
  })
})

describe('urlsForUser', () => {
  it('should return the object containing authorized url for user ', () => {
    const authorizedURLs = urlsForUser("b6UTxQ")
    const expected = {b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "b6UTxQ"
      }}
    assert.deepEqual(authorizedURLs, expected)
  })

  it('should return the empty object if user does not have any authorized urls', () => {
    const allowURLs = urlsForUser("i3BoGs")
    const expected = {}
    assert.deepEqual(allowURLs, expected)
  })

})