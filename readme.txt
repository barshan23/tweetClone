For starting the scrpit first you need to install the dependecies:
    1. To install the dependecies run the command in the root directory:
        npm install
    2. Then change the mongodb connection string to  a suitable string for your system in the app.js file
    3. To start the node server run the command
        npm start
    
The endpoints are:

1.  POST   /user/register
        registers a user on the system
    
    URI parameters:
        username: String(required)
                a unique username for the user
        password: String(required)
                a password of min length 6 characters
    Returns:
        If unsuccessful to register server sends a 500 response code with a message of "There was a problem"
        otherwise sends response code 200 with :
            id: id of the registered user
            access_token: jwt token for accessing the secured endpoints
            refresh_token: jwt for getting a new access_token
            message: "Successfully registered"

2. POST /auth/login
        logges a user in the system
    URI parameters:
        username: String(required)
            username of the user
        password: String(required)
            password of the user
    Returns:
        if unsuccessful sends 500 or 401 with error message
        if Successfully logges in the user then sends 200 as response code with success message

3.  POST /follow/:id
        follows the user with specified id
    HEADERS:
        Authorization: in form of "Bearer access_token_value"
    Returns:
        if unsuccessful to follow sends 404 or 401 or 500 response codes with error message
        if Successfully followed then sends 200 response code

4. DELETE /unfollow/:id
        unfollows the user with the specified id
    HEADERS:
        Authorization: in form of "Bearer access_token_value"
    Returns:
        if unsuccessful to unfollow sends 500 or 404 response code with error message
        otherwise sends 200 response code with a success message

5. GET /auth/token/refresh
        generates and sends a new access_token for the user by using the refresh_token
    HEADERS:
        x-refreshtoken: in form of "refresh_token_value"
    Returns:
        if unsuccessful sends 401 response code with the error message
        otherwise sends 200 response code with access_token and a success message

6. POST /tweet/
        creates a new tweet
    HEADERS:
        Authorization: in form of "Bearer access_token_value"
    URI parameters:
        tweet: String (required)
    Returns:
        if unsuccessful sends 500 response code with error message
        otherwise sends 200 response code with a success message and generated id of the tweet created

7. GET /tweet/:id
        returns the tweet having the specified id
    HEADERS:
        Authorization: in form of "Bearer access_token_value"
    Returns:
        if unsuccessful sends 500 response code with error message
        otherwise sends 200 response code and the tweet requested

8. GET /tweet/
        returns all the tweets
    HEADERS:
        Authorization: in form of "Bearer access_token_value"
    Returns:
        if unsuccessful sends 500 or 404 response code with error message
        otherwise sends 200 response code and an array of all the tweets

9. DELETE /tweet/:id
        deletes the tweet having the specified id
    HEADERS:
        Authorization: in form of "Bearer access_token_value"
    Returns:
        if unsuccessful sends 500 response code with error message
        otherwise sends 200 response code and the tweet id which was deleted

    