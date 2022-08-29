# Welcome to the Dog & Bone Beer Co

The Dog & Bone website displays information about how it all started as well as listing the current beers on tap and the back catalouge.

Behind the scenes the admin log in credentials allow beers to bo be added with full CRUD capabilties, shuffled between taps or archived. 
The full back catalouge of beers can also be viewed where archived beers can be reused should the recipe be brewwed again.

The front end use HTML CSS and JavaScript and the graphics where produced using Adobe Illustrator.

The back end is built using Node.js, Express.js and MongoDB Atlas. The app runs on Heroku.

the website can be seen here [dogandbonebeerco.co.uk](http://www.dogandbonebeerco.co.uk/)

Here is a GIF showing the admin features used to add and edit beers

<img src="DNB.gif?raw=true">

## August Update - Brewfather API 

Each beer info page now displays data taken from the Brewfather API, recipes are built using the app and data is then displayed on the info pages. Key info like hop amounts and useage is displayed and simple calculations add up the amouts for each hop phase. Malts are also listed showing the type, supplier  along with the amounts. Finally the yeast supplier and strain is displayed.

I used postman to initially get the data from brewfather and then slowly built the route requests within the app. 

- Considerations

The API limits calls to 150 per hour, currently each time a page is displayed a request is made. This could potentially cause a 429 - Too Many Requests Error should too many people be viewing the site at one time. When developing this feature I did consider storing the data from requests in to my own database with a feature to fetch and update the ingredients as a manual process, however I decided against this to ensure the data was always upto date.

For futher development I could get the app to pull data on a daily basis to avoid too many request errors whilst ensuring the data is still relatively new. Realistically once a recipe has been made it is unlikely to be changed that often.
