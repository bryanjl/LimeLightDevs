# Limelight Devs

	##Backend Test API
	###Node.js | Strapi.js | MongoDB | Limelight Devs



##Problem

Build a Strapi development server and configure a Mongo Database. You must create an API that will allow a user to create an organization. Organizations should have users and a user should be able to have a role in that organization. Finally, an organization should be able to post jobs. 

##Routes must contain basic CRUD functionality

-Organization fields will include:
-Title,
-Description
-Website
-Location
-Jobs
-Users with roles(This role is different from the default user-permissions role, the role should be specific to the organization)

##Job fields will include:
-Title
-Description


You must also create a custom Strapi route organizations/id/findFirst, all this route will do is find the FIRST organization in the organization collection.

When everything has been completed please provide a staging link(heroku hosted), user credentials to login to admin, and a link to your Github repository.

For the database, use a free tier mongo database.





                    
##Bonus

 Generate swagger documentation via strapi plugins

