'use strict';

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
    async create(ctx) {  
        //error with saving relational data in Mongo
        //hacked together solution :(     
        let arr = [];
        arr.push(ctx.state.user);

        ctx.request.body.users_permissions_users = arr;
        ctx.request.body.owner = ctx.state.user.email;
        let organization = await strapi.services.organization.create(ctx.request.body);
        
        return sanitizeEntity(organization, { model: strapi.models.organization });
    }, 

    async createOrganizationUser(ctx) {
        //find organization based on submitted organization name --> should be organization password
        let organization = await strapi.services.organization.findOne({ title: ctx.request.body.organization })

        if(!organization){
            return ctx.response.notFound(`Organization ${ctx.request.body.organization} Not Found`);
        }

        //check if there is an email in body and current logged in user is the owner
        if(ctx.request.body.email && organization.owner != ctx.state.user.email){
            return ctx.response.badRequest(`You are not the owner of this organization, you can not add other members`);
        }

        //check if email is supplied in request body
        let userEmail;
        (ctx.request.body.email) ? userEmail = ctx.request.body.email : userEmail = ctx.state.user.email;
        

        //check if user to be registered is already registered with organization
        let usersArr = organization.users_permissions_users;
        usersArr.forEach(user => {
            if (user.email === userEmail){
                return ctx.response.badRequest(`The email ${userEmail} is already a member of this organization`);
            }
        });


        //set the employee's role
        let getRole = await strapi
            .query('role', 'users-permissions')
            .findOne({ name: ctx.request.body.role });
        
        let userObj = {
            email: ctx.request.body.email,
            password: ctx.request.body.password,
            username: ctx.request.body.username,
            role: getRole.id,
            confirmed: true,
            provider: "local"
        }
        
        //create user
        let user = await strapi.plugins['users-permissions'].services.user.add(userObj);

        usersArr.push(user);

        //update organization with new array of organizational users
        organization = await strapi.query('organization').update({ id: organization.id }, {
            users_permissions_users: usersArr
        });

        return sanitizeEntity(organization, { model: strapi.models.organization });
    },

    async deleteOrganizationUser(ctx) {
        let organization = await strapi.services.organization.findOne({ title: ctx.request.body.organization });

        if(!organization){
            return ctx.response.notFound(`Organization ${ctx.request.body.organization} Not Found`);
        }

        let usersArr = organization.users_permissions_users;

        //owner of organization cannot delete themself from array of organization members
        if(!ctx.request.body.email && organization.owner === ctx.state.user.email){
            return ctx.response.badRequest(`You are the owner of this organization and cannot delete yourself from the organization's members`);
        }
        if(ctx.request.body.email === ctx.state.user.email && organization.owner === ctx.state.user.email){
            return ctx.response.badRequest(`You are the owner of this organization and cannot delete yourself from the organization's members`);
        }

        //a member cannot by someone else other than the owner of the organization
        if(ctx.request.body.email && organization.owner != ctx.state.user.email) {
            return ctx.response.badRequest(`You must be the owner of this organization to remove members`)
        } 

        //user to be removed either from request body or a non-owner member can remove themselves from an organization
        let userEmail;
        (ctx.request.body.email) ? userEmail = ctx.request.body.email : userEmail = ctx.state.user.email;

        let index = -1;
        for(let i = 0 ; i < usersArr.length; i++){
            if(usersArr[i].email === userEmail){
                index = i;
                break;
            }
        }
        if(index < 0){
            return ctx.response.notFound(`User with email ${userEmail} not found in this organization`);
        }

        usersArr.splice(index, 1);

        organization = await strapi.query('organization').update({ id: organization.id }, {
            users_permissions_users: usersArr
        });

        return sanitizeEntity(organization, { model: strapi.models.organization });
    },

    async findFirst(ctx) {
        let firstOrganization = await strapi.services.organization.find({_start:0, _limit:1});
            
        return sanitizeEntity(firstOrganization, { model: strapi.models.organization });
    }
};


